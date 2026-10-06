"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
        className={
          isActive
            ? "rounded-xl bg-[#fff1ef] px-3 py-2 text-xs font-extrabold text-[#b35b55] disabled:opacity-50"
            : "rounded-xl bg-[#e8f8ee] px-3 py-2 text-xs font-extrabold text-[#47865d] disabled:opacity-50"
        }
      >
        {isActive ? "非公開にする" : "公開する"}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={remove}
        className="rounded-xl bg-[#f5f5f5] px-3 py-2 text-xs font-extrabold text-[#7c6b6b] disabled:opacity-50"
      >
        削除
      </button>
    </>
  );
}
