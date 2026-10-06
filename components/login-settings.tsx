"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";

export default function LoginSettings({
  eventId,
  email,
  initialOtpEnabled,
}: {
  eventId: string;
  email: string | null;
  initialOtpEnabled: boolean;
}) {
  const [otpEnabled, setOtpEnabled] = useState(initialOtpEnabled);
  const [otpRequested, setOtpRequested] = useState(false);
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function requestVerificationOtp() {
    setBusy(true);
    setError("");
    setMessage("");
    const response = await fetch(
      `/api/events/${eventId}/me/auth-settings/request-otp`,
      { method: "POST" },
    );
    const data = (await response.json()) as { error?: string };
    setBusy(false);

    if (!response.ok) {
      setError(data.error || "OTPを送信できませんでした。");
      return;
    }

    setOtpRequested(true);
    setMessage("確認コードをメールへ送信しました。");
  }

  async function verifyOtp() {
    setBusy(true);
    setError("");
    setMessage("");
    const response = await fetch(
      `/api/events/${eventId}/me/auth-settings/verify-otp`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: otp }),
      },
    );
    const data = (await response.json()) as { error?: string };
    setBusy(false);

    if (!response.ok) {
      setError(data.error || "OTPを確認できませんでした。");
      return;
    }

    setOtpEnabled(true);
    setOtpRequested(false);
    setOtp("");
    setMessage("メールOTPでの再ログインを有効にしました。");
  }

  async function disableOtp() {
    setBusy(true);
    setError("");
    setMessage("");
    const response = await fetch(
      `/api/events/${eventId}/me/auth-settings`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOtpEnabled: false }),
      },
    );
    const data = (await response.json()) as { error?: string };
    setBusy(false);

    if (!response.ok) {
      setError(data.error || "設定を変更できませんでした。");
      return;
    }

    setOtpEnabled(false);
    setOtpRequested(false);
    setMessage("メールOTPでの再ログインを無効にしました。");
  }

  async function issueReloginCode() {
    setBusy(true);
    setError("");
    setMessage("");
    const response = await fetch(
      `/api/events/${eventId}/me/relogin-code`,
      { method: "POST" },
    );
    const data = (await response.json()) as {
      error?: string;
      sentTo?: string;
    };
    setBusy(false);

    if (!response.ok) {
      setError(data.error || "再ログインIDを発行できませんでした。");
      return;
    }

    setMessage(
      data.sentTo
        ? `${data.sentTo} へ再ログインIDを送信しました。`
        : "再ログインIDをメールへ送信しました。",
    );
  }

  return (
    <section className="mt-5 rounded-[26px] border border-[#e1eef4] bg-white p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e7f7ff] text-[#278fb9]">
          <Icon name="lock" className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-extrabold">再ログイン設定</h2>
          <p className="mt-1 text-xs leading-5 text-[#7c909b]">
            セッションが切れたときの本人確認方法を設定できます。
          </p>
        </div>
      </div>

      {!email ? (
        <p className="mt-4 rounded-2xl bg-[#fff5c9] px-4 py-3 text-sm font-bold text-[#7d681f]">
          メール認証を使うには、プロフィール編集からメールアドレスを登録してください。
        </p>
      ) : (
        <div className="mt-5 grid gap-4">
          <div className="rounded-[22px] border border-[#e4eef3] bg-[#fbfdfe] p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Icon name="mail" className="h-5 w-5 text-[#278fb9]" />
                  <h3 className="font-extrabold">メールOTP</h3>
                </div>
                <p className="mt-2 break-all text-xs leading-5 text-[#718792]">
                  {email} に6桁コードを送り、再ログインできます。
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                  otpEnabled
                    ? "bg-[#e8f8ee] text-[#47865d]"
                    : "bg-[#f0f2f3] text-[#7a8990]"
                }`}
              >
                {otpEnabled ? "有効" : "無効"}
              </span>
            </div>

            {!otpEnabled && !otpRequested ? (
              <button
                type="button"
                disabled={busy}
                onClick={requestVerificationOtp}
                className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#cfe7f1] bg-white px-3.5 py-2 text-xs font-extrabold text-[#2f8fb7] disabled:opacity-50"
              >
                <Icon name="mail" className="h-4 w-4" />
                メールが届くか確認して有効にする
              </button>
            ) : null}

            {!otpEnabled && otpRequested ? (
              <div className="mt-4">
                <label className="block text-xs font-extrabold text-[#506b78]">
                  メールに届いた6桁コード
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    className="mt-2 w-full rounded-2xl border border-[#d9eaf2] bg-white px-4 py-3 text-sm font-bold tracking-[0.18em] outline-none focus:border-[#62bde5]"
                    placeholder="123456"
                  />
                </label>
                <button
                  type="button"
                  disabled={busy || otp.length !== 6}
                  onClick={verifyOtp}
                  className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#4db7e5] px-4 py-2 text-xs font-extrabold text-white disabled:opacity-50"
                >
                  <Icon name="lock" className="h-4 w-4" />
                  確認して有効化
                </button>
              </div>
            ) : null}

            {otpEnabled ? (
              <button
                type="button"
                disabled={busy}
                onClick={disableOtp}
                className="mt-4 inline-flex min-h-10 items-center rounded-xl border border-[#e2e9ec] bg-white px-3.5 py-2 text-xs font-extrabold text-[#6d8089] disabled:opacity-50"
              >
                メールOTPを無効にする
              </button>
            ) : null}
          </div>

          <div className="rounded-[22px] border border-[#eee3b8] bg-[#fffdf4] p-4">
            <div className="flex items-center gap-2">
              <Icon name="key" className="h-5 w-5 text-[#8a6f1a]" />
              <h3 className="font-extrabold">再ログインID</h3>
            </div>
            <p className="mt-2 text-xs leading-5 text-[#7c7046]">
              長期保管用の再ログインIDをメールへ発行します。新しく発行すると以前のIDは無効になります。
            </p>
            <button
              type="button"
              disabled={busy}
              onClick={issueReloginCode}
              className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#eadfae] bg-white px-3.5 py-2 text-xs font-extrabold text-[#7d681f] disabled:opacity-50"
            >
              <Icon name="mail" className="h-4 w-4" />
              再ログインIDをメールで発行
            </button>
          </div>
        </div>
      )}

      {message ? (
        <p className="mt-4 rounded-2xl bg-[#eefaf2] px-4 py-3 text-xs font-bold leading-5 text-[#4b805d]">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 rounded-2xl bg-[#fff4f4] px-4 py-3 text-xs font-bold leading-5 text-[#b94e4e]">
          {error}
        </p>
      ) : null}
    </section>
  );
}
