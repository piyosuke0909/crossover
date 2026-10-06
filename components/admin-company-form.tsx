"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Industry = { id: string; name: string };
type CompanyValue = {
  id: string;
  name: string;
  phone: string;
  postalCode: string;
  address: string;
  websiteUrl: string;
  businessDescription: string;
  profile: string;
  industryIds: string[];
};

export default function AdminCompanyForm({
  company,
  industries,
}: {
  company: CompanyValue;
  industries: Industry[];
}) {
  const router = useRouter();
  const [value, setValue] = useState(company);
  const [industryIds, setIndustryIds] = useState(company.industryIds);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const inputClass =
    "mt-2 w-full rounded-2xl border border-[#d9eaf2] bg-[#f9fcfe] px-4 py-3.5 text-sm font-medium outline-none focus:border-[#62bde5] focus:bg-white focus:ring-4 focus:ring-[#def4fe]";

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const response = await fetch(`/api/admin/companies/${company.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company: { ...value, industryIds } }),
    });
    const data = (await response.json()) as { error?: string };
    setSaving(false);

    if (!response.ok) {
      setError(data.error || "保存に失敗しました。");
      return;
    }

    router.push("/admin/companies");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-5 space-y-5">
      <label className="block text-sm font-extrabold">企業名 *
        <input required maxLength={200} value={value.name} onChange={(e) => setValue({ ...value, name: e.target.value })} className={inputClass} />
      </label>

      <fieldset>
        <legend className="text-sm font-extrabold">業界 *</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {industries.map((industry) => {
            const checked = industryIds.includes(industry.id);
            return (
              <button
                type="button"
                key={industry.id}
                onClick={() =>
                  setIndustryIds((current) =>
                    checked ? current.filter((id) => id !== industry.id) : [...current, industry.id],
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

      <label className="block text-sm font-extrabold">事業内容 *
        <textarea required maxLength={200} rows={4} value={value.businessDescription} onChange={(e) => setValue({ ...value, businessDescription: e.target.value })} className={inputClass} />
      </label>
      <label className="block text-sm font-extrabold">企業プロフィール
        <textarea maxLength={200} rows={4} value={value.profile} onChange={(e) => setValue({ ...value, profile: e.target.value })} className={inputClass} />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-extrabold">電話番号
          <input type="tel" maxLength={25} pattern="[0-9+() -]{8,25}" value={value.phone} onChange={(e) => setValue({ ...value, phone: e.target.value })} className={inputClass} />
        </label>
        <label className="block text-sm font-extrabold">郵便番号
          <input maxLength={8} pattern="\d{3}-?\d{4}" value={value.postalCode} onChange={(e) => setValue({ ...value, postalCode: e.target.value })} className={inputClass} />
        </label>
      </div>

      <label className="block text-sm font-extrabold">住所
        <input maxLength={200} value={value.address} onChange={(e) => setValue({ ...value, address: e.target.value })} className={inputClass} />
      </label>
      <label className="block text-sm font-extrabold">Webサイト
        <input type="url" maxLength={200} value={value.websiteUrl} onChange={(e) => setValue({ ...value, websiteUrl: e.target.value })} className={inputClass} />
      </label>

      {error ? <p className="rounded-2xl bg-[#fff4f4] px-4 py-3 text-sm font-bold text-[#b94e4e]">{error}</p> : null}

      <button disabled={saving} className="w-full rounded-2xl bg-[#4db7e5] px-5 py-4 font-extrabold text-white disabled:opacity-50">
        {saving ? "保存中..." : "変更を保存"}
      </button>
    </form>
  );
}
