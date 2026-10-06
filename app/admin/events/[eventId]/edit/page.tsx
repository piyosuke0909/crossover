import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import AdminEventForm from "@/components/admin-event-form";

function toJapanLocalInput(date: Date) {
  const jst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 16);
}

export default async function EditAdminEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  const event = await prisma.event.findFirst({
    where: { id: eventId, deletedAt: null },
  });

  if (!event) notFound();

  return (
    <main className="min-h-screen bg-[#f5fbfe] px-4 py-8 text-[#173042] sm:px-6">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/admin"
          className="text-sm font-extrabold text-[#4b91af]"
        >
          ← 管理画面
        </Link>

        <section className="mt-5 rounded-[30px] border border-[#e1eef4] bg-white p-6 shadow-[0_12px_32px_rgba(50,99,121,0.07)] sm:p-8">
          <p className="text-xs font-extrabold tracking-[0.16em] text-[#4aaed9]">
            EDIT EVENT
          </p>
          <h1 className="mt-1 text-2xl font-extrabold">
            イベントを編集
          </h1>

          <AdminEventForm
            event={{
              id: event.id,
              name: event.name,
              eventDate: toJapanLocalInput(event.eventDate),
              venue: event.venue ?? "",
              description: event.description ?? "",
              isActive: event.isActive,
            }}
          />
        </section>
      </div>
    </main>
  );
}
