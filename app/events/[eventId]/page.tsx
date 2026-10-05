import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      _count: {
        select: {
          eventCompanies: true,
          eventPeople: true,
        },
      },
    },
  });

  if (!event || !event.isActive) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8 sm:px-6">
      <Link href="/" className="text-sm text-slate-500 hover:text-slate-900">
        ← 交流会一覧
      </Link>

      <section className="mt-5 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold text-slate-500">CROSSOVER</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{event.name}</h1>
        <p className="mt-3 text-slate-600">
          {new Intl.DateTimeFormat("ja-JP", {
            dateStyle: "long",
          }).format(event.eventDate)}
          {event.venue ? " ・ " + event.venue : ""}
        </p>

        {event.description && (
          <p className="mt-5 leading-7 text-slate-700">{event.description}</p>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-2xl font-bold">{event._count.eventCompanies}</p>
            <p className="text-sm text-slate-500">参加企業</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-2xl font-bold">{event._count.eventPeople}</p>
            <p className="text-sm text-slate-500">参加担当者</p>
          </div>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <Link
            href={"/events/" + event.id + "/register"}
            className="rounded-2xl bg-slate-900 px-5 py-4 text-center font-semibold text-white"
          >
            プロフィールを登録
          </Link>
          <Link
            href={"/events/" + event.id + "/companies"}
            className="rounded-2xl border border-slate-300 bg-white px-5 py-4 text-center font-semibold text-slate-900"
          >
            参加企業を見る
          </Link>
        </div>
      </section>
    </main>
  );
}
