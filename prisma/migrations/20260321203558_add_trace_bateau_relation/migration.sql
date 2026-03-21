-- AlterTable
ALTER TABLE "Trace" ADD COLUMN     "bateauId" TEXT;

-- CreateIndex
CREATE INDEX "Trace_bateauId_idx" ON "Trace"("bateauId");

-- AddForeignKey
ALTER TABLE "Trace" ADD CONSTRAINT "Trace_bateauId_fkey" FOREIGN KEY ("bateauId") REFERENCES "Bateau"("id") ON DELETE SET NULL ON UPDATE CASCADE;
