import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
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

export async function createParticipantSession(eventId: string, personId: string) {
  const rawToken = newParticipantToken();
  const expiresAt = participantSessionExpiry();

  await prisma.participantSession.create({
    data: {
      eventId,
      personId,
      tokenHash: hashParticipantToken(rawToken),
      expiresAt,
    },
  });

  return { rawToken, expiresAt };
}

export function attachParticipantSessionCookie(
  response: NextResponse,
  eventId: string,
  rawToken: string,
  expiresAt: Date,
) {
  response.cookies.set(participantCookieName(eventId), rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
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
