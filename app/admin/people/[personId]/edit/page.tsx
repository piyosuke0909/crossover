import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import BackLink from "@/components/back-link";
import AdminPersonForm from "@/components/admin-person-form";

export const dynamic = "force-dynamic";

export default async function EditPersonPage({
  params,
}: {
  params: Promise<{ personId: string }>;
}) {
  const { personId } = await params;
  const person = await prisma.person.findUnique({
    where: { id: personId },
    include: { company: { select: { name: true } } },
  });

  if (!person) notFound();

  return (
    <main className="min-h-screen bg-[#f5fbfe] px-4 py-8 text-[#173042] sm:px-6">
      <div className="mx-auto max-w-2xl">
        <BackLink href="/admin/people">担当者管理へ戻る</BackLink>

        <section className="mt-5 rounded-[30px] border border-[#e1eef4] bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-extrabold tracking-[0.16em] text-[#4aaed9]">PERSON DETAIL</p>
          <h1 className="mt-1 text-2xl font-extrabold">{person.name}</h1>
          <p className="mt-2 text-sm font-bold text-[#728792]">{person.company.name}</p>

          <AdminPersonForm
            person={{
              id: person.id,
              name: person.name,
              photoUrl: person.photoUrl,
              email: person.email ?? "",
              department: person.department ?? "",
              position: person.position ?? "",
              phone: person.phone ?? "",
              responsibility: person.responsibility ?? "",
              profile: person.profile ?? "",
            }}
          />
        </section>
      </div>
    </main>
  );
}
