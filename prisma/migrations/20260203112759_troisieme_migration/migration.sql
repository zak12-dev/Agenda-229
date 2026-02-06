/*
  Warnings:

  - Added the required column `name` to the `Organizer_profile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `organizer_profile` ADD COLUMN `name` TEXT NOT NULL;
