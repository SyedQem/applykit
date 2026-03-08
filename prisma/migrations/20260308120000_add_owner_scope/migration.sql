-- Add owner identifiers for user scoping
ALTER TABLE "Application" ADD COLUMN "ownerId" TEXT;
ALTER TABLE "Event" ADD COLUMN "ownerId" TEXT;

-- Backfill existing development data with a deterministic fallback owner
UPDATE "Application"
SET "ownerId" = COALESCE("ownerId", 'dev-owner')
WHERE "ownerId" IS NULL;

UPDATE "Event" e
SET "ownerId" = a."ownerId"
FROM "Application" a
WHERE e."applicationId" = a."id"
  AND e."ownerId" IS NULL;

UPDATE "Event"
SET "ownerId" = 'dev-owner'
WHERE "ownerId" IS NULL;

ALTER TABLE "Application" ALTER COLUMN "ownerId" SET NOT NULL;
ALTER TABLE "Event" ALTER COLUMN "ownerId" SET NOT NULL;

CREATE INDEX "Application_ownerId_idx" ON "Application"("ownerId");
CREATE INDEX "Event_ownerId_idx" ON "Event"("ownerId");
CREATE INDEX "Event_applicationId_ownerId_idx" ON "Event"("applicationId", "ownerId");
