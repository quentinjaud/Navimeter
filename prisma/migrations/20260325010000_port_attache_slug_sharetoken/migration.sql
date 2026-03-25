-- AlterTable User: port d'attache
ALTER TABLE "User" ADD COLUMN "portAttacheLat" DOUBLE PRECISION;
ALTER TABLE "User" ADD COLUMN "portAttacheLon" DOUBLE PRECISION;
ALTER TABLE "User" ADD COLUMN "portAttacheNom" TEXT;

-- AlterTable Navigation: slug + shareToken
ALTER TABLE "Navigation" ADD COLUMN "slug" TEXT;
ALTER TABLE "Navigation" ADD COLUMN "shareToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Navigation_slug_key" ON "Navigation"("slug");
CREATE UNIQUE INDEX "Navigation_shareToken_key" ON "Navigation"("shareToken");
