"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";

export default function AdminEventActions({
  eventId,
  isActive,
}: {
  eventId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function togglePublish() {
    setBusy(true);
    const response = await fetch(`/api/admin/events/${eventId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    setBusy(false);

    if (!response.ok) {
      alert("公開状態の変更に失敗しました。");
      return;
    }

    router.refresh();
  }

  async function remove() {
    if (
      !window.confirm(
        "このイベントを削除しますか？参加履歴は保持したまま、管理一覧と公開画面から非表示になります。",
      )
    ) {
      return;
    }

    setBusy(true);
    const response = await fetch(`/api/admin/events/${eventId}`, {
      method: "DELETE",
    });
    setBusy(false);

    if (!response.ok) {
      alert("削除に失敗しました。");
      return;
    }

    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        disabled={busy}
        onClick={togglePublish}
        className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-extrabold transition disabled:opacity-50 ${
          isActive
            ? "border-[#f0d8d4] bg-[#fff7f5] text-[#a95852] hover:bg-[#fff0ed]"
            : "border-[#cfe9d8] bg-[#f2fbf5] text-[#47865d] hover:bg-[#e8f8ee]"
        }`}
      >
        <Icon
          name={isActive ? "eye-off" : "eye"}
          className="h-4 w-4 shrink-0"
        />
        {isActive ? "非公開にする" : "公開する"}
      </button>

      <button
        type="button"
        disabled={busy}
        onClick={remove}
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#e9dddd] bg-white px-3.5 py-2 text-xs font-extrabold text-[#8b6161] transition hover:bg-[#fff5f5] disabled:opacity-50"
      >
        <Icon name="trash" className="h-4 w-4 shrink-0" />
        削除
      </button>
    </>
  );
}
