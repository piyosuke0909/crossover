import { NextResponse } from "next/server";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024;
const GEMINI_MODEL = "gemini-3.6-flash";

type GeminiErrorPayload = {
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
};

function publicGeminiError(status: number, message: string) {
  const normalized = message.toLowerCase();

  if (
    status === 401 ||
    status === 403 ||
    normalized.includes("api key") ||
    normalized.includes("permission_denied") ||
    normalized.includes("permission denied")
  ) {
    return "Gemini APIの認証に失敗しました。Google AI Studioで作成したAuth keyをGEMINI_API_KEYに設定してください。";
  }

  if (
    status === 429 ||
    normalized.includes("resource_exhausted") ||
    normalized.includes("quota")
  ) {
    return "Gemini APIの利用上限に達しています。Google AI Studioの利用枠・課金設定を確認してください。";
  }

  if (status === 404 || normalized.includes("not found")) {
    return `Geminiモデル（${GEMINI_MODEL}）を利用できません。API設定またはモデル利用可否を確認してください。`;
  }

  if (status === 400) {
    return "Gemini APIへのリクエストが不正です。名刺画像の形式やAPI設定を確認してください。";
  }

  return `Gemini APIでエラーが発生しました（HTTP ${status}）。サーバーログのGeminiエラー詳細を確認してください。`;
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "名刺スキャン用のGEMINI_API_KEYが設定されていません。" },
      { status: 503 },
    );
  }

  const formData = await request.formData();
  const image = formData.get("image");

  if (!(image instanceof File)) {
    return NextResponse.json(
      { error: "名刺画像を選択してください。" },
      { status: 400 },
    );
  }

  if (!ALLOWED_TYPES.has(image.type) || image.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "名刺画像はJPEG / PNG / WebP、5MB以内にしてください。" },
      { status: 400 },
    );
  }

  const data = Buffer.from(await image.arrayBuffer()).toString("base64");
  const prompt = `この名刺画像からプロフィール入力に使える情報を読み取ってください。
推測で埋めず、画像から確認できない項目は空文字にしてください。
JSONのみを返してください。
キー:
companyName, personName, department, position, companyPhone, personPhone, email, postalCode, address, websiteUrl, industryHint`;

  let response: Response;

  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { inline_data: { mime_type: image.type, data } },
                { text: prompt },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0,
          },
        }),
        signal: AbortSignal.timeout(30_000),
      },
    );
  } catch (error) {
    console.error("Gemini business card request failed before response", {
      model: GEMINI_MODEL,
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        error:
          "Gemini APIへ接続できませんでした。ネットワーク状態を確認してもう一度お試しください。",
      },
      { status: 502 },
    );
  }

  if (!response.ok) {
    const rawError = await response.text();

    let geminiError: GeminiErrorPayload | null = null;
    try {
      geminiError = JSON.parse(rawError) as GeminiErrorPayload;
    } catch {
      // GoogleがJSON以外を返した場合も、秘密値を含めずHTTP情報だけ記録する。
    }

    const googleMessage =
      geminiError?.error?.message?.slice(0, 1000) || rawError.slice(0, 1000);
    const googleStatus = geminiError?.error?.status;

    console.error("Gemini business card scan failed", {
      model: GEMINI_MODEL,
      httpStatus: response.status,
      httpStatusText: response.statusText,
      googleStatus,
      googleMessage,
    });

    return NextResponse.json(
      {
        error: publicGeminiError(response.status, googleMessage),
        code: googleStatus || `HTTP_${response.status}`,
      },
      { status: 502 },
    );
  }

  const result = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const raw = result.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();

  if (!raw) {
    console.error("Gemini business card scan returned no text", {
      model: GEMINI_MODEL,
    });

    return NextResponse.json(
      { error: "名刺から文字を読み取れませんでした。" },
      { status: 422 },
    );
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const clean = (key: string) =>
      typeof parsed[key] === "string"
        ? String(parsed[key]).trim().slice(0, 200)
        : "";

    return NextResponse.json({
      companyName: clean("companyName"),
      personName: clean("personName"),
      department: clean("department"),
      position: clean("position"),
      companyPhone: clean("companyPhone"),
      personPhone: clean("personPhone"),
      email: clean("email"),
      postalCode: clean("postalCode"),
      address: clean("address"),
      websiteUrl: clean("websiteUrl"),
      industryHint: clean("industryHint"),
    });
  } catch (error) {
    console.error("Gemini business card JSON parse failed", {
      model: GEMINI_MODEL,
      error: error instanceof Error ? error.message : String(error),
      responsePreview: raw.slice(0, 500),
    });

    return NextResponse.json(
      { error: "名刺解析結果の形式が不正でした。" },
      { status: 502 },
    );
  }
}
