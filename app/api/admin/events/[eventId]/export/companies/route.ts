import prisma from "@/lib/prisma";
import { isAdminApiAuthenticated } from "@/lib/admin-api-auth";
import { createCsv, csvResponse } from "@/lib/csv";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ eventId: string }> },
) {
  if (!(await isAdminApiAuthenticated())) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { eventId } = await context.params;

  const event = await prisma.event.findFirst({
    where: { id: eventId, deletedAt: null },
    select: {
      id: true,
      name: true,
      eventCompanies: {
        orderBy: { joinedAt: "asc" },
        select: {
          joinedAt: true,
          company: {
            select: {
              name: true,
              phone: true,
              postalCode: true,
              address: true,
              websiteUrl: true,
              businessDescription: true,
              profile: true,
              industries: {
                select: {
                  industry: {
                    select: { name: true },
                  },
                },
              },
              people: {
                where: {
                  isHidden: false,
                  eventPeople: { some: { eventId } },
                },
                select: { id: true },
              },
            },
          },
        },
      },
    },
  });

  if (!event) {
    return new Response("イベントが見つかりません。", { status: 404 });
  }

  const rows: unknown[][] = [
    [
      "企業名",
      "業界",
      "電話番号",
      "郵便番号",
      "住所",
      "Webサイト",
      "事業内容",
      "企業プロフィール",
      "参加担当者数",
      "登録日時",
    ],
    ...event.eventCompanies.map(({ company, joinedAt }) => [
      company.name,
      company.industries.map(({ industry }) => industry.name).join(" / "),
      company.phone,
      company.postalCode,
      company.address,
      company.websiteUrl,
      company.businessDescription,
      company.profile,
      company.people.length,
      new Intl.DateTimeFormat("ja-JP", {
        dateStyle: "short",
        timeStyle: "short",
        timeZone: "Asia/Tokyo",
      }).format(joinedAt),
    ]),
  ];

  return csvResponse(
    createCsv(rows),
    `${event.name}-企業一覧.csv`,
  );
}
