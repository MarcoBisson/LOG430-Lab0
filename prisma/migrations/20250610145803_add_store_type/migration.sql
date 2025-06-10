-- CreateEnum
CREATE TYPE "StoreType" AS ENUM ('SALES', 'LOGISTICS', 'HEADQUARTERS');

-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "type" "StoreType" NOT NULL DEFAULT 'SALES';
