/*
  Warnings:

  - The `status` column on the `ReplenishmentRequest` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ReplenishmentRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "ReplenishmentRequest" DROP COLUMN "status",
ADD COLUMN     "status" "ReplenishmentRequestStatus" NOT NULL DEFAULT 'PENDING';

-- DropEnum
DROP TYPE "RequestStatus";
