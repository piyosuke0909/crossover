"use client";

import { useEffect, useState } from "react";

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
  photo,
  existingPhotoUrl,
}: {
  company: PublicCompany;
  person: PublicPerson;
  photo?: File | null;
  existingPhotoUrl?: string;
}) {
  const [previewPhoto, setPreviewPhoto] = useState("");

  useEffect(() => {
    if (!photo) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPreviewPhoto(reader.result);
      }
    };
    reader.readAsDataURL(photo);
    return () => reader.abort();
  }, [photo]);

  const displayPhoto = photo ? previewPhoto : existingPhotoUrl || "";

  return (
    <section aria-label="公開プロフィールのプレビュー" className="space-y-5">
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
          {displayPhoto ? (
            <img src={displayPhoto} alt="登録予定の顔写真" className="h-20 w-20 shrink-0 rounded-2xl object-cover" />
          ) : (
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-[#e8f7ff] text-xs text-[#7793a2]">顔写真</div>
          )}
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
