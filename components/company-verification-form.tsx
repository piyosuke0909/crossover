"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { readApiJson } from "@/lib/response-json";

export default function CompanyVerificationForm({
  eventId,
  verified,
}: {
  eventId: string;
  verified: boolean;
}) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || verified || success) return;

    setBusy(true);
    setError("");
    try {
      await readApiJson<{ success: boolean }>(
        await fetch(`/api/events/${eventId}/me/verify-company`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: code.trim() }),
        }),
        "企業認証に失敗しました。",
      );
      setSuccess(true);
      setCode("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "認証できませんでした。");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-5 rounded-[26px] border border-[#dcebf2] bg-white p-5">
      <h2 className="text-base font-extrabold">企業参加コードで認証</h2>
      {verified || success ? (
        <p className="mt-3 rounded-2xl bg-[#eafaf1] px-4 py-3 text-sm font-bold leading-6 text-[#24765a]">
          企業コード認証済みです。プロフィールと参加企業の担当者欄に認証バッジが表示されます。
        </p>
      ) : (
        <>
          <p className="mt-2 text-xs leading-6 text-[#6c8391]">
            登録はコードなしでも可能です。所属企業から共有されたコードを入力すると、
            あなたのプロフィールに「企業コード認証済み」バッジが付きます。
          </p>
          <form onSubmit={submit} className="mt-4 space-y-3">
            <label className="block text-xs font-bold text-[#43616f]">
              企業参加コード
              <input
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                maxLength={20}
                autoComplete="off"
                placeholder="企業参加コードを入力"
                required
                className="mt-2 w-full rounded-xl border border-[#cfe1e9] bg-[#f9fcfe] px-4 py-3 text-sm font-bold tracking-wide outline-none focus:border-[#4db7e5]"
              />
            </label>
            {error ? <p role="alert" className="text-xs font-bold text-[#b94e4e]">{error}</p> : null}
            <button
              type="submit"
              disabled={busy || !code.trim()}
              className="w-full rounded-xl bg-[#4db7e5] px-4 py-3 text-sm font-extrabold text-white disabled:opacity-50"
            >
              {busy ? "確認中..." : "認証してバッジを取得する"}
            </button>
          </form>
        </>
      )}
    </section>
  );
}
