-- CreateEnum
CREATE TYPE "EmailOtpPurpose" AS ENUM ('LOGIN', 'VERIFY_EMAIL');

-- AlterTable
ALTER TABLE "Person"
ADD COLUMN "emailVerifiedAt" TIMESTAMP(3),
ADD COLUMN "emailOtpEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "PersonLoginCredential" (
  "id" TEXT NOT NULL,
  "personId" TEXT NOT NULL,
  "codeHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revokedAt" TIMESTAMP(3),
  "lastUsedAt" TIMESTAMP(3),
  CONSTRAINT "PersonLoginCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailOtpChallenge" (
  "id" TEXT NOT NULL,
  "personId" TEXT NOT NULL,
  "eventId" TEXT,
  "purpose" "EmailOtpPurpose" NOT NULL,
  "email" TEXT NOT NULL,
  "codeHash" TEXT NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "consumedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EmailOtpChallenge_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX "Person_email_idx" ON "Person"("email");
CREATE UNIQUE INDEX "PersonLoginCredential_codeHash_key" ON "PersonLoginCredential"("codeHash");
CREATE INDEX "PersonLoginCredential_personId_idx" ON "PersonLoginCredential"("personId");
CREATE INDEX "EmailOtpChallenge_personId_purpose_createdAt_idx" ON "EmailOtpChallenge"("personId", "purpose", "createdAt");
CREATE INDEX "EmailOtpChallenge_eventId_email_idx" ON "EmailOtpChallenge"("eventId", "email");
CREATE INDEX "EmailOtpChallenge_expiresAt_idx" ON "EmailOtpChallenge"("expiresAt");

-- Foreign keys
ALTER TABLE "PersonLoginCredential"
ADD CONSTRAINT "PersonLoginCredential_personId_fkey"
FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EmailOtpChallenge"
ADD CONSTRAINT "EmailOtpChallenge_personId_fkey"
FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;
