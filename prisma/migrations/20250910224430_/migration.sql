/*
  Warnings:

  - You are about to drop the column `latitude` on the `House` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `House` table. All the data in the column will be lost.
  - Added the required column `allFloor` to the `House` table without a default value. This is not possible if the table is not empty.
  - Added the required column `area` to the `House` table without a default value. This is not possible if the table is not empty.
  - Added the required column `floor` to the `House` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."House" DROP COLUMN "latitude",
DROP COLUMN "longitude",
ADD COLUMN     "allFloor" INTEGER NOT NULL,
ADD COLUMN     "area" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "floor" INTEGER NOT NULL;
