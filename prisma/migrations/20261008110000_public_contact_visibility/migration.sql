-- Public profile contact details are private until explicitly enabled.
ALTER TABLE "Company"
  ADD COLUMN "showPhone" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "showAddress" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Person"
  ADD COLUMN "showPhone" BOOLEAN NOT NULL DEFAULT false;
