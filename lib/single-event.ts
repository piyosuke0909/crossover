import prisma from "@/lib/prisma";

/** Keep one permanent event; existing events/data are never deleted or merged. */
export async function getPrimaryEvent() {
  const configuredId = process.env.CROSSOVER_EVENT_ID?.trim();
  if (configuredId) {
    return prisma.event.findFirst({
      where: { id: configuredId, deletedAt: null },
      include: { _count: { select: { eventPeople: true, eventCompanies: true } } },
    });
  }
  const events = await prisma.event.findMany({
    where: { deletedAt: null },
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    include: { _count: { select: { eventPeople: true, eventCompanies: true } } },
  });
  // Most-populated existing event wins; ties use the newest.
  return events.sort((a, b) =>
    (b._count.eventPeople + b._count.eventCompanies) -
    (a._count.eventPeople + a._count.eventCompanies)
  )[0] ?? null;
}
