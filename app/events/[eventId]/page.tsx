import PersonAvatar from "@/components/person-avatar";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import AppShell from "@/components/app-shell";
import { Icon } from "@/components/icons";
import { getCurrentParticipant } from "@/lib/participant-session";

export const dynamic = "force-dynamic";

export default async function EventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  const [event, participant] = await Promise.all([
    prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: { eventCompanies: true, eventPeople: true },
        },
      },
    }),
    getCurrentParticipant(eventId),
  ]);

  if (!event || !event.isActive) notFound();

  const actions = participant
    ? [
        {
          href: `/events/${event.id}/companies`,
          title: "企業を探す",
          sub: "会社・担当者から検索",
          icon: "search" as const,
          iconClass: "bg-[#e4f7ff] text-[#249ed1]",
        },
        {
          href: `/events/${event.id}/me`,
          title: "自分のQR",
          sub: "相手に読み取ってもらう",
          icon: "qr" as const,
          iconClass: "bg-[#fff3b8] text-[#8d711a]",
        },
        {
          href: `/events/${event.id}/met`,
          title: "話した人",
          sub: "交流した担当者を振り返る",
          icon: "handshake" as const,
          iconClass: "bg-[#edf9f1] text-[#4b9a68]",
        },
      ]
    : [
        {
          href: `/events/${event.id}/login`,
          title: "企業を探す（要ログイン）",
          sub: "登録済みの方はこちら",
          icon: "lock" as const,
          iconClass: "bg-[#e4f7ff] text-[#249ed1]",
        },
        {
          href: `/events/${event.id}/register`,
          title: "プロフィール登録",
          sub: "初めて参加する方はこちら",
          icon: "user-plus" as const,
          iconClass: "bg-[#fff3b8] text-[#8d711a]",
        },
        {
          href: `/events/${event.id}/login`,
          title: "以前登録した方",
          sub: "OTP・再ログインIDで戻る",
          icon: "lock" as const,
          iconClass: "bg-[#edf9f1] text-[#4b9a68]",
        },
      ];

  return (
    <AppShell eventId={event.id}>
      <main className="mx-auto w-full max-w-5xl px-4 pb-32 pt-5 sm:px-6 sm:pt-8">
        <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#4db7e5] to-[#39a8d8] px-6 py-7 text-white shadow-[0_18px_42px_rgba(45,143,186,0.23)] sm:px-8 sm:py-9">
          <span className="absolute -right-7 -top-7 h-28 w-28 rounded-full bg-[#fff0a8]" />
          <span className="absolute -bottom-14 right-14 h-32 w-32 rounded-full border-[18px] border-white/15" />

          <div className="relative">
            <p className="text-xs font-bold tracking-[0.18em] text-white/80">
              CROSSOVER
            </p>
            <h1 className="mt-2 max-w-2xl text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
              {event.name}
            </h1>

            <div className="mt-5 flex flex-wrap gap-2.5 text-sm font-semibold">
              {event.venue ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-white/18 px-3 py-2 backdrop-blur">
                  <Icon name="pin" className="h-4 w-4" />
                  {event.venue}
                </span>
              ) : null}
            </div>

            {participant ? (
              <div className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white/18 px-3 py-2 text-xs font-bold backdrop-blur">
<PersonAvatar name={participant.person.name} size="xs" />
                {participant.person.name} として参加中
              </div>
            ) : null}
          </div>
        </section>

        <section className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-[24px] border border-[#e1eef4] bg-white p-5 shadow-[0_8px_24px_rgba(50,99,121,0.07)]">
            <div className="flex items-center justify-between gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#e6f7ff] text-[#249ed1]">
                <Icon name="building" className="h-5 w-5" />
              </span>
              <span className="text-2xl font-extrabold">
                {event._count.eventCompanies}
              </span>
            </div>
            <p className="mt-4 text-xs font-bold text-[#748995]">
              参加企業
            </p>
          </div>

          <div className="rounded-[24px] border border-[#efe9c9] bg-[#fff9dd] p-5 shadow-[0_8px_24px_rgba(100,89,38,0.06)]">
            <div className="flex items-center justify-between gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/80 text-[#8f731a]">
                <Icon name="users" className="h-5 w-5" />
              </span>
              <span className="text-2xl font-extrabold">
                {event._count.eventPeople}
              </span>
            </div>
            <p className="mt-4 text-xs font-bold text-[#766b42]">
              参加担当者
            </p>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4">
            <p className="text-xs font-bold tracking-[0.16em] text-[#4aaed9]">
              QUICK ACTIONS
            </p>
            <h2 className="mt-1 text-xl font-extrabold">
              交流をはじめる
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {actions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group flex items-center gap-4 rounded-[24px] border border-[#e1eef4] bg-white p-4 shadow-[0_9px_26px_rgba(50,99,121,0.07)] transition hover:-translate-y-0.5"
              >
                <span
                  className={`grid h-14 w-14 shrink-0 place-items-center rounded-[20px] ${action.iconClass}`}
                >
                  <Icon name={action.icon} className="h-7 w-7" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-extrabold">
                    {action.title}
                  </span>
                  <span className="mt-1 block text-xs font-medium text-[#7b8f99]">
                    {action.sub}
                  </span>
                </span>
                <Icon
                  name="chevron"
                  className="h-5 w-5 text-[#a5b6be] transition group-hover:translate-x-1"
                />
              </Link>
            ))}
          </div>
        </section>

        {event.description ? (
          <section className="mt-8 rounded-[26px] border border-[#e1eef4] bg-white p-6 shadow-[0_8px_24px_rgba(50,99,121,0.06)]">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#fff4bf] text-[#92751b]">
                <Icon name="briefcase" className="h-5 w-5" />
              </span>
              <h2 className="font-extrabold">交流スペースについて</h2>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#607783]">
              {event.description}
            </p>
          </section>
        ) : null}
      </main>
    </AppShell>
  );
}
