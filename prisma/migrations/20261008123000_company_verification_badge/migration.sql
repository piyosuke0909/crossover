-- Existing people remain unverified until they enter a valid company code.
ALTER TABLE "Person" ADD COLUMN "companyVerifiedAt" TIMESTAMP(3);
