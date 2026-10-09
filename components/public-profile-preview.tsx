"use client";

import PersonAvatar from "@/components/person-avatar";

type PublicCompany = {
  name: string;
  industries: string[];
  businessDescription: string;
  profile: string;
  phone: string;
  showPhone: boolean;
  postalCode: string;
  address: string;
  showAddress: boolean;
  websiteUrl: string;
};

type PublicPerson = {
  name: string;
  department: string;
  position: string;
  responsibility: string;
  profile: string;
  phone: string;
  showPhone: boolean;
};

export default function PublicProfilePreview({
  company,
  person,
  onCompanyPhoneVisibilityChange,
  onCompanyAddressVisibilityChange,
  onPersonPhoneVisibilityChange,
}: {
  company: PublicCompany;
  person: PublicPerson;
  onCompanyPhoneVisibilityChange?: (visible: boolean) => void;
  onCompanyAddressVisibilityChange?: (visible: boolean) => void;
  onPersonPhoneVisibilityChange?: (visible: boolean) => void;
}) {
  return (
    <section aria-label="公開プロフィールのプレビュー" className="space-y-5">
      {(onCompanyPhoneVisibilityChange ||
        onCompanyAddressVisibilityChange ||
        onPersonPhoneVisibilityChange) ? (
        <div className="rounded-[28px] border border-[#cfe3ed] bg-[#f0faff] p-5 sm:p-6">
          <h2 className="text-base font-extrabold text-[#27556b]">この情報を公開しますか？</h2>
          <p className="mt-2 text-xs leading-6 text-[#648292]">
            ここでON/OFFを変更すると、下のプレビューにすぐ反映されます。
            初期値は非公開です。会社の公開設定は同じ会社の担当者に共通で適用されます。
          </p>
          <div className="mt-4 space-y-3">
            {onCompanyPhoneVisibilityChange ? (
              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-white px-4 py-3">
                <span className="min-w-0 text-sm font-bold text-[#365464]">企業の電話番号を表示する</span>
                <input
                  type="checkbox"
                  checked={company.showPhone}
                  onChange={(e) => onCompanyPhoneVisibilityChange(e.target.checked)}
                  className="h-5 w-5 shrink-0 accent-[#4db7e5]"
                />
              </label>
            ) : null}
            {onCompanyAddressVisibilityChange ? (
              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-white px-4 py-3">
                <span className="min-w-0 text-sm font-bold text-[#365464]">会社住所を表示する</span>
                <input
                  type="checkbox"
                  checked={company.showAddress}
                  onChange={(e) => onCompanyAddressVisibilityChange(e.target.checked)}
                  className="h-5 w-5 shrink-0 accent-[#4db7e5]"
                />
              </label>
            ) : null}
            {onPersonPhoneVisibilityChange ? (
              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-white px-4 py-3">
                <span className="min-w-0 text-sm font-bold text-[#365464]">担当者の電話番号を表示する</span>
                <input
                  type="checkbox"
                  checked={person.showPhone}
                  onChange={(e) => onPersonPhoneVisibilityChange(e.target.checked)}
                  className="h-5 w-5 shrink-0 accent-[#4db7e5]"
                />
              </label>
            ) : null}
          </div>
        </div>
      ) : null}
      <div className="rounded-[28px] border border-[#d8eaf1] bg-white p-5 shadow-sm sm:p-7">
        <p className="text-xs font-extrabold tracking-widest text-[#42a2ca]">
          PUBLIC PREVIEW
        </p>
        <h2 className="mt-2 text-xl font-extrabold">外部に表示される企業情報</h2>
        <h3 className="mt-5 break-words text-lg font-extrabold">
          {company.name || "企業名"}
        </h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {company.industries.map((name) => (
            <span key={name} className="rounded-full bg-[#e8f7ff] px-3 py-1 text-xs font-bold text-[#287fa3]">{name}</span>
          ))}
        </div>
        <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-[#607783]">
          {company.businessDescription || "事業内容"}
        </p>
        {company.profile ? <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#607783]">{company.profile}</p> : null}
        {company.showPhone && company.phone ? (
          <p className="mt-4 break-all text-sm font-semibold">電話番号: {company.phone}</p>
        ) : null}
        {company.showAddress && company.address ? (
          <p className="mt-2 text-sm font-semibold">
            住所: {company.postalCode ? `〒${company.postalCode} ` : ""}{company.address}
          </p>
        ) : null}
        {company.websiteUrl ? (
          <p className="mt-2 break-all text-sm text-[#278fb9]">Web: {company.websiteUrl}</p>
        ) : null}
      </div>

      <div className="rounded-[28px] border border-[#e1eef4] bg-white p-5 shadow-sm sm:p-7">
        <h2 className="text-xl font-extrabold">外部に表示される担当者情報</h2>
        <div className="mt-4 flex items-center gap-4">
          <PersonAvatar name={person.name || "担当者"} size="lg" />
          <div className="min-w-0">
            <h3 className="break-words text-lg font-extrabold">{person.name || "担当者名"}</h3>
            <p className="mt-1 text-xs font-semibold text-[#7d919b]">
              {[person.department, person.position].filter(Boolean).join(" / ") || "所属情報なし"}
            </p>
          </div>
        </div>
        {person.responsibility ? <p className="mt-4 text-sm leading-6">{person.responsibility}</p> : null}
        {person.profile ? <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{person.profile}</p> : null}
        {person.showPhone && person.phone ? (
          <p className="mt-4 break-all text-sm font-semibold text-[#299fce]">電話番号: {person.phone}</p>
        ) : null}
      </div>

      <p className="rounded-2xl bg-[#f2f5f7] px-4 py-3 text-xs leading-6 text-[#607783]">
        オフにした電話番号・住所は公開ページに表示されません。メールアドレスは公開ページに表示しません。会社の公開設定は同じ会社の担当者全員に適用されます。
      </p>
    </section>
  );
}
