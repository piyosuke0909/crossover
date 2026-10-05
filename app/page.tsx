import Link from "next/link";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const events = await prisma.event.findMany({
    where: { isActive: true },
    orderBy: { eventDate: "desc" },
    take: 10,
  });

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8 sm:px-6">
      <header className="mb-8">
        <p className="mb-2 text-sm font-semibold tracking-wide text-slate-500">
          CROSSOVER
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          企業交流会プロフィール
        </h1>
        <p className="mt-3 leading-7 text-slate-600">
          参加企業や担当者を検索して、交流したい相手を見つけられます。
        </p>
      </header>

      <section>
        <h2 className="mb-4 text-lg font-semibold">交流会一覧</h2>
        <div className="grid gap-3">
          {events.map((event) => (
            <Link
              key={event.id}
              href={"/events/" + event.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300"
            >
              <p className="font-semibold text-slate-900">{event.name}</p>
              <p className="mt-1 text-sm text-slate-500">
                {new Intl.DateTimeFormat("ja-JP", {
                  dateStyle: "long",
                }).format(event.eventDate)}
                {event.venue ? " ・ " + event.venue : ""}
              </p>
            </Link>
          ))}

          {events.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
              交流会がまだ登録されていません。
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
