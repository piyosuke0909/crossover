import Link from "next/link";
import prisma from "@/lib/prisma";
import BackLink from "@/components/back-link";
import AdminVisibilityButton from "@/components/admin-visibility-button";
import { Icon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function AdminPeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q: rawQ } = await searchParams;
  const q = rawQ?.trim() ?? "";

  const people = await prisma.person.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { department: { contains: q, mode: "insensitive" } },
            { position: { contains: q, mode: "insensitive" } },
            { company: { name: { contains: q, mode: "insensitive" } } },
          ],
        }
      : undefined,
    orderBy: [{ isHidden: "asc" }, { name: "asc" }],
    take: 150,
    include: {
      company: { select: { name: true } },
      _count: { select: { eventPeople: true } },
    },
  });

  return (
    <main className="min-h-screen bg-[#f5fbfe] px-4 py-8 text-[#173042] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <BackLink href="/admin">管理画面へ戻る</BackLink>

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-extrabold tracking-[0.16em] text-[#4aaed9]">PEOPLE</p>
            <h1 className="mt-1 text-2xl font-extrabold">担当者管理</h1>
            <p className="mt-2 text-sm text-[#728792]">担当者の検索・編集・非表示管理ができます。</p>
          </div>

          <form className="flex w-full gap-2 sm:max-w-md">
            <input
              name="q"
              defaultValue={q}
              className="min-w-0 flex-1 rounded-2xl border border-[#d9eaf2] bg-white px-4 py-3 text-sm outline-none focus:border-[#62bde5]"
              placeholder="氏名・企業名・部署で検索"
            />
            <button className="inline-flex items-center gap-2 rounded-2xl bg-[#4db7e5] px-4 py-3 text-sm font-extrabold text-white">
              <Icon name="search" className="h-4 w-4" />
              検索
            </button>
          </form>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {people.map((person) => (
            <article
              key={person.id}
              className={`rounded-[24px] border p-4 ${
                person.isHidden
                  ? "border-[#e6e8e9] bg-[#f7f8f8] opacity-80"
                  : "border-[#e1eef4] bg-white"
              }`}
            >
              <div className="flex min-w-0 items-center gap-4">
                <img src={person.photoUrl} alt={person.name} className="h-16 w-16 shrink-0 rounded-[20px] object-cover" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate font-extrabold">{person.name}</h2>
                    {person.isHidden ? (
                      <span className="rounded-full bg-[#eceff0] px-2 py-1 text-[10px] font-extrabold text-[#75838a]">非表示</span>
                    ) : null}
                  </div>
                  <p className="mt-1 truncate text-sm font-bold text-[#617985]">{person.company.name}</p>
                  <p className="mt-1 truncate text-xs text-[#8497a1]">
                    {[person.department, person.position].filter(Boolean).join(" / ") || "所属情報なし"}
                  </p>
                  <p className="mt-1 text-[11px] font-bold text-[#8a9ca5]">参加交流会 {person._count.eventPeople}件</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link
                  href={`/admin/people/${person.id}/edit`}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#dce8ed] bg-white px-3 py-2 text-xs font-extrabold text-[#57717e]"
                >
                  <Icon name="pencil" className="h-4 w-4" />
                  詳細・編集
                </Link>
                <AdminVisibilityButton
                  endpoint={`/api/admin/people/${person.id}`}
                  hidden={person.isHidden}
                />
              </div>
            </article>
          ))}

          {people.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-[#d7e8ef] bg-white p-8 text-center text-sm font-bold text-[#7c909b] sm:col-span-2">
              該当する担当者がいません。
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
