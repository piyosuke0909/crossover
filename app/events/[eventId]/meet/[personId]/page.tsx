import PersonAvatar from "@/components/person-avatar";
import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import AppShell from "@/components/app-shell";
import CompanyVerifiedBadge from "@/components/company-verified-badge";
import MeetRegistrar from "@/components/meet-registrar";
import { getCurrentParticipant } from "@/lib/participant-session";

export const dynamic = "force-dynamic";

export default async function MeetPersonPage({
  params,
}: {
  params: Promise<{ eventId: string; personId: string }>;
}) {
  const { eventId, personId: qrToken } = await params;
  const participant = await getCurrentParticipant(eventId);
  if (!participant) redirect(`/events/${eventId}/login`);

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
<PersonAvatar name={person.name} size="xl" />
          <h1 className="mt-4 text-2xl font-extrabold">{person.name}</h1>
                  {person.companyVerifiedAt ? (
                    <div className="mt-2 inline-flex"><CompanyVerifiedBadge compact /></div>
                  ) : null}
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
