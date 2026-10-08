"use client";

import { FormEvent, useState } from "react";
import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import PublicProfilePreview from "@/components/public-profile-preview";

type Industry = { id: string; name: string };
type Props = {
  eventId: string;
  industries: Industry[];
  initial: {
    company: {
      name: string;
      phone: string;
      showPhone: boolean;
      showAddress: boolean;
      postalCode: string;
      address: string;
      websiteUrl: string;
      businessDescription: string;
      profile: string;
      industryIds: string[];
    };
    person: {
      name: string;
      photoUrl: string;
      email: string;
      department: string;
      position: string;
      phone: string;
      showPhone: boolean;
      responsibility: string;
      profile: string;
    };
  };
};

const MAX_TEXT = 200;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export default function ProfileEditForm({ eventId, industries, initial }: Props) {
  const router = useRouter();
  const [company, setCompany] = useState(initial.company);
  const [person, setPerson] = useState(initial.person);
  const [industryIds, setIndustryIds] = useState(initial.company.industryIds);
  const [photo, setPhoto] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "uploading">("idle");
  const [error, setError] = useState("");
  const [review, setReview] = useState(false);

  const inputClass =
    "mt-2 w-full rounded-2xl border border-[#d9eaf2] bg-[#f9fcfe] px-4 py-3.5 text-sm font-medium outline-none focus:border-[#62bde5] focus:bg-white focus:ring-4 focus:ring-[#def4fe]";
  const labelClass = "text-sm font-extrabold text-[#3d5663]";

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (industryIds.length === 0) {
      setError("業界を1つ以上選択してください。");
      return;
    }

    if (!review) {
      setReview(true);
      return;
    }

    try {
      let photoUrl = person.photoUrl;
      if (photo) {
        if (!ALLOWED_PHOTO_TYPES.has(photo.type) || photo.size > MAX_PHOTO_BYTES) {
          throw new Error("顔写真はJPEG / PNG / WebP、5MB以内にしてください。");
        }

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
        photoUrl = blob.url;
      }

      setStatus("saving");
      const response = await fetch(`/api/events/${eventId}/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: { ...company, industryIds },
          person: { ...person, photoUrl },
        }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) throw new Error(data.error || "保存に失敗しました。");

      router.push(`/events/${eventId}/me`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存に失敗しました。");
      setStatus("idle");
    }
  }

  return (
    <form onSubmit={submit} className="mt-5 space-y-5">
      <div hidden={review} className="space-y-5">
      <section className="rounded-[28px] border border-[#e1eef4] bg-white p-5 sm:p-7">
        <h2 className="font-extrabold">会社情報</h2>
        <p className="mt-1 text-xs leading-5 text-[#80939d]">
          会社情報の変更は、同じ会社に紐づく他の担当者にも反映されます。
        </p>

        <div className="mt-5 grid gap-5">
          <label className={labelClass}>企業名 *
            <input required maxLength={MAX_TEXT} value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} className={inputClass} />
          </label>

          <fieldset>
            <legend className={labelClass}>業界 *</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {industries.map((industry) => {
                const checked = industryIds.includes(industry.id);
                return (
                  <button
                    type="button"
                    key={industry.id}
                    onClick={() =>
                      setIndustryIds((current) =>
                        checked
                          ? current.filter((id) => id !== industry.id)
                          : [...current, industry.id],
                      )
                    }
                    className={`rounded-full border px-3.5 py-2 text-xs font-extrabold ${
                      checked
                        ? "border-[#4db7e5] bg-[#e6f7ff] text-[#238fbd]"
                        : "border-[#d6e8ef] bg-white text-[#607783]"
                    }`}
                  >
                    {industry.name}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <label className={labelClass}>事業内容 *
            <textarea required maxLength={MAX_TEXT} rows={4} value={company.businessDescription} onChange={(e) => setCompany({ ...company, businessDescription: e.target.value })} className={inputClass} />
          </label>
          <label className={labelClass}>企業プロフィール
            <textarea maxLength={MAX_TEXT} rows={4} value={company.profile} onChange={(e) => setCompany({ ...company, profile: e.target.value })} className={inputClass} />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className={labelClass}>会社電話番号
              <input type="tel" maxLength={25} pattern="[0-9+() -]{8,25}" value={company.phone} onChange={(e) => setCompany({ ...company, phone: e.target.value })} className={inputClass} />
              <span className="mt-2 flex gap-2 text-xs font-bold text-[#607783]">
                <input type="checkbox" checked={company.showPhone} onChange={(e) => setCompany({ ...company, showPhone: e.target.checked })} />
                この企業電話番号を公開する
              </span>
            </label>
            <label className={labelClass}>郵便番号
              <input maxLength={8} pattern="\d{3}-?\d{4}" value={company.postalCode} onChange={(e) => setCompany({ ...company, postalCode: e.target.value })} className={inputClass} />
            </label>
          </div>

          <label className={labelClass}>住所
            <input maxLength={MAX_TEXT} value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} className={inputClass} />
            <span className="mt-2 flex gap-2 text-xs font-bold text-[#607783]">
              <input type="checkbox" checked={company.showAddress} onChange={(e) => setCompany({ ...company, showAddress: e.target.checked })} />
              この会社住所を公開する
            </span>
          </label>
          <label className={labelClass}>Webサイト
            <input type="url" maxLength={MAX_TEXT} value={company.websiteUrl} onChange={(e) => setCompany({ ...company, websiteUrl: e.target.value })} className={inputClass} />
          </label>
        </div>
      </section>

      <section className="rounded-[28px] border border-[#eee7c8] bg-[#fffdf3] p-5 sm:p-7">
        <h2 className="font-extrabold">担当者情報</h2>

        <div className="mt-5 grid gap-5">
          <div className="flex items-center gap-4 rounded-2xl bg-white p-4">
            <img src={person.photoUrl} alt="" className="h-16 w-16 rounded-2xl object-cover" />
            <label className="min-w-0 flex-1 text-sm font-extrabold text-[#3d5663]">
              顔写真を変更
              <input type="file" accept="image/jpeg,image/png,image/webp" className="mt-2 block w-full text-xs" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
            </label>
          </div>

          <label className={labelClass}>氏名 *
            <input required maxLength={MAX_TEXT} value={person.name} onChange={(e) => setPerson({ ...person, name: e.target.value })} className={inputClass} />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className={labelClass}>部署
              <input maxLength={MAX_TEXT} value={person.department} onChange={(e) => setPerson({ ...person, department: e.target.value })} className={inputClass} />
            </label>
            <label className={labelClass}>役職
              <input maxLength={MAX_TEXT} value={person.position} onChange={(e) => setPerson({ ...person, position: e.target.value })} className={inputClass} />
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className={labelClass}>電話番号
              <input type="tel" maxLength={25} pattern="[0-9+() -]{8,25}" value={person.phone} onChange={(e) => setPerson({ ...person, phone: e.target.value })} className={inputClass} />
              <span className="mt-2 flex gap-2 text-xs font-bold text-[#607783]">
                <input type="checkbox" checked={person.showPhone} onChange={(e) => setPerson({ ...person, showPhone: e.target.checked })} />
                この担当者電話番号を公開する
              </span>
            </label>
            <label className={labelClass}>メールアドレス
              <input type="email" maxLength={MAX_TEXT} value={person.email} onChange={(e) => setPerson({ ...person, email: e.target.value })} className={inputClass} />
            </label>
          </div>

          <label className={labelClass}>担当業務
            <input maxLength={MAX_TEXT} value={person.responsibility} onChange={(e) => setPerson({ ...person, responsibility: e.target.value })} className={inputClass} />
          </label>
          <label className={labelClass}>自己紹介
            <textarea maxLength={MAX_TEXT} rows={4} value={person.profile} onChange={(e) => setPerson({ ...person, profile: e.target.value })} className={inputClass} />
          </label>
        </div>
      </section>

      </div>
      {review ? (
        <div className="space-y-5">
          <p className="rounded-2xl bg-[#e9f8ff] px-4 py-3 text-sm font-extrabold text-[#357d99]">
            公開画面の見え方を確認してください。公開設定がOFFの項目は表示されません。
          </p>
          <PublicProfilePreview
            company={{
              ...company,
              industries: industries.filter((item) => industryIds.includes(item.id)).map((item) => item.name),
            }}
            person={person}
            photo={photo}
            existingPhotoUrl={person.photoUrl}
            onCompanyPhoneVisibilityChange={(visible) =>
              setCompany((current) => ({ ...current, showPhone: visible }))
            }
            onCompanyAddressVisibilityChange={(visible) =>
              setCompany((current) => ({ ...current, showAddress: visible }))
            }
            onPersonPhoneVisibilityChange={(visible) =>
              setPerson((current) => ({ ...current, showPhone: visible }))
            }
          />
          <button type="button" onClick={() => { setReview(false); setError(""); }} className="w-full rounded-2xl border border-[#d9eaf2] bg-white px-4 py-3 text-sm font-extrabold text-[#3f7f99]">
            入力画面に戻って修正する
          </button>
        </div>
      ) : null}

      {error ? (
        <p className="rounded-2xl border border-[#ffd7d7] bg-[#fff4f4] px-4 py-3 text-sm font-bold text-[#b94e4e]">{error}</p>
      ) : null}

      <button
        disabled={status !== "idle"}
        className="w-full rounded-[22px] bg-[#4db7e5] px-5 py-4 font-extrabold text-white disabled:opacity-50"
      >
        {status === "uploading" ? "画像アップロード中..." : status === "saving" ? "保存中..." : review ? "確認して変更を保存" : "プレビューで確認する"}
      </button>
    </form>
  );
}
