/*
  Warnings:

  - Added the required column `imgUrl` to the `Category` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Category" ADD COLUMN     "imgUrl" TEXT NOT NULL;
