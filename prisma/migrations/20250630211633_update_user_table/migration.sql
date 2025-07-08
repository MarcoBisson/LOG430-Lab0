/*
  Warnings:

  - You are about to drop the column `storeId` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_storeId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "storeId";

-- CreateTable
CREATE TABLE "_UserAccess" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_UserAccess_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_UserAccess_B_index" ON "_UserAccess"("B");

-- AddForeignKey
ALTER TABLE "_UserAccess" ADD CONSTRAINT "_UserAccess_A_fkey" FOREIGN KEY ("A") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserAccess" ADD CONSTRAINT "_UserAccess_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
