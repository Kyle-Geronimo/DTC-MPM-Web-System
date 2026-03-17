-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 17, 2026 at 11:46 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `project_management_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_log`
--

CREATE TABLE `activity_log` (
  `id` int(255) DEFAULT NULL,
  `user_id` varchar(255) DEFAULT NULL,
  `action` varchar(255) DEFAULT NULL,
  `entity_type` varchar(255) DEFAULT NULL,
  `entity_id` int(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activity_log`
--

INSERT INTO `activity_log` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `description`, `created_at`) VALUES
(NULL, '6', 'register', 'user', NULL, 'New user registered successfully', NULL),
(NULL, '7', 'register', 'user', NULL, 'New user registered successfully', NULL),
(NULL, '8', 'register', 'user', NULL, 'New user registered successfully', NULL),
(NULL, '8', 'login', 'user', NULL, 'User logged in successfully', NULL),
(NULL, '8', 'logout', 'user', NULL, 'User logged out', NULL),
(NULL, '9', 'register', 'user', NULL, 'New user registered successfully', NULL),
(NULL, '10', 'register', 'user', NULL, 'New user registered successfully', NULL),
(NULL, '10', 'login', 'user', NULL, 'User logged in successfully', NULL),
(NULL, '10', 'logout', 'user', NULL, 'User logged out', NULL),
(NULL, '11', 'register', 'user', NULL, 'New user registered successfully', NULL),
(NULL, '11', 'login', 'user', NULL, 'User logged in successfully', NULL),
(NULL, '11', 'logout', 'user', NULL, 'User logged out', NULL),
(NULL, '12', 'register', 'user', NULL, 'New user registered successfully', NULL),
(NULL, '12', 'password_reset', 'user', NULL, 'Password reset approved by admin', NULL),
(NULL, '12', 'login', 'user', NULL, 'User logged in successfully', NULL),
(NULL, 'USER-DEFAULT', 'create', 'project', 0, 'Created new project: web', '2026-03-11 07:05:30'),
(NULL, 'USER-DEFAULT', 'create', 'project', 0, 'Created new project: dwada', '2026-03-11 07:06:48'),
(NULL, '12', 'create', 'project', 0, 'Created new project: jao', '2026-03-11 07:36:26'),
(NULL, '12', 'create', 'task', 0, 'Created new task: stay', '2026-03-11 07:38:41'),
(NULL, '12', 'create', 'meeting', 0, 'Scheduled meeting: holiday on 2026-03-12 17:00', '2026-03-11 07:39:53'),
(NULL, '12', 'delete', 'project', 0, 'Deleted project: dwada', '2026-03-11 07:55:33'),
(NULL, '12', 'delete', 'project', 0, 'Deleted project: web', '2026-03-11 07:55:42'),
(NULL, '12', 'create', 'project', 0, 'Created new project: kim', '2026-03-11 07:59:21'),
(NULL, '12', 'delete', 'project', 0, 'Deleted project: kim', '2026-03-11 07:59:44'),
(NULL, '12', 'delete', 'project', 0, 'Deleted project: jao', '2026-03-11 08:06:12'),
(NULL, 'USER-DEFAULT', 'create', 'project', 0, 'Created new project: kyle', '2026-03-11 08:57:23'),
(NULL, 'USER-DEFAULT', 'delete', 'project', 0, 'Deleted project: kyle', '2026-03-11 08:57:36'),
(NULL, 'USER-DEFAULT', 'create', 'project', 0, 'Created new project: tristan', '2026-03-11 09:03:22'),
(NULL, 'USER-DEFAULT', 'delete', 'project', 0, 'Deleted project: tristan', '2026-03-11 09:03:31'),
(NULL, 'USER-DEFAULT', 'create', 'project', 0, 'Created new project: kyle', '2026-03-11 09:43:33'),
(NULL, '12', 'delete', 'project', 0, 'Deleted project: kyle', '2026-03-11 09:44:58'),
(NULL, 'USER-DEFAULT', 'create', 'team', 802835, 'Created new team: kyle', '2026-03-12 00:23:21'),
(NULL, 'USER-DEFAULT', 'create', 'team', 615069, 'Created new team: kyle', '2026-03-12 00:33:46'),
(NULL, '12', 'login', 'user', NULL, 'User logged in successfully', NULL),
(NULL, 'USER-DEFAULT', 'create', 'project', 0, 'Created new project: kyle', '2026-03-15 23:31:49'),
(NULL, 'USER-DEFAULT', 'delete', 'project', 0, 'Deleted project: kyle', '2026-03-15 23:31:58'),
(NULL, '0', 'logout', 'user', NULL, 'User logged out', NULL),
(NULL, 'USER-DEFAULT', 'create', 'project', 0, 'Created new project: DTC', '2026-03-16 03:38:47'),
(NULL, 'USER-DEFAULT', 'delete', 'project', 0, 'Deleted project: DTC', '2026-03-16 03:39:54'),
(NULL, 'USER-DEFAULT', 'create', 'project', 0, 'Created new project: DTC', '2026-03-16 03:40:30'),
(NULL, 'USER-DEFAULT', 'delete', 'project', 0, 'Deleted project: DTC', '2026-03-16 03:40:47'),
(NULL, 'USER-DEFAULT', 'create', 'project', 0, 'Created new project: DTC', '2026-03-16 03:41:18'),
(NULL, '12', 'login', 'user', NULL, 'User logged in successfully', NULL),
(NULL, '12', 'logout', 'user', NULL, 'User logged out', NULL),
(NULL, '12', 'login', 'user', NULL, 'User logged in successfully', NULL),
(NULL, '12', 'login', 'user', NULL, 'User logged in successfully', NULL),
(NULL, '12', 'login', 'user', NULL, 'User logged in successfully', NULL),
(NULL, '12', 'login', 'user', NULL, 'User logged in successfully', NULL),
(NULL, '12', 'login', 'user', NULL, 'User logged in successfully', NULL),
(NULL, '12', 'login', 'user', NULL, 'User logged in successfully', NULL),
(NULL, '12', 'login', 'user', NULL, 'User logged in successfully', NULL),
(NULL, '12', 'login', 'user', NULL, 'User logged in successfully', NULL),
(NULL, '12', 'login', 'user', 12, 'Login user #12', NULL),
(NULL, '12', 'login', 'user', 12, 'Login user #12', NULL),
(NULL, '12', 'login', 'user', 12, 'Login user #12', NULL),
(NULL, '12', 'logout', 'user', 12, 'Logout user #12', NULL),
(NULL, '12', 'login', 'user', 12, 'Login user #12', NULL),
(NULL, '12', 'logout', 'user', 12, 'Logout user #12', NULL),
(NULL, NULL, 'register', 'user', 13, 'Register user #13', NULL),
(NULL, '13', 'login', 'user', 13, 'Login user #13', NULL),
(NULL, '13', 'login', 'user', 13, 'Login user #13', NULL),
(NULL, '13', 'logout', 'user', 13, 'Logout user #13', NULL),
(NULL, '13', 'login', 'user', 13, 'Login user #13', NULL),
(NULL, '13', 'login', 'user', 13, 'Login user #13', NULL),
(NULL, '12', 'deactivate', 'user', NULL, 'User deactivated by admin', NULL),
(NULL, '13', 'logout', 'user', 13, 'Logout user #13', NULL),
(NULL, '13', 'login', 'user', 13, 'Login user #13', NULL),
(NULL, '12', 'password_reset', 'user', NULL, 'Password reset approved by admin', NULL),
(NULL, '13', 'login', 'user', 13, 'Login user #13', NULL),
(NULL, '13', 'logout', 'user', 13, 'Logout user #13', NULL),
(NULL, NULL, 'login_failed', 'user', 12, 'Login_failed user #12', NULL),
(NULL, '12', 'login', 'user', 12, 'Login user #12', NULL),
(NULL, '12', 'logout', 'user', 12, 'Logout user #12', NULL),
(NULL, '13', 'login', 'user', 13, 'Login user #13', NULL),
(NULL, NULL, 'login_failed', 'user', 13, 'Login_failed user #13', NULL),
(NULL, '13', 'login', 'user', 13, 'Login user #13', NULL),
(NULL, '13', 'logout', 'user', 13, 'Logout user #13', NULL),
(NULL, NULL, 'register', 'user', 14, 'Register user #14', NULL),
(NULL, '14', 'login', 'user', 14, 'Login user #14', NULL),
(NULL, '14', 'logout', 'user', 14, 'Logout user #14', NULL),
(NULL, '13', 'login', 'user', 13, 'Login user #13', NULL),
(NULL, '14', 'deactivate', 'user', NULL, 'User deactivated by admin', NULL),
(NULL, '14', 'deactivate', 'user', NULL, 'User deactivated by admin', NULL),
(NULL, '14', 'deactivate', 'user', NULL, 'User deactivated by admin', NULL),
(NULL, '13', 'logout', 'user', 13, 'Logout user #13', NULL),
(NULL, NULL, 'login_failed', 'user', 14, 'Login_failed user #14', NULL),
(NULL, NULL, 'login_failed', 'user', 12, 'Login_failed user #12', NULL),
(NULL, '12', 'login', 'user', 12, 'Login user #12', NULL),
(NULL, '12', 'logout', 'user', 12, 'Logout user #12', NULL),
(NULL, '13', 'login', 'user', 13, 'Login user #13', NULL),
(NULL, '14', 'deactivate', 'user', NULL, 'User deactivated by admin', NULL),
(NULL, '13', 'login', 'user', 13, 'Login user #13', NULL),
(NULL, '13', 'update', 'project', 0, 'Update project #PROJ-20260316034118-325713: DTC', NULL),
(NULL, '13', 'update', 'project', 0, 'Update project #PROJ-20260316034118-325713: DTC', NULL),
(NULL, '13', 'update', 'project', 0, 'Update project #PROJ-20260316034118-325713: DTC', NULL),
(NULL, '13', 'delete', 'project', 0, 'Delete project #PROJ-20260316034118-325713', NULL),
(NULL, '13', 'create', 'project', 0, 'Create project #PROJ-20260317045535-a70aff: DTC', NULL),
(NULL, '13', 'delete', 'project', 0, 'Delete project #PROJ-20260317045535-a70aff', NULL),
(NULL, '13', 'create', 'project', 0, 'Create project #PROJ-20260317051700-53f1ed: DTC', NULL),
(NULL, '13', 'update', 'user', 14, 'Username updated by admin', NULL),
(NULL, '13', 'update', 'user', 14, 'Username updated by admin', NULL),
(NULL, '13', 'logout', 'user', 13, 'Logout user #13', NULL),
(NULL, '13', 'login', 'user', 13, 'Login user #13', NULL),
(NULL, '13', 'update', 'user', 14, 'Username updated by admin', NULL),
(NULL, '13', 'update', 'user', 14, 'Username updated by admin', NULL),
(NULL, '13', 'update', 'user', 14, 'Username updated by admin', NULL),
(NULL, '13', 'update', 'user', 14, 'Username updated by admin', NULL),
(NULL, '13', 'update', 'user', 14, 'Username updated by admin', NULL),
(NULL, '13', 'update', 'user', 14, 'Username updated by admin', NULL),
(NULL, '13', 'update', 'user', 14, 'Username updated by admin', NULL),
(NULL, '13', 'logout', 'user', 13, 'Logout user #13', NULL),
(NULL, '13', 'login', 'user', 13, 'Login user #13', NULL),
(NULL, '13', 'login', 'user', 13, 'Login user #13', NULL),
(NULL, '13', 'create', 'project', 0, 'Create project #PROJ-20260317061241-1229aa: DTC', NULL),
(NULL, '13', 'logout', 'user', 13, 'Logout user #13', NULL),
(NULL, NULL, 'login_failed', 'user', 14, 'Login_failed user #14', NULL),
(NULL, '12', 'login', 'user', 12, 'Login user #12', NULL),
(NULL, '12', 'logout', 'user', 12, 'Logout user #12', NULL),
(NULL, '13', 'login', 'user', 13, 'Login user #13', NULL),
(NULL, '13', 'login', 'user', 13, 'Login user #13', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `users` varchar(225) DEFAULT NULL,
  `projects` varchar(225) DEFAULT NULL,
  `tasks` varchar(225) DEFAULT NULL,
  `teams` int(225) DEFAULT NULL,
  `team_members` varchar(225) DEFAULT NULL,
  `activity_log` varchar(225) DEFAULT NULL,
  `password_reset_tokens` varchar(225) DEFAULT NULL,
  `system_monitoring` varchar(225) DEFAULT NULL,
  `alerts` varchar(225) DEFAULT NULL,
  `reports` varchar(225) DEFAULT NULL,
  `settings` varchar(225) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `alerts`
--

CREATE TABLE `alerts` (
  `id` varchar(255) DEFAULT NULL,
  `alert_type` varchar(255) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `message` varchar(255) DEFAULT NULL,
  `severity` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `created_at` varchar(255) DEFAULT NULL,
  `resolved_at` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `alerts`
--

INSERT INTO `alerts` (`id`, `alert_type`, `subject`, `message`, `severity`, `status`, `created_at`, `resolved_at`) VALUES
(NULL, 'system', 'High Memory Usage', 'Memory usage is at 75%. Consider optimizing or scaling up.', 'warning', 'active', NULL, NULL),
(NULL, 'info', 'Backup Completed', 'Database backup completed successfully.', 'info', 'resolved', NULL, NULL),
(NULL, 'success', 'System Update', 'Security patches have been successfully applied.', 'success', 'resolved', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `audit_log`
--

CREATE TABLE `audit_log` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` varchar(100) DEFAULT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_values`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `audit_log`
--

INSERT INTO `audit_log` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `old_values`, `new_values`, `ip_address`, `user_agent`, `created_at`) VALUES
(1, 12, 'login', 'user', '12', NULL, '{\"email\":\"taikistay@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 00:46:29'),
(2, 12, 'login', 'user', '12', NULL, '{\"email\":\"taikistay@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 00:46:40'),
(3, 12, 'login', 'user', '12', NULL, '{\"email\":\"taikistay@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 00:47:02'),
(4, 12, 'logout', 'user', '12', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 00:51:53'),
(5, 12, 'login', 'user', '12', NULL, '{\"email\":\"taikistay@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 00:52:58'),
(6, 12, 'logout', 'user', '12', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 00:53:54'),
(7, NULL, 'register', 'user', '13', NULL, '{\"email\":\"dtcoffice@gmail.com\",\"full_name\":\"DTC Office\",\"department\":\"DTC Office\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 01:17:55'),
(8, 13, 'login', 'user', '13', NULL, '{\"email\":\"dtcoffice@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 01:18:32'),
(9, 13, 'login', 'user', '13', NULL, '{\"email\":\"dtcoffice@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 01:49:30'),
(10, 13, 'logout', 'user', '13', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 01:50:36'),
(11, 13, 'login', 'user', '13', NULL, '{\"email\":\"dtcoffice@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 01:59:47'),
(12, 13, 'login', 'user', '13', NULL, '{\"email\":\"dtcoffice@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 02:09:11'),
(13, 13, 'logout', 'user', '13', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 02:24:29'),
(14, 13, 'login', 'user', '13', NULL, '{\"email\":\"dtcoffice@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 02:26:01'),
(15, 13, 'login', 'user', '13', NULL, '{\"email\":\"dtcoffice@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 02:40:47'),
(16, 13, 'logout', 'user', '13', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 02:41:05'),
(17, NULL, 'login_failed', 'user', '12', NULL, '{\"reason\":\"inactive\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 02:41:13'),
(18, 12, 'login', 'user', '12', NULL, '{\"email\":\"taikistay@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 02:41:59'),
(19, 12, 'logout', 'user', '12', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 02:42:15'),
(20, 13, 'login', 'user', '13', NULL, '{\"email\":\"dtcoffice@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 02:42:42'),
(21, NULL, 'login_failed', 'user', '13', NULL, '{\"reason\":\"bad_password\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 02:56:15'),
(22, 13, 'login', 'user', '13', NULL, '{\"email\":\"dtcoffice@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 02:56:27'),
(23, 13, 'logout', 'user', '13', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 03:31:20'),
(24, NULL, 'register', 'user', '14', NULL, '{\"email\":\"testing@gmail.com\",\"full_name\":\"test testing\",\"department\":\"testing\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 03:32:19'),
(25, 14, 'login', 'user', '14', NULL, '{\"email\":\"testing@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 03:32:35'),
(26, 14, 'logout', 'user', '14', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 03:32:51'),
(27, 13, 'login', 'user', '13', NULL, '{\"email\":\"dtcoffice@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 03:33:01'),
(28, 13, 'logout', 'user', '13', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 03:55:33'),
(29, NULL, 'login_failed', 'user', '14', NULL, '{\"reason\":\"inactive\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 03:55:46'),
(30, NULL, 'login_failed', 'user', '12', NULL, '{\"reason\":\"bad_password\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 03:56:05'),
(31, 12, 'login', 'user', '12', NULL, '{\"email\":\"taikistay@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 03:56:12'),
(32, 12, 'logout', 'user', '12', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 03:56:46'),
(33, 13, 'login', 'user', '13', NULL, '{\"email\":\"dtcoffice@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 03:56:58'),
(34, 13, 'login', 'user', '13', NULL, '{\"email\":\"dtcoffice@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 04:49:48'),
(35, 13, 'update', 'project', 'PROJ-20260316034118-325713', NULL, '{\"name\":\"DTC\",\"status\":\"completed\",\"progress\":100}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 04:54:06'),
(36, 13, 'update', 'project', 'PROJ-20260316034118-325713', NULL, '{\"name\":\"DTC\",\"status\":\"completed\",\"progress\":100}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 04:54:42'),
(37, 13, 'update', 'project', 'PROJ-20260316034118-325713', NULL, '{\"name\":\"DTC\",\"status\":\"active\",\"progress\":100}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 04:54:56'),
(38, 13, 'delete', 'project', 'PROJ-20260316034118-325713', '{\"name\":\"DTC\"}', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 04:55:01'),
(39, 13, 'create', 'project', 'PROJ-20260317045535-a70aff', NULL, '{\"name\":\"DTC\",\"status\":\"active\",\"start_date\":\"2026-03-17\",\"end_date\":\"2026-03-17\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 04:55:35'),
(40, 13, 'delete', 'project', 'PROJ-20260317045535-a70aff', '{\"name\":\"DTC\"}', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 05:13:17'),
(41, 13, 'create', 'project', 'PROJ-20260317051700-53f1ed', NULL, '{\"name\":\"DTC\",\"status\":\"active\",\"start_date\":\"2026-03-17\",\"end_date\":\"2026-03-17\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 05:17:00'),
(42, 13, 'logout', 'user', '13', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 05:36:48'),
(43, 13, 'login', 'user', '13', NULL, '{\"email\":\"dtcoffice@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 05:41:09'),
(44, 13, 'logout', 'user', '13', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 06:01:26'),
(45, 13, 'login', 'user', '13', NULL, '{\"email\":\"dtcoffice@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 06:03:56'),
(46, 13, 'login', 'user', '13', NULL, '{\"email\":\"dtcoffice@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 06:09:46'),
(47, 13, 'create', 'project', 'PROJ-20260317061241-1229aa', NULL, '{\"name\":\"DTC\",\"status\":\"active\",\"start_date\":\"2026-03-17\",\"end_date\":\"2026-03-17\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 06:12:41'),
(48, 13, 'logout', 'user', '13', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 06:55:19'),
(49, NULL, 'login_failed', 'user', '14', NULL, '{\"reason\":\"bad_password\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 06:55:28'),
(50, 12, 'login', 'user', '12', NULL, '{\"email\":\"taikistay@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 06:55:44'),
(51, 12, 'logout', 'user', '12', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 06:55:59'),
(52, 13, 'login', 'user', '13', NULL, '{\"email\":\"dtcoffice@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 06:56:16'),
(53, 13, 'login', 'user', '13', NULL, '{\"email\":\"dtcoffice@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 07:27:33');

-- --------------------------------------------------------

--
-- Table structure for table `email_queue`
--

CREATE TABLE `email_queue` (
  `id` int(11) NOT NULL,
  `to_email` varchar(255) NOT NULL,
  `to_name` varchar(100) DEFAULT NULL,
  `subject` varchar(255) NOT NULL,
  `body` text NOT NULL,
  `status` enum('pending','sent','failed') DEFAULT 'pending',
  `attempts` int(11) DEFAULT 0,
  `error_message` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `sent_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `email_queue`
--

INSERT INTO `email_queue` (`id`, `to_email`, `to_name`, `subject`, `body`, `status`, `attempts`, `error_message`, `created_at`, `sent_at`) VALUES
(1, 'dtcoffice@gmail.com', 'DTC Office', 'Welcome to Project Management Dashboard', '\r\n        <html>\r\n        <head>\r\n            <style>\r\n                body { font-family: \'Segoe UI\', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }\r\n                .email-container { max-width: 600px; margin: 0 auto; background: #fff; }\r\n                .email-header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 24px; text-align: center; border-radius: 8px 8px 0 0; }\r\n                .email-header h1 { margin: 0; font-size: 22px; }\r\n                .email-body { padding: 30px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; }\r\n                .email-footer { background: #f3f4f6; padding: 16px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; }\r\n                .btn { display: inline-block; background: #2563eb; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; margin: 16px 0; font-weight: 600; }\r\n                .info-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 16px; margin: 16px 0; }\r\n            </style>\r\n        </head>\r\n        <body>\r\n            <div class=\'email-container\'>\r\n                <div class=\'email-header\'>\r\n                    <h1>Project Management Dashboard</h1>\r\n                </div>\r\n                <div class=\'email-body\'>\r\n                    \r\n            <h2>Welcome to Project Management Dashboard!</h2>\r\n            <p>Hello DTC Office,</p>\r\n            <p>Your account has been created successfully. You can now log in and start managing your projects.</p>\r\n            <div class=\'info-box\'>\r\n                <strong>Getting Started:</strong>\r\n                <ul>\r\n                    <li>Log in with your email and password</li>\r\n                    <li>Create your first project</li>\r\n                    <li>Assign tasks to team members</li>\r\n                    <li>Track progress on the dashboard</li>\r\n                </ul>\r\n            </div>\r\n            <a href=\'http://localhost/ProjectDashboard/page/login.php\' class=\'btn\'>Log In Now</a>\r\n        \r\n                </div>\r\n                <div class=\'email-footer\'>\r\n                    <p>This is an automated email. Please do not reply.</p>\r\n                    <p>&copy; 2026 Project Management Dashboard. All rights reserved.</p>\r\n                </div>\r\n            </div>\r\n        </body>\r\n        </html>', 'pending', 1, 'PHP mail() returned false', '2026-03-17 01:17:56', NULL),
(2, 'testing@gmail.com', 'test testing', 'Welcome to Project Management Dashboard', '\r\n        <html>\r\n        <head>\r\n            <style>\r\n                body { font-family: \'Segoe UI\', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }\r\n                .email-container { max-width: 600px; margin: 0 auto; background: #fff; }\r\n                .email-header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 24px; text-align: center; border-radius: 8px 8px 0 0; }\r\n                .email-header h1 { margin: 0; font-size: 22px; }\r\n                .email-body { padding: 30px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; }\r\n                .email-footer { background: #f3f4f6; padding: 16px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; }\r\n                .btn { display: inline-block; background: #2563eb; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; margin: 16px 0; font-weight: 600; }\r\n                .info-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 16px; margin: 16px 0; }\r\n            </style>\r\n        </head>\r\n        <body>\r\n            <div class=\'email-container\'>\r\n                <div class=\'email-header\'>\r\n                    <h1>Project Management Dashboard</h1>\r\n                </div>\r\n                <div class=\'email-body\'>\r\n                    \r\n            <h2>Welcome to Project Management Dashboard!</h2>\r\n            <p>Hello test testing,</p>\r\n            <p>Your account has been created successfully. You can now log in and start managing your projects.</p>\r\n            <div class=\'info-box\'>\r\n                <strong>Getting Started:</strong>\r\n                <ul>\r\n                    <li>Log in with your email and password</li>\r\n                    <li>Create your first project</li>\r\n                    <li>Assign tasks to team members</li>\r\n                    <li>Track progress on the dashboard</li>\r\n                </ul>\r\n            </div>\r\n            <a href=\'http://localhost/ProjectDashboard/page/login.php\' class=\'btn\'>Log In Now</a>\r\n        \r\n                </div>\r\n                <div class=\'email-footer\'>\r\n                    <p>This is an automated email. Please do not reply.</p>\r\n                    <p>&copy; 2026 Project Management Dashboard. All rights reserved.</p>\r\n                </div>\r\n            </div>\r\n        </body>\r\n        </html>', 'pending', 1, 'PHP mail() returned false', '2026-03-17 03:32:19', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL DEFAULT 'info',
  `title` varchar(200) NOT NULL,
  `message` text DEFAULT NULL,
  `link` varchar(500) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `link`, `is_read`, `created_at`) VALUES
(1, 12, 'info', 'Welcome back!', 'You logged in successfully.', '', 0, '2026-03-17 00:46:29'),
(2, 12, 'info', 'Welcome back!', 'You logged in successfully.', '', 0, '2026-03-17 00:46:40'),
(3, 12, 'info', 'Welcome back!', 'You logged in successfully.', '', 0, '2026-03-17 00:47:02'),
(4, 12, 'info', 'Welcome back!', 'You logged in successfully.', '', 0, '2026-03-17 00:52:58'),
(5, 13, 'info', 'Welcome back!', 'You logged in successfully.', '', 1, '2026-03-17 01:18:32'),
(6, 13, 'info', 'Welcome back!', 'You logged in successfully.', '', 1, '2026-03-17 01:49:30'),
(7, 13, 'info', 'Welcome back!', 'You logged in successfully.', '', 1, '2026-03-17 01:59:47'),
(8, 13, 'info', 'Welcome back!', 'You logged in successfully.', '', 1, '2026-03-17 02:09:12'),
(9, 13, 'info', 'Welcome back!', 'You logged in successfully.', '', 1, '2026-03-17 02:26:01'),
(10, 13, 'info', 'Welcome back!', 'You logged in successfully.', '', 1, '2026-03-17 02:40:47'),
(11, 12, 'info', 'Welcome back!', 'You logged in successfully.', '', 0, '2026-03-17 02:41:59'),
(12, 13, 'info', 'Welcome back!', 'You logged in successfully.', '', 1, '2026-03-17 02:42:42'),
(13, 13, 'info', 'Welcome back!', 'You logged in successfully.', '', 1, '2026-03-17 02:56:27'),
(14, 13, 'info', 'New User Registered', 'test testing (testing@gmail.com) has registered.', 'admin.html', 1, '2026-03-17 03:32:22'),
(15, 14, 'info', 'Welcome back!', 'You logged in successfully.', '', 0, '2026-03-17 03:32:35'),
(16, 13, 'info', 'Welcome back!', 'You logged in successfully.', '', 1, '2026-03-17 03:33:01'),
(17, 12, 'info', 'Welcome back!', 'You logged in successfully.', '', 0, '2026-03-17 03:56:12'),
(18, 13, 'info', 'Welcome back!', 'You logged in successfully.', '', 1, '2026-03-17 03:56:58'),
(19, 13, 'info', 'Welcome back!', 'You logged in successfully.', '', 1, '2026-03-17 04:49:48'),
(20, 12, 'project', 'New Project Created', 'DTC Office created project \"DTC\"', 'projects.html', 0, '2026-03-17 04:55:36'),
(21, 13, 'project', 'New Project Created', 'DTC Office created project \"DTC\"', 'projects.html', 1, '2026-03-17 04:55:36'),
(22, 12, 'project', 'New Project Created', 'DTC Office created project \"DTC\"', 'projects.html', 0, '2026-03-17 05:17:00'),
(23, 13, 'project', 'New Project Created', 'DTC Office created project \"DTC\"', 'projects.html', 1, '2026-03-17 05:17:00'),
(24, 13, 'info', 'Welcome back!', 'You logged in successfully.', '', 1, '2026-03-17 05:41:09'),
(25, 13, 'info', 'Welcome back!', 'You logged in successfully.', '', 1, '2026-03-17 06:03:56'),
(26, 13, 'info', 'Welcome back!', 'You logged in successfully.', '', 1, '2026-03-17 06:09:46'),
(27, 12, 'project', 'New Project Created', 'DTC Office created project \"DTC\"', 'projects.html', 0, '2026-03-17 06:12:41'),
(28, 13, 'project', 'New Project Created', 'DTC Office created project \"DTC\"', 'projects.html', 1, '2026-03-17 06:12:41'),
(29, 14, 'project', 'New Project Created', 'DTC Office created project \"DTC\"', 'projects.html', 0, '2026-03-17 06:12:41'),
(30, 12, 'info', 'Welcome back!', 'You logged in successfully.', '', 0, '2026-03-17 06:55:44'),
(31, 13, 'info', 'Welcome back!', 'You logged in successfully.', '', 0, '2026-03-17 06:56:16'),
(32, 13, 'info', 'Welcome back!', 'You logged in successfully.', '', 0, '2026-03-17 07:27:33');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `token` varchar(255) NOT NULL,
  `new_password_hash` varchar(255) DEFAULT NULL,
  `approval_status` enum('pending','approved','rejected') DEFAULT 'pending',
  `admin_id` int(11) DEFAULT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `used` tinyint(1) DEFAULT 0,
  `used_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `password_reset_tokens`
--

INSERT INTO `password_reset_tokens` (`id`, `email`, `token`, `new_password_hash`, `approval_status`, `admin_id`, `expires_at`, `created_at`, `used`, `used_at`) VALUES
(5, 'taikistay@gmail.com', '7ba19fd2838ca37205ba30dedf25736669cb6e0355de96c37c486c329ad7eaf3', 'e77bfb1aadc8803e010a585d6581158f6ac9f4590b190d6b96f76a441a1aaa9d', 'approved', NULL, '2026-03-17 03:25:03', '2026-03-17 02:25:03', 1, '2026-03-17 10:26:16');

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `id` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `start_date` int(255) DEFAULT NULL,
  `end_date` int(255) DEFAULT NULL,
  `progress` int(255) DEFAULT NULL,
  `budget` decimal(15,2) DEFAULT NULL,
  `spent` decimal(15,2) DEFAULT 0.00,
  `team_id` varchar(255) DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `created_at` varchar(255) DEFAULT NULL,
  `updated_at` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`id`, `name`, `description`, `status`, `start_date`, `end_date`, `progress`, `budget`, `spent`, `team_id`, `created_by`, `created_at`, `updated_at`) VALUES
(NULL, 'Website Redesign', 'Complete redesign of company website', 'active', 2026, 2026, 77, NULL, 0.00, NULL, '1', NULL, NULL),
(NULL, 'Mobile App Development', 'iOS and Android mobile application', 'active', 2026, 2026, 60, NULL, 0.00, NULL, '1', NULL, NULL),
(NULL, 'API Integration', 'Integration of third-party APIs', 'active', 2026, 2026, 90, NULL, 0.00, NULL, '1', NULL, NULL),
(NULL, 'Database Migration', 'Migration to modern NoSQL', 'on-hold', 2026, 2026, 30, NULL, 0.00, NULL, '1', NULL, NULL),
(NULL, 'Testing & QA', 'Comprehensive testing for v2.0', 'completed', 2026, 2026, 100, NULL, 0.00, NULL, '1', NULL, NULL),
('PROJ-20260317051700-53f1ed', 'DTC', '', 'active', 1773705600, 1773705600, 50, NULL, 0.00, NULL, '13', '2026-03-17 05:17:00', NULL),
('PROJ-20260317061241-1229aa', 'DTC', '', 'active', 1773705600, 1773705600, 75, NULL, 0.00, NULL, '13', '2026-03-17 06:12:41', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `system_monitoring`
--

CREATE TABLE `system_monitoring` (
  `id` varchar(255) DEFAULT NULL,
  `metric_name` varchar(255) DEFAULT NULL,
  `metric_value` int(255) DEFAULT NULL,
  `unit` int(255) DEFAULT NULL,
  `threshold_warning` varchar(255) DEFAULT NULL,
  `threshold_critical` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `recorded_at` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `system_monitoring`
--

INSERT INTO `system_monitoring` (`id`, `metric_name`, `metric_value`, `unit`, `threshold_warning`, `threshold_critical`, `status`, `recorded_at`) VALUES
(NULL, 'CPU Usage', 66, 0, '80', '95', 'normal', NULL),
(NULL, 'RAM Usage', 75, 0, '80', '90', 'warning', NULL),
(NULL, 'Disk Space', 45, 0, '85', '95', 'normal', NULL),
(NULL, 'Network I/O', 35, 0, '80', '95', 'normal', NULL),
(NULL, 'Database Response', 12, 0, '100', '200', 'normal', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `id` int(11) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `setting_type` enum('string','number','boolean','json') DEFAULT 'string',
  `description` text DEFAULT NULL,
  `is_public` tinyint(1) DEFAULT 0,
  `updated_by` int(11) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`id`, `setting_key`, `setting_value`, `setting_type`, `description`, `is_public`, `updated_by`, `updated_at`) VALUES
(1, 'app_name', 'ProjectDashboard', 'string', 'Application name', 1, NULL, '2026-03-11 05:11:12'),
(2, 'app_version', '1.0.0', 'string', 'Application version', 1, NULL, '2026-03-11 05:11:12'),
(3, 'max_upload_size', '5', 'number', 'Maximum file upload size in MB', 0, NULL, '2026-03-11 05:11:12'),
(4, 'session_timeout', '30', 'number', 'Session timeout in minutes', 0, NULL, '2026-03-11 05:11:12'),
(5, 'items_per_page', '20', 'number', 'Default pagination items per page', 0, NULL, '2026-03-11 05:11:12'),
(6, 'maintenance_mode', 'false', 'boolean', 'Enable maintenance mode', 0, NULL, '2026-03-11 05:11:12'),
(7, 'allow_registration', 'true', 'boolean', 'Allow new user registrations', 0, NULL, '2026-03-11 05:11:12'),
(8, 'password_min_length', '6', 'number', 'Minimum password length', 0, NULL, '2026-03-11 05:11:12'),
(9, 'email_notifications', 'true', 'boolean', 'Enable email notifications', 0, NULL, '2026-03-11 05:11:12'),
(10, 'task_deadline_reminder', '24', 'number', 'Task deadline reminder in hours', 0, NULL, '2026-03-11 05:11:12');

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `project_id` int(255) DEFAULT NULL,
  `assigned_to` varchar(255) DEFAULT NULL,
  `priority` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `progress` int(11) DEFAULT 0,
  `estimated_hours` decimal(5,2) DEFAULT NULL,
  `actual_hours` decimal(5,2) DEFAULT NULL,
  `completed_date` datetime DEFAULT NULL,
  `due_date` int(255) DEFAULT NULL,
  `created_at` varchar(255) DEFAULT NULL,
  `updated_at` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`id`, `title`, `description`, `project_id`, `assigned_to`, `priority`, `status`, `progress`, `estimated_hours`, `actual_hours`, `completed_date`, `due_date`, `created_at`, `updated_at`) VALUES
(NULL, 'Update Database Schema', 'Modify schema to support new features', 1, '1', 'high', 'in-progress', 0, NULL, NULL, NULL, 2026, NULL, NULL),
(NULL, 'Code Review - PR #123', 'Review API endpoints', 2, '2', 'medium', 'completed', 0, NULL, NULL, NULL, 2026, NULL, NULL),
(NULL, 'Write Unit Tests', 'Tests for authentication module', 1, '3', 'medium', 'in-progress', 0, NULL, NULL, NULL, 2026, NULL, NULL),
(NULL, 'Design System UI', 'Create reusable UI components', 3, '4', 'high', 'in-progress', 0, NULL, NULL, NULL, 2026, NULL, NULL),
(NULL, 'Documentation Update', 'Update API documentation', 2, '5', 'low', 'todo', 0, NULL, NULL, NULL, 2026, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `teams`
--

CREATE TABLE `teams` (
  `id` int(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` varchar(255) DEFAULT NULL,
  `updated_at` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `teams`
--

INSERT INTO `teams` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES
(NULL, 'Frontend Team', 'Responsible for UI/UX development', NULL, NULL),
(NULL, 'Backend Team', 'Handles server-side development', NULL, NULL),
(NULL, 'QA Team', 'Testing and quality assurance', NULL, NULL),
(NULL, 'Design Team', 'UI/UX design and branding', NULL, NULL),
(NULL, 'DevOps Team', 'Infrastructure and deployment', NULL, NULL),
(802835, 'kyle', 'gising', '2026-03-12 00:23:21', NULL),
(615069, 'kyle', '', '2026-03-12 00:33:46', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `department` varchar(50) DEFAULT NULL,
  `role` varchar(50) DEFAULT 'user',
  `status` varchar(20) DEFAULT 'active',
  `last_login` datetime DEFAULT NULL,
  `login_count` int(11) DEFAULT 0,
  `avatar_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `full_name`, `phone`, `department`, `role`, `status`, `last_login`, `login_count`, `avatar_url`, `created_at`, `updated_at`) VALUES
(12, 'taikistay', 'taikistay@gmail.com', 'e77bfb1aadc8803e010a585d6581158f6ac9f4590b190d6b96f76a441a1aaa9d', 'taiki stayq', NULL, 'Stay', 'user', 'active', '2026-03-17 14:55:44', 0, NULL, '2026-03-11 04:45:36', '2026-03-17 06:55:44'),
(13, 'dtcoffice', 'dtcoffice@gmail.com', '3dab775edd8491ecb97a059cdb8d9581d703019c8661c1a66a05f7688aa825aa', 'DTC Office', NULL, 'DTC Office', 'admin', 'active', '2026-03-17 15:27:33', 0, NULL, '2026-03-17 01:17:55', '2026-03-17 07:27:33'),
(14, 'testing', 'testing@gmail.com', 'ca9d10c005e24b04e61b0011521d2e52ffda6bc567dd15dc1793d35613d01df3', 'testing', NULL, 'testing', 'user', 'active', '2026-03-17 11:32:35', 0, NULL, '2026-03-17 03:32:19', '2026-03-17 05:54:53');

-- --------------------------------------------------------

--
-- Table structure for table `user_sessions`
--

CREATE TABLE `user_sessions` (
  `id` varchar(128) NOT NULL,
  `user_id` int(11) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `last_activity` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_sessions`
--

INSERT INTO `user_sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `last_activity`, `created_at`) VALUES
('0so3tardvkhdfvtjsa9e7luof0', 12, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 00:46:40', '2026-03-17 00:46:40'),
('4ef28kfjher6aggs7gh2e9m31a', 13, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 02:26:01', '2026-03-17 02:26:01'),
('653p41g6f23k3oaubd8d7culrp', 13, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 03:56:58', '2026-03-17 03:56:58'),
('7pipodp4a93jpvf76ns6m419g8', 13, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 06:56:16', '2026-03-17 06:56:16'),
('7roq0319thsqqonne7d2b76vho', 13, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 01:18:31', '2026-03-17 01:18:31'),
('ddri338kqgaa5vdtg5emmu4hm1', 13, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 02:42:42', '2026-03-17 02:42:42'),
('e4crj65crcqsibph9v4kduf09q', 13, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 06:03:56', '2026-03-17 06:03:56'),
('i56fc5h1s90jvv43o529vir2ph', 12, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 00:46:29', '2026-03-17 00:46:29'),
('u4qg3f9toucf5qabe548j1tjpi', 13, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 07:27:33', '2026-03-17 07:27:33'),
('vcphoqjr50ce6ce77qkvpuosru', 13, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 01:59:47', '2026-03-17 01:59:47');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_log`
--
ALTER TABLE `activity_log`
  ADD KEY `idx_activity_user` (`user_id`);

--
-- Indexes for table `audit_log`
--
ALTER TABLE `audit_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_entity` (`entity_type`,`entity_id`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indexes for table `email_queue`
--
ALTER TABLE `email_queue`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_read` (`user_id`,`is_read`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_token` (`token`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_expires` (`expires_at`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD KEY `idx_projects_status` (`status`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`),
  ADD KEY `idx_key` (`setting_key`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD KEY `idx_tasks_project` (`project_id`),
  ADD KEY `idx_tasks_assigned` (`assigned_to`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_role` (`role`);

--
-- Indexes for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_activity` (`last_activity`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `audit_log`
--
ALTER TABLE `audit_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;

--
-- AUTO_INCREMENT for table `email_queue`
--
ALTER TABLE `email_queue`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `system_settings`
--
ALTER TABLE `system_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
