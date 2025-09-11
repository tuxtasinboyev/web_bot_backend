/*
  Warnings:

  - The `allFloor` column on the `House` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `area` column on the `House` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `floor` column on the `House` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `rooms` on the `House` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."House" DROP COLUMN "rooms",
ADD COLUMN     "rooms" INTEGER NOT NULL,
DROP COLUMN "allFloor",
ADD COLUMN     "allFloor" INTEGER,
DROP COLUMN "area",
ADD COLUMN     "area" INTEGER,
DROP COLUMN "floor",
ADD COLUMN     "floor" INTEGER;
