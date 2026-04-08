-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 08, 2026 at 11:57 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

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
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(255) DEFAULT NULL,
  `entity_type` varchar(255) DEFAULT NULL,
  `entity_id` int(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activity_log`
--

INSERT INTO `activity_log` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `description`, `created_at`) VALUES
(1, NULL, 'register', 'user', NULL, 'New user registered successfully', '2026-03-18 07:07:51'),
(2, NULL, 'register', 'user', NULL, 'New user registered successfully', '2026-03-18 07:07:51'),
(3, NULL, 'register', 'user', NULL, 'New user registered successfully', '2026-03-18 07:07:51'),
(4, NULL, 'login', 'user', NULL, 'User logged in successfully', '2026-03-18 07:07:51'),
(5, NULL, 'logout', 'user', NULL, 'User logged out', '2026-03-18 07:07:51'),
(6, NULL, 'register', 'user', NULL, 'New user registered successfully', '2026-03-18 07:07:51'),
(7, NULL, 'register', 'user', NULL, 'New user registered successfully', '2026-03-18 07:07:51'),
(8, NULL, 'login', 'user', NULL, 'User logged in successfully', '2026-03-18 07:07:51'),
(9, NULL, 'logout', 'user', NULL, 'User logged out', '2026-03-18 07:07:51'),
(10, NULL, 'register', 'user', NULL, 'New user registered successfully', '2026-03-18 07:07:51'),
(11, NULL, 'login', 'user', NULL, 'User logged in successfully', '2026-03-18 07:07:51'),
(12, NULL, 'logout', 'user', NULL, 'User logged out', '2026-03-18 07:07:51'),
(13, 12, 'register', 'user', NULL, 'New user registered successfully', '2026-03-18 07:07:51'),
(14, 12, 'password_reset', 'user', NULL, 'Password reset approved by admin', '2026-03-18 07:07:51'),
(15, 12, 'login', 'user', NULL, 'User logged in successfully', '2026-03-18 07:07:51'),
(16, NULL, 'create', 'project', 0, 'Created new project: web', '2026-03-10 23:05:30'),
(17, NULL, 'create', 'project', 0, 'Created new project: dwada', '2026-03-10 23:06:48'),
(18, 12, 'create', 'project', 0, 'Created new project: jao', '2026-03-10 23:36:26'),
(19, 12, 'create', 'task', 0, 'Created new task: stay', '2026-03-10 23:38:41'),
(20, 12, 'create', 'meeting', 0, 'Scheduled meeting: holiday on 2026-03-12 17:00', '2026-03-10 23:39:53'),
(21, 12, 'delete', 'project', 0, 'Deleted project: dwada', '2026-03-10 23:55:33'),
(22, 12, 'delete', 'project', 0, 'Deleted project: web', '2026-03-10 23:55:42'),
(23, 12, 'create', 'project', 0, 'Created new project: kim', '2026-03-10 23:59:21'),
(24, 12, 'delete', 'project', 0, 'Deleted project: kim', '2026-03-10 23:59:44'),
(25, 12, 'delete', 'project', 0, 'Deleted project: jao', '2026-03-11 00:06:12'),
(26, NULL, 'create', 'project', 0, 'Created new project: kyle', '2026-03-11 00:57:23'),
(27, NULL, 'delete', 'project', 0, 'Deleted project: kyle', '2026-03-11 00:57:36'),
(28, NULL, 'create', 'project', 0, 'Created new project: tristan', '2026-03-11 01:03:22'),
(29, NULL, 'delete', 'project', 0, 'Deleted project: tristan', '2026-03-11 01:03:31'),
(30, NULL, 'create', 'project', 0, 'Created new project: kyle', '2026-03-11 01:43:33'),
(31, 12, 'delete', 'project', 0, 'Deleted project: kyle', '2026-03-11 01:44:58'),
(32, NULL, 'create', 'team', 802835, 'Created new team: kyle', '2026-03-11 16:23:21'),
(33, NULL, 'create', 'team', 615069, 'Created new team: kyle', '2026-03-11 16:33:46'),
(34, 12, 'login', 'user', NULL, 'User logged in successfully', '2026-03-18 07:07:51'),
(35, NULL, 'create', 'project', 0, 'Created new project: kyle', '2026-03-15 15:31:49'),
(36, NULL, 'delete', 'project', 0, 'Deleted project: kyle', '2026-03-15 15:31:58'),
(37, NULL, 'logout', 'user', NULL, 'User logged out', '2026-03-18 07:07:51'),
(38, NULL, 'create', 'project', 0, 'Created new project: DTC', '2026-03-15 19:38:47'),
(39, NULL, 'delete', 'project', 0, 'Deleted project: DTC', '2026-03-15 19:39:54'),
(40, NULL, 'create', 'project', 0, 'Created new project: DTC', '2026-03-15 19:40:30'),
(41, NULL, 'delete', 'project', 0, 'Deleted project: DTC', '2026-03-15 19:40:47'),
(42, NULL, 'create', 'project', 0, 'Created new project: DTC', '2026-03-15 19:41:18'),
(43, 12, 'login', 'user', NULL, 'User logged in successfully', '2026-03-18 07:07:51'),
(44, 12, 'logout', 'user', NULL, 'User logged out', '2026-03-18 07:07:51'),
(45, 12, 'login', 'user', NULL, 'User logged in successfully', '2026-03-18 07:07:51'),
(46, 12, 'login', 'user', NULL, 'User logged in successfully', '2026-03-18 07:07:51'),
(47, 12, 'login', 'user', NULL, 'User logged in successfully', '2026-03-18 07:07:51'),
(48, 12, 'login', 'user', NULL, 'User logged in successfully', '2026-03-18 07:07:51'),
(49, 12, 'login', 'user', NULL, 'User logged in successfully', '2026-03-18 07:07:51'),
(50, 12, 'login', 'user', NULL, 'User logged in successfully', '2026-03-18 07:07:51'),
(51, 12, 'login', 'user', NULL, 'User logged in successfully', '2026-03-18 07:07:51'),
(52, 12, 'login', 'user', NULL, 'User logged in successfully', '2026-03-18 07:07:51'),
(53, 12, 'login', 'user', 12, 'Login user #12', '2026-03-18 07:07:51'),
(54, 12, 'login', 'user', 12, 'Login user #12', '2026-03-18 07:07:51'),
(55, 12, 'login', 'user', 12, 'Login user #12', '2026-03-18 07:07:51'),
(56, 12, 'logout', 'user', 12, 'Logout user #12', '2026-03-18 07:07:51'),
(57, 12, 'login', 'user', 12, 'Login user #12', '2026-03-18 07:07:51'),
(58, 12, 'logout', 'user', 12, 'Logout user #12', '2026-03-18 07:07:51'),
(59, NULL, 'register', 'user', 13, 'Register user #13', '2026-03-18 07:07:51'),
(60, 13, 'login', 'user', 13, 'Login user #13', '2026-03-18 07:07:51'),
(61, 13, 'login', 'user', 13, 'Login user #13', '2026-03-18 07:07:51'),
(62, 13, 'logout', 'user', 13, 'Logout user #13', '2026-03-18 07:07:51'),
(63, 13, 'login', 'user', 13, 'Login user #13', '2026-03-18 07:07:51'),
(64, 13, 'login', 'user', 13, 'Login user #13', '2026-03-18 07:07:51'),
(65, 12, 'deactivate', 'user', NULL, 'User deactivated by admin', '2026-03-18 07:07:51'),
(66, 13, 'logout', 'user', 13, 'Logout user #13', '2026-03-18 07:07:51'),
(67, 13, 'login', 'user', 13, 'Login user #13', '2026-03-18 07:07:51'),
(68, 12, 'password_reset', 'user', NULL, 'Password reset approved by admin', '2026-03-18 07:07:51'),
(69, 13, 'login', 'user', 13, 'Login user #13', '2026-03-18 07:07:51'),
(70, 13, 'logout', 'user', 13, 'Logout user #13', '2026-03-18 07:07:51'),
(71, NULL, 'login_failed', 'user', 12, 'Login_failed user #12', '2026-03-18 07:07:51'),
(72, 12, 'login', 'user', 12, 'Login user #12', '2026-03-18 07:07:51'),
(73, 12, 'logout', 'user', 12, 'Logout user #12', '2026-03-18 07:07:51'),
(74, 13, 'login', 'user', 13, 'Login user #13', '2026-03-18 07:07:51'),
(75, NULL, 'login_failed', 'user', 13, 'Login_failed user #13', '2026-03-18 07:07:51'),
(76, 13, 'login', 'user', 13, 'Login user #13', '2026-03-18 07:07:51'),
(77, 13, 'logout', 'user', 13, 'Logout user #13', '2026-03-18 07:07:51'),
(78, NULL, 'register', 'user', 14, 'Register user #14', '2026-03-18 07:07:51'),
(79, 14, 'login', 'user', 14, 'Login user #14', '2026-03-18 07:07:51'),
(80, 14, 'logout', 'user', 14, 'Logout user #14', '2026-03-18 07:07:51'),
(81, 13, 'login', 'user', 13, 'Login user #13', '2026-03-18 07:07:51'),
(82, 14, 'deactivate', 'user', NULL, 'User deactivated by admin', '2026-03-18 07:07:51'),
(83, 14, 'deactivate', 'user', NULL, 'User deactivated by admin', '2026-03-18 07:07:51'),
(84, 14, 'deactivate', 'user', NULL, 'User deactivated by admin', '2026-03-18 07:07:51'),
(85, 13, 'logout', 'user', 13, 'Logout user #13', '2026-03-18 07:07:51'),
(86, NULL, 'login_failed', 'user', 14, 'Login_failed user #14', '2026-03-18 07:07:51'),
(87, NULL, 'login_failed', 'user', 12, 'Login_failed user #12', '2026-03-18 07:07:51'),
(88, 12, 'login', 'user', 12, 'Login user #12', '2026-03-18 07:07:51'),
(89, 12, 'logout', 'user', 12, 'Logout user #12', '2026-03-18 07:07:51'),
(90, 13, 'login', 'user', 13, 'Login user #13', '2026-03-18 07:07:51'),
(91, 14, 'deactivate', 'user', NULL, 'User deactivated by admin', '2026-03-18 07:07:51'),
(92, 13, 'login', 'user', 13, 'Login user #13', '2026-03-18 07:07:51'),
(93, 13, 'update', 'project', 0, 'Update project #PROJ-20260316034118-325713: DTC', '2026-03-18 07:07:51'),
(94, 13, 'update', 'project', 0, 'Update project #PROJ-20260316034118-325713: DTC', '2026-03-18 07:07:51'),
(95, 13, 'update', 'project', 0, 'Update project #PROJ-20260316034118-325713: DTC', '2026-03-18 07:07:51'),
(96, 13, 'delete', 'project', 0, 'Delete project #PROJ-20260316034118-325713', '2026-03-18 07:07:51'),
(97, 13, 'create', 'project', 0, 'Create project #PROJ-20260317045535-a70aff: DTC', '2026-03-18 07:07:51'),
(98, 13, 'delete', 'project', 0, 'Delete project #PROJ-20260317045535-a70aff', '2026-03-18 07:07:51'),
(99, 13, 'create', 'project', 0, 'Create project #PROJ-20260317051700-53f1ed: DTC', '2026-03-18 07:07:51'),
(100, 13, 'update', 'user', 14, 'Username updated by admin', '2026-03-18 07:07:51'),
(101, 13, 'update', 'user', 14, 'Username updated by admin', '2026-03-18 07:07:51'),
(102, 13, 'logout', 'user', 13, 'Logout user #13', '2026-03-18 07:07:51'),
(103, 13, 'login', 'user', 13, 'Login user #13', '2026-03-18 07:07:51'),
(104, 13, 'update', 'user', 14, 'Username updated by admin', '2026-03-18 07:07:51'),
(105, 13, 'update', 'user', 14, 'Username updated by admin', '2026-03-18 07:07:51'),
(106, 13, 'update', 'user', 14, 'Username updated by admin', '2026-03-18 07:07:51'),
(107, 13, 'update', 'user', 14, 'Username updated by admin', '2026-03-18 07:07:51'),
(108, 13, 'update', 'user', 14, 'Username updated by admin', '2026-03-18 07:07:51'),
(109, 13, 'update', 'user', 14, 'Username updated by admin', '2026-03-18 07:07:51'),
(110, 13, 'update', 'user', 14, 'Username updated by admin', '2026-03-18 07:07:51'),
(111, 13, 'logout', 'user', 13, 'Logout user #13', '2026-03-18 07:07:51'),
(112, 13, 'login', 'user', 13, 'Login user #13', '2026-03-18 07:07:51'),
(113, 13, 'login', 'user', 13, 'Login user #13', '2026-03-18 07:07:51'),
(114, 13, 'create', 'project', 0, 'Create project #PROJ-20260317061241-1229aa: DTC', '2026-03-18 07:07:51'),
(115, 13, 'logout', 'user', 13, 'Logout user #13', '2026-03-18 07:07:51'),
(116, NULL, 'login_failed', 'user', 14, 'Login_failed user #14', '2026-03-18 07:07:51'),
(117, 12, 'login', 'user', 12, 'Login user #12', '2026-03-18 07:07:51'),
(118, 12, 'logout', 'user', 12, 'Logout user #12', '2026-03-18 07:07:51'),
(119, 13, 'login', 'user', 13, 'Login user #13', '2026-03-18 07:07:51'),
(120, 13, 'login', 'user', 13, 'Login user #13', '2026-03-18 07:07:51'),
(121, 13, 'login', 'user', 13, 'Login user #13', '2026-03-18 07:07:51'),
(122, 13, 'delete', 'project', 0, 'Delete project #PROJ-20260317061241-1229aa', '2026-03-18 07:07:51'),
(123, 13, 'update', 'user', 14, 'Username updated by admin', '2026-03-18 07:07:51'),
(124, 13, 'update', 'user', 14, 'Username updated by admin', '2026-03-18 07:07:51'),
(125, 13, 'create', 'task', 0, 'Create task #TASK-20260318003447-bfba51: Hmm', '2026-03-18 07:07:51'),
(126, 13, 'delete', 'task', 0, 'Delete task #TASK-20260318003447-bfba51', '2026-03-18 07:07:51'),
(127, 13, 'update', 'user', 14, 'Username updated by admin', '2026-03-18 07:07:51'),
(128, 13, 'login', 'user', 13, 'Login user #13', '2026-03-18 07:07:51'),
(129, 14, 'deactivate', 'user', NULL, 'User deactivated by admin', '2026-03-18 07:07:51'),
(130, 14, 'deactivate', 'user', NULL, 'User deactivated by admin', '2026-03-18 07:07:51'),
(131, 14, 'deactivate', 'user', NULL, 'User deactivated by admin', '2026-03-18 07:07:51'),
(132, 14, 'deactivate', 'user', NULL, 'User deactivated by admin', '2026-03-18 07:07:51'),
(133, 14, 'deactivate', 'user', NULL, 'User deactivated by admin', '2026-03-18 07:07:51'),
(134, NULL, 'login_failed', 'user', NULL, 'Login_failed user', '2026-03-18 07:07:51'),
(135, NULL, 'login_failed', 'user', NULL, 'Login_failed user', '2026-03-18 07:07:51'),
(136, 13, 'login', 'user', 13, 'Login user #13', '2026-03-18 07:07:51'),
(137, 14, 'deactivate', 'user', NULL, 'User deactivated by admin', '2026-03-18 07:07:51'),
(138, 13, 'update', 'team', 6, 'Update team #6: gang', '2026-03-18 07:11:05'),
(139, 13, 'login', 'user', 13, 'Login user #13', '2026-03-18 07:15:36'),
(140, 13, 'update', 'team', 6, 'Update team #6: gang', '2026-03-18 07:17:06'),
(141, 13, 'update', 'team', 6, 'Update team #6: gang', '2026-03-18 07:40:41'),
(142, 13, 'update', 'team', 6, 'Update team #6: gang', '2026-03-18 07:41:21'),
(143, 13, 'login', 'user', 13, 'Login user #13', '2026-03-18 08:29:28'),
(144, 13, 'update', 'project', 0, 'Update project #null: Website Redesigndwaaaaaagf', '2026-03-18 08:30:10'),
(145, 13, 'update', 'project', 0, 'Update project #PROJ-20260317051700-53f1ed: DTC', '2026-03-18 08:30:43'),
(146, 13, 'update', 'project', 0, 'Update project #PROJ-20260317051700-53f1ed: DTC', '2026-03-18 08:31:21'),
(147, NULL, 'login_failed', 'user', NULL, 'Login_failed user', '2026-03-18 08:35:36'),
(148, 13, 'login', 'user', 13, 'Login user #13', '2026-03-18 08:35:48'),
(149, 13, 'login', 'user', 13, 'Login user #13', '2026-03-18 08:40:58'),
(150, 13, 'update', 'team', 6, 'Update team #6: Testing', '2026-03-18 23:29:23'),
(151, 13, 'update', 'project', 0, 'Update project #null: Website Redesign', '2026-03-19 00:25:32'),
(152, 13, 'update', 'project', 0, 'Update project #null: Website Redesign', '2026-03-19 00:25:46'),
(153, 13, 'update', 'project', 0, 'Update project #null: Testing & QA', '2026-03-19 00:26:27'),
(154, 13, 'login', 'user', 13, 'Login user #13', '2026-03-19 01:00:02'),
(155, 13, 'create', 'task', 0, 'Create task #TASK-20260319010805-d1b734: DTC', '2026-03-19 01:08:05'),
(156, 13, 'delete', 'task', 0, 'Delete task #TASK-20260319010805-d1b734', '2026-03-19 01:08:50'),
(157, 13, 'login', 'user', 13, 'Login user #13', '2026-03-19 01:11:54'),
(158, 13, 'login', 'user', 13, 'Login user #13', '2026-03-19 03:19:37'),
(159, NULL, 'login_failed', 'user', 13, 'Login_failed user #13', '2026-03-19 05:20:51'),
(160, 13, 'login', 'user', 13, 'Login user #13', '2026-03-19 05:21:01'),
(161, 13, 'login', 'user', 13, 'Login user #13', '2026-03-19 05:40:22'),
(162, 13, 'create', 'team', 8, 'Create team #8: Website Redesign', '2026-03-19 05:43:24'),
(163, 13, 'delete', 'team', 1, 'Delete team #1', '2026-03-19 05:48:57'),
(164, 13, 'delete', 'team', 2, 'Delete team #2', '2026-03-19 05:49:01'),
(165, 13, 'delete', 'team', 3, 'Delete team #3', '2026-03-19 05:49:04'),
(166, 13, 'delete', 'team', 4, 'Delete team #4', '2026-03-19 05:49:09'),
(167, 13, 'delete', 'team', 5, 'Delete team #5', '2026-03-19 05:49:11'),
(168, 13, 'update', 'team', 7, 'Update team #7: kyle', '2026-03-19 06:18:54'),
(169, 13, 'update', 'team', 7, 'Update team #7: kyle', '2026-03-19 06:20:16'),
(170, 13, 'update', 'team', 6, 'Update team #6: Testing', '2026-03-19 06:24:22'),
(171, 13, 'update', 'team', 7, 'Update team #7: kyle', '2026-03-19 06:24:37'),
(172, 13, 'delete', 'team', 7, 'Delete team #7', '2026-03-19 06:28:47'),
(173, 13, 'create', 'team', 9, 'Create team #9: Backend Team', '2026-03-19 07:01:43'),
(174, 13, 'create', 'team', 10, 'Create team #10: dasd', '2026-03-19 07:04:49'),
(175, 13, 'create', 'team', 11, 'Create team #11: fjrhjs', '2026-03-19 07:05:49'),
(176, 13, 'delete', 'team', 11, 'Delete team #11', '2026-03-19 07:08:45'),
(177, 13, 'delete', 'team', 10, 'Delete team #10', '2026-03-19 07:08:49'),
(178, 13, 'create', 'team', 12, 'Create team #12: kamay', '2026-03-19 07:36:06'),
(179, 13, 'logout', 'user', 13, 'Logout user #13', '2026-03-19 07:36:48'),
(180, 12, 'login', 'user', 12, 'Login user #12', '2026-03-19 07:37:13'),
(181, 12, 'logout', 'user', 12, 'Logout user #12', '2026-03-19 07:38:15'),
(182, 13, 'login', 'user', 13, 'Login user #13', '2026-03-19 07:38:28'),
(183, 13, 'login', 'user', 13, 'Login user #13', '2026-03-19 07:40:09'),
(184, NULL, 'login_failed', 'user', 13, 'Login_failed user #13', '2026-03-19 07:40:56'),
(185, 13, 'login', 'user', 13, 'Login user #13', '2026-03-19 07:41:04'),
(186, 13, 'login', 'user', 13, 'Login user #13', '2026-04-06 05:16:23'),
(187, 13, 'logout', 'user', 13, 'Logout user #13', '2026-04-06 05:25:10'),
(188, 13, 'login', 'user', 13, 'Login user #13', '2026-04-06 05:30:35'),
(189, 13, 'create', 'project', 0, 'Create project #PROJ-20260406054845-0cfa04: API Integration', '2026-04-06 05:48:45'),
(190, 13, 'update', 'project', 0, 'Update project #PROJ-20260406054845-0cfa04: API Integration', '2026-04-06 05:49:13'),
(191, 13, 'delete', 'project', 0, 'Delete project #PROJ-20260406054845-0cfa04', '2026-04-06 05:49:30'),
(192, 13, 'create', 'task', 0, 'Create task #TASK-20260406061300-893ee4: ...', '2026-04-06 06:13:00'),
(193, 13, 'delete', 'task', 0, 'Delete task #TASK-20260406061300-893ee4', '2026-04-06 06:13:16'),
(194, 13, 'login', 'user', 13, 'Login user #13', '2026-04-07 00:25:53'),
(195, 13, 'logout', 'user', 13, 'Logout user #13', '2026-04-07 01:37:40'),
(196, 14, 'login', 'user', 14, 'Login user #14', '2026-04-07 01:37:48'),
(197, 14, 'create', 'task', 0, 'Create task #TASK-20260407014007-2bbd02: aisdwi', '2026-04-07 01:40:07'),
(198, 14, 'delete', 'task', 0, 'Delete task #TASK-20260407014007-2bbd02', '2026-04-07 01:40:12'),
(199, 14, 'delete', 'task', 2, 'Delete task #2', '2026-04-07 01:46:35'),
(200, 14, 'delete', 'task', 4, 'Delete task #4', '2026-04-07 01:46:49'),
(201, 14, 'delete', 'task', 5, 'Delete task #5', '2026-04-07 01:46:56'),
(202, 14, 'delete', 'task', 3, 'Delete task #3', '2026-04-07 01:46:59'),
(203, 14, 'delete', 'task', 1, 'Delete task #1', '2026-04-07 01:47:02'),
(204, 14, 'update', 'team', 12, 'Update team #12: kamay', '2026-04-07 01:49:29'),
(205, 14, 'logout', 'user', 14, 'Logout user #14', '2026-04-07 01:59:17'),
(206, 13, 'login', 'user', 13, 'Login user #13', '2026-04-07 01:59:25'),
(207, 13, 'create', 'task', 0, 'Create task #TASK-20260407023804-7858c9: dawd', '2026-04-07 02:38:04'),
(208, 13, 'delete', 'task', 6, 'Delete task #6', '2026-04-07 02:39:23'),
(209, 13, 'create', 'task', 0, 'Create task #TASK-20260407023941-64d845: awdawd', '2026-04-07 02:39:41'),
(210, 13, 'login', 'user', 13, 'Login user #13', '2026-04-07 06:24:38'),
(211, 13, 'update', 'user', 14, 'Username and role updated by admin', '2026-04-07 07:00:13'),
(212, 13, 'login', 'user', 13, 'Login user #13', '2026-04-08 00:36:16'),
(213, NULL, 'login_failed', 'user', 13, 'Login_failed user #13', '2026-04-08 01:42:50'),
(214, NULL, 'login_failed', 'user', 13, 'Login_failed user #13', '2026-04-08 01:42:53'),
(215, 13, 'login', 'user', 13, 'Login user #13', '2026-04-08 01:43:00'),
(216, 13, 'login', 'user', 13, 'Login user #13', '2026-04-08 03:31:46'),
(217, 13, 'login', 'user', 13, 'Login user #13', '2026-04-08 05:02:53'),
(218, 13, 'create', 'team', 13, 'Create team #13: testing', '2026-04-08 05:38:30'),
(219, 13, 'delete', 'team', 13, 'Delete team #13', '2026-04-08 05:38:33'),
(220, 13, 'update', 'task', 7, 'Update task #7: awdawd', '2026-04-08 05:40:01'),
(221, 13, 'create', 'task', 8, 'Create task #8: Copilot Temp Task', '2026-04-08 06:07:08'),
(222, 13, 'create', 'task', 9, 'Create task #9: Copilot Temp Task', '2026-04-08 06:07:22'),
(223, 13, 'delete', 'task', 8, 'Delete task #8', '2026-04-08 06:09:04'),
(224, 13, 'create', 'task', 10, 'Create task #10: test', '2026-04-08 06:09:21'),
(225, 13, 'logout', 'user', 13, 'Logout user #13', '2026-04-08 06:11:38'),
(226, 13, 'login', 'user', 13, 'Login user #13', '2026-04-08 06:54:50'),
(227, 13, 'logout', 'user', 13, 'Logout user #13', '2026-04-08 07:31:03'),
(228, 13, 'login', 'user', 13, 'Login user #13', '2026-04-08 07:31:36'),
(229, 13, 'login', 'user', 13, 'Login user #13', '2026-04-08 08:25:10'),
(230, 13, 'create', 'task', 11, 'Create task #11: ainwc', '2026-04-08 08:27:58'),
(231, 13, 'create', 'task', 12, 'Create task #12: 12313', '2026-04-08 08:30:21'),
(232, 13, 'delete', 'task', 12, 'Delete task #12', '2026-04-08 08:34:55'),
(233, 13, 'create', 'task', 13, 'Create task #13: cadq', '2026-04-08 08:35:12'),
(234, 13, 'logout', 'user', 13, 'Logout user #13', '2026-04-08 08:44:33'),
(235, NULL, 'login_failed', 'user', 14, 'Login_failed user #14', '2026-04-08 08:44:55'),
(236, 14, 'login', 'user', 14, 'Login user #14', '2026-04-08 08:45:02'),
(237, 14, 'logout', 'user', 14, 'Logout user #14', '2026-04-08 08:54:13'),
(238, 13, 'login', 'user', 13, 'Login user #13', '2026-04-08 08:54:24'),
(239, 13, 'delete', 'task', 11, 'Delete task #11', '2026-04-08 08:54:56'),
(240, 13, 'logout', 'user', 13, 'Logout user #13', '2026-04-08 08:55:46'),
(241, 14, 'login', 'user', 14, 'Login user #14', '2026-04-08 08:56:05'),
(242, 14, 'create', 'project', 0, 'Create project #PROJ-20260408085656-3b63e4: awdaw', '2026-04-08 08:56:56'),
(243, 14, 'delete', 'project', 0, 'Delete project #PROJ-20260408085656-3b63e4', '2026-04-08 08:57:16'),
(244, 14, 'logout', 'user', 14, 'Logout user #14', '2026-04-08 09:26:48'),
(245, 13, 'login', 'user', 13, 'Login user #13', '2026-04-08 09:26:57');

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
-- Table structure for table `archived_users`
--

CREATE TABLE `archived_users` (
  `id` int(11) NOT NULL,
  `original_user_id` int(11) DEFAULT NULL,
  `username` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `department` varchar(50) DEFAULT NULL,
  `role` varchar(50) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`)),
  `archived_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `archived_by` int(11) DEFAULT NULL,
  `reason` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `archived_users`
--

INSERT INTO `archived_users` (`id`, `original_user_id`, `username`, `email`, `full_name`, `phone`, `department`, `role`, `status`, `data`, `archived_at`, `archived_by`, `reason`) VALUES
(1, 14, 'testing', 'testing@gmail.com', 'testing', NULL, 'testing', 'user', 'active', '{\"id\":14,\"username\":\"testing\",\"email\":\"testing@gmail.com\",\"password\":\"ca9d10c005e24b04e61b0011521d2e52ffda6bc567dd15dc1793d35613d01df3\",\"full_name\":\"testing\",\"phone\":null,\"department\":\"testing\",\"role\":\"user\",\"status\":\"active\",\"last_login\":\"2026-03-17 11:32:35\",\"login_count\":0,\"avatar_url\":null,\"created_at\":\"2026-03-17 11:32:19\",\"updated_at\":\"2026-03-18 09:28:04\"}', '2026-03-18 02:29:13', 13, NULL),
(2, 14, 'testing', 'testing@gmail.com', 'testing', NULL, 'testing', 'user', 'active', '{\"id\":14,\"username\":\"testing\",\"email\":\"testing@gmail.com\",\"password\":\"ca9d10c005e24b04e61b0011521d2e52ffda6bc567dd15dc1793d35613d01df3\",\"full_name\":\"testing\",\"phone\":null,\"department\":\"testing\",\"role\":\"user\",\"status\":\"active\",\"last_login\":\"2026-03-17 11:32:35\",\"login_count\":0,\"avatar_url\":null,\"created_at\":\"2026-03-17 11:32:19\",\"updated_at\":\"2026-03-18 10:30:06\"}', '2026-03-18 02:32:13', 13, NULL),
(3, 14, 'testing', 'testing@gmail.com', 'testing', NULL, 'testing', 'user', 'active', '{\"id\":14,\"username\":\"testing\",\"email\":\"testing@gmail.com\",\"password\":\"ca9d10c005e24b04e61b0011521d2e52ffda6bc567dd15dc1793d35613d01df3\",\"full_name\":\"testing\",\"phone\":null,\"department\":\"testing\",\"role\":\"user\",\"status\":\"active\",\"last_login\":\"2026-03-17 11:32:35\",\"login_count\":0,\"avatar_url\":null,\"created_at\":\"2026-03-17 11:32:19\",\"updated_at\":\"2026-03-18 10:32:37\"}', '2026-03-18 02:34:57', 13, NULL),
(4, 14, 'testing', 'testing@gmail.com', 'testing', NULL, 'testing', 'user', 'active', '{\"id\":14,\"username\":\"testing\",\"email\":\"testing@gmail.com\",\"password\":\"ca9d10c005e24b04e61b0011521d2e52ffda6bc567dd15dc1793d35613d01df3\",\"full_name\":\"testing\",\"phone\":null,\"department\":\"testing\",\"role\":\"user\",\"status\":\"active\",\"last_login\":\"2026-03-17 11:32:35\",\"login_count\":0,\"avatar_url\":null,\"created_at\":\"2026-03-17 11:32:19\",\"updated_at\":\"2026-03-18 10:35:45\"}', '2026-03-18 02:38:35', 13, NULL),
(5, 14, 'testing', 'testing@gmail.com', 'testing', NULL, 'testing', 'user', 'active', '{\"id\":14,\"username\":\"testing\",\"email\":\"testing@gmail.com\",\"password\":\"ca9d10c005e24b04e61b0011521d2e52ffda6bc567dd15dc1793d35613d01df3\",\"full_name\":\"testing\",\"phone\":null,\"department\":\"testing\",\"role\":\"user\",\"status\":\"active\",\"last_login\":\"2026-03-17 11:32:35\",\"login_count\":0,\"avatar_url\":null,\"created_at\":\"2026-03-17 11:32:19\",\"updated_at\":\"2026-03-18 10:39:41\"}', '2026-03-18 03:29:53', 13, NULL),
(6, 14, 'testing', 'testing@gmail.com', 'testing', NULL, 'testing', 'user', 'active', '{\"id\":14,\"username\":\"testing\",\"email\":\"testing@gmail.com\",\"password\":\"ca9d10c005e24b04e61b0011521d2e52ffda6bc567dd15dc1793d35613d01df3\",\"full_name\":\"testing\",\"phone\":null,\"department\":\"testing\",\"role\":\"user\",\"status\":\"active\",\"last_login\":\"2026-03-17 11:32:35\",\"login_count\":0,\"avatar_url\":null,\"created_at\":\"2026-03-17 11:32:19\",\"updated_at\":\"2026-03-18 11:30:27\"}', '2026-03-18 06:22:04', 13, NULL);

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
(53, 13, 'login', 'user', '13', NULL, '{\"email\":\"dtcoffice@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 07:27:33'),
(54, 13, 'login', 'user', '13', NULL, '{\"email\":\"dtcoffice@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-18 00:21:57'),
(55, 13, 'delete', 'project', 'PROJ-20260317061241-1229aa', '{\"name\":\"DTC\"}', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-18 00:26:57'),
(56, 13, 'create', 'task', 'TASK-20260318003447-bfba51', NULL, '{\"title\":\"Hmm\",\"priority\":\"medium\",\"status\":\"pending\",\"due_date\":\"2026-03-18\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-18 00:34:47'),
(57, 13, 'delete', 'task', 'TASK-20260318003447-bfba51', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-18 00:35:02'),
(58, 13, 'login', 'user', '13', NULL, '{\"email\":\"dtcoffice@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-18 01:55:45'),
(59, NULL, 'login_failed', 'user', NULL, NULL, '{\"email\":\"dtcofiice@gmail.com\",\"reason\":\"not_found\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-18 05:44:27'),
(60, NULL, 'login_failed', 'user', NULL, NULL, '{\"email\":\"dtcofice@gmail.com\",\"reason\":\"not_found\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-18 05:44:47'),
(61, 13, 'login', 'user', '13', NULL, '{\"email\":\"dtcoffice@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-18 05:44:54'),
(62, 13, 'update', 'team', '6', NULL, '{\"name\":\"gang\",\"description\":\"yum burger yn\",\"team_lead\":12}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-18 07:11:05'),
(63, 13, 'login', 'user', '13', NULL, '{\"email\":\"dtcoffice@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-18 07:15:36'),
(64, 13, 'update', 'team', '6', NULL, '{\"name\":\"gang\",\"description\":\"yum burger\",\"team_lead\":12}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-18 07:17:06'),
(65, 13, 'update', 'team', '6', NULL, '{\"name\":\"gang\",\"description\":\"yum burger\",\"team_lead\":12}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-18 07:40:41'),
(66, 13, 'update', 'team', '6', NULL, '{\"name\":\"gang\",\"description\":\"yum burger\",\"team_lead\":12}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-18 07:41:21'),
(67, 13, 'login', 'user', '13', NULL, '{\"email\":\"dtcoffice@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-18 08:29:28'),
(68, 13, 'update', 'project', 'null', NULL, '{\"name\":\"Website Redesigndwaaaaaagf\",\"status\":\"active\",\"progress\":77}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-18 08:30:10'),
(69, 13, 'update', 'project', 'PROJ-20260317051700-53f1ed', NULL, '{\"name\":\"DTC\",\"status\":\"active\",\"progress\":50}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-18 08:30:43'),
(70, 13, 'update', 'project', 'PROJ-20260317051700-53f1ed', NULL, '{\"name\":\"DTC\",\"status\":\"active\",\"progress\":50}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-18 08:31:21'),
(71, NULL, 'login_failed', 'user', NULL, NULL, '{\"email\":\"dtcofiice@gmail.com\",\"reason\":\"not_found\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-18 08:35:36'),
(72, 13, 'login', 'user', '13', NULL, '{\"email\":\"dtcoffice@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-18 08:35:48'),
(73, 13, 'login', 'user', '13', NULL, '{\"email\":\"dtcoffice@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-18 08:40:57'),
(74, 13, 'update', 'team', '6', NULL, '{\"name\":\"Testing\",\"description\":\"TEST\",\"team_lead\":13}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-03-18 23:29:23'),
(75, 13, 'update', 'project', 'null', NULL, '{\"name\":\"Website Redesign\",\"status\":\"active\",\"progress\":50}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-03-19 00:25:32'),
(76, 13, 'update', 'project', 'null', NULL, '{\"name\":\"Website Redesign\",\"status\":\"active\",\"progress\":50}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-03-19 00:25:46'),
(77, 13, 'update', 'project', 'null', NULL, '{\"name\":\"Testing & QA\",\"status\":\"active\",\"progress\":100}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-03-19 00:26:27'),
(78, 13, 'login', 'user', '13', NULL, '{\"email\":\"dtcoffice@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-03-19 01:00:02'),
(79, 13, 'create', 'task', 'TASK-20260319010805-d1b734', NULL, '{\"title\":\"DTC\",\"priority\":\"medium\",\"status\":\"in-progress\",\"due_date\":\"2026-03-19\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-03-19 01:08:05'),
(80, 13, 'delete', 'task', 'TASK-20260319010805-d1b734', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-03-19 01:08:50'),
(81, 13, 'login', 'user', '13', NULL, '{\"email\":\"dtcoffice@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-03-19 01:11:54'),
(82, 13, 'login', 'user', '13', NULL, '{\"email\":\"dtcoffice@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-03-19 03:19:37'),
(83, NULL, 'login_failed', 'user', '13', NULL, '{\"reason\":\"bad_password\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-03-19 05:20:50'),
(84, 13, 'login', 'user', '13', NULL, '{\"email\":\"dtcoffice@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-03-19 05:21:01'),
(85, 13, 'login', 'user', '13', NULL, '{\"email\":\"dtcoffice@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-03-19 05:40:22'),
(86, 13, 'create', 'team', '8', NULL, '{\"name\":\"Website Redesign\",\"description\":\"BA\",\"team_lead\":13}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-03-19 05:43:23'),
(87, 13, 'delete', 'team', '1', NULL, '[]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-03-19 05:48:56'),
(88, 13, 'delete', 'team', '2', NULL, '[]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-03-19 05:49:01'),
(89, 13, 'delete', 'team', '3', NULL, '[]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-03-19 05:49:04'),
(90, 13, 'delete', 'team', '4', NULL, '[]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-03-19 05:49:08'),
(91, 13, 'delete', 'team', '5', NULL, '[]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-03-19 05:49:11'),
(92, 13, 'update', 'team', '7', NULL, '{\"name\":\"kyle\",\"description\":\"grupo\",\"team_lead\":13}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-03-19 06:18:54'),
(93, 13, 'update', 'team', '7', NULL, '{\"name\":\"kyle\",\"description\":\"grupo\",\"team_lead\":13}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-03-19 06:20:16'),
(94, 13, 'update', 'team', '6', NULL, '{\"name\":\"Testing\",\"description\":\"TEST\",\"team_lead\":13}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-03-19 06:24:22'),
(95, 13, 'update', 'team', '7', NULL, '{\"name\":\"kyle\",\"description\":\"grupo\",\"team_lead\":13}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-03-19 06:24:37'),
(96, 13, 'delete', 'team', '7', NULL, '[]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-03-19 06:28:47'),
(97, 13, 'create', 'team', '9', NULL, '{\"name\":\"Backend Team\",\"description\":\"wakanda\",\"team_lead\":14}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-03-19 07:01:43'),
(98, 13, 'create', 'team', '10', NULL, '{\"name\":\"dasd\",\"description\":\"wdasdw\",\"team_lead\":13}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-03-19 07:04:49'),
(99, 13, 'create', 'team', '11', NULL, '{\"name\":\"fjrhjs\",\"description\":\"dcsdcsd\",\"team_lead\":13}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-03-19 07:05:49'),
(100, 13, 'delete', 'team', '11', NULL, '[]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-03-19 07:08:45'),
(101, 13, 'delete', 'team', '10', NULL, '[]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-03-19 07:08:49'),
(102, 13, 'create', 'team', '12', NULL, '{\"name\":\"kamay\",\"description\":\"ni jesus\",\"team_lead\":12}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-03-19 07:36:06'),
(103, 13, 'logout', 'user', '13', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-03-19 07:36:48'),
(104, 12, 'login', 'user', '12', NULL, '{\"email\":\"taikistay@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-03-19 07:37:13'),
(105, 12, 'logout', 'user', '12', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-03-19 07:38:15'),
(106, 13, 'login', 'user', '13', NULL, '{\"email\":\"dtcoffice@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-03-19 07:38:28'),
(107, 13, 'login', 'user', '13', NULL, '{\"email\":\"dtcoffice@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-03-19 07:40:09'),
(108, NULL, 'login_failed', 'user', '13', NULL, '{\"reason\":\"bad_password\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-03-19 07:40:56'),
(109, 13, 'login', 'user', '13', NULL, '{\"email\":\"dtcoffice@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-03-19 07:41:04'),
(110, 13, 'login', 'user', '13', NULL, '{\"email\":\"dtcoffice@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-06 05:16:23'),
(111, 13, 'logout', 'user', '13', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-06 05:25:10'),
(112, 13, 'login', 'user', '13', NULL, '{\"email\":\"dtcoffice@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-06 05:30:35'),
(113, 13, 'create', 'project', 'PROJ-20260406054845-0cfa04', NULL, '{\"name\":\"API Integration\",\"status\":\"active\",\"start_date\":\"2026-04-06\",\"end_date\":\"2026-04-30\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-06 05:48:45'),
(114, 13, 'update', 'project', 'PROJ-20260406054845-0cfa04', NULL, '{\"name\":\"API Integration\",\"status\":\"active\",\"progress\":70}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-06 05:49:13'),
(115, 13, 'delete', 'project', 'PROJ-20260406054845-0cfa04', '{\"name\":\"API Integration\"}', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-06 05:49:30'),
(116, 13, 'create', 'task', 'TASK-20260406061300-893ee4', NULL, '{\"title\":\"...\",\"priority\":\"low\",\"status\":\"pending\",\"due_date\":\"2026-04-06\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-06 06:13:00'),
(117, 13, 'delete', 'task', 'TASK-20260406061300-893ee4', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-06 06:13:16'),
(118, 13, 'login', 'user', '13', NULL, '{\"email\":\"dtcoffice@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-07 00:25:53'),
(119, 13, 'logout', 'user', '13', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-07 01:37:40'),
(120, 14, 'login', 'user', '14', NULL, '{\"email\":\"testing@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-07 01:37:48'),
(121, 14, 'create', 'task', 'TASK-20260407014007-2bbd02', NULL, '{\"title\":\"aisdwi\",\"priority\":\"medium\",\"status\":\"pending\",\"due_date\":\"2026-04-07\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-07 01:40:07'),
(122, 14, 'delete', 'task', 'TASK-20260407014007-2bbd02', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-07 01:40:12'),
(123, 14, 'delete', 'task', '2', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-07 01:46:35'),
(124, 14, 'delete', 'task', '4', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-07 01:46:49'),
(125, 14, 'delete', 'task', '5', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-07 01:46:56'),
(126, 14, 'delete', 'task', '3', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-07 01:46:59'),
(127, 14, 'delete', 'task', '1', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-07 01:47:02'),
(128, 14, 'update', 'team', '12', NULL, '{\"name\":\"kamay\",\"description\":\"ni jesus\",\"team_lead\":12}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-07 01:49:29'),
(129, 14, 'logout', 'user', '14', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-07 01:59:17'),
(130, 13, 'login', 'user', '13', NULL, '{\"email\":\"dtcoffice@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-07 01:59:25'),
(131, 13, 'create', 'task', 'TASK-20260407023804-7858c9', NULL, '{\"title\":\"dawd\",\"priority\":\"medium\",\"status\":\"pending\",\"due_date\":\"2026-04-07\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-07 02:38:04'),
(132, 13, 'delete', 'task', '6', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-07 02:39:23'),
(133, 13, 'create', 'task', 'TASK-20260407023941-64d845', NULL, '{\"title\":\"awdawd\",\"priority\":\"medium\",\"status\":\"pending\",\"due_date\":\"2026-04-07\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-07 02:39:41'),
(134, 13, 'login', 'user', '13', NULL, '{\"email\":\"dtcoffice@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-07 06:24:38'),
(135, 13, 'login', 'user', '13', NULL, '{\"email\":\"dtcoffice@gmail.com\"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-08 00:36:16'),
(136, NULL, 'login_failed', 'user', '13', NULL, '{\"reason\":\"bad_password\"}', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-08 01:42:50'),
(137, NULL, 'login_failed', 'user', '13', NULL, '{\"reason\":\"bad_password\"}', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-08 01:42:53'),
(138, 13, 'login', 'user', '13', NULL, '{\"email\":\"dtcoffice@gmail.com\"}', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-08 01:43:00'),
(139, 13, 'login', 'user', '13', NULL, '{\"email\":\"dtcoffice@gmail.com\"}', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-08 03:31:46'),
(140, 13, 'login', 'user', '13', NULL, '{\"email\":\"dtcoffice@gmail.com\"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-08 05:02:53'),
(141, 13, 'create', 'project', 'PROJ-20260408053711-1fdddf', NULL, '{\"name\":\"2345\",\"status\":\"on-hold\",\"start_date\":\"2026-04-08\",\"end_date\":\"2026-04-09\"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-08 05:37:11'),
(142, 13, 'create', 'team', '13', NULL, '{\"name\":\"testing\",\"description\":\"test\",\"team_lead\":13}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-08 05:38:30'),
(143, 13, 'delete', 'team', '13', NULL, '[]', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-08 05:38:33'),
(144, 13, 'update', 'task', '7', NULL, '{\"title\":\"awdawd\",\"priority\":\"high\",\"status\":\"pending\"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-08 05:40:01'),
(145, 13, 'create', 'task', '8', NULL, '{\"title\":\"Copilot Temp Task\",\"priority\":\"medium\",\"status\":\"pending\",\"due_date\":\"2026-04-20\"}', '0.0.0.0', '', '2026-04-08 06:07:08'),
(146, 13, 'create', 'task', '9', NULL, '{\"title\":\"Copilot Temp Task\",\"priority\":\"medium\",\"status\":\"pending\",\"due_date\":\"2026-04-20\"}', '0.0.0.0', '', '2026-04-08 06:07:22'),
(147, 13, 'delete', 'task', '8', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-08 06:09:04'),
(148, 13, 'create', 'task', '10', NULL, '{\"title\":\"test\",\"priority\":\"critical\",\"status\":\"in-progress\",\"due_date\":\"2026-04-09\"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-08 06:09:21'),
(149, 13, 'logout', 'user', '13', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-08 06:11:38'),
(150, 13, 'login', 'user', '13', NULL, '{\"email\":\"dtcoffice@gmail.com\"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-08 06:54:50'),
(151, 13, 'logout', 'user', '13', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-08 07:31:03'),
(152, 13, 'login', 'user', '13', NULL, '{\"email\":\"dtcoffice@gmail.com\"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-08 07:31:36'),
(153, 13, 'login', 'user', '13', NULL, '{\"email\":\"dtcoffice@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-08 08:25:10'),
(154, 13, 'create', 'task', '11', NULL, '{\"title\":\"ainwc\",\"priority\":\"low\",\"status\":\"pending\",\"due_date\":\"2026-04-08\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-08 08:27:58'),
(155, 13, 'create', 'task', '12', NULL, '{\"title\":\"12313\",\"priority\":\"medium\",\"status\":\"in-progress\",\"due_date\":\"2026-04-08\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-08 08:30:21'),
(156, 13, 'delete', 'task', '12', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-08 08:34:55'),
(157, 13, 'create', 'task', '13', NULL, '{\"title\":\"cadq\",\"priority\":\"medium\",\"status\":\"in-progress\",\"due_date\":\"2026-04-08\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-08 08:35:12'),
(158, 13, 'logout', 'user', '13', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-08 08:44:32'),
(159, NULL, 'login_failed', 'user', '14', NULL, '{\"reason\":\"bad_password\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-08 08:44:54'),
(160, 14, 'login', 'user', '14', NULL, '{\"email\":\"testing@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-08 08:45:02'),
(161, 14, 'logout', 'user', '14', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-08 08:54:13'),
(162, 13, 'login', 'user', '13', NULL, '{\"email\":\"dtcoffice@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-08 08:54:24'),
(163, 13, 'delete', 'task', '11', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-08 08:54:56'),
(164, 13, 'logout', 'user', '13', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-08 08:55:46'),
(165, 14, 'login', 'user', '14', NULL, '{\"email\":\"testing@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-08 08:56:04'),
(166, 14, 'create', 'project', 'PROJ-20260408085656-3b63e4', NULL, '{\"name\":\"awdaw\",\"status\":\"active\",\"start_date\":\"2026-04-08\",\"end_date\":\"2026-04-09\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-08 08:56:56'),
(167, 14, 'delete', 'project', 'PROJ-20260408085656-3b63e4', '{\"name\":\"awdaw\"}', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-08 08:57:16'),
(168, 14, 'logout', 'user', '14', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-08 09:26:47'),
(169, 13, 'login', 'user', '13', NULL, '{\"email\":\"dtcoffice@gmail.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-08 09:26:57');

-- --------------------------------------------------------

--
-- Table structure for table `chat_groups`
--

CREATE TABLE `chat_groups` (
  `id` int(11) NOT NULL,
  `team_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `chat_groups`
--

INSERT INTO `chat_groups` (`id`, `team_id`, `name`, `description`, `created_at`, `updated_at`) VALUES
(1, 8, 'Website Redesign Group Chat', 'Team group chat for Website Redesign', '2026-03-19 05:43:24', '2026-03-19 07:33:57'),
(3, 6, 'Testing Group Chat', 'Team group chat for Testing', '2026-03-19 06:24:15', '2026-03-19 07:34:02'),
(4, 9, 'Backend Team Group Chat', 'Team group chat for Backend Team', '2026-03-19 07:01:43', '2026-03-19 07:33:50'),
(7, 12, 'kamay Group Chat', 'Team group chat for kamay', '2026-03-19 07:36:06', '2026-03-19 07:36:20');

-- --------------------------------------------------------

--
-- Table structure for table `chat_group_members`
--

CREATE TABLE `chat_group_members` (
  `id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `chat_group_members`
--

INSERT INTO `chat_group_members` (`id`, `group_id`, `user_id`, `joined_at`) VALUES
(1, 1, 13, '2026-03-19 05:43:24'),
(2, 1, 12, '2026-03-19 05:43:24'),
(8, 3, 13, '2026-03-19 06:24:22'),
(9, 3, 12, '2026-03-19 06:24:22'),
(10, 3, 14, '2026-03-19 06:24:22'),
(14, 4, 13, '2026-03-19 07:01:43'),
(23, 7, 13, '2026-04-07 01:49:29'),
(24, 7, 12, '2026-04-07 01:49:29'),
(27, 4, 14, '2026-04-08 09:13:40');

-- --------------------------------------------------------

--
-- Table structure for table `chat_messages`
--

CREATE TABLE `chat_messages` (
  `id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(2, 'testing@gmail.com', 'test testing', 'Welcome to Project Management Dashboard', '\r\n        <html>\r\n        <head>\r\n            <style>\r\n                body { font-family: \'Segoe UI\', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }\r\n                .email-container { max-width: 600px; margin: 0 auto; background: #fff; }\r\n                .email-header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 24px; text-align: center; border-radius: 8px 8px 0 0; }\r\n                .email-header h1 { margin: 0; font-size: 22px; }\r\n                .email-body { padding: 30px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; }\r\n                .email-footer { background: #f3f4f6; padding: 16px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; }\r\n                .btn { display: inline-block; background: #2563eb; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; margin: 16px 0; font-weight: 600; }\r\n                .info-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 16px; margin: 16px 0; }\r\n            </style>\r\n        </head>\r\n        <body>\r\n            <div class=\'email-container\'>\r\n                <div class=\'email-header\'>\r\n                    <h1>Project Management Dashboard</h1>\r\n                </div>\r\n                <div class=\'email-body\'>\r\n                    \r\n            <h2>Welcome to Project Management Dashboard!</h2>\r\n            <p>Hello test testing,</p>\r\n            <p>Your account has been created successfully. You can now log in and start managing your projects.</p>\r\n            <div class=\'info-box\'>\r\n                <strong>Getting Started:</strong>\r\n                <ul>\r\n                    <li>Log in with your email and password</li>\r\n                    <li>Create your first project</li>\r\n                    <li>Assign tasks to team members</li>\r\n                    <li>Track progress on the dashboard</li>\r\n                </ul>\r\n            </div>\r\n            <a href=\'http://localhost/ProjectDashboard/page/login.php\' class=\'btn\'>Log In Now</a>\r\n        \r\n                </div>\r\n                <div class=\'email-footer\'>\r\n                    <p>This is an automated email. Please do not reply.</p>\r\n                    <p>&copy; 2026 Project Management Dashboard. All rights reserved.</p>\r\n                </div>\r\n            </div>\r\n        </body>\r\n        </html>', 'pending', 1, 'PHP mail() returned false', '2026-03-17 03:32:19', NULL),
(3, 'dtcoffice@gmail.com', 'DTC Office', 'New Task: test', '\r\n        <html>\r\n        <head>\r\n            <style>\r\n                body { font-family: \'Segoe UI\', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }\r\n                .email-container { max-width: 600px; margin: 0 auto; background: #fff; }\r\n                .email-header { background: linear-gradient(135deg, #800000 0%, #660000 100%); color: white; padding: 24px; text-align: center; border-radius: 8px 8px 0 0; }\r\n                .email-header h1 { margin: 0; font-size: 22px; }\r\n                .email-body { padding: 30px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; }\r\n                .email-footer { background: #f3f4f6; padding: 16px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; }\r\n                .btn { display: inline-block; background: #800000; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; margin: 16px 0; font-weight: 600; }\r\n                .info-box { background: #E0CCCC; border: 1px solid #D4A0A0; border-radius: 6px; padding: 16px; margin: 16px 0; }\r\n            </style>\r\n        </head>\r\n        <body>\r\n            <div class=\'email-container\'>\r\n                <div class=\'email-header\'>\r\n                    <h1>Project Management Dashboard</h1>\r\n                </div>\r\n                <div class=\'email-body\'>\r\n                    \r\n            <h2>New Task Assigned</h2>\r\n            <p>Hello DTC Office,</p>\r\n            <p>A new task has been assigned to you:</p>\r\n            <div class=\'info-box\'>\r\n                <strong>test</strong><br>\r\n                <small>Priority: Critical | Due: 2026-04-09</small>\r\n            </div>\r\n            <a href=\'http://localhost/ProjectDashboard/page/tasks.html\' class=\'btn\'>View Tasks</a>\r\n        \r\n                </div>\r\n                <div class=\'email-footer\'>\r\n                    <p>This is an automated email. Please do not reply.</p>\r\n                    <p>&copy; 2026 Project Management Dashboard. All rights reserved.</p>\r\n                </div>\r\n            </div>\r\n        </body>\r\n        </html>', 'pending', 1, 'PHP mail() returned false', '2026-04-08 06:09:21', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `message_read_status`
--

CREATE TABLE `message_read_status` (
  `id` int(11) NOT NULL,
  `message_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `read_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(15, 14, 'info', 'Welcome back!', 'You logged in successfully.', '', 1, '2026-03-17 03:32:35'),
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
(29, 14, 'project', 'New Project Created', 'DTC Office created project \"DTC\"', 'projects.html', 1, '2026-03-17 06:12:41'),
(30, 12, 'info', 'Welcome back!', 'You logged in successfully.', '', 0, '2026-03-17 06:55:44'),
(31, 13, 'info', 'Welcome back!', 'You logged in successfully.', '', 1, '2026-03-17 06:56:16'),
(32, 13, 'info', 'Welcome back!', 'You logged in successfully.', '', 1, '2026-03-17 07:27:33'),
(33, 13, 'info', 'Welcome back!', 'You logged in successfully.', '', 1, '2026-03-18 00:21:57'),
(34, 13, 'task', 'Task Assigned: Hmm', 'Priority: Medium | Due: 2026-03-18', 'tasks.html', 1, '2026-03-18 00:34:47'),
(35, 13, 'info', 'Welcome back!', 'You logged in successfully.', '', 1, '2026-03-18 01:55:45'),
(36, 13, 'info', 'Welcome back!', 'You logged in successfully.', '', 1, '2026-03-18 05:44:55'),
(37, 13, 'info', 'Welcome back!', 'You logged in successfully.', '', 1, '2026-03-18 07:15:36'),
(38, 13, 'info', 'Welcome back!', 'You logged in successfully.', '', 1, '2026-03-18 08:29:28'),
(39, 13, 'info', 'Welcome back!', 'You logged in successfully.', '', 1, '2026-03-18 08:35:48'),
(40, 13, 'info', 'Welcome back!', 'You logged in successfully.', '', 1, '2026-03-18 08:40:58'),
(41, 13, 'info', 'Welcome back!', 'You logged in successfully.', '', 1, '2026-03-19 01:00:02'),
(42, 13, 'task', 'Task Assigned: DTC', 'Priority: Medium | Due: 2026-03-19', 'tasks.html', 1, '2026-03-19 01:08:05'),
(43, 13, 'info', 'Welcome back!', 'You logged in successfully.', '', 1, '2026-03-19 01:11:54'),
(44, 13, 'info', 'Welcome back!', 'You logged in successfully.', '', 1, '2026-03-19 03:19:37'),
(45, 13, 'info', 'Welcome back!', 'You logged in successfully.', '', 1, '2026-03-19 05:21:01'),
(46, 13, 'info', 'Welcome back!', 'You logged in successfully.', '', 1, '2026-03-19 05:40:22'),
(47, 12, 'info', 'Welcome back!', 'You logged in successfully.', '', 0, '2026-03-19 07:37:13'),
(48, 13, 'info', 'Welcome back!', 'You logged in successfully.', '', 1, '2026-03-19 07:38:28'),
(49, 13, 'info', 'Welcome back!', 'You logged in successfully.', '', 1, '2026-03-19 07:40:09'),
(50, 13, 'info', 'Welcome back!', 'You logged in successfully.', '', 1, '2026-03-19 07:41:04'),
(51, 13, 'info', 'Welcome back!', 'You logged in successfully.', '', 1, '2026-04-06 05:16:23'),
(52, 13, 'info', 'Welcome back!', 'You logged in successfully.', '', 1, '2026-04-06 05:30:35'),
(53, 12, 'project', 'New Project Created', 'DTC Office created project \"API Integration\"', 'projects.html', 0, '2026-04-06 05:48:45'),
(54, 13, 'project', 'New Project Created', 'DTC Office created project \"API Integration\"', 'projects.html', 1, '2026-04-06 05:48:45'),
(55, 14, 'project', 'New Project Created', 'DTC Office created project \"API Integration\"', 'projects.html', 1, '2026-04-06 05:48:45'),
(56, 13, 'task', 'Task Assigned: ...', 'Priority: Low | Due: 2026-04-06', 'tasks.html', 1, '2026-04-06 06:13:00'),
(57, 13, 'info', 'Welcome back!', 'You logged in successfully.', '', 1, '2026-04-07 00:25:53'),
(58, 14, 'info', 'Welcome back!', 'You logged in successfully.', '', 1, '2026-04-07 01:37:48'),
(59, 14, 'task', 'Task Assigned: aisdwi', 'Priority: Medium | Due: 2026-04-07', 'tasks.html', 1, '2026-04-07 01:40:07'),
(60, 13, 'info', 'Welcome back!', 'You logged in successfully.', '', 1, '2026-04-07 01:59:26'),
(61, 13, 'task', 'Task Assigned: dawd', 'Priority: Medium | Due: 2026-04-07', 'tasks.html', 1, '2026-04-07 02:38:04'),
(62, 13, 'task', 'Task Assigned: awdawd', 'Priority: Medium | Due: 2026-04-07', 'tasks.html', 1, '2026-04-07 02:39:41'),
(63, 13, 'info', 'Welcome back!', 'You logged in successfully.', '', 1, '2026-04-07 06:24:38'),
(64, 13, 'info', 'Welcome back!', 'You logged in successfully.', '', 1, '2026-04-08 00:36:16'),
(65, 13, 'info', 'Welcome back!', 'You logged in successfully.', '', 1, '2026-04-08 01:43:00'),
(66, 13, 'info', 'Welcome back!', 'You logged in successfully.', '', 1, '2026-04-08 03:31:46'),
(67, 13, 'info', 'Welcome back!', 'You logged in successfully.', '', 1, '2026-04-08 05:02:53'),
(68, 12, 'project', 'New Project Created', 'DTC Office created project \"2345\"', 'projects.html', 0, '2026-04-08 05:37:11'),
(69, 13, 'project', 'New Project Created', 'DTC Office created project \"2345\"', 'projects.html', 1, '2026-04-08 05:37:11'),
(70, 14, 'project', 'New Project Created', 'DTC Office created project \"2345\"', 'projects.html', 0, '2026-04-08 05:37:11'),
(71, 13, 'task', 'Task Assigned: Copilot Temp Task', 'Priority: Medium | Due: 2026-04-20', 'tasks.html', 1, '2026-04-08 06:07:08'),
(72, 13, 'task', 'Task Assigned: Copilot Temp Task', 'Priority: Medium | Due: 2026-04-20', 'tasks.html', 1, '2026-04-08 06:07:22'),
(73, 13, 'task', 'Task Assigned: test', 'Priority: Critical | Due: 2026-04-09', 'tasks.html', 1, '2026-04-08 06:09:21'),
(74, 13, 'info', 'Welcome back!', 'You logged in successfully.', '', 1, '2026-04-08 06:54:50'),
(75, 13, 'info', 'Welcome back!', 'You logged in successfully.', '', 1, '2026-04-08 07:31:36'),
(76, 13, 'info', 'Welcome back!', 'You logged in successfully.', '', 1, '2026-04-08 08:25:10'),
(77, 13, 'task', 'Task Assigned: ainwc', 'Priority: Low | Due: 2026-04-08', 'tasks.html', 1, '2026-04-08 08:27:58'),
(78, 13, 'task', 'Task Assigned: 12313', 'Priority: Medium | Due: 2026-04-08', 'tasks.html', 1, '2026-04-08 08:30:21'),
(79, 13, 'task', 'Task Assigned: cadq', 'Priority: Medium | Due: 2026-04-08', 'tasks.html', 1, '2026-04-08 08:35:12'),
(80, 14, 'info', 'Welcome back!', 'You logged in successfully.', '', 0, '2026-04-08 08:45:02'),
(81, 13, 'info', 'Welcome back!', 'You logged in successfully.', '', 1, '2026-04-08 08:54:24'),
(82, 14, 'info', 'Welcome back!', 'You logged in successfully.', '', 0, '2026-04-08 08:56:05'),
(83, 12, 'project', 'New Project Created', 'testing created project \"awdaw\"', 'projects.html', 0, '2026-04-08 08:56:56'),
(84, 13, 'project', 'New Project Created', 'testing created project \"awdaw\"', 'projects.html', 0, '2026-04-08 08:56:56'),
(85, 14, 'project', 'New Project Created', 'testing created project \"awdaw\"', 'projects.html', 0, '2026-04-08 08:56:56'),
(86, 13, 'info', 'Welcome back!', 'You logged in successfully.', '', 0, '2026-04-08 09:26:57');

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
('PROJ-20260408053711-1fdddf', '2345', '2345', 'on-hold', 1775606400, 1775692800, 0, NULL, 0.00, NULL, '13', '2026-04-08 05:37:11', NULL);

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
  `id` int(11) NOT NULL,
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
(7, 'awdawd', 'awdawd', NULL, '13', 'high', 'pending', 0, 0.00, NULL, NULL, 1775692800, '2026-04-07 02:39:41', NULL),
(10, 'test', '1', NULL, '13', 'critical', 'in-progress', 0, 24.00, NULL, NULL, 1775692800, '2026-04-08 06:09:21', NULL),
(13, 'cadq', 'dsqqwdq', NULL, '13', 'medium', 'in-progress', 0, 24.00, NULL, NULL, 1775606400, '2026-04-08 08:35:12', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `teams`
--

CREATE TABLE `teams` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `team_lead` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `teams`
--

INSERT INTO `teams` (`id`, `name`, `description`, `team_lead`, `created_at`, `updated_at`) VALUES
(6, 'Testing', 'TEST', 13, '2026-03-11 16:23:21', '2026-03-18 23:29:22'),
(8, 'Website Redesign', 'BA', 13, '2026-03-19 05:43:23', '2026-03-19 05:43:23'),
(9, 'Backend Team', 'wakanda', 14, '2026-03-19 07:01:43', '2026-03-19 07:01:43'),
(12, 'kamay', 'ni jesus', 12, '2026-03-19 07:36:06', '2026-03-19 07:36:06');

-- --------------------------------------------------------

--
-- Table structure for table `team_members`
--

CREATE TABLE `team_members` (
  `id` int(11) NOT NULL,
  `team_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `role` varchar(50) DEFAULT 'member',
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `team_members`
--

INSERT INTO `team_members` (`id`, `team_id`, `user_id`, `role`, `joined_at`) VALUES
(6, 8, 13, 'member', '2026-03-19 05:43:23'),
(7, 8, 12, 'member', '2026-03-19 05:43:23'),
(14, 6, 13, 'member', '2026-03-19 06:24:22'),
(15, 6, 12, 'member', '2026-03-19 06:24:22'),
(16, 6, 14, 'member', '2026-03-19 06:24:22'),
(20, 9, 13, 'member', '2026-03-19 07:01:43'),
(29, 12, 13, 'member', '2026-04-07 01:49:28'),
(30, 12, 12, 'member', '2026-04-07 01:49:29');

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
(12, 'taikistay', 'taikistay@gmail.com', 'e77bfb1aadc8803e010a585d6581158f6ac9f4590b190d6b96f76a441a1aaa9d', 'taiki stayq', NULL, 'Stay', 'user', 'active', '2026-03-19 15:37:13', 0, NULL, '2026-03-11 04:45:36', '2026-03-19 07:37:13'),
(13, 'dtcoffice', 'dtcoffice@gmail.com', '3dab775edd8491ecb97a059cdb8d9581d703019c8661c1a66a05f7688aa825aa', 'DTC Office', NULL, 'DTC Office', 'admin', 'active', '2026-04-08 17:26:57', 0, NULL, '2026-03-17 01:17:55', '2026-04-08 09:26:57'),
(14, 'testing', 'testing@gmail.com', 'ca9d10c005e24b04e61b0011521d2e52ffda6bc567dd15dc1793d35613d01df3', 'testing', NULL, 'testing', 'intern', 'active', '2026-04-08 16:56:04', 0, NULL, '2026-03-17 03:32:19', '2026-04-08 08:56:04');

-- --------------------------------------------------------

--
-- Table structure for table `user_preferences`
--

CREATE TABLE `user_preferences` (
  `pref_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `pref_key` varchar(100) NOT NULL,
  `pref_value` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_preferences`
--

INSERT INTO `user_preferences` (`pref_id`, `user_id`, `pref_key`, `pref_value`, `created_at`, `updated_at`) VALUES
(1, 13, 'theme', 'dark', '2026-04-06 05:16:41', '2026-04-08 03:57:57'),
(2, 13, 'compact_view', '1', '2026-04-06 05:33:37', '2026-04-08 03:42:41'),
(3, 13, 'maintenance_mode', '0', '2026-04-06 05:57:06', '2026-04-06 05:57:33'),
(4, 13, 'language', 'English', '2026-04-06 05:57:12', '2026-04-06 05:57:13');

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
('019ievqgmi3ntp63uc7hhrid1b', 13, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-18 01:55:45', '2026-03-18 01:55:45'),
('0hcrup9r5svfun7mbfgsehilr2', 13, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-08 07:31:36', '2026-04-08 07:31:36'),
('0so3tardvkhdfvtjsa9e7luof0', 12, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 00:46:40', '2026-03-17 00:46:40'),
('2h2922hpi96vo69dtm7phcslfo', 13, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-18 08:35:48', '2026-03-18 08:35:48'),
('3kkrvt6jvg5vcj1cpolp76a7p2', 13, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-03-19 05:21:01', '2026-03-19 05:21:01'),
('4ef28kfjher6aggs7gh2e9m31a', 13, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 02:26:01', '2026-03-17 02:26:01'),
('4j7ksij93sihijqab78jhf81u6', 13, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-03-19 01:11:54', '2026-03-19 01:11:54'),
('653p41g6f23k3oaubd8d7culrp', 13, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 03:56:58', '2026-03-17 03:56:58'),
('7cllr8q8sp87arh6vra3bimvee', 13, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-03-19 07:41:04', '2026-03-19 07:41:04'),
('7pipodp4a93jpvf76ns6m419g8', 13, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 06:56:16', '2026-03-17 06:56:16'),
('7roq0319thsqqonne7d2b76vho', 13, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 01:18:31', '2026-03-17 01:18:31'),
('8a8qbodupo70pjiec01slguulr', 13, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-03-19 01:00:02', '2026-03-19 01:00:02'),
('8ptiucc8imqvg4kduj4sfnj1me', 13, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-03-19 03:19:37', '2026-03-19 03:19:37'),
('9cpqqhn7vv3emucq2dfp8o2c9s', 13, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-07 06:24:38', '2026-04-07 06:24:38'),
('9eg3eussla0udi90r8fr19ujja', 13, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-03-19 07:38:28', '2026-03-19 07:38:28'),
('ddri338kqgaa5vdtg5emmu4hm1', 13, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 02:42:42', '2026-03-17 02:42:42'),
('dsprcj9ovjnevnhn7k27f0ou94', 13, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-18 07:15:36', '2026-03-18 07:15:36'),
('e4crj65crcqsibph9v4kduf09q', 13, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 06:03:56', '2026-03-17 06:03:56'),
('e4reg84gup4j8nm7sqkeu3iv56', 13, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-08 06:54:50', '2026-04-08 06:54:50'),
('ejns4sva58i37vh5umoa6hhma6', 13, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-08 09:26:57', '2026-04-08 09:26:57'),
('f2megq97png05811o1mbp7f4o1', 13, '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-08 03:31:46', '2026-04-08 03:31:46'),
('hqr6feeg57ct659febcse6bmv5', 13, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-18 08:29:28', '2026-03-18 08:29:28'),
('i56fc5h1s90jvv43o529vir2ph', 12, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 00:46:29', '2026-03-17 00:46:29'),
('infploqrl955e0p2f5cht5doa1', 13, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-07 01:59:25', '2026-04-07 01:59:25'),
('j3k67lrapq42p03hcoe5qmlfh6', 13, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-03-19 07:40:09', '2026-03-19 07:40:09'),
('js53udi5v881irkl7i2132jo4f', 14, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-08 08:45:02', '2026-04-08 08:45:02'),
('kaekh2va5uqlsjrpc0t6849v3g', 13, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-08 00:36:16', '2026-04-08 00:36:16'),
('kailj58vt46gu6n4dvj1t8ftp3', 13, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-07 00:25:53', '2026-04-07 00:25:53'),
('lb6t1ek53os1nkr4uoef006i7k', 13, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-18 00:21:57', '2026-03-18 00:21:57'),
('n2qmq8u35tmtjft66r67gdeabn', 13, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-06 05:16:23', '2026-04-06 05:16:23'),
('nkdqqscrp0r240r4m4t1r6qun1', 13, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-03-19 05:40:22', '2026-03-19 05:40:22'),
('o7hrj5cro2feh29cn22hmueig5', 13, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-18 05:44:54', '2026-03-18 05:44:54'),
('ootu825915nt4s091omf0cpkrb', 13, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-18 08:40:57', '2026-03-18 08:40:57'),
('pcd9q8rh2ljp2br96jo5vm4llp', 14, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-08 08:56:04', '2026-04-08 08:56:04'),
('pghus4n9pd3qpnglu44t0ero9f', 13, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-08 08:25:10', '2026-04-08 08:25:10'),
('qdmta6oe2hn26dajrndg3hofr8', 13, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-06 05:30:35', '2026-04-06 05:30:35'),
('qh95do9udg0qa67vh7jtprlssj', 13, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-08 05:02:53', '2026-04-08 05:02:53'),
('thball01cpngeq8gfrqtg72tao', 13, '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-08 01:43:00', '2026-04-08 01:43:00'),
('u1uh2vfg5kb1oa5b80ifm34o4s', 14, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-07 01:37:48', '2026-04-07 01:37:48'),
('u4qg3f9toucf5qabe548j1tjpi', 13, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 07:27:33', '2026-03-17 07:27:33'),
('vcphoqjr50ce6ce77qkvpuosru', 13, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-17 01:59:47', '2026-03-17 01:59:47');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_log`
--
ALTER TABLE `activity_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_activity_user` (`user_id`);

--
-- Indexes for table `archived_users`
--
ALTER TABLE `archived_users`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_archived_at` (`archived_at`),
  ADD KEY `idx_original_user` (`original_user_id`),
  ADD KEY `archived_by` (`archived_by`);

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
-- Indexes for table `chat_groups`
--
ALTER TABLE `chat_groups`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `team_id` (`team_id`),
  ADD KEY `idx_team_id` (`team_id`);

--
-- Indexes for table `chat_group_members`
--
ALTER TABLE `chat_group_members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_group_user` (`group_id`,`user_id`),
  ADD KEY `idx_group_id` (`group_id`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_group_id` (`group_id`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `email_queue`
--
ALTER TABLE `email_queue`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indexes for table `message_read_status`
--
ALTER TABLE `message_read_status`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_message_user` (`message_id`,`user_id`),
  ADD KEY `idx_message_id` (`message_id`),
  ADD KEY `idx_user_id` (`user_id`);

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
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tasks_project` (`project_id`),
  ADD KEY `idx_tasks_assigned` (`assigned_to`);

--
-- Indexes for table `teams`
--
ALTER TABLE `teams`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_team_lead` (`team_lead`);

--
-- Indexes for table `team_members`
--
ALTER TABLE `team_members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_team_user` (`team_id`,`user_id`),
  ADD KEY `fk_tm_user` (`user_id`);

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
-- Indexes for table `user_preferences`
--
ALTER TABLE `user_preferences`
  ADD PRIMARY KEY (`pref_id`),
  ADD UNIQUE KEY `unique_user_pref` (`user_id`,`pref_key`);

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
-- AUTO_INCREMENT for table `activity_log`
--
ALTER TABLE `activity_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=246;

--
-- AUTO_INCREMENT for table `archived_users`
--
ALTER TABLE `archived_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `audit_log`
--
ALTER TABLE `audit_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=170;

--
-- AUTO_INCREMENT for table `chat_groups`
--
ALTER TABLE `chat_groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `chat_group_members`
--
ALTER TABLE `chat_group_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `chat_messages`
--
ALTER TABLE `chat_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=69;

--
-- AUTO_INCREMENT for table `email_queue`
--
ALTER TABLE `email_queue`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `message_read_status`
--
ALTER TABLE `message_read_status`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=69;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=87;

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
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `teams`
--
ALTER TABLE `teams`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `team_members`
--
ALTER TABLE `team_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `user_preferences`
--
ALTER TABLE `user_preferences`
  MODIFY `pref_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_log`
--
ALTER TABLE `activity_log`
  ADD CONSTRAINT `fk_activity_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `archived_users`
--
ALTER TABLE `archived_users`
  ADD CONSTRAINT `archived_users_ibfk_1` FOREIGN KEY (`archived_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `chat_groups`
--
ALTER TABLE `chat_groups`
  ADD CONSTRAINT `chat_groups_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `chat_group_members`
--
ALTER TABLE `chat_group_members`
  ADD CONSTRAINT `chat_group_members_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `chat_groups` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `chat_group_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD CONSTRAINT `chat_messages_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `chat_groups` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `chat_messages_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `message_read_status`
--
ALTER TABLE `message_read_status`
  ADD CONSTRAINT `message_read_status_ibfk_1` FOREIGN KEY (`message_id`) REFERENCES `chat_messages` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `message_read_status_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `teams`
--
ALTER TABLE `teams`
  ADD CONSTRAINT `fk_team_lead` FOREIGN KEY (`team_lead`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `team_members`
--
ALTER TABLE `team_members`
  ADD CONSTRAINT `fk_tm_team` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_tm_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_preferences`
--
ALTER TABLE `user_preferences`
  ADD CONSTRAINT `user_preferences_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
