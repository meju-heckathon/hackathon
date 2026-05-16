import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "gpt-4o-mini";
const MAX_MESSAGES = 20;
const MAX_CONTENT = 2000;

const SYSTEM_PROMPT = `You are MEJU, a friendly assistant for English-speaking foreigners living in Korea who need help using Korean financial mobile apps (banks, fintech, payments, investing).

You help with:
- What a Korean financial term means (신탁, 청약, ISA, 외환, 자동이체, 공동인증서, 마이너스통장, 등) — define in plain English, no jargon.
- How to do common tasks in Korean banking apps (open a foreigner account, transfer money, set up auto-transfer, register a phone, KYC steps, etc.).
- Risk and warnings: be honest about transfers being hard to cancel, foreigner-specific limits, certificate-based authentication, voice-phishing red flags.
- Recommending apps friendly to foreigners (KakaoBank, Toss, Wibee/Woori, Shinhan SOL Global, KB Star, NH Smart) — and noting which ones support English UI.

Style: short (2–4 sentences usually), plain English, beginner-friendly. Define a Korean term the first time you use it like this: "신탁 (trust — letting a bank manage your assets for you)". When a user is about to move money or sign something, mention the risk in one short line.

If the question is outside Korean banking/finance, briefly redirect. If you genuinely don't know a specific path inside a specific app, say so — never invent menu paths.

Always reply in the same language the user wrote in. Default to English.`;

type IncomingMessage = { role: "user" | "assistant"; content: string };

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not set on the server." },
      { status: 500 },
    );
  }

  let body: { messages?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!Array.isArray(body.messages)) {
    return NextResponse.json(
      { error: "Field 'messages' must be an array." },
      { status: 400 },
    );
  }

  const cleanMessages: IncomingMessage[] = body.messages
    .filter(
      (m: unknown): m is IncomingMessage =>
        !!m &&
        typeof m === "object" &&
        "role" in m &&
        "content" in m &&
        typeof (m as { content: unknown }).content === "string" &&
        ((m as { role: unknown }).role === "user" ||
          (m as { role: unknown }).role === "assistant"),
    )
    .slice(-MAX_MESSAGES)
    .map((m) => ({
      role: m.role,
      content: m.content.slice(0, MAX_CONTENT),
    }));

  if (cleanMessages.length === 0) {
    return NextResponse.json(
      { error: "No valid messages." },
      { status: 400 },
    );
  }

  const client = new OpenAI({ apiKey });

  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...cleanMessages,
      ],
      max_tokens: 600,
      temperature: 0.4,
    });
    const text = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!text) {
      return NextResponse.json(
        { error: "Empty model response." },
        { status: 502 },
      );
    }
    return NextResponse.json(
      { message: text },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: `Chat call failed: ${msg}` },
      { status: 502 },
    );
  }
}
