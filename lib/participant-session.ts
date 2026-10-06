import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

const SESSION_DAYS = 30;

export function participantCookieName(eventId: string) {
  return `crossover_participant_${eventId}`;
}

export function hashParticipantToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function newParticipantToken() {
  return randomBytes(32).toString("base64url");
}

export function participantSessionExpiry() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);
  return expiresAt;
}

export async function getCurrentParticipant(eventId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get(participantCookieName(eventId))?.value;

  if (!token) return null;

  const session = await prisma.participantSession.findUnique({
    where: { tokenHash: hashParticipantToken(token) },
    include: {
      person: {
        include: {
          company: {
            include: {
              industries: {
                include: { industry: true },
              },
            },
          },
          eventPeople: {
            where: { eventId },
            select: { qrToken: true },
            take: 1,
          },
        },
      },
    },
  });

  if (
    !session ||
    session.eventId !== eventId ||
    session.expiresAt.getTime() <= Date.now()
  ) {
    return null;
  }

  return session;
}
