"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type EventValue = {
  id: string;
  name: string;
  eventDate: string;
  venue: string;
  description: string;
  isActive: boolean;
};

export default function AdminEventForm({
  event,
}: {
  event?: EventValue;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setStatus("saving");

    const form = new FormData(e.currentTarget);
    const localDate = String(form.get("eventDate") ?? "");
    const parsedDate = new Date(localDate);

    if (!localDate || Number.isNaN(parsedDate.getTime())) {
      setError("開催日時を正しく入力してください。");
      setStatus("error");
      return;
    }

    const body = {
      name: String(form.get("name") ?? ""),
      eventDate: parsedDate.toISOString(),
      venue: String(form.get("venue") ?? ""),
      description: String(form.get("description") ?? ""),
      isActive: form.get("isActive") === "on",
    };

    const response = await fetch(
      event ? `/api/admin/events/${event.id}` : "/api/admin/events",
      {
        method: event ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );

    const data = (await response.json()) as { id?: string; error?: string };

    if (!response.ok) {
      setError(data.error || "保存に失敗しました。");
      setStatus("error");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  const inputClass =
    "mt-2 w-full rounded-2xl border border-[#d9eaf2] bg-[#f9fcfe] px-4 py-3.5 text-sm font-medium text-[#173042] outline-none transition focus:border-[#62bde5] focus:bg-white focus:ring-4 focus:ring-[#def4fe]";

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      <label className="block text-sm font-extrabold text-[#3d5663]">
        イベント名 <span className="text-[#e56c6c]">*</span>
        <input
          required
          maxLength={200}
          name="name"
          defaultValue={event?.name ?? ""}
          className={inputClass}
          placeholder="クロスオーバー企業交流会"
        />
      </label>

      <label className="block text-sm font-extrabold text-[#3d5663]">
        開催日時 <span className="text-[#e56c6c]">*</span>
        <input
          required
          type="datetime-local"
          name="eventDate"
          defaultValue={event?.eventDate ?? ""}
          className={inputClass}
        />
      </label>

      <label className="block text-sm font-extrabold text-[#3d5663]">
        会場
        <input
          maxLength={200}
          name="venue"
          defaultValue={event?.venue ?? ""}
          className={inputClass}
          placeholder="犬山市..."
        />
        <span className="mt-1 block text-right text-[11px] font-medium text-[#8a9ca5]">
          200文字以内
        </span>
      </label>

      <label className="block text-sm font-extrabold text-[#3d5663]">
        説明
        <textarea
          maxLength={200}
          name="description"
          defaultValue={event?.description ?? ""}
          rows={5}
          className={inputClass}
          placeholder="交流会の説明を入力してください"
        />
        <span className="mt-1 block text-right text-[11px] font-medium text-[#8a9ca5]">
          200文字以内
        </span>
      </label>

      <label className="flex items-center justify-between rounded-2xl border border-[#d9eaf2] bg-[#f9fcfe] px-4 py-4">
        <div>
          <p className="text-sm font-extrabold text-[#3d5663]">公開する</p>
          <p className="mt-1 text-xs text-[#8397a1]">
            オフの場合、参加者からイベントを開けません。
          </p>
        </div>
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={event?.isActive ?? true}
          className="h-5 w-5 accent-[#4db7e5]"
        />
      </label>

      {error ? (
        <p className="rounded-2xl border border-[#ffd7d7] bg-[#fff4f4] px-4 py-3 text-sm font-bold text-[#b94e4e]">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "saving"}
        className="w-full rounded-2xl bg-[#4db7e5] px-5 py-4 text-sm font-extrabold text-white shadow-[0_10px_22px_rgba(55,166,214,0.26)] disabled:opacity-55"
      >
        {status === "saving"
          ? "保存中..."
          : event
            ? "変更を保存"
            : "イベントを作成"}
      </button>
    </form>
  );
}
