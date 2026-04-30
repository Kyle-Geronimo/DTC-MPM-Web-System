-- ============================================================
-- Storage & Emulator — Database Schema
-- Run this against project_management_db in phpMyAdmin (SQL tab)
-- ============================================================

-- ── Storage System ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `storage_files` (
    `id`             INT(11)      NOT NULL AUTO_INCREMENT,
    `user_id`        INT(11)      NOT NULL,
    `original_name`  VARCHAR(255) NOT NULL,
    `stored_name`    VARCHAR(255) NOT NULL COMMENT 'UUID-based filename saved to disk',
    `file_path`      VARCHAR(512) NOT NULL COMMENT 'Relative path from project root (uploads/YYYY/MM/filename)',
    `file_type`      VARCHAR(100) NOT NULL COMMENT 'Server-detected MIME type',
    `file_size`      BIGINT       NOT NULL DEFAULT 0 COMMENT 'File size in bytes',
    `category`       VARCHAR(100) NOT NULL DEFAULT 'General',
    `description`    TEXT         DEFAULT NULL,
    `is_public`      TINYINT(1)   NOT NULL DEFAULT 0,
    `download_count` INT(11)      NOT NULL DEFAULT 0,
    `uploaded_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_sf_user_id`   (`user_id`),
    INDEX `idx_sf_file_type` (`file_type`),
    INDEX `idx_sf_category`  (`category`),
    CONSTRAINT `fk_sf_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Emulator Environment ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS `emulator_programs` (
    `id`           INT(11)      NOT NULL AUTO_INCREMENT,
    `user_id`      INT(11)      NOT NULL,
    `name`         VARCHAR(255) NOT NULL,
    `description`  TEXT         DEFAULT NULL,
    `runtime`      ENUM('python','javascript','x86_disk_image') NOT NULL DEFAULT 'python',
    `source_code`  MEDIUMTEXT   DEFAULT NULL  COMMENT 'Script source for python/javascript runtimes',
    `binary_data`  LONGBLOB     DEFAULT NULL  COMMENT 'Raw disk image for x86_disk_image runtime',
    `binary_size`  BIGINT       NOT NULL DEFAULT 0,
    `version`      VARCHAR(50)  NOT NULL DEFAULT '1.0',
    `is_public`    TINYINT(1)   NOT NULL DEFAULT 0,
    `run_count`    INT(11)      NOT NULL DEFAULT 0,
    `created_at`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_ep_user_id` (`user_id`),
    INDEX `idx_ep_runtime` (`runtime`),
    CONSTRAINT `fk_ep_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Sample emulator programs (optional — remove in production) ─
INSERT IGNORE INTO `emulator_programs`
    (`id`, `user_id`, `name`, `description`, `runtime`, `source_code`, `is_public`)
VALUES
(1, 1, 'Hello World (Python)', 'A simple Python demo.', 'python',
 'print("Hello from the emulator!")\nfor i in range(1, 6):\n    print(f"  Line {i}")', 1),
(2, 1, 'Fibonacci (JavaScript)', 'Prints first 10 Fibonacci numbers.', 'javascript',
 'let a=0, b=1;\nfor(let i=0;i<10;i++){\n    print(a);\n    [a,b]=[b,a+b];\n}', 1);
