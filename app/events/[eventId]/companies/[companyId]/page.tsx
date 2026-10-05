import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ eventId: string; companyId: string }>;
}) {
  const { eventId, companyId } = await params;

  const participation = await prisma.eventCompany.findUnique({
    where: {
      eventId_companyId: {
        eventId,
        companyId,
      },
    },
    include: {
      event: {
        select: {
          id: true,
          name: true,
          isActive: true,
        },
      },
      company: {
        include: {
          industry: true,
          people: {
            where: {
              isHidden: false,
              eventPeople: {
                some: { eventId },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });

  if (!participation?.event.isActive || participation.company.isHidden) {
    notFound();
  }

  const { company, event } = participation;

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8 sm:px-6">
      <Link
        href={"/events/" + event.id + "/companies"}
        className="text-sm text-slate-500 hover:text-slate-900"
      >
        ← 参加企業一覧
      </Link>

      <article className="mt-5 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {company.industry.name}
        </span>
        <h1 className="mt-4 text-3xl font-bold">{company.name}</h1>

        <section className="mt-7">
          <h2 className="font-semibold">事業内容</h2>
          <p className="mt-2 whitespace-pre-wrap leading-7 text-slate-700">
            {company.businessDescription}
          </p>
        </section>

        {company.profile && (
          <section className="mt-6">
            <h2 className="font-semibold">企業プロフィール</h2>
            <p className="mt-2 whitespace-pre-wrap leading-7 text-slate-700">
              {company.profile}
            </p>
          </section>
        )}

        <dl className="mt-7 grid gap-4 border-t border-slate-200 pt-6 text-sm sm:grid-cols-2">
          {company.phone && (
            <div>
              <dt className="text-slate-500">電話番号</dt>
              <dd className="mt-1 font-medium">{company.phone}</dd>
            </div>
          )}
          {company.address && (
            <div>
              <dt className="text-slate-500">住所</dt>
              <dd className="mt-1 font-medium">
                {company.postalCode ? "〒" + company.postalCode + " " : ""}
                {company.address}
              </dd>
            </div>
          )}
          {company.websiteUrl && (
            <div className="sm:col-span-2">
              <dt className="text-slate-500">Webサイト</dt>
              <dd className="mt-1">
                <a
                  href={company.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium underline"
                >
                  {company.websiteUrl}
                </a>
              </dd>
            </div>
          )}
        </dl>

        <section className="mt-8 border-t border-slate-200 pt-7">
          <h2 className="text-lg font-semibold">今回の参加担当者</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {company.people.map((person) => (
              <div
                key={person.id}
                className="rounded-2xl border border-slate-200 p-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={person.photoUrl}
                    alt={person.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold">{person.name}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {[person.department, person.position]
                        .filter(Boolean)
                        .join(" / ") || "所属情報なし"}
                    </p>
                  </div>
                </div>

                {person.responsibility && (
                  <p className="mt-4 text-sm leading-6 text-slate-700">
                    担当：{person.responsibility}
                  </p>
                )}
                {person.profile && (
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {person.profile}
                  </p>
                )}
                {person.phone && (
                  <p className="mt-3 text-sm font-medium">
                    TEL: {person.phone}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      </article>
    </main>
  );
}
