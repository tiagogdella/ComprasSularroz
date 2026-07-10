/*
  Warnings:

  - You are about to drop the column `SupplierId` on the `Purchase` table. All the data in the column will be lost.
  - Added the required column `supplierId` to the `Purchase` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Purchase" DROP CONSTRAINT "Purchase_SupplierId_fkey";

-- AlterTable
ALTER TABLE "Purchase" DROP COLUMN "SupplierId",
ADD COLUMN     "supplierId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
