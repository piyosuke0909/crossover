-- CreateTable
CREATE TABLE "CompanyIndustry" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "industryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyIndustry_pkey" PRIMARY KEY ("id")
);

-- Migrate existing single-industry links before removing Company.industryId
INSERT INTO "CompanyIndustry" ("id", "companyId", "industryId")
SELECT 'legacy_' || md5("id" || ':' || "industryId"), "id", "industryId"
FROM "Company";

-- Remove old single-industry relation
ALTER TABLE "Company" DROP CONSTRAINT "Company_industryId_fkey";
DROP INDEX "Company_industryId_idx";
ALTER TABLE "Company" DROP COLUMN "industryId";

-- CreateTable
CREATE TABLE "ParticipantSession" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParticipantSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Encounter" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "ownerPersonId" TEXT NOT NULL,
    "metPersonId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Encounter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanyIndustry_companyId_industryId_key"
ON "CompanyIndustry"("companyId", "industryId");

-- CreateIndex
CREATE INDEX "CompanyIndustry_industryId_idx"
ON "CompanyIndustry"("industryId");

-- CreateIndex
CREATE UNIQUE INDEX "ParticipantSession_tokenHash_key"
ON "ParticipantSession"("tokenHash");

-- CreateIndex
CREATE INDEX "ParticipantSession_eventId_personId_idx"
ON "ParticipantSession"("eventId", "personId");

-- CreateIndex
CREATE INDEX "ParticipantSession_expiresAt_idx"
ON "ParticipantSession"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Encounter_eventId_ownerPersonId_metPersonId_key"
ON "Encounter"("eventId", "ownerPersonId", "metPersonId");

-- CreateIndex
CREATE INDEX "Encounter_ownerPersonId_idx"
ON "Encounter"("ownerPersonId");

-- CreateIndex
CREATE INDEX "Encounter_metPersonId_idx"
ON "Encounter"("metPersonId");

-- AddForeignKey
ALTER TABLE "CompanyIndustry"
ADD CONSTRAINT "CompanyIndustry_companyId_fkey"
FOREIGN KEY ("companyId") REFERENCES "Company"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyIndustry"
ADD CONSTRAINT "CompanyIndustry_industryId_fkey"
FOREIGN KEY ("industryId") REFERENCES "Industry"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipantSession"
ADD CONSTRAINT "ParticipantSession_eventId_fkey"
FOREIGN KEY ("eventId") REFERENCES "Event"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipantSession"
ADD CONSTRAINT "ParticipantSession_personId_fkey"
FOREIGN KEY ("personId") REFERENCES "Person"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Encounter"
ADD CONSTRAINT "Encounter_eventId_fkey"
FOREIGN KEY ("eventId") REFERENCES "Event"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Encounter"
ADD CONSTRAINT "Encounter_ownerPersonId_fkey"
FOREIGN KEY ("ownerPersonId") REFERENCES "Person"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Encounter"
ADD CONSTRAINT "Encounter_metPersonId_fkey"
FOREIGN KEY ("metPersonId") REFERENCES "Person"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
