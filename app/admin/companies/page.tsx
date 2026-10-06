import Link from "next/link";
import prisma from "@/lib/prisma";
import BackLink from "@/components/back-link";
import AdminVisibilityButton from "@/components/admin-visibility-button";
import { Icon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function AdminCompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q: rawQ } = await searchParams;
  const q = rawQ?.trim() ?? "";

  const companies = await prisma.company.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { businessDescription: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: [{ isHidden: "asc" }, { name: "asc" }],
    take: 100,
    include: {
      industries: { include: { industry: true } },
      _count: { select: { people: true, eventCompanies: true } },
    },
  });

  return (
    <main className="min-h-screen bg-[#f5fbfe] px-4 py-8 text-[#173042] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <BackLink href="/admin">管理画面へ戻る</BackLink>

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-extrabold tracking-[0.16em] text-[#4aaed9]">COMPANIES</p>
            <h1 className="mt-1 text-2xl font-extrabold">企業管理</h1>
            <p className="mt-2 text-sm text-[#728792]">企業の検索・編集・非表示管理ができます。</p>
          </div>

          <form className="flex w-full gap-2 sm:max-w-md">
            <input
              name="q"
              defaultValue={q}
              className="min-w-0 flex-1 rounded-2xl border border-[#d9eaf2] bg-white px-4 py-3 text-sm outline-none focus:border-[#62bde5]"
              placeholder="企業名・事業内容で検索"
            />
            <button className="inline-flex items-center gap-2 rounded-2xl bg-[#4db7e5] px-4 py-3 text-sm font-extrabold text-white">
              <Icon name="search" className="h-4 w-4" />
              検索
            </button>
          </form>
        </div>

        <div className="mt-6 grid gap-4">
          {companies.map((company) => (
            <article
              key={company.id}
              className={`rounded-[24px] border p-5 shadow-[0_8px_22px_rgba(50,99,121,0.055)] ${
                company.isHidden
                  ? "border-[#e6e8e9] bg-[#f7f8f8] opacity-80"
                  : "border-[#e1eef4] bg-white"
              }`}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="break-words text-lg font-extrabold">{company.name}</h2>
                    {company.isHidden ? (
                      <span className="rounded-full bg-[#eceff0] px-2.5 py-1 text-[10px] font-extrabold text-[#75838a]">非表示</span>
                    ) : null}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {company.industries.map(({ industry }) => (
                      <span key={industry.id} className="rounded-full bg-[#e7f7ff] px-2.5 py-1 text-[10px] font-extrabold text-[#278fb9]">
                        {industry.name}
                      </span>
                    ))}
                  </div>

                  <p className="mt-3 line-clamp-2 break-words text-sm leading-6 text-[#667d88]">
                    {company.businessDescription}
                  </p>
                  <p className="mt-3 text-xs font-bold text-[#7f929c]">
                    担当者 {company._count.people}名 ・ 参加交流会 {company._count.eventCompanies}件
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                  <Link
                    href={`/admin/companies/${company.id}/edit`}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#dce8ed] bg-white px-3.5 py-2 text-xs font-extrabold text-[#57717e]"
                  >
                    <Icon name="pencil" className="h-4 w-4" />
                    詳細・編集
                  </Link>
                  <AdminVisibilityButton
                    endpoint={`/api/admin/companies/${company.id}`}
                    hidden={company.isHidden}
                  />
                </div>
              </div>
            </article>
          ))}

          {companies.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-[#d7e8ef] bg-white p-8 text-center text-sm font-bold text-[#7c909b]">
              該当する企業がありません。
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
