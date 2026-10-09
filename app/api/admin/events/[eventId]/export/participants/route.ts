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
      eventPeople: {
        orderBy: { joinedAt: "asc" },
        select: {
          joinedAt: true,
          person: {
            select: {
              name: true,
              department: true,
              position: true,
              phone: true,
              responsibility: true,
              profile: true,
              company: {
                select: {
                  name: true,
                  industries: {
                    select: {
                      industry: {
                        select: { name: true },
                      },
                    },
                  },
                },
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
      "交流会名",
      "企業名",
      "業界",
      "担当者名",
      "部署",
      "役職",
      "電話番号",
      "担当業務",
      "自己紹介",
      "登録日時",
    ],
    ...event.eventPeople.map(({ person, joinedAt }) => [
      event.name,
      person.company.name,
      person.company.industries
        .map(({ industry }) => industry.name)
        .join(" / "),
      person.name,
      person.department,
      person.position,
      person.phone,
      person.responsibility,
      person.profile,
      new Intl.DateTimeFormat("ja-JP", {
        dateStyle: "short",
        timeStyle: "short",
        timeZone: "Asia/Tokyo",
      }).format(joinedAt),
    ]),
  ];

  return csvResponse(
    createCsv(rows),
    `${event.name}-参加者名簿.csv`,
  );
}
