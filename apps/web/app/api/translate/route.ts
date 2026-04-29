import { NextResponse } from "next/server";

type TranslationRequest = {
  source?: "fr" | "en";
  target?: "fr" | "en";
  text?: string;
};

const translateWithCloudApi = async (text: string, source: "fr" | "en", target: "fr" | "en") => {
  const key = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!key) return null;

  const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ format: "text", q: [text], source, target })
  });
  if (!response.ok) throw new Error("Google Cloud Translate request failed");
  const result = await response.json();
  return String(result?.data?.translations?.[0]?.translatedText || "");
};

const translateWithGoogleFallback = async (text: string, source: "fr" | "en", target: "fr" | "en") => {
  const params = new URLSearchParams({
    client: "gtx",
    dt: "t",
    q: text,
    sl: source,
    tl: target
  });
  const response = await fetch(`https://translate.googleapis.com/translate_a/single?${params.toString()}`, {
    cache: "no-store"
  });
  if (!response.ok) throw new Error("Google Translate request failed");
  const result = await response.json();
  return Array.isArray(result?.[0])
    ? result[0].map((segment: unknown[]) => (Array.isArray(segment) ? segment[0] : "")).join("")
    : "";
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TranslationRequest;
    const source = body.source === "en" ? "en" : "fr";
    const target = body.target === "fr" ? "fr" : "en";
    const text = String(body.text || "").trim();

    if (!text) {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    const cloudTranslation = await translateWithCloudApi(text, source, target);
    const translatedText = cloudTranslation ?? await translateWithGoogleFallback(text, source, target);

    return NextResponse.json({ translatedText });
  } catch {
    return NextResponse.json({ error: "Translation failed" }, { status: 502 });
  }
}
