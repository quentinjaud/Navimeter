-- AlterEnum
ALTER TYPE "TypeNavigation" ADD VALUE 'AVENTURE';

-- AlterTable
ALTER TABLE "Dossier" ADD COLUMN     "markerLat" DOUBLE PRECISION,
ADD COLUMN     "markerLon" DOUBLE PRECISION,
ADD COLUMN     "parentId" TEXT;

-- AlterTable
ALTER TABLE "Navigation" ADD COLUMN     "parentNavId" TEXT,
ADD COLUMN     "polylineCache" JSONB;

-- AddForeignKey
ALTER TABLE "Dossier" ADD CONSTRAINT "Dossier_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Dossier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Navigation" ADD CONSTRAINT "Navigation_parentNavId_fkey" FOREIGN KEY ("parentNavId") REFERENCES "Navigation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
