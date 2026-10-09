-- AlterTable
ALTER TABLE "Person" ADD COLUMN "email" TEXT;

-- AlterTable
ALTER TABLE "EventPerson" ADD COLUMN "qrToken" TEXT;

-- Backfill a random public QR token for existing participants
UPDATE "EventPerson"
SET "qrToken" = 'qr_' || md5(random()::text || clock_timestamp()::text || "id");

ALTER TABLE "EventPerson" ALTER COLUMN "qrToken" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "EventPerson_qrToken_key" ON "EventPerson"("qrToken");
