"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";

type Status = "saving" | "saved" | "already" | "login-required" | "error";

export default function MeetRegistrar({
  eventId,
  personId,
}: {
  eventId: string;
  personId: string;
}) {
  const [status, setStatus] = useState<Status>("saving");
  const [message, setMessage] = useState("話した人に追加しています...");

  useEffect(() => {
    let cancelled = false;

    async function registerEncounter() {
      try {
        const response = await fetch(
          `/api/events/${eventId}/meet/${personId}`,
          { method: "POST" },
        );

        const data = (await response.json()) as {
          created?: boolean;
          error?: string;
        };

        if (cancelled) return;

        if (response.status === 401) {
          setStatus("login-required");
          setMessage("先に自分のプロフィール登録が必要です。");
          return;
        }

        if (!response.ok) {
          setStatus("error");
          setMessage(data.error || "話した人に追加できませんでした。");
          return;
        }

        if (data.created === false) {
          setStatus("already");
          setMessage("この方はすでに「話した人」に登録されています。");
          return;
        }

        setStatus("saved");
        setMessage("「話した人」に追加しました！");
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage("通信に失敗しました。もう一度お試しください。");
        }
      }
    }

    registerEncounter();

    return () => {
      cancelled = true;
    };
  }, [eventId, personId]);

  const success = status === "saved" || status === "already";

  return (
    <section
      className={`mt-5 rounded-[26px] border p-5 text-center ${
        success
          ? "border-[#cfead8] bg-[#f2fbf5]"
          : status === "login-required"
            ? "border-[#eee3b6] bg-[#fffbea]"
            : "border-[#dcecf3] bg-white"
      }`}
    >
      <span
        className={`mx-auto grid h-14 w-14 place-items-center rounded-[20px] ${
          success
            ? "bg-[#dff5e7] text-[#4a9665]"
            : "bg-[#e6f7ff] text-[#269ed0]"
        }`}
      >
        <Icon
          name={success ? "handshake" : "qr"}
          className="h-7 w-7"
        />
      </span>

      <p className="mt-4 font-extrabold">{message}</p>

      {status === "login-required" ? (
        <Link
          href={`/events/${eventId}/register`}
          className="mt-4 inline-flex rounded-2xl bg-[#4db7e5] px-5 py-3 text-sm font-extrabold text-white"
        >
          プロフィール登録へ
        </Link>
      ) : success ? (
        <Link
          href={`/events/${eventId}/met`}
          className="mt-4 inline-flex rounded-2xl bg-[#4db7e5] px-5 py-3 text-sm font-extrabold text-white"
        >
          話した人一覧を見る
        </Link>
      ) : null}
    </section>
  );
}
