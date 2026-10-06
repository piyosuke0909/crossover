"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/icons";

type PersonOption = {
  id: string;
  name: string;
  companyName: string;
  department: string;
  position: string;
  photoUrl: string;
};

type EventOption = {
  id: string;
  name: string;
  eventDateLabel: string;
};

export default function AdminTransferForm({
  sourceEventId,
  people,
  targetEvents,
}: {
  sourceEventId: string;
  people: PersonOption[];
  targetEvents: EventOption[];
}) {
  const [targetEventId, setTargetEventId] = useState(targetEvents[0]?.id ?? "");
  const [selected, setSelected] = useState<string[]>(people.map((person) => person.id));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const allSelected = useMemo(
    () => people.length > 0 && selected.length === people.length,
    [people.length, selected.length],
  );

  async function transfer() {
    setBusy(true);
    setError("");
    setMessage("");

    const response = await fetch(
      `/api/admin/events/${sourceEventId}/transfer`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetEventId,
          personIds: selected,
        }),
      },
    );
    const data = (await response.json()) as {
      error?: string;
      transferred?: number;
      targetEventName?: string;
    };
    setBusy(false);

    if (!response.ok) {
      setError(data.error || "参加者を引き継げませんでした。");
      return;
    }

    setMessage(
      `${data.targetEventName ?? "移行先イベント"} に ${data.transferred ?? selected.length}名を引き継ぎました。`,
    );
  }

  return (
    <div className="mt-6">
      {targetEvents.length === 0 ? (
        <p className="rounded-2xl bg-[#fff5c9] px-4 py-3 text-sm font-bold leading-6 text-[#7d681f]">
          移行先にできる公開中の別イベントがありません。先に次回イベントを作成して公開してください。
        </p>
      ) : (
        <>
          <label className="block text-sm font-extrabold text-[#3d5663]">
            移行先イベント
            <div className="relative mt-2">
              <select
                value={targetEventId}
                onChange={(e) => setTargetEventId(e.target.value)}
                className="h-12 w-full appearance-none rounded-2xl border border-[#d9eaf2] bg-white pl-4 pr-12 text-sm font-semibold outline-none focus:border-[#65bfe7] focus:ring-4 focus:ring-[#dff5ff]"
              >
                {targetEvents.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}（{event.eventDateLabel}）
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-3 grid w-7 place-items-center text-[#6f8b99]">
                <Icon name="chevron-down" className="h-4 w-4" />
              </span>
            </div>
          </label>

          <div className="mt-6 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-extrabold">引き継ぐ担当者</h2>
              <p className="mt-1 text-xs text-[#7c909b]">
                同じプロフィールのまま次回イベントへ参加状態にします。
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setSelected(allSelected ? [] : people.map((person) => person.id))
              }
              className="shrink-0 rounded-xl border border-[#dce8ed] bg-white px-3 py-2 text-xs font-extrabold text-[#57717e]"
            >
              {allSelected ? "全解除" : "全選択"}
            </button>
          </div>

          <div className="mt-4 grid gap-2">
            {people.map((person) => {
              const checked = selected.includes(person.id);
              return (
                <button
                  key={person.id}
                  type="button"
                  onClick={() =>
                    setSelected((current) =>
                      checked
                        ? current.filter((id) => id !== person.id)
                        : [...current, person.id],
                    )
                  }
                  className={`flex min-w-0 items-center gap-3 rounded-[20px] border p-3 text-left transition ${
                    checked
                      ? "border-[#4db7e5] bg-[#effaff]"
                      : "border-[#e1eef4] bg-white"
                  }`}
                >
                  <span
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border text-xs font-extrabold ${
                      checked
                        ? "border-[#4db7e5] bg-[#4db7e5] text-white"
                        : "border-[#c9dce5] bg-white text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                  <img
                    src={person.photoUrl}
                    alt=""
                    className="h-11 w-11 shrink-0 rounded-2xl object-cover"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-extrabold">
                      {person.name}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-[#718792]">
                      {person.companyName}
                      {[person.department, person.position].filter(Boolean).length
                        ? ` / ${[person.department, person.position]
                            .filter(Boolean)
                            .join("・")}`
                        : ""}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {message ? (
            <p className="mt-4 rounded-2xl bg-[#eefaf2] px-4 py-3 text-sm font-bold text-[#4b805d]">
              {message}
            </p>
          ) : null}
          {error ? (
            <p className="mt-4 rounded-2xl bg-[#fff4f4] px-4 py-3 text-sm font-bold text-[#b94e4e]">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            disabled={busy || selected.length === 0 || !targetEventId}
            onClick={transfer}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#4db7e5] px-5 py-4 font-extrabold text-white disabled:opacity-50"
          >
            <Icon name="swap" className="h-5 w-5" />
            {busy
              ? "引き継ぎ中..."
              : `${selected.length}名を次回イベントへ引き継ぐ`}
          </button>
        </>
      )}
    </div>
  );
}
