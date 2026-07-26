/*
  Warnings:

  - You are about to drop the column `category` on the `Car` table. All the data in the column will be lost.
  - You are about to drop the column `specs` on the `Car` table. All the data in the column will be lost.
  - Added the required column `bodyType` to the `Car` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fuel` to the `Car` table without a default value. This is not possible if the table is not empty.
  - Added the required column `seats` to the `Car` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transmission` to the `Car` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `Car` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Car" DROP COLUMN "category",
DROP COLUMN "specs",
ADD COLUMN     "bodyType" TEXT NOT NULL,
ADD COLUMN     "fuel" TEXT NOT NULL,
ADD COLUMN     "seats" INTEGER NOT NULL,
ADD COLUMN     "transmission" TEXT NOT NULL,
ADD COLUMN     "year" INTEGER NOT NULL;
