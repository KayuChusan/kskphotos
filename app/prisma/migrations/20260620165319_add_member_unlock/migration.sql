-- AlterTable
ALTER TABLE "Collection" ADD COLUMN     "isLocked" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Photo" ADD COLUMN     "isLocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "originalUrl" TEXT;

-- CreateTable
CREATE TABLE "UnlockToken" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "label" TEXT,
    "expiresAt" TIMESTAMP(3),
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UnlockToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UnlockToken_tokenHash_key" ON "UnlockToken"("tokenHash");

-- CreateIndex
CREATE INDEX "UnlockToken_collectionId_idx" ON "UnlockToken"("collectionId");

-- AddForeignKey
ALTER TABLE "UnlockToken" ADD CONSTRAINT "UnlockToken_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
