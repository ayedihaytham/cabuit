-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "region" TEXT;

-- CreateIndex
CREATE INDEX "Business_status_region_idx" ON "Business"("status", "region");

-- Backfill : rattache les fiches existantes à un gouvernorat d'après la ville.
UPDATE "Business" SET "region" = 'tunis'
  WHERE "region" IS NULL AND "city" IN
  ('La Marsa', 'Sidi Bou Saïd', 'Sidi Bou Said', 'Tunis Centre', 'Tunis', 'Carthage', 'Les Berges du Lac', 'Le Bardo', 'La Goulette');
UPDATE "Business" SET "region" = 'ariana' WHERE "region" IS NULL AND "city" IN ('Ariana', 'Raoued', 'La Soukra');
UPDATE "Business" SET "region" = 'ben-arous' WHERE "region" IS NULL AND "city" IN ('Ben Arous', 'Radès', 'Rades', 'Hammam Lif');
UPDATE "Business" SET "region" = 'sousse' WHERE "region" IS NULL AND "city" IN ('Sousse', 'Hammam Sousse');
UPDATE "Business" SET "region" = 'sfax' WHERE "region" IS NULL AND "city" = 'Sfax';
UPDATE "Business" SET "region" = 'nabeul' WHERE "region" IS NULL AND "city" IN ('Nabeul', 'Hammamet');
