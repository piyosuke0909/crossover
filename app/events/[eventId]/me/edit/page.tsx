import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import AppShell from "@/components/app-shell";
import BackLink from "@/components/back-link";
import ProfileEditForm from "@/components/profile-edit-form";
import { getCurrentParticipant } from "@/lib/participant-session";

export const dynamic = "force-dynamic";

export default async function EditMyProfilePage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const participant = await getCurrentParticipant(eventId);

  if (!participant) redirect(`/events/${eventId}/register`);

  const event = await prisma.event.findFirst({
    where: { id: eventId, isActive: true, deletedAt: null },
    select: { id: true },
  });
  if (!event) notFound();

  const industries = await prisma.industry.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  const person = participant.person;
  const company = person.company;

  return (
    <AppShell eventId={eventId}>
      <main className="mx-auto w-full max-w-3xl px-4 pb-32 pt-5 sm:px-6 sm:pt-8">
        <BackLink href={`/events/${eventId}/me`}>自分のページへ戻る</BackLink>
        <div className="mt-5">
          <p className="text-xs font-extrabold tracking-[0.16em] text-[#4aaed9]">EDIT PROFILE</p>
          <h1 className="mt-1 text-2xl font-extrabold">プロフィール編集</h1>
        </div>

        <ProfileEditForm
          canEditCompany={Boolean(person.companyVerifiedAt)}
          eventId={eventId}
          industries={industries.map(({ id, name }) => ({ id, name }))}
          initial={{
            company: {
              name: company.name,
              phone: company.phone ?? "",
              showPhone: company.showPhone,
              showAddress: company.showAddress,
              postalCode: company.postalCode ?? "",
              address: company.address ?? "",
              websiteUrl: company.websiteUrl ?? "",
              businessDescription: company.businessDescription,
              profile: company.profile ?? "",
              industryIds: company.industries.map(({ industryId }) => industryId),
            },
            person: {
              name: person.name,
              email: person.email ?? "",
              department: person.department ?? "",
              position: person.position ?? "",
              phone: person.phone ?? "",
              showPhone: person.showPhone,
              responsibility: person.responsibility ?? "",
              profile: person.profile ?? "",
            },
          }}
        />
      </main>
    </AppShell>
  );
}
