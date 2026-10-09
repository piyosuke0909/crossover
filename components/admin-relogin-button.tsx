"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";

export default function AdminReloginButton({
  personId,
  email,
}: {
  personId: string;
  email: string | null;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function issue() {
    if (!email) return;
    setBusy(true);
    setMessage("");

    const response = await fetch(
      `/api/admin/people/${personId}/relogin-code`,
      { method: "POST" },
    );
    const data = (await response.json()) as {
      error?: string;
      sentTo?: string;
    };
    setBusy(false);

    setMessage(
      response.ok
        ? `${data.sentTo ?? email} へ再ログインIDを送信しました。`
        : data.error || "再ログインIDを発行できませんでした。",
    );
  }

  return (
    <section className="mt-5 rounded-[22px] border border-[#eee3b8] bg-[#fffdf4] p-4">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-[#8a6f1a]">
          <Icon name="key" className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="font-extrabold">再ログインID</h2>
          <p className="mt-1 break-all text-xs leading-5 text-[#7c7046]">
            {email
              ? `${email} 宛に本人用IDを再発行できます。`
              : "メールアドレスが未登録のため発行できません。"}
          </p>
        </div>
      </div>

      {email ? (
        <button
          type="button"
          disabled={busy}
          onClick={issue}
          className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#eadfae] bg-white px-3.5 py-2 text-xs font-extrabold text-[#7d681f] disabled:opacity-50"
        >
          <Icon name="mail" className="h-4 w-4" />
          {busy ? "送信中..." : "メールで再ログインIDを発行"}
        </button>
      ) : null}

      {message ? (
        <p className="mt-3 rounded-xl bg-white px-3 py-2 text-xs font-bold leading-5 text-[#6d6545]">
          {message}
        </p>
      ) : null}
    </section>
  );
}
