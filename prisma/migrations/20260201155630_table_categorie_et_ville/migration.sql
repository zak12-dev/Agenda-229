/*
  Warnings:

  - Added the required column `image` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `villeId` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `event` ADD COLUMN `image` VARCHAR(191) NOT NULL,
    ADD COLUMN `views` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `villeId` VARCHAR(191) NOT NULL,
    MODIFY `startDate` VARCHAR(191) NOT NULL,
    MODIFY `endDate` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Ville` (
    `id` VARCHAR(191) NOT NULL,
    `nomVille` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Ville_nomVille_key`(`nomVille`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_villeId_fkey` FOREIGN KEY (`villeId`) REFERENCES `Ville`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
