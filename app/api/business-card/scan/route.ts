import { NextResponse } from "next/server";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024;

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
    return NextResponse.json({ error: "名刺画像を選択してください。" }, { status: 400 });
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

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
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
    },
  );

  if (!response.ok) {
    return NextResponse.json(
      { error: "名刺の解析に失敗しました。もう一度お試しください。" },
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
    return NextResponse.json({ error: "名刺から文字を読み取れませんでした。" }, { status: 422 });
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const clean = (key: string) =>
      typeof parsed[key] === "string" ? String(parsed[key]).trim().slice(0, 200) : "";

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
  } catch {
    return NextResponse.json({ error: "名刺解析結果の形式が不正でした。" }, { status: 502 });
  }
}
