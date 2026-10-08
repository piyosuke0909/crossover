"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type PersonValue = {
  id: string;
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

export default function AdminPersonForm({ person }: { person: PersonValue }) {
  const router = useRouter();
  const [value, setValue] = useState(person);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const inputClass =
    "mt-2 w-full rounded-2xl border border-[#d9eaf2] bg-[#f9fcfe] px-4 py-3.5 text-sm font-medium outline-none focus:border-[#62bde5] focus:bg-white focus:ring-4 focus:ring-[#def4fe]";

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const response = await fetch(`/api/admin/people/${person.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ person: value }),
    });
    const data = (await response.json()) as { error?: string };
    setSaving(false);

    if (!response.ok) {
      setError(data.error || "保存に失敗しました。");
      return;
    }

    router.push("/admin/people");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-5 space-y-5">
      <div className="flex items-center gap-4 rounded-2xl bg-[#f7fbfd] p-4">
        <img src={person.photoUrl} alt="" className="h-20 w-20 rounded-2xl object-cover" />
        <p className="text-xs leading-5 text-[#728792]">
          顔写真の差し替えは本人のプロフィール編集画面から行えます。
        </p>
      </div>

      <label className="block text-sm font-extrabold">氏名 *
        <input required maxLength={200} value={value.name} onChange={(e) => setValue({ ...value, name: e.target.value })} className={inputClass} />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-extrabold">部署
          <input maxLength={200} value={value.department} onChange={(e) => setValue({ ...value, department: e.target.value })} className={inputClass} />
        </label>
        <label className="block text-sm font-extrabold">役職
          <input maxLength={200} value={value.position} onChange={(e) => setValue({ ...value, position: e.target.value })} className={inputClass} />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-extrabold">電話番号
          <input type="tel" maxLength={25} pattern="[0-9+() -]{8,25}" value={value.phone} onChange={(e) => setValue({ ...value, phone: e.target.value })} className={inputClass} />
          <span className="mt-2 flex items-center gap-2 text-xs font-semibold text-[#607783]">
            <input type="checkbox" checked={value.showPhone} onChange={(e) => setValue({ ...value, showPhone: e.target.checked })} />
            担当者電話番号を公開する
          </span>
        </label>
        <label className="block text-sm font-extrabold">メールアドレス
          <input type="email" maxLength={200} value={value.email} onChange={(e) => setValue({ ...value, email: e.target.value })} className={inputClass} />
        </label>
      </div>

      <label className="block text-sm font-extrabold">担当業務
        <input maxLength={200} value={value.responsibility} onChange={(e) => setValue({ ...value, responsibility: e.target.value })} className={inputClass} />
      </label>
      <label className="block text-sm font-extrabold">自己紹介
        <textarea maxLength={200} rows={4} value={value.profile} onChange={(e) => setValue({ ...value, profile: e.target.value })} className={inputClass} />
      </label>

      {error ? <p className="rounded-2xl bg-[#fff4f4] px-4 py-3 text-sm font-bold text-[#b94e4e]">{error}</p> : null}

      <button disabled={saving} className="w-full rounded-2xl bg-[#4db7e5] px-5 py-4 font-extrabold text-white disabled:opacity-50">
        {saving ? "保存中..." : "変更を保存"}
      </button>
    </form>
  );
}
