-- DropForeignKey
ALTER TABLE "Aventure" DROP CONSTRAINT "Aventure_dossierId_fkey";

-- DropForeignKey
ALTER TABLE "Aventure" DROP CONSTRAINT "Aventure_userId_fkey";

-- DropForeignKey
ALTER TABLE "Navigation" DROP CONSTRAINT "Navigation_aventureId_fkey";

-- DropIndex
DROP INDEX "Navigation_aventureId_idx";

-- AlterTable
ALTER TABLE "Navigation" DROP COLUMN "aventureId";

-- DropTable
DROP TABLE "Aventure";
