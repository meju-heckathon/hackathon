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

// Boxes belonging to one UI element should sit on roughly the same line.
// If GPT grouped vertically-distant ocr fragments, return false.
function isSingleLineCluster(boxes: BBox[]): boolean {
  if (boxes.length <= 1) return true;
  const avgH =
    boxes.reduce((s, b) => s + b.height, 0) / boxes.length || 0.01;
  const minY = Math.min(...boxes.map((b) => b.y));
  const maxBottom = Math.max(...boxes.map((b) => b.y + b.height));
  const vSpread = maxBottom - minY;
  return vSpread < avgH * 2.5;
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
  const goalRaw = form.get("goal");
  const goal =
    typeof goalRaw === "string" && goalRaw.trim().length > 0
      ? goalRaw.trim().slice(0, 200)
      : null;

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

  const goalLine = goal
    ? `The user's goal is: "${goal}". Populate the "goalAnswer" field accordingly.\n\n`
    : `The user gave no specific goal. Set "goalAnswer" to null.\n\n`;

  const userText = `${goalLine}Here are the text fragments OCR found on this Korean financial app screenshot, with their ids:\n\n${ocrSummary}\n\nReturn the JSON described in the system prompt.`;

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
    let boxes = el.ocrIds
      .map((id) => ocrById.get(id)?.bbox)
      .filter((b): b is BBox => Boolean(b));
    if (boxes.length === 0) continue;

    // Drop vertically-stacked ocr ids that GPT wrongly grouped.
    // Keep the largest single-line subset by clustering on y.
    if (!isSingleLineCluster(boxes)) {
      const sorted = [...boxes].sort((a, b) => a.y - b.y);
      const groups: BBox[][] = [];
      for (const b of sorted) {
        const last = groups[groups.length - 1];
        const avgH = b.height || 0.01;
        if (last && Math.abs(b.y - last[0].y) < avgH * 1.5) {
          last.push(b);
        } else {
          groups.push([b]);
        }
      }
      boxes = groups.reduce((best, g) => (g.length > best.length ? g : best));
    }

    let bbox = unionBbox(boxes);

    // Refuse degenerate bboxes that cover most of the screen.
    if (bbox.width > 0.92 && bbox.height > 0.25 && !el.fullRow) continue;

    if (el.fullRow) {
      // Only allow full-row expansion when the cluster itself is a tight,
      // line-shaped object (wide relative to its height).
      if (bbox.height < 0.08) bbox = expandFullRow(bbox);
    }
    elements.push({
      id: el.id,
      label: el.label,
      koreanText: el.koreanText,
      explanation: el.explanation,
      termGloss: el.termGloss ?? null,
      risk: el.risk,
      bbox,
    });
  }

  let goalAnswer: AnalyzeResult["goalAnswer"] = null;
  if (goal && modelResult.goalAnswer) {
    const ga = modelResult.goalAnswer;
    // Ensure the referenced element actually survived our filtering.
    const exists =
      ga.elementId !== null &&
      elements.some((e) => e.id === ga.elementId);
    goalAnswer = {
      goal,
      found: ga.found && exists,
      elementId: exists ? ga.elementId : null,
      rationale: ga.rationale,
    };
  } else if (goal) {
    goalAnswer = {
      goal,
      found: false,
      elementId: null,
      rationale:
        "I couldn't determine whether this screen helps with that goal. Try a different screenshot.",
    };
  }

  const result: AnalyzeResult = {
    screen: modelResult.screen,
    appGuess: modelResult.appGuess,
    warnings: modelResult.warnings,
    elements,
    goalAnswer,
  };

  return NextResponse.json(result, {
    headers: { "Cache-Control": "no-store" },
  });
}
