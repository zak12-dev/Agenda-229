/*
  Warnings:

  - Made the column `details` on table `event` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `event` MODIFY `details` TEXT NOT NULL,
    ALTER COLUMN `priceType` DROP DEFAULT;
