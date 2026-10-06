"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";

export default function AdminVisibilityButton({
  endpoint,
  hidden,
}: {
  endpoint: string;
  hidden: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    const response = await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isHidden: !hidden }),
    });
    setBusy(false);

    if (!response.ok) {
      alert("表示状態の変更に失敗しました。");
      return;
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={toggle}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-extrabold disabled:opacity-50 ${
        hidden
          ? "border-[#cfe9d8] bg-[#f2fbf5] text-[#47865d]"
          : "border-[#f0d8d4] bg-[#fff7f5] text-[#a95852]"
      }`}
    >
      <Icon name={hidden ? "eye" : "eye-off"} className="h-4 w-4" />
      {hidden ? "表示に戻す" : "非表示にする"}
    </button>
  );
}
