/*
  Warnings:

  - Added the required column `endDate` to the `House` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."House" ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "House_endDate_idx" ON "public"."House"("endDate");
