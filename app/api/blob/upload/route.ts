import { NextResponse } from "next/server";

/** Photo uploads were retired to avoid growing storage and bandwidth costs. */
export async function POST() {
  return NextResponse.json(
    { error: "画像アップロード機能は終了しました。" },
    { status: 410 },
  );
}
