import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import BackLink from "@/components/back-link";
import AdminCompanyForm from "@/components/admin-company-form";
import AdminCompanyCode from "@/components/admin-company-code";

export const dynamic = "force-dynamic";

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  const [company, industries] = await Promise.all([
    prisma.company.findUnique({
      where: { id: companyId },
      include: { industries: true },
    }),
    prisma.industry.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!company) notFound();

  return (
    <main className="min-h-screen bg-[#f5fbfe] px-4 py-8 text-[#173042] sm:px-6">
      <div className="mx-auto max-w-2xl">
        <BackLink href="/admin/companies">企業管理へ戻る</BackLink>

        <section className="mt-5 rounded-[30px] border border-[#e1eef4] bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-extrabold tracking-[0.16em] text-[#4aaed9]">COMPANY DETAIL</p>
          <h1 className="mt-1 break-words text-2xl font-extrabold">{company.name}</h1>

          <AdminCompanyCode companyId={company.id} />

          <AdminCompanyForm
            company={{
              id: company.id,
              name: company.name,
              phone: company.phone ?? "",
              postalCode: company.postalCode ?? "",
              address: company.address ?? "",
              websiteUrl: company.websiteUrl ?? "",
              businessDescription: company.businessDescription,
              profile: company.profile ?? "",
              industryIds: company.industries.map(({ industryId }) => industryId),
            }}
            industries={industries.map(({ id, name }) => ({ id, name }))}
          />
        </section>
      </div>
    </main>
  );
}
