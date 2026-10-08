export function companyEventSearchConditions(q: string, eventId: string) {
  return {
    OR: [
      { name: { contains: q, mode: "insensitive" as const } },
      { businessDescription: { contains: q, mode: "insensitive" as const } },
      { profile: { contains: q, mode: "insensitive" as const } },
      {
        people: {
          some: {
            isHidden: false,
            name: { contains: q, mode: "insensitive" as const },
            eventPeople: { some: { eventId } },
          },
        },
      },
    ],
  };
}
