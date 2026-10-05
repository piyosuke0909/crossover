import Link from "next/link";
import AppShell from "@/components/app-shell";
import { Icon } from "@/components/icons";
import { getCurrentParticipant } from "@/lib/participant-session";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MetPeoplePage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const participant = await getCurrentParticipant(eventId);

  if (!participant) {
    return (
      <AppShell eventId={eventId}>
        <main className="mx-auto w-full max-w-xl px-4 pb-32 pt-8 sm:px-6">
          <section className="rounded-[30px] border border-[#e1eef4] bg-white p-7 text-center shadow-sm">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-[20px] bg-[#fff4bf] text-[#8d711a]">
              <Icon name="handshake" className="h-7 w-7" />
            </span>
            <h1 className="mt-4 text-xl font-extrabold">
              話した人を記録するには登録が必要です
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#718792]">
              プロフィール登録後、相手のQRを読み取るとここに保存されます。
            </p>
            <Link
              href={`/events/${eventId}/register`}
              className="mt-5 inline-flex rounded-2xl bg-[#4db7e5] px-5 py-3 text-sm font-extrabold text-white"
            >
              プロフィール登録へ
            </Link>
          </section>
        </main>
      </AppShell>
    );
  }

  const encounters = await prisma.encounter.findMany({
    where: {
      eventId,
      ownerPersonId: participant.personId,
    },
    orderBy: { createdAt: "desc" },
    include: {
      metPerson: {
        include: {
          company: {
            include: {
              industries: {
                include: { industry: true },
              },
            },
          },
        },
      },
    },
  });

  return (
    <AppShell eventId={eventId}>
      <main className="mx-auto w-full max-w-4xl px-4 pb-32 pt-6 sm:px-6 sm:pt-10">
        <div>
          <p className="text-xs font-extrabold tracking-[0.16em] text-[#4aaed9]">
            MET PEOPLE
          </p>
          <h1 className="mt-1 text-2xl font-extrabold">話した人</h1>
          <p className="mt-2 text-sm text-[#718792]">
            この交流会でQRを読み取って登録した担当者です。
          </p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {encounters.map(({ metPerson, createdAt }) => (
            <Link
              key={metPerson.id}
              href={`/events/${eventId}/companies/${metPerson.companyId}`}
              className="rounded-[26px] border border-[#e1eef4] bg-white p-4 shadow-[0_9px_26px_rgba(50,99,121,0.07)]"
            >
              <div className="flex items-center gap-4">
                <img
                  src={metPerson.photoUrl}
                  alt={metPerson.name}
                  className="h-16 w-16 rounded-[22px] object-cover"
                />
                <div className="min-w-0">
                  <h2 className="truncate font-extrabold">
                    {metPerson.name}
                  </h2>
                  <p className="mt-1 truncate text-sm font-bold text-[#607783]">
                    {metPerson.company.name}
                  </p>
                  <p className="mt-1 text-xs text-[#8a9ca5]">
                    {[metPerson.department, metPerson.position]
                      .filter(Boolean)
                      .join(" / ") || "所属情報なし"}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {metPerson.company.industries.map(({ industry }) => (
                  <span
                    key={industry.id}
                    className="rounded-full bg-[#e7f7ff] px-2.5 py-1 text-[10px] font-extrabold text-[#278fb9]"
                  >
                    {industry.name}
                  </span>
                ))}
              </div>

              <p className="mt-4 border-t border-[#edf3f6] pt-3 text-[11px] font-bold text-[#8a9ca5]">
                {new Intl.DateTimeFormat("ja-JP", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(createdAt)}
              </p>
            </Link>
          ))}

          {encounters.length === 0 ? (
            <section className="rounded-[28px] border border-dashed border-[#cfe3ec] bg-white p-9 text-center sm:col-span-2">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-[20px] bg-[#fff4bf] text-[#8d711a]">
                <Icon name="handshake" className="h-7 w-7" />
              </span>
              <h2 className="mt-4 font-extrabold">
                まだ話した人はいません
              </h2>
              <p className="mt-2 text-sm text-[#718792]">
                相手のQRを読み取ると、ここに追加されます。
              </p>
            </section>
          ) : null}
        </div>
      </main>
    </AppShell>
  );
}
