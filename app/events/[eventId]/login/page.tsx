import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import AppShell from "@/components/app-shell";
import BackLink from "@/components/back-link";
import ParticipantLoginForm from "@/components/participant-login-form";
import { getCurrentParticipant } from "@/lib/participant-session";
import { Icon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function ParticipantLoginPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const [event, participant] = await Promise.all([
    prisma.event.findFirst({
      where: { id: eventId, isActive: true, deletedAt: null },
      select: { id: true, name: true },
    }),
    getCurrentParticipant(eventId),
  ]);

  if (!event) notFound();
  if (participant) redirect(`/events/${eventId}/me`);

  return (
    <AppShell eventId={eventId}>
      <main className="mx-auto w-full max-w-xl px-4 pb-32 pt-5 sm:px-6 sm:pt-8">
        <BackLink href={`/events/${eventId}`}>イベントへ戻る</BackLink>

        <section className="mt-5 rounded-[30px] border border-[#e1eef4] bg-white p-6 shadow-[0_12px_32px_rgba(50,99,121,0.08)] sm:p-8">
          <span className="grid h-12 w-12 place-items-center rounded-[18px] bg-[#e6f7ff] text-[#278fb9]">
            <Icon name="lock" className="h-6 w-6" />
          </span>
          <p className="mt-4 text-xs font-extrabold tracking-[0.16em] text-[#4aaed9]">
            RE-LOGIN
          </p>
          <h1 className="mt-1 text-2xl font-extrabold">以前登録した方</h1>
          <p className="mt-2 text-sm leading-6 text-[#718792]">
            {event.name} に参加済みの方は、メールOTPまたは再ログインIDで自分のプロフィールへ戻れます。
          </p>

          <ParticipantLoginForm eventId={eventId} />
          <div className="mt-6 border-t border-[#e1eef4] pt-5 text-center">
            <p className="text-sm font-semibold text-[#607783]">
              まだ登録していない方はこちら
            </p>
            <Link
              href={`/events/${eventId}/register`}
              className="mt-3 inline-flex w-full items-center justify-center rounded-2xl border border-[#d4e8f1] bg-[#f1faff] px-5 py-3 text-sm font-extrabold text-[#238fbd]"
            >
              新しくプロフィールを登録する
            </Link>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
