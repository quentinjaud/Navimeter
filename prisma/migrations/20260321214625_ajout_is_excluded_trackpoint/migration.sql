-- AlterTable
ALTER TABLE "TrackPoint" ADD COLUMN     "isExcluded" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "TrackPoint_traceId_isExcluded_idx" ON "TrackPoint"("traceId", "isExcluded");
