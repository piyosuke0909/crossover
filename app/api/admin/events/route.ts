import { NextResponse } from "next/server";
export async function POST() {
  return NextResponse.json({ error: "新しい交流会の作成はできません。" }, { status: 405 });
}
