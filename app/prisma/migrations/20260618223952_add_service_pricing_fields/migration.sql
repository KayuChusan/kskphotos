-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ServiceCategory" ADD VALUE 'POLITICS';
ALTER TYPE "ServiceCategory" ADD VALUE 'WEB_PRODUCTION';
ALTER TYPE "ServiceCategory" ADD VALUE 'IT_SUPPORT';

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "isPopular" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "priceNote" TEXT;
