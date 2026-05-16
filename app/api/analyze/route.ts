import { NextResponse } from "next/server";
import OpenAI from "openai";
import {
  JSON_SCHEMA,
  SYSTEM_PROMPT,
  type AnalyzeResult,
  type BBox,
  type ModelResult,
  type UIElement,
} from "@/lib/analyze-schema";
import { ocrImage, type OcrLine } from "@/lib/ocr";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MODEL = "gpt-4o";
const MAX_BYTES = 8 * 1024 * 1024;

const ALLOWED: Record<string, "image/jpeg" | "image/png" | "image/webp" | "image/gif"> = {
  "image/jpeg": "image/jpeg",
  "image/jpg": "image/jpeg",
  "image/png": "image/png",
  "image/webp": "image/webp",
  "image/gif": "image/gif",
};

function unionBbox(boxes: BBox[]): BBox {
  const x = Math.min(...boxes.map((b) => b.x));
  const y = Math.min(...boxes.map((b) => b.y));
  const right = Math.max(...boxes.map((b) => b.x + b.width));
  const bottom = Math.max(...boxes.map((b) => b.y + b.height));
  return { x, y, width: right - x, height: bottom - y };
}

function expandFullRow(bbox: BBox): BBox {
  const pad = bbox.height * 0.4;
  const y = Math.max(0, bbox.y - pad);
  const height = Math.min(1 - y, bbox.height + pad * 2);
  return { x: 0, y, width: 1, height };
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not set on the server." },
      { status: 500 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const file = form.get("image");
  const widthRaw = form.get("width");
  const heightRaw = form.get("height");

  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "Missing image field." }, { status: 400 });
  }
  const mediaType = ALLOWED[file.type];
  if (!mediaType) {
    return NextResponse.json(
      { error: `Unsupported image type: ${file.type || "unknown"}` },
      { status: 415 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Image is larger than 8 MB." },
      { status: 413 },
    );
  }

  const imgWidth = Number(widthRaw);
  const imgHeight = Number(heightRaw);
  if (!Number.isFinite(imgWidth) || !Number.isFinite(imgHeight) || imgWidth <= 0 || imgHeight <= 0) {
    return NextResponse.json(
      { error: "Image dimensions missing or invalid." },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let ocrLines: OcrLine[];
  try {
    ocrLines = await ocrImage(buffer, imgWidth, imgHeight);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: `OCR failed: ${msg}` },
      { status: 502 },
    );
  }

  const base64 = buffer.toString("base64");
  const dataUrl = `data:${mediaType};base64,${base64}`;

  const ocrSummary = ocrLines.length
    ? ocrLines.map((l) => `[${l.id}] "${l.text}"`).join("\n")
    : "(no text was detected)";

  const userText = `Here are the text fragments OCR found on this Korean financial app screenshot, with their ids:\n\n${ocrSummary}\n\nReturn the JSON described in the system prompt.`;

  const client = new OpenAI({ apiKey });

  let modelResult: ModelResult;
  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: userText },
            { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
          ],
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "screen_analysis",
          strict: true,
          schema: JSON_SCHEMA,
        },
      },
      max_tokens: 4096,
    });

    const text = completion.choices[0]?.message?.content;
    if (!text) {
      return NextResponse.json(
        { error: "Model returned no content." },
        { status: 502 },
      );
    }
    modelResult = JSON.parse(text) as ModelResult;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: `Vision API call failed: ${msg}` },
      { status: 502 },
    );
  }

  const ocrById = new Map(ocrLines.map((l) => [l.id, l]));
  const elements: UIElement[] = [];
  for (const el of modelResult.elements) {
    const boxes = el.ocrIds
      .map((id) => ocrById.get(id)?.bbox)
      .filter((b): b is BBox => Boolean(b));
    if (boxes.length === 0) continue;
    let bbox = unionBbox(boxes);
    if (el.fullRow) bbox = expandFullRow(bbox);
    elements.push({
      id: el.id,
      label: el.label,
      koreanText: el.koreanText,
      explanation: el.explanation,
      risk: el.risk,
      bbox,
    });
  }

  const result: AnalyzeResult = {
    screen: modelResult.screen,
    appGuess: modelResult.appGuess,
    warnings: modelResult.warnings,
    elements,
  };

  return NextResponse.json(result, {
    headers: { "Cache-Control": "no-store" },
  });
}
