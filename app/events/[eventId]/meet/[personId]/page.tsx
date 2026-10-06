import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import AppShell from "@/components/app-shell";
import MeetRegistrar from "@/components/meet-registrar";

export const dynamic = "force-dynamic";

export default async function MeetPersonPage({
  params,
}: {
  params: Promise<{ eventId: string; personId: string }>;
}) {
  const { eventId, personId: qrToken } = await params;

  const participation = await prisma.eventPerson.findFirst({
    where: { eventId, qrToken },
    include: {
      event: {
        select: { id: true, name: true, isActive: true, deletedAt: true },
      },
      person: {
        include: { company: true },
      },
    },
  });

  if (
    !participation?.event.isActive ||
    participation.event.deletedAt ||
    participation.person.isHidden ||
    participation.person.company.isHidden
  ) {
    notFound();
  }

  const { person, event } = participation;

  return (
    <AppShell eventId={event.id}>
      <main className="mx-auto w-full max-w-xl px-4 pb-32 pt-6 sm:px-6 sm:pt-10">
        <section className="rounded-[30px] border border-[#e1eef4] bg-white p-6 text-center shadow-[0_12px_32px_rgba(50,99,121,0.08)]">
          <p className="text-xs font-extrabold tracking-[0.16em] text-[#4aaed9]">
            QR CHECK
          </p>
          <img
            src={person.photoUrl}
            alt={person.name}
            className="mx-auto mt-5 h-28 w-28 rounded-[32px] object-cover shadow-sm"
          />
          <h1 className="mt-4 text-2xl font-extrabold">{person.name}</h1>
          <p className="mt-1 text-sm font-bold text-[#6f8490]">
            {person.company.name}
          </p>
          <p className="mt-1 text-xs text-[#8a9ca5]">
            {[person.department, person.position].filter(Boolean).join(" / ")}
          </p>
        </section>

        <MeetRegistrar eventId={event.id} personId={qrToken} />
      </main>
    </AppShell>
  );
}
