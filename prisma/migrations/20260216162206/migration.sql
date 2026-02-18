-- AlterTable
ALTER TABLE `event` MODIFY `priceType` ENUM('FREE', 'PAID') NOT NULL DEFAULT 'FREE';
