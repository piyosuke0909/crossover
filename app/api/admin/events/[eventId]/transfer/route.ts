import { NextResponse } from "next/server";
export async function POST() {
  return NextResponse.json({ error: "参加者移行機能は廃止されました。" }, { status: 410 });
}
