"use client";

import { FormEvent, useState } from "react";
import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";

type Industry = { id: string; name: string };
type Props = { eventId: string; industries: Industry[] };

const MAX_TEXT = 200;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export default function ProfileRegisterForm({ eventId, industries }: Props) {
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

    if (!ALLOWED_PHOTO_TYPES.has(photo.type)) {
      setError("顔写真はJPEG / PNG / WebPを選択してください。");
      return;
    }

    if (photo.size > MAX_PHOTO_BYTES) {
      setError("顔写真は5MB以内にしてください。");
      return;
    }

    const form = new FormData(event.currentTarget);
    const industryIds = form.getAll("industryIds").map(String);

    if (industryIds.length === 0) {
      setError("業界を1つ以上選択してください。");
      return;
    }

    try {
      setStatus("uploading");
      const blob = await upload(
        `events/${eventId}/people/${crypto.randomUUID()}-${photo.name}`,
        photo,
        {
          access: "public",
          handleUploadUrl: "/api/blob/upload",
          clientPayload: JSON.stringify({ eventId }),
        },
      );

      setStatus("saving");
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: {
            name: String(form.get("companyName") ?? ""),
            phone: String(form.get("companyPhone") ?? ""),
            postalCode: String(form.get("postalCode") ?? ""),
            address: String(form.get("address") ?? ""),
            websiteUrl: String(form.get("websiteUrl") ?? ""),
            industryIds,
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
        personId?: string;
        error?: string;
      };

      if (!response.ok || !data.personId) {
        throw new Error(data.error || "登録に失敗しました。");
      }

      router.push(`/events/${eventId}/me`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "登録に失敗しました。");
      setStatus("error");
    }
  }

  const inputClass =
    "mt-2 w-full rounded-2xl border border-[#d9eaf2] bg-[#f9fcfe] px-4 py-3.5 text-sm font-medium text-[#173042] outline-none transition placeholder:text-[#9babb4] focus:border-[#62bde5] focus:bg-white focus:ring-4 focus:ring-[#def4fe]";
  const labelClass = "text-sm font-extrabold text-[#3d5663]";
  const helpClass =
    "mt-1 block text-right text-[11px] font-medium text-[#8a9ca5]";

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-5">
      <section className="rounded-[28px] border border-[#e1eef4] bg-white p-5 shadow-[0_10px_28px_rgba(50,99,121,0.07)] sm:p-7">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-[18px] bg-[#e5f7ff] text-[#249ed1]">
            <Icon name="building" className="h-6 w-6" />
          </span>
          <div>
            <p className="text-[11px] font-extrabold tracking-[0.14em] text-[#55afd4]">
              STEP 1
            </p>
            <h2 className="font-extrabold">会社情報</h2>
          </div>
        </div>

        <div className="mt-6 grid gap-5">
          <label className={labelClass}>
            企業名 <span className="text-[#e56c6c]">*</span>
            <input
              required
              maxLength={MAX_TEXT}
              name="companyName"
              className={inputClass}
              placeholder="株式会社○○"
            />
            <span className={helpClass}>200文字以内</span>
          </label>

          <fieldset>
            <legend className={labelClass}>
              業界 <span className="text-[#e56c6c]">*</span>
              <span className="ml-2 text-xs font-medium text-[#8397a1]">
                複数選択できます
              </span>
            </legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {industries.map((industry) => (
                <label key={industry.id} className="cursor-pointer">
                  <input
                    type="checkbox"
                    name="industryIds"
                    value={industry.id}
                    className="peer sr-only"
                  />
                  <span className="inline-flex rounded-full border border-[#d6e8ef] bg-white px-3.5 py-2 text-xs font-extrabold text-[#607783] transition peer-checked:border-[#4db7e5] peer-checked:bg-[#e6f7ff] peer-checked:text-[#238fbd]">
                    {industry.name}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className={labelClass}>
            事業内容 <span className="text-[#e56c6c]">*</span>
            <textarea
              required
              maxLength={MAX_TEXT}
              name="businessDescription"
              className={inputClass}
              rows={4}
              placeholder="どんな事業をしている会社か、簡潔に入力してください"
            />
            <span className={helpClass}>200文字以内</span>
          </label>

          <label className={labelClass}>
            企業プロフィール
            <textarea
              maxLength={MAX_TEXT}
              name="companyProfile"
              className={inputClass}
              rows={4}
              placeholder="会社の特徴、強み、交流会で話したいことなど"
            />
            <span className={helpClass}>200文字以内</span>
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className={labelClass}>
              電話番号
              <input
                name="companyPhone"
                type="tel"
                inputMode="tel"
                maxLength={25}
                pattern="[0-9+() -]{8,25}"
                title="8〜25文字の数字・+・()・ハイフン・空白で入力してください"
                className={inputClass}
                placeholder="0568-00-0000"
              />
            </label>
            <label className={labelClass}>
              郵便番号
              <input
                name="postalCode"
                inputMode="numeric"
                maxLength={8}
                pattern="\d{3}-?\d{4}"
                title="123-4567の形式で入力してください"
                className={inputClass}
                placeholder="484-0000"
              />
            </label>
          </div>

          <label className={labelClass}>
            住所
            <input
              name="address"
              maxLength={MAX_TEXT}
              className={inputClass}
              placeholder="愛知県犬山市..."
            />
            <span className={helpClass}>200文字以内</span>
          </label>

          <label className={labelClass}>
            Webサイト
            <input
              name="websiteUrl"
              type="url"
              maxLength={MAX_TEXT}
              className={inputClass}
              placeholder="https://..."
            />
            <span className={helpClass}>http:// または https:// / 200文字以内</span>
          </label>
        </div>
      </section>

      <section className="rounded-[28px] border border-[#eee7c8] bg-[#fffdf3] p-5 shadow-[0_10px_28px_rgba(90,82,42,0.055)] sm:p-7">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-[18px] bg-[#fff1a8] text-[#8d711a]">
            <Icon name="user-plus" className="h-6 w-6" />
          </span>
          <div>
            <p className="text-[11px] font-extrabold tracking-[0.14em] text-[#a68a31]">
              STEP 2
            </p>
            <h2 className="font-extrabold">担当者情報</h2>
          </div>
        </div>

        <div className="mt-6 grid gap-5">
          <label className={labelClass}>
            氏名 <span className="text-[#e56c6c]">*</span>
            <input
              required
              maxLength={MAX_TEXT}
              name="personName"
              className={inputClass}
              placeholder="山田 太郎"
            />
            <span className={helpClass}>200文字以内</span>
          </label>

          <label className={labelClass}>
            顔写真 <span className="text-[#e56c6c]">*</span>
            <span className="mt-2 block rounded-[22px] border-2 border-dashed border-[#c9e4ef] bg-white p-5 text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#e9f8ff] text-[#279fd1]">
                <Icon name="user-plus" className="h-6 w-6" />
              </span>
              <span className="mt-3 block text-sm font-extrabold text-[#3f5e6d]">
                {photo ? photo.name : "顔がわかる写真を選択"}
              </span>
              <span className="mt-1 block text-xs font-medium text-[#8397a1]">
                JPEG / PNG / WebP、最大5MB
              </span>
              <input
                required
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="mt-4 block w-full text-xs text-[#718792] file:mr-3 file:rounded-full file:border-0 file:bg-[#4db7e5] file:px-4 file:py-2 file:font-extrabold file:text-white"
                onChange={(event) => {
                  const nextPhoto = event.target.files?.[0] ?? null;
                  setError("");
                  if (
                    nextPhoto &&
                    (!ALLOWED_PHOTO_TYPES.has(nextPhoto.type) ||
                      nextPhoto.size > MAX_PHOTO_BYTES)
                  ) {
                    setPhoto(null);
                    event.target.value = "";
                    setError(
                      nextPhoto.size > MAX_PHOTO_BYTES
                        ? "顔写真は5MB以内にしてください。"
                        : "顔写真はJPEG / PNG / WebPを選択してください。",
                    );
                    return;
                  }
                  setPhoto(nextPhoto);
                }}
              />
            </span>
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className={labelClass}>
              部署
              <input
                name="department"
                maxLength={MAX_TEXT}
                className={inputClass}
                placeholder="営業部"
              />
              <span className={helpClass}>200文字以内</span>
            </label>
            <label className={labelClass}>
              役職
              <input
                name="position"
                maxLength={MAX_TEXT}
                className={inputClass}
                placeholder="部長"
              />
              <span className={helpClass}>200文字以内</span>
            </label>
          </div>

          <label className={labelClass}>
            電話番号
            <input
              name="personPhone"
              type="tel"
              inputMode="tel"
              maxLength={25}
              pattern="[0-9+() -]{8,25}"
              title="8〜25文字の数字・+・()・ハイフン・空白で入力してください"
              className={inputClass}
              placeholder="090-0000-0000"
            />
          </label>

          <label className={labelClass}>
            担当業務
            <input
              name="responsibility"
              maxLength={MAX_TEXT}
              className={inputClass}
              placeholder="営業、採用、開発など"
            />
            <span className={helpClass}>200文字以内</span>
          </label>

          <label className={labelClass}>
            自己紹介
            <textarea
              name="personProfile"
              maxLength={MAX_TEXT}
              className={inputClass}
              rows={4}
              placeholder="話したいテーマや、担当している仕事について"
            />
            <span className={helpClass}>200文字以内</span>
          </label>
        </div>
      </section>

      {error ? (
        <p className="rounded-[20px] border border-[#ffd7d7] bg-[#fff4f4] px-4 py-3.5 text-sm font-bold text-[#b94e4e]">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "uploading" || status === "saving"}
        className="w-full rounded-[22px] bg-[#4db7e5] px-5 py-4 text-base font-extrabold text-white shadow-[0_12px_24px_rgba(55,166,214,0.28)] transition hover:bg-[#36a9da] disabled:cursor-not-allowed disabled:opacity-55"
      >
        {status === "uploading"
          ? "顔写真をアップロード中..."
          : status === "saving"
            ? "プロフィールを登録中..."
            : "この内容で登録する"}
      </button>

      <p className="px-3 text-center text-xs leading-5 text-[#82959f]">
        入力内容は最大200文字。登録後、この端末で自分のQRと「話した人」一覧を利用できます。
      </p>
    </form>
  );
}
