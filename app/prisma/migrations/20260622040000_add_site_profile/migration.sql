-- CreateTable
CREATE TABLE "SiteProfile" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "name" TEXT NOT NULL DEFAULT '',
    "tagline" TEXT NOT NULL DEFAULT '',
    "bio" TEXT NOT NULL DEFAULT '',
    "profileImage" TEXT,
    "profileBlur" TEXT,
    "gearBody" TEXT[],
    "gearLenses" TEXT[],
    "gearSoftware" TEXT[],
    "policyBadge" TEXT NOT NULL DEFAULT '',
    "policy" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteProfile_pkey" PRIMARY KEY ("id")
);
