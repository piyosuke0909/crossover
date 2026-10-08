import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  BUSINESS_CARD_SCAN_COOKIE,
  BUSINESS_CARD_SCAN_MAX_AGE,
  createScanUsedCookie,
  isScanUsedCookie,
} from "@/lib/business-card-usage";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024;
const GEMINI_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
] as const;
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);
const MAX_ATTEMPTS_PER_MODEL = 2;

type GeminiErrorPayload = {
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
};

type GeminiSuccessPayload = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
};

type GeminiFailure = {
  model: string;
  httpStatus: number;
  httpStatusText: string;
  googleStatus?: string;
  googleMessage: string;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function publicGeminiError(failure: GeminiFailure) {
  const normalized = failure.googleMessage.toLowerCase();

  if (
    failure.httpStatus === 401 ||
    failure.httpStatus === 403 ||
    normalized.includes("api key") ||
    normalized.includes("permission_denied") ||
    normalized.includes("permission denied")
  ) {
    return "Gemini APIの認証に失敗しました。Google AI Studioで作成したAuth keyをGEMINI_API_KEYに設定してください。";
  }

  if (
    failure.httpStatus === 429 ||
    normalized.includes("resource_exhausted") ||
    normalized.includes("quota")
  ) {
    return "Gemini APIの利用上限に達しています。Google AI Studioの利用枠・課金設定を確認してください。";
  }

  if (
    failure.httpStatus === 503 ||
    failure.googleStatus === "UNAVAILABLE" ||
    normalized.includes("high demand") ||
    normalized.includes("unavailable")
  ) {
    return "Geminiが混雑しています。自動再試行と別モデルへの切り替えも行いましたが処理できませんでした。少し時間を置いてもう一度お試しください。";
  }

  if (failure.httpStatus === 404 || normalized.includes("not found")) {
    return `Geminiモデル（${failure.model}）を利用できません。API設定またはモデル利用可否を確認してください。`;
  }

  if (failure.httpStatus === 400) {
    return "Gemini APIへのリクエストが不正です。名刺画像の形式やAPI設定を確認してください。";
  }

  return `Gemini APIでエラーが発生しました（HTTP ${failure.httpStatus}）。サーバーログのGeminiエラー詳細を確認してください。`;
}

async function callGemini({
  apiKey,
  model,
  imageType,
  imageData,
  prompt,
}: {
  apiKey: string;
  model: string;
  imageType: string;
  imageData: string;
  prompt: string;
}) {
  return fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
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
              { inline_data: { mime_type: imageType, data: imageData } },
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
}

async function parseGeminiFailure(
  response: Response,
  model: string,
): Promise<GeminiFailure> {
  const rawError = await response.text();

  let geminiError: GeminiErrorPayload | null = null;
  try {
    geminiError = JSON.parse(rawError) as GeminiErrorPayload;
  } catch {
    // GoogleがJSON以外を返した場合も、秘密値を含めずHTTP情報だけ記録する。
  }

  return {
    model,
    httpStatus: response.status,
    httpStatusText: response.statusText,
    googleStatus: geminiError?.error?.status,
    googleMessage:
      geminiError?.error?.message?.slice(0, 1000) || rawError.slice(0, 1000),
  };
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  const scanSecret = process.env.PARTICIPANT_AUTH_SECRET;
  if (!apiKey || !scanSecret) {
    return NextResponse.json(
      { error: "名刺スキャンのAPIキーまたは認証設定がありません。" },
      { status: 503 },
    );
  }

  const cookieStore = await cookies();
  if (isScanUsedCookie(cookieStore.get(BUSINESS_CARD_SCAN_COOKIE)?.value, scanSecret)) {
    return NextResponse.json(
      { error: "名刺解析はこのブラウザですでに1回成功しています。以降は手入力で修正してください。", code: "SCAN_ALREADY_USED" },
      { status: 409 },
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

  const imageData = Buffer.from(await image.arrayBuffer()).toString("base64");
  const prompt = `この名刺画像からプロフィール入力に使える情報を読み取ってください。
推測で埋めず、画像から確認できない項目は空文字にしてください。
JSONのみを返してください。
キー:
companyName, personName, department, position, companyPhone, personPhone, email, postalCode, address, websiteUrl, industryHint`;

  let result: GeminiSuccessPayload | null = null;
  let usedModel: string | null = null;
  let lastFailure: GeminiFailure | null = null;

  for (const model of GEMINI_MODELS) {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_MODEL; attempt += 1) {
      let response: Response;

      try {
        response = await callGemini({
          apiKey,
          model,
          imageType: image.type,
          imageData,
          prompt,
        });
      } catch (error) {
        console.error("Gemini business card request failed before response", {
          model,
          attempt,
          error: error instanceof Error ? error.message : String(error),
        });

        if (attempt < MAX_ATTEMPTS_PER_MODEL) {
          await sleep(600 * 2 ** (attempt - 1));
          continue;
        }

        break;
      }

      if (response.ok) {
        result = (await response.json()) as GeminiSuccessPayload;
        usedModel = model;
        break;
      }

      const failure = await parseGeminiFailure(response, model);
      lastFailure = failure;

      console.error("Gemini business card scan failed", {
        ...failure,
        attempt,
      });

      if (!RETRYABLE_STATUSES.has(response.status)) {
        return NextResponse.json(
          {
            error: publicGeminiError(failure),
            code: failure.googleStatus || `HTTP_${failure.httpStatus}`,
          },
          { status: 502 },
        );
      }

      if (attempt < MAX_ATTEMPTS_PER_MODEL) {
        await sleep(600 * 2 ** (attempt - 1));
      }
    }

    if (result) break;

    console.warn("Gemini business card scan falling back to next model", {
      failedModel: model,
    });
  }

  if (!result || !usedModel) {
    if (lastFailure) {
      return NextResponse.json(
        {
          error: publicGeminiError(lastFailure),
          code:
            lastFailure.googleStatus || `HTTP_${lastFailure.httpStatus}`,
        },
        { status: 502 },
      );
    }

    return NextResponse.json(
      {
        error:
          "Gemini APIへ接続できませんでした。ネットワーク状態を確認してもう一度お試しください。",
      },
      { status: 502 },
    );
  }

  console.info("Gemini business card scan succeeded", {
    model: usedModel,
  });

  const raw = result.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();

  if (!raw) {
    console.error("Gemini business card scan returned no text", {
      model: usedModel,
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

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("JSON object expected");
    }

    const extracted = {
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
    };

    // AIが空データを返した場合は成功扱いにしない（再試行可能）。
    if (!Object.values(extracted).some(Boolean)) {
      throw new Error("No extracted fields");
    }

    const success = NextResponse.json(extracted);
    success.cookies.set(BUSINESS_CARD_SCAN_COOKIE, createScanUsedCookie(scanSecret), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: BUSINESS_CARD_SCAN_MAX_AGE,
    });
    return success;
  } catch (error) {
    console.error("Gemini business card JSON parse failed", {
      model: usedModel,
      error: error instanceof Error ? error.message : String(error),
      responsePreview: raw.slice(0, 500),
    });

    return NextResponse.json(
      { error: "名刺解析結果の形式が不正でした。" },
      { status: 502 },
    );
  }
}
