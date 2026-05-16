import { NextResponse } from "next/server";

export const runtime = "nodejs";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.redirect(new URL("/", request.url), 303);
  }

  const file = form.get("image");
  if (!(file instanceof Blob) || !ALLOWED.has(file.type)) {
    return NextResponse.redirect(new URL("/", request.url), 303);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");
  const dataUrl = `data:${file.type};base64,${base64}`;

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Loading…</title></head>
<body style="font-family:system-ui;text-align:center;padding:40px;">
  <p>Opening shared screenshot…</p>
  <script>
    try {
      sessionStorage.setItem('shared-image', ${JSON.stringify(dataUrl)});
      sessionStorage.setItem('shared-image-type', ${JSON.stringify(file.type)});
    } catch (_) {}
    location.replace('/?from=share');
  </script>
</body></html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(request: Request) {
  return NextResponse.redirect(new URL("/", request.url), 303);
}
