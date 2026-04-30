CREATE TABLE IF NOT EXISTS `storage_folders` (
    `id`          INT(11)      NOT NULL AUTO_INCREMENT,
    `user_id`     INT(11)      NOT NULL,
    `name`        VARCHAR(255) NOT NULL,
    `description` TEXT         DEFAULT NULL,
    `is_public`   TINYINT(1)   NOT NULL DEFAULT 0,
    `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_fold_user` (`user_id`),
    CONSTRAINT `fk_fold_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `storage_files` ADD COLUMN IF NOT EXISTS `folder_id` INT(11) DEFAULT NULL AFTER `id`;
ALTER TABLE `storage_files` ADD INDEX IF NOT EXISTS `idx_sf_folder` (`folder_id`);
