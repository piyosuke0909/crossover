"use client";

import { FormEvent, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";

type Industry = { id: string; name: string };
type CompanyResult = {
  id: string;
  name: string;
  businessDescription: string;
  industries: Industry[];
};
type Props = { eventId: string; industries: Industry[] };

const MAX_TEXT = 200;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const emptyFields = {
  companyName: "",
  companyPhone: "",
  postalCode: "",
  address: "",
  websiteUrl: "",
  businessDescription: "",
  companyProfile: "",
  personName: "",
  email: "",
  department: "",
  position: "",
  personPhone: "",
  responsibility: "",
  personProfile: "",
};

export default function ProfileRegisterForm({ eventId, industries }: Props) {
  const router = useRouter();
  const cardInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"new" | "existing">("new");
  const [fields, setFields] = useState(emptyFields);
  const [industryOptions, setIndustryOptions] = useState(industries);
  const [industryIds, setIndustryIds] = useState<string[]>([]);
  const [newIndustryName, setNewIndustryName] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [companyQuery, setCompanyQuery] = useState("");
  const [companyResults, setCompanyResults] = useState<CompanyResult[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<CompanyResult | null>(null);
  const [companyAccessCode, setCompanyAccessCode] = useState("");
  const [status, setStatus] = useState<
    "idle" | "scanning" | "searching" | "uploading" | "saving" | "error"
  >("idle");
  const [error, setError] = useState("");

  function updateField(name: keyof typeof fields, value: string) {
    setFields((current) => ({ ...current, [name]: value }));
  }

  async function searchCompanies() {
    const q = companyQuery.trim();
    if (q.length < 2) {
      setError("企業名を2文字以上入力してください。");
      return;
    }

    setError("");
    setStatus("searching");
    try {
      const response = await fetch(`/api/companies/search?q=${encodeURIComponent(q)}`);
      const data = (await response.json()) as { companies?: CompanyResult[] };
      setCompanyResults(data.companies ?? []);
      if ((data.companies ?? []).length === 0) {
        setError("該当する登録済み企業がありません。新規企業として登録してください。");
      }
      setStatus("idle");
    } catch {
      setStatus("error");
      setError("企業検索に失敗しました。");
    }
  }

  async function addIndustry() {
    const name = newIndustryName.trim();
    if (!name) return;

    setError("");
    try {
      const response = await fetch("/api/industries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = (await response.json()) as Industry & { error?: string };

      if (!response.ok || !data.id) {
        throw new Error(data.error || "業界を追加できませんでした。");
      }

      setIndustryOptions((current) =>
        current.some((item) => item.id === data.id)
          ? current
          : [...current, { id: data.id, name: data.name }].sort((a, b) =>
              a.name.localeCompare(b.name, "ja"),
            ),
      );
      setIndustryIds((current) =>
        current.includes(data.id) ? current : [...current, data.id],
      );
      setNewIndustryName("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "業界を追加できませんでした。");
    }
  }

  async function scanBusinessCard(file: File) {
    if (!ALLOWED_PHOTO_TYPES.has(file.type) || file.size > MAX_PHOTO_BYTES) {
      setError("名刺画像はJPEG / PNG / WebP、5MB以内にしてください。");
      return;
    }

    setError("");
    setStatus("scanning");

    try {
      const body = new FormData();
      body.append("image", file);
      const response = await fetch("/api/business-card/scan", {
        method: "POST",
        body,
      });
      const data = (await response.json()) as Record<string, string> & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "名刺の解析に失敗しました。");
      }

      setFields((current) => ({
        ...current,
        companyName: data.companyName || current.companyName,
        companyPhone: data.companyPhone || current.companyPhone,
        postalCode: data.postalCode || current.postalCode,
        address: data.address || current.address,
        websiteUrl: data.websiteUrl || current.websiteUrl,
        personName: data.personName || current.personName,
        email: data.email || current.email,
        department: data.department || current.department,
        position: data.position || current.position,
        personPhone: data.personPhone || current.personPhone,
      }));

      if (data.industryHint) {
        const hint = data.industryHint.toLowerCase();
        const match = industryOptions.find(
          (industry) =>
            industry.name.toLowerCase().includes(hint) ||
            hint.includes(industry.name.toLowerCase()),
        );
        if (match) {
          setIndustryIds((current) =>
            current.includes(match.id) ? current : [...current, match.id],
          );
        }
      }

      setStatus("idle");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "名刺の解析に失敗しました。");
    } finally {
      if (cardInputRef.current) cardInputRef.current.value = "";
    }
  }

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
    if (mode === "new" && industryIds.length === 0) {
      setError("業界を1つ以上選択してください。");
      return;
    }
    if (mode === "existing" && (!selectedCompany || !companyAccessCode.trim())) {
      setError("登録済み企業と企業参加コードを入力してください。");
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
      const payload =
        mode === "existing"
          ? {
              companyId: selectedCompany!.id,
              companyAccessCode,
              person: {
                name: fields.personName,
                photoUrl: blob.url,
                email: fields.email,
                department: fields.department,
                position: fields.position,
                phone: fields.personPhone,
                responsibility: fields.responsibility,
                profile: fields.personProfile,
              },
            }
          : {
              company: {
                name: fields.companyName,
                phone: fields.companyPhone,
                postalCode: fields.postalCode,
                address: fields.address,
                websiteUrl: fields.websiteUrl,
                industryIds,
                businessDescription: fields.businessDescription,
                profile: fields.companyProfile,
              },
              person: {
                name: fields.personName,
                photoUrl: blob.url,
                email: fields.email,
                department: fields.department,
                position: fields.position,
                phone: fields.personPhone,
                responsibility: fields.responsibility,
                profile: fields.personProfile,
              },
            };

      const response = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { personId?: string; error?: string };

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
  const helpClass = "mt-1 block text-right text-[11px] font-medium text-[#8a9ca5]";

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-5">
      <section className="rounded-[28px] border border-[#e1eef4] bg-white p-4 shadow-[0_10px_28px_rgba(50,99,121,0.07)] sm:p-6">
        <p className="text-sm font-extrabold text-[#3d5663]">登録方法</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setMode("new");
              setSelectedCompany(null);
              setError("");
            }}
            className={`rounded-2xl border px-3 py-3 text-sm font-extrabold transition ${
              mode === "new"
                ? "border-[#4db7e5] bg-[#e6f7ff] text-[#238fbd]"
                : "border-[#dcebf2] bg-white text-[#6f8490]"
            }`}
          >
            新しい企業
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("existing");
              setError("");
            }}
            className={`rounded-2xl border px-3 py-3 text-sm font-extrabold transition ${
              mode === "existing"
                ? "border-[#4db7e5] bg-[#e6f7ff] text-[#238fbd]"
                : "border-[#dcebf2] bg-white text-[#6f8490]"
            }`}
          >
            登録済み企業
          </button>
        </div>
      </section>

      {mode === "new" ? (
        <section className="rounded-[28px] border border-[#e1eef4] bg-white p-5 shadow-[0_10px_28px_rgba(50,99,121,0.07)] sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-[18px] bg-[#e5f7ff] text-[#249ed1]">
                <Icon name="building" className="h-6 w-6" />
              </span>
              <div>
                <p className="text-[11px] font-extrabold tracking-[0.14em] text-[#55afd4]">STEP 1</p>
                <h2 className="font-extrabold">会社情報</h2>
              </div>
            </div>

            <div>
              <input
                ref={cardInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) scanBusinessCard(file);
                }}
              />
              <button
                type="button"
                disabled={status === "scanning"}
                onClick={() => cardInputRef.current?.click()}
                className="inline-flex min-h-10 items-center gap-2 rounded-2xl border border-[#cde7f2] bg-[#f1faff] px-3.5 py-2 text-xs font-extrabold text-[#278fb9] disabled:opacity-50"
              >
                <Icon name="sparkles" className="h-4 w-4" />
                {status === "scanning" ? "名刺を解析中..." : "名刺から入力"}
              </button>
            </div>
          </div>

          <p className="mt-3 rounded-2xl bg-[#f7fbfd] px-4 py-3 text-xs leading-5 text-[#6f8490]">
            名刺画像は入力補助のためAI解析へ送信され、CrossoverのBlobやDBには保存しません。解析結果は登録前に確認できます。
          </p>

          <div className="mt-6 grid gap-5">
            <label className={labelClass}>
              企業名 <span className="text-[#e56c6c]">*</span>
              <input required maxLength={MAX_TEXT} value={fields.companyName} onChange={(e) => updateField("companyName", e.target.value)} className={inputClass} placeholder="株式会社○○" />
            </label>

            <fieldset>
              <legend className={labelClass}>
                業界 <span className="text-[#e56c6c]">*</span>
                <span className="ml-2 text-xs font-medium text-[#8397a1]">複数選択できます</span>
              </legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {industryOptions.map((industry) => {
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
                      className={`rounded-full border px-3.5 py-2 text-xs font-extrabold transition ${
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

              <div className="mt-3 flex gap-2">
                <input
                  value={newIndustryName}
                  onChange={(e) => setNewIndustryName(e.target.value)}
                  maxLength={50}
                  className="min-w-0 flex-1 rounded-2xl border border-[#d9eaf2] bg-[#f9fcfe] px-4 py-2.5 text-sm outline-none focus:border-[#62bde5]"
                  placeholder="見つからない業界を追加"
                />
                <button
                  type="button"
                  onClick={addIndustry}
                  className="shrink-0 rounded-2xl border border-[#cfe7f1] bg-white px-4 py-2.5 text-xs font-extrabold text-[#2f8fb7]"
                >
                  追加
                </button>
              </div>
            </fieldset>

            <label className={labelClass}>
              事業内容 <span className="text-[#e56c6c]">*</span>
              <textarea required maxLength={MAX_TEXT} value={fields.businessDescription} onChange={(e) => updateField("businessDescription", e.target.value)} className={inputClass} rows={4} placeholder="どんな事業をしている会社か、簡潔に入力してください" />
              <span className={helpClass}>200文字以内</span>
            </label>

            <label className={labelClass}>
              企業プロフィール
              <textarea maxLength={MAX_TEXT} value={fields.companyProfile} onChange={(e) => updateField("companyProfile", e.target.value)} className={inputClass} rows={4} placeholder="会社の特徴、強み、交流会で話したいことなど" />
              <span className={helpClass}>200文字以内</span>
            </label>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className={labelClass}>
                電話番号
                <input value={fields.companyPhone} onChange={(e) => updateField("companyPhone", e.target.value)} type="tel" maxLength={25} pattern="[0-9+() -]{8,25}" className={inputClass} placeholder="0568-00-0000" />
              </label>
              <label className={labelClass}>
                郵便番号
                <input value={fields.postalCode} onChange={(e) => updateField("postalCode", e.target.value)} maxLength={8} pattern="\d{3}-?\d{4}" className={inputClass} placeholder="484-0000" />
              </label>
            </div>

            <label className={labelClass}>
              住所
              <input value={fields.address} onChange={(e) => updateField("address", e.target.value)} maxLength={MAX_TEXT} className={inputClass} placeholder="愛知県犬山市..." />
            </label>

            <label className={labelClass}>
              Webサイト
              <input value={fields.websiteUrl} onChange={(e) => updateField("websiteUrl", e.target.value)} type="url" maxLength={MAX_TEXT} className={inputClass} placeholder="https://..." />
            </label>
          </div>
        </section>
      ) : (
        <section className="rounded-[28px] border border-[#e1eef4] bg-white p-5 shadow-[0_10px_28px_rgba(50,99,121,0.07)] sm:p-7">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-[18px] bg-[#e5f7ff] text-[#249ed1]">
              <Icon name="search" className="h-6 w-6" />
            </span>
            <div>
              <p className="text-[11px] font-extrabold tracking-[0.14em] text-[#55afd4]">STEP 1</p>
              <h2 className="font-extrabold">登録済み企業を探す</h2>
            </div>
          </div>

          <div className="mt-5 flex gap-2">
            <input
              value={companyQuery}
              onChange={(e) => setCompanyQuery(e.target.value)}
              className="min-w-0 flex-1 rounded-2xl border border-[#d9eaf2] bg-[#f9fcfe] px-4 py-3 text-sm outline-none focus:border-[#62bde5]"
              placeholder="企業名を入力"
            />
            <button type="button" onClick={searchCompanies} className="shrink-0 rounded-2xl bg-[#4db7e5] px-4 py-3 text-sm font-extrabold text-white">
              検索
            </button>
          </div>

          {companyResults.length > 0 ? (
            <div className="mt-4 grid gap-2">
              {companyResults.map((company) => (
                <button
                  type="button"
                  key={company.id}
                  onClick={() => {
                    setSelectedCompany(company);
                    setError("");
                  }}
                  className={`rounded-2xl border p-4 text-left transition ${
                    selectedCompany?.id === company.id
                      ? "border-[#4db7e5] bg-[#effaff]"
                      : "border-[#dfeaf0] bg-white"
                  }`}
                >
                  <p className="font-extrabold">{company.name}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {company.industries.map((industry) => (
                      <span key={industry.id} className="rounded-full bg-[#e7f7ff] px-2.5 py-1 text-[10px] font-extrabold text-[#278fb9]">
                        {industry.name}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          ) : null}

          {selectedCompany ? (
            <label className={`mt-5 block ${labelClass}`}>
              企業参加コード <span className="text-[#e56c6c]">*</span>
              <input
                value={companyAccessCode}
                onChange={(e) => setCompanyAccessCode(e.target.value.toUpperCase())}
                maxLength={20}
                className={inputClass}
                placeholder="会社の代表者から共有されたコード"
              />
              <span className="mt-2 block text-xs font-medium leading-5 text-[#80939d]">
                {selectedCompany.name} の登録者から共有されたコードを入力してください。
              </span>
            </label>
          ) : null}
        </section>
      )}

      <section className="rounded-[28px] border border-[#eee7c8] bg-[#fffdf3] p-5 shadow-[0_10px_28px_rgba(90,82,42,0.055)] sm:p-7">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-[18px] bg-[#fff1a8] text-[#8d711a]">
            <Icon name="user-plus" className="h-6 w-6" />
          </span>
          <div>
            <p className="text-[11px] font-extrabold tracking-[0.14em] text-[#a68a31]">STEP 2</p>
            <h2 className="font-extrabold">担当者情報</h2>
          </div>
        </div>

        <div className="mt-6 grid gap-5">
          <label className={labelClass}>
            氏名 <span className="text-[#e56c6c]">*</span>
            <input required maxLength={MAX_TEXT} value={fields.personName} onChange={(e) => updateField("personName", e.target.value)} className={inputClass} placeholder="山田 太郎" />
          </label>

          <label className={labelClass}>
            顔写真 <span className="text-[#e56c6c]">*</span>
            <span className="mt-2 block rounded-[22px] border-2 border-dashed border-[#c9e4ef] bg-white p-5 text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#e9f8ff] text-[#279fd1]">
                <Icon name="person" className="h-6 w-6" />
              </span>
              <span className="mt-3 block text-sm font-extrabold text-[#3f5e6d]">
                {photo ? photo.name : "顔がわかる写真を選択"}
              </span>
              <input
                required
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="mt-4 block w-full text-xs text-[#718792] file:mr-3 file:rounded-full file:border-0 file:bg-[#4db7e5] file:px-4 file:py-2 file:font-extrabold file:text-white"
                onChange={(e) => {
                  const next = e.target.files?.[0] ?? null;
                  if (next && (!ALLOWED_PHOTO_TYPES.has(next.type) || next.size > MAX_PHOTO_BYTES)) {
                    e.target.value = "";
                    setPhoto(null);
                    setError(next.size > MAX_PHOTO_BYTES ? "顔写真は5MB以内にしてください。" : "顔写真はJPEG / PNG / WebPを選択してください。");
                    return;
                  }
                  setPhoto(next);
                  setError("");
                }}
              />
            </span>
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className={labelClass}>
              部署
              <input value={fields.department} onChange={(e) => updateField("department", e.target.value)} maxLength={MAX_TEXT} className={inputClass} placeholder="営業部" />
            </label>
            <label className={labelClass}>
              役職
              <input value={fields.position} onChange={(e) => updateField("position", e.target.value)} maxLength={MAX_TEXT} className={inputClass} placeholder="部長" />
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className={labelClass}>
              電話番号
              <input value={fields.personPhone} onChange={(e) => updateField("personPhone", e.target.value)} type="tel" maxLength={25} pattern="[0-9+() -]{8,25}" className={inputClass} placeholder="090-0000-0000" />
            </label>
            <label className={labelClass}>
              メールアドレス
              <input value={fields.email} onChange={(e) => updateField("email", e.target.value)} type="email" maxLength={MAX_TEXT} className={inputClass} placeholder="name@example.com" />
            </label>
          </div>

          <label className={labelClass}>
            担当業務
            <input value={fields.responsibility} onChange={(e) => updateField("responsibility", e.target.value)} maxLength={MAX_TEXT} className={inputClass} placeholder="営業、採用、開発など" />
          </label>

          <label className={labelClass}>
            自己紹介
            <textarea value={fields.personProfile} onChange={(e) => updateField("personProfile", e.target.value)} maxLength={MAX_TEXT} className={inputClass} rows={4} placeholder="話したいテーマや、担当している仕事について" />
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
        disabled={["scanning", "searching", "uploading", "saving"].includes(status)}
        className="w-full rounded-[22px] bg-[#4db7e5] px-5 py-4 text-base font-extrabold text-white shadow-[0_12px_24px_rgba(55,166,214,0.28)] transition hover:bg-[#36a9da] disabled:cursor-not-allowed disabled:opacity-55"
      >
        {status === "uploading"
          ? "顔写真をアップロード中..."
          : status === "saving"
            ? "プロフィールを登録中..."
            : "この内容で登録する"}
      </button>
    </form>
  );
}
