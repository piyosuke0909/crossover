import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import ProfileRegisterForm from "@/components/profile-register-form";
import AppShell from "@/components/app-shell";
import BackLink from "@/components/back-link";

export const dynamic = "force-dynamic";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const [event, industries] = await Promise.all([
    prisma.event.findUnique({ where: { id: eventId } }),
    prisma.industry.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!event || !event.isActive) notFound();

  return (
    <AppShell eventId={event.id}>
      <main className="mx-auto w-full max-w-3xl px-4 pb-32 pt-5 sm:px-6 sm:pt-8">
        <BackLink href={`/events/${event.id}`}>イベントへ戻る</BackLink>

        <section className="mt-5 rounded-[28px] border border-[#deedf3] bg-gradient-to-br from-[#e5f7ff] to-white p-6 shadow-[0_10px_26px_rgba(50,99,121,0.05)] sm:p-8">
          <span className="inline-flex rounded-full bg-[#fff3b8] px-3 py-1.5 text-xs font-extrabold text-[#816b22]">
            かんたん登録
          </span>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
            企業・担当者プロフィール
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#647c88]">
            参加者が話しかけやすいように、会社の特徴と今回参加する担当者について教えてください。
          </p>
        </section>

        <ProfileRegisterForm
          eventId={event.id}
          industries={industries.map((industry) => ({
            id: industry.id,
            name: industry.name,
          }))}
        />
      </main>
    </AppShell>
  );
}
