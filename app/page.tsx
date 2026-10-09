import { redirect } from "next/navigation";
import AppShell from "@/components/app-shell";
import { getPrimaryEvent } from "@/lib/single-event";

export const dynamic = "force-dynamic";

export default async function Home() {
  const event = await getPrimaryEvent();
  if (event?.isActive) redirect(`/events/${event.id}`);
  return (
    <AppShell showBottomNav={false}>
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-2xl font-extrabold">Crossover 企業交流</h1>
        <p className="mt-4 break-words text-sm leading-7 text-[#607783]">
          {event ? "現在、交流ページは非公開です。" : "交流ページを準備しています。運営担当者にお問い合わせください。"}
        </p>
      </main>
    </AppShell>
  );
}
