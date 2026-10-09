import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export function hashCompanyAccessCode(code: string) {
  return createHash("sha256").update(code.trim().toUpperCase()).digest("hex");
}

export function newCompanyAccessCode() {
  return randomBytes(6)
    .toString("base64url")
    .replace(/[^A-Za-z0-9]/g, "")
    .slice(0, 8)
    .toUpperCase()
    .padEnd(8, "X");
}

export function companyAccessCookieName(companyId: string) {
  return `crossover_company_${companyId}`;
}

export async function verifyCompanyAccess(companyId: string, code: string) {
  if (!code.trim()) return false;

  const key = await prisma.companyAccessKey.findFirst({
    where: {
      companyId,
      keyHash: hashCompanyAccessCode(code),
      revokedAt: null,
    },
    select: { id: true },
  });

  return Boolean(key);
}

export async function getCompanyAccessCodeFromCookie(companyId: string) {
  const cookieStore = await cookies();
  return cookieStore.get(companyAccessCookieName(companyId))?.value ?? null;
}
