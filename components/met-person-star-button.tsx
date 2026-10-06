"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MetPersonStarButton({
  eventId,
  personId,
  initialSelected,
  canEdit,
  isSelf,
}: {
  eventId: string;
  personId: string;
  initialSelected: boolean;
  canEdit: boolean;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState(initialSelected);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function toggle() {
    if (isSelf) return;

    if (!canEdit) {
      router.push(`/events/${eventId}/login`);
      return;
    }

    setBusy(true);
    setError("");

    try {
      const response = await fetch(
        `/api/events/${eventId}/met/${personId}`,
        { method: selected ? "DELETE" : "POST" },
      );
      const data = (await response.json()) as {
        selected?: boolean;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "話した人を更新できませんでした。");
      }

      setSelected(Boolean(data.selected));
      router.refresh();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "話した人を更新できませんでした。",
      );
    } finally {
      setBusy(false);
    }
  }

  if (isSelf) {
    return (
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f2f5f6] text-lg text-[#b6c2c8]"
        title="自分自身"
        aria-label="自分自身"
      >
        ☆
      </span>
    );
  }

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        aria-pressed={selected}
        aria-label={selected ? "話した人から外す" : "話した人に登録"}
        title={
          canEdit
            ? selected
              ? "話した人から外す"
              : "話した人に登録"
            : "再ログインして話した人に登録"
        }
        className={`grid h-9 w-9 place-items-center rounded-xl border text-xl font-bold transition disabled:opacity-50 ${
          selected
            ? "border-[#ead77b] bg-[#fff5bd] text-[#d69b00]"
            : "border-[#dce8ed] bg-white text-[#98aab3] hover:border-[#ead77b] hover:bg-[#fffdf1] hover:text-[#d69b00]"
        }`}
      >
        {selected ? "★" : "☆"}
      </button>
      {error ? (
        <span className="absolute right-0 top-11 z-20 w-52 rounded-xl border border-[#ffd7d7] bg-white px-3 py-2 text-[11px] font-bold leading-4 text-[#b94e4e] shadow-lg">
          {error}
        </span>
      ) : null}
    </div>
  );
}
