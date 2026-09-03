-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'COMMERCIAL';

-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "claimedByOwnerAt" TIMESTAMP(3),
ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Business_createdById_idx" ON "Business"("createdById");

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
