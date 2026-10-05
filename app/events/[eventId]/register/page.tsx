import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import ProfileRegisterForm from "@/components/profile-register-form";

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

  if (!event || !event.isActive) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-4 py-8 sm:px-6">
      <Link
        href={"/events/" + event.id}
        className="text-sm text-slate-500 hover:text-slate-900"
      >
        ← {event.name}
      </Link>

      <div className="mt-5">
        <h1 className="text-2xl font-bold">企業・担当者プロフィール登録</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          会社情報と、今回参加する担当者の情報を登録してください。
        </p>
      </div>

      <ProfileRegisterForm
        eventId={event.id}
        industries={industries.map((industry) => ({
          id: industry.id,
          name: industry.name,
        }))}
      />
    </main>
  );
}
