import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import BackLink from "@/components/back-link";
import AdminTransferForm from "@/components/admin-transfer-form";
import { Icon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function AdminEventTransferPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  const [sourceEvent, targetEvents] = await Promise.all([
    prisma.event.findFirst({
      where: { id: eventId, deletedAt: null },
      include: {
        eventPeople: {
          orderBy: { joinedAt: "asc" },
          where: {
            person: {
              isHidden: false,
              company: { isHidden: false },
            },
          },
          include: {
            person: {
              include: {
                company: { select: { name: true } },
              },
            },
          },
        },
      },
    }),
    prisma.event.findMany({
      where: {
        id: { not: eventId },
        isActive: true,
        deletedAt: null,
      },
      orderBy: { eventDate: "asc" },
      select: { id: true, name: true, eventDate: true },
    }),
  ]);

  if (!sourceEvent) notFound();

  return (
    <main className="min-h-screen bg-[#f5fbfe] px-4 py-8 text-[#173042] sm:px-6">
      <div className="mx-auto max-w-3xl">
        <BackLink href="/admin">管理画面へ戻る</BackLink>

        <section className="mt-5 rounded-[30px] border border-[#e1eef4] bg-white p-6 shadow-sm sm:p-8">
          <span className="grid h-12 w-12 place-items-center rounded-[18px] bg-[#e6f7ff] text-[#278fb9]">
            <Icon name="swap" className="h-6 w-6" />
          </span>
          <p className="mt-4 text-xs font-extrabold tracking-[0.16em] text-[#4aaed9]">
            TRANSFER
          </p>
          <h1 className="mt-1 text-2xl font-extrabold">参加者を次回イベントへ引き継ぐ</h1>
          <p className="mt-2 break-words text-sm leading-6 text-[#718792]">
            {sourceEvent.name} の登録済みプロフィールを再利用します。移行後、参加者は再登録せず、メールOTPまたは再ログインIDで自分のページへ入れます。
          </p>

          <AdminTransferForm
            sourceEventId={eventId}
            people={sourceEvent.eventPeople.map(({ person }) => ({
              id: person.id,
              name: person.name,
              companyName: person.company.name,
              department: person.department ?? "",
              position: person.position ?? "",
              photoUrl: person.photoUrl,
            }))}
            targetEvents={targetEvents.map((event) => ({
              id: event.id,
              name: event.name,
              eventDateLabel: new Intl.DateTimeFormat("ja-JP", {
                dateStyle: "medium",
                timeZone: "Asia/Tokyo",
              }).format(event.eventDate),
            }))}
          />
        </section>
      </div>
    </main>
  );
}
