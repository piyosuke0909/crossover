"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";

export default function ParticipantLoginForm({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"otp" | "id">("otp");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [reloginId, setReloginId] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const inputClass =
    "mt-2 w-full rounded-2xl border border-[#d9eaf2] bg-[#f9fcfe] px-4 py-3.5 text-sm font-medium outline-none focus:border-[#62bde5] focus:bg-white focus:ring-4 focus:ring-[#def4fe]";

  async function requestOtp() {
    setError("");
    setBusy(true);
    const response = await fetch(`/api/events/${eventId}/auth/request-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = (await response.json()) as { error?: string };
    setBusy(false);

    if (!response.ok) {
      setError(data.error || "OTPを送信できませんでした。");
      return;
    }
    setOtpSent(true);
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);

    const endpoint =
      mode === "otp"
        ? `/api/events/${eventId}/auth/verify-otp`
        : `/api/events/${eventId}/auth/login-id`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        mode === "otp"
          ? { email, code: otp }
          : { email, reloginId },
      ),
    });

    const data = (await response.json()) as { error?: string };
    setBusy(false);

    if (!response.ok) {
      setError(data.error || "再ログインできませんでした。");
      return;
    }

    router.push(`/events/${eventId}/me`);
    router.refresh();
  }

  return (
    <div className="mt-5">
      <div className="grid grid-cols-2 gap-2 rounded-[22px] bg-[#eef7fb] p-1.5">
        <button
          type="button"
          onClick={() => {
            setMode("otp");
            setError("");
          }}
          className={`rounded-2xl px-3 py-3 text-sm font-extrabold transition ${
            mode === "otp" ? "bg-white text-[#278fb9] shadow-sm" : "text-[#728792]"
          }`}
        >
          メールOTP
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("id");
            setError("");
          }}
          className={`rounded-2xl px-3 py-3 text-sm font-extrabold transition ${
            mode === "id" ? "bg-white text-[#278fb9] shadow-sm" : "text-[#728792]"
          }`}
        >
          再ログインID
        </button>
      </div>

      <form onSubmit={submit} className="mt-5 space-y-5">
        <label className="block text-sm font-extrabold text-[#3d5663]">
          登録したメールアドレス
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="name@example.com"
          />
        </label>

        {mode === "otp" ? (
          <>
            {!otpSent ? (
              <button
                type="button"
                disabled={busy}
                onClick={requestOtp}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#cfe7f1] bg-[#f3fbff] px-4 py-3.5 text-sm font-extrabold text-[#278fb9] disabled:opacity-50"
              >
                <Icon name="mail" className="h-5 w-5" />
                {busy ? "送信中..." : "OTPをメールで受け取る"}
              </button>
            ) : (
              <label className="block text-sm font-extrabold text-[#3d5663]">
                6桁のOTP
                <input
                  required
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className={inputClass}
                  placeholder="123456"
                />
                <span className="mt-2 block text-xs font-medium text-[#7c909b]">
                  メールに届いたコードを入力してください。有効期限は10分です。
                </span>
              </label>
            )}
          </>
        ) : (
          <label className="block text-sm font-extrabold text-[#3d5663]">
            再ログインID
            <input
              required
              value={reloginId}
              onChange={(e) => setReloginId(e.target.value.toUpperCase())}
              className={inputClass}
              placeholder="CR-XXXX-XXXX-XXXX"
            />
          </label>
        )}

        {error ? (
          <p className="rounded-2xl border border-[#ffd7d7] bg-[#fff4f4] px-4 py-3 text-sm font-bold text-[#b94e4e]">
            {error}
          </p>
        ) : null}

        {(mode === "id" || otpSent) ? (
          <button
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#4db7e5] px-5 py-4 font-extrabold text-white disabled:opacity-50"
          >
            <Icon name={mode === "id" ? "key" : "lock"} className="h-5 w-5" />
            {busy ? "確認中..." : "再ログインする"}
          </button>
        ) : null}
      </form>
    </div>
  );
}
