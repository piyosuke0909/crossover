"use client";

import { FormEvent, useState } from "react";
import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";

type Industry = {
  id: string;
  name: string;
};

type Props = {
  eventId: string;
  industries: Industry[];
};

export default function ProfileRegisterForm({
  eventId,
  industries,
}: Props) {
  const router = useRouter();
  const [photo, setPhoto] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "idle" | "uploading" | "saving" | "error"
  >("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!photo) {
      setError("担当者の顔写真を選択してください。");
      return;
    }

    const form = new FormData(event.currentTarget);

    try {
      setStatus("uploading");

      const blob = await upload(
        "events/" +
          eventId +
          "/people/" +
          crypto.randomUUID() +
          "-" +
          photo.name,
        photo,
        {
          access: "public",
          handleUploadUrl: "/api/blob/upload",
          clientPayload: JSON.stringify({ eventId }),
        },
      );

      setStatus("saving");

      const response = await fetch("/api/events/" + eventId + "/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company: {
            name: String(form.get("companyName") ?? ""),
            phone: String(form.get("companyPhone") ?? ""),
            postalCode: String(form.get("postalCode") ?? ""),
            address: String(form.get("address") ?? ""),
            websiteUrl: String(form.get("websiteUrl") ?? ""),
            industryId: String(form.get("industryId") ?? ""),
            businessDescription: String(
              form.get("businessDescription") ?? "",
            ),
            profile: String(form.get("companyProfile") ?? ""),
          },
          person: {
            name: String(form.get("personName") ?? ""),
            photoUrl: blob.url,
            department: String(form.get("department") ?? ""),
            position: String(form.get("position") ?? ""),
            phone: String(form.get("personPhone") ?? ""),
            responsibility: String(form.get("responsibility") ?? ""),
            profile: String(form.get("personProfile") ?? ""),
          },
        }),
      });

      const data = (await response.json()) as {
        companyId?: string;
        error?: string;
      };

      if (!response.ok || !data.companyId) {
        throw new Error(data.error || "登録に失敗しました。");
      }

      router.push(
        "/events/" + eventId + "/companies/" + data.companyId,
      );
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "登録に失敗しました。");
      setStatus("error");
    }
  }

  const inputClass =
    "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 outline-none focus:border-slate-600";

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 space-y-8 rounded-3xl bg-white p-5 shadow-sm sm:p-7"
    >
      <section>
        <h2 className="text-lg font-semibold">会社情報</h2>
        <div className="mt-4 grid gap-4">
          <label className="text-sm font-medium">
            企業名 <span className="text-red-600">*</span>
            <input
              required
              name="companyName"
              className={inputClass}
              placeholder="株式会社○○"
            />
          </label>

          <label className="text-sm font-medium">
            業界 <span className="text-red-600">*</span>
            <select
              required
              name="industryId"
              className={inputClass}
              defaultValue=""
            >
              <option value="" disabled>
                選択してください
              </option>
              {industries.map((industry) => (
                <option key={industry.id} value={industry.id}>
                  {industry.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium">
            事業内容 <span className="text-red-600">*</span>
            <textarea
              required
              name="businessDescription"
              className={inputClass}
              rows={4}
              placeholder="主な事業内容を入力してください"
            />
          </label>

          <label className="text-sm font-medium">
            企業プロフィール
            <textarea
              name="companyProfile"
              className={inputClass}
              rows={4}
              placeholder="会社の特徴や交流会で話したい内容など"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">
              電話番号
              <input name="companyPhone" className={inputClass} />
            </label>
            <label className="text-sm font-medium">
              郵便番号
              <input name="postalCode" className={inputClass} />
            </label>
          </div>

          <label className="text-sm font-medium">
            住所
            <input name="address" className={inputClass} />
          </label>

          <label className="text-sm font-medium">
            Webサイト
            <input
              name="websiteUrl"
              type="url"
              className={inputClass}
              placeholder="https://..."
            />
          </label>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">担当者情報</h2>
        <div className="mt-4 grid gap-4">
          <label className="text-sm font-medium">
            氏名 <span className="text-red-600">*</span>
            <input required name="personName" className={inputClass} />
          </label>

          <label className="text-sm font-medium">
            顔写真 <span className="text-red-600">*</span>
            <input
              required
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="mt-2 block w-full text-sm"
              onChange={(event) => setPhoto(event.target.files?.[0] ?? null)}
            />
            <span className="mt-1 block text-xs font-normal text-slate-500">
              JPEG / PNG / WebP、最大5MB
            </span>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">
              部署
              <input name="department" className={inputClass} />
            </label>
            <label className="text-sm font-medium">
              役職
              <input name="position" className={inputClass} />
            </label>
          </div>

          <label className="text-sm font-medium">
            電話番号
            <input name="personPhone" className={inputClass} />
          </label>

          <label className="text-sm font-medium">
            担当業務
            <input
              name="responsibility"
              className={inputClass}
              placeholder="営業、採用、開発など"
            />
          </label>

          <label className="text-sm font-medium">
            自己紹介
            <textarea
              name="personProfile"
              className={inputClass}
              rows={4}
            />
          </label>
        </div>
      </section>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "uploading" || status === "saving"}
        className="w-full rounded-2xl bg-slate-900 px-5 py-4 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "uploading"
          ? "顔写真をアップロード中..."
          : status === "saving"
            ? "プロフィールを登録中..."
            : "登録する"}
      </button>
    </form>
  );
}
