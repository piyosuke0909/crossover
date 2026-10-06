"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";

export default function AdminCompanyCode({ companyId }: { companyId: string }) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  async function issue() {
    if (
      !window.confirm(
        "新しい企業参加コードを発行します。以前のコードは使えなくなります。よろしいですか？",
      )
    ) {
      return;
    }

    setBusy(true);
    const response = await fetch(`/api/admin/companies/${companyId}/access-code`, {
      method: "POST",
    });
    const data = (await response.json()) as { code?: string; error?: string };
    setBusy(false);

    if (!response.ok || !data.code) {
      alert(data.error || "コードを発行できませんでした。");
      return;
    }
    setCode(data.code);
  }

  return (
    <section className="mt-5 rounded-[22px] border border-[#dcebf2] bg-[#f8fcfe] p-4">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#e7f7ff] text-[#278fb9]">
          <Icon name="lock" className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="font-extrabold">企業参加コード</h2>
          <p className="mt-1 text-xs leading-5 text-[#728792]">
            登録済み企業へ新しい担当者を追加するときに使います。
          </p>
        </div>
      </div>

      {code ? (
        <div className="mt-4 rounded-2xl bg-white px-4 py-4 text-center font-mono text-2xl font-extrabold tracking-[0.18em] text-[#245f78] ring-1 ring-[#dbeaf0]">
          {code}
        </div>
      ) : null}

      <button
        type="button"
        disabled={busy}
        onClick={issue}
        className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#cfe7f1] bg-white px-3.5 py-2 text-xs font-extrabold text-[#2f8fb7] disabled:opacity-50"
      >
        <Icon name="lock" className="h-4 w-4" />
        {busy ? "発行中..." : "参加コードを再発行"}
      </button>
    </section>
  );
}
