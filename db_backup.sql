-- MariaDB dump 10.19  Distrib 10.4.28-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: project_management_db
-- ------------------------------------------------------
-- Server version	10.4.28-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activity_log`
--

DROP TABLE IF EXISTS `activity_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `activity_log` (
  `id` int(255) DEFAULT NULL,
  `user_id` varchar(255) DEFAULT NULL,
  `action` varchar(255) DEFAULT NULL,
  `entity_type` varchar(255) DEFAULT NULL,
  `entity_id` int(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` varchar(255) DEFAULT NULL,
  KEY `idx_activity_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_log`
--

LOCK TABLES `activity_log` WRITE;
/*!40000 ALTER TABLE `activity_log` DISABLE KEYS */;
INSERT INTO `activity_log` VALUES (NULL,'6','register','user',NULL,'New user registered successfully',NULL),(NULL,'7','register','user',NULL,'New user registered successfully',NULL),(NULL,'8','register','user',NULL,'New user registered successfully',NULL),(NULL,'8','login','user',NULL,'User logged in successfully',NULL),(NULL,'8','logout','user',NULL,'User logged out',NULL),(NULL,'9','register','user',NULL,'New user registered successfully',NULL),(NULL,'10','register','user',NULL,'New user registered successfully',NULL),(NULL,'10','login','user',NULL,'User logged in successfully',NULL),(NULL,'10','logout','user',NULL,'User logged out',NULL),(NULL,'11','register','user',NULL,'New user registered successfully',NULL),(NULL,'11','login','user',NULL,'User logged in successfully',NULL),(NULL,'11','logout','user',NULL,'User logged out',NULL),(NULL,'12','register','user',NULL,'New user registered successfully',NULL),(NULL,'12','password_reset','user',NULL,'Password reset approved by admin',NULL),(NULL,'12','login','user',NULL,'User logged in successfully',NULL),(NULL,'USER-DEFAULT','create','project',0,'Created new project: web','2026-03-11 07:05:30'),(NULL,'USER-DEFAULT','create','project',0,'Created new project: dwada','2026-03-11 07:06:48'),(NULL,'12','create','project',0,'Created new project: jao','2026-03-11 07:36:26'),(NULL,'12','create','task',0,'Created new task: stay','2026-03-11 07:38:41'),(NULL,'12','create','meeting',0,'Scheduled meeting: holiday on 2026-03-12 17:00','2026-03-11 07:39:53'),(NULL,'12','delete','project',0,'Deleted project: dwada','2026-03-11 07:55:33'),(NULL,'12','delete','project',0,'Deleted project: web','2026-03-11 07:55:42'),(NULL,'12','create','project',0,'Created new project: kim','2026-03-11 07:59:21'),(NULL,'12','delete','project',0,'Deleted project: kim','2026-03-11 07:59:44'),(NULL,'12','delete','project',0,'Deleted project: jao','2026-03-11 08:06:12'),(NULL,'USER-DEFAULT','create','project',0,'Created new project: kyle','2026-03-11 08:57:23'),(NULL,'USER-DEFAULT','delete','project',0,'Deleted project: kyle','2026-03-11 08:57:36'),(NULL,'USER-DEFAULT','create','project',0,'Created new project: tristan','2026-03-11 09:03:22'),(NULL,'USER-DEFAULT','delete','project',0,'Deleted project: tristan','2026-03-11 09:03:31'),(NULL,'USER-DEFAULT','create','project',0,'Created new project: kyle','2026-03-11 09:43:33'),(NULL,'12','delete','project',0,'Deleted project: kyle','2026-03-11 09:44:58'),(NULL,'USER-DEFAULT','create','team',802835,'Created new team: kyle','2026-03-12 00:23:21'),(NULL,'USER-DEFAULT','create','team',615069,'Created new team: kyle','2026-03-12 00:33:46'),(NULL,'12','login','user',NULL,'User logged in successfully',NULL),(NULL,'USER-DEFAULT','create','project',0,'Created new project: kyle','2026-03-15 23:31:49'),(NULL,'USER-DEFAULT','delete','project',0,'Deleted project: kyle','2026-03-15 23:31:58'),(NULL,'0','logout','user',NULL,'User logged out',NULL),(NULL,'USER-DEFAULT','create','project',0,'Created new project: DTC','2026-03-16 03:38:47'),(NULL,'USER-DEFAULT','delete','project',0,'Deleted project: DTC','2026-03-16 03:39:54'),(NULL,'USER-DEFAULT','create','project',0,'Created new project: DTC','2026-03-16 03:40:30'),(NULL,'USER-DEFAULT','delete','project',0,'Deleted project: DTC','2026-03-16 03:40:47'),(NULL,'USER-DEFAULT','create','project',0,'Created new project: DTC','2026-03-16 03:41:18');
/*!40000 ALTER TABLE `activity_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin`
--

DROP TABLE IF EXISTS `admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin`
--

LOCK TABLES `admin` WRITE;
/*!40000 ALTER TABLE `admin` DISABLE KEYS */;
/*!40000 ALTER TABLE `admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alerts`
--

DROP TABLE IF EXISTS `alerts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alerts`
--

LOCK TABLES `alerts` WRITE;
/*!40000 ALTER TABLE `alerts` DISABLE KEYS */;
INSERT INTO `alerts` VALUES (NULL,'system','High Memory Usage','Memory usage is at 75%. Consider optimizing or scaling up.','warning','active',NULL,NULL),(NULL,'info','Backup Completed','Database backup completed successfully.','info','resolved',NULL,NULL),(NULL,'success','System Update','Security patches have been successfully applied.','success','resolved',NULL,NULL);
/*!40000 ALTER TABLE `alerts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `password_reset_tokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `token` varchar(255) NOT NULL,
  `new_password_hash` varchar(255) DEFAULT NULL,
  `approval_status` enum('pending','approved','rejected') DEFAULT 'pending',
  `admin_id` int(11) DEFAULT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `used` tinyint(1) DEFAULT 0,
  `used_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_token` (`token`),
  KEY `idx_email` (`email`),
  KEY `idx_expires` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
INSERT INTO `password_reset_tokens` VALUES (4,'taikistay@gmail.com','018391cc0fe08becbfd09fd44edf0c00ff6d1c92cd2d71d798329ccb883c8099','c4313fb081d54fb6474a664dde67631d70addca13a66fd4f20a2468f3988c5ac','approved',NULL,'2026-03-11 05:59:08','2026-03-11 04:59:08',1,'2026-03-11 13:01:05');
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
  `updated_at` varchar(255) DEFAULT NULL,
  KEY `idx_projects_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projects`
--

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
INSERT INTO `projects` VALUES (NULL,'Website Redesign','Complete redesign of company website','active',2026,2026,77,NULL,0.00,NULL,'1',NULL,NULL),(NULL,'Mobile App Development','iOS and Android mobile application','active',2026,2026,60,NULL,0.00,NULL,'1',NULL,NULL),(NULL,'API Integration','Integration of third-party APIs','active',2026,2026,90,NULL,0.00,NULL,'1',NULL,NULL),(NULL,'Database Migration','Migration to modern NoSQL','on-hold',2026,2026,30,NULL,0.00,NULL,'1',NULL,NULL),(NULL,'Testing & QA','Comprehensive testing for v2.0','completed',2026,2026,100,NULL,0.00,NULL,'1',NULL,NULL),('PROJ-20260316034118-325713','DTC','','completed',1773619200,1773619200,100,NULL,0.00,NULL,'USER-DEFAULT','2026-03-16 03:41:18',NULL);
/*!40000 ALTER TABLE `projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_monitoring`
--

DROP TABLE IF EXISTS `system_monitoring`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_monitoring`
--

LOCK TABLES `system_monitoring` WRITE;
/*!40000 ALTER TABLE `system_monitoring` DISABLE KEYS */;
INSERT INTO `system_monitoring` VALUES (NULL,'CPU Usage',66,0,'80','95','normal',NULL),(NULL,'RAM Usage',75,0,'80','90','warning',NULL),(NULL,'Disk Space',45,0,'85','95','normal',NULL),(NULL,'Network I/O',35,0,'80','95','normal',NULL),(NULL,'Database Response',12,0,'100','200','normal',NULL);
/*!40000 ALTER TABLE `system_monitoring` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `system_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `setting_type` enum('string','number','boolean','json') DEFAULT 'string',
  `description` text DEFAULT NULL,
  `is_public` tinyint(1) DEFAULT 0,
  `updated_by` int(11) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`),
  KEY `idx_key` (`setting_key`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_settings`
--

LOCK TABLES `system_settings` WRITE;
/*!40000 ALTER TABLE `system_settings` DISABLE KEYS */;
INSERT INTO `system_settings` VALUES (1,'app_name','ProjectDashboard','string','Application name',1,NULL,'2026-03-11 05:11:12'),(2,'app_version','1.0.0','string','Application version',1,NULL,'2026-03-11 05:11:12'),(3,'max_upload_size','5','number','Maximum file upload size in MB',0,NULL,'2026-03-11 05:11:12'),(4,'session_timeout','30','number','Session timeout in minutes',0,NULL,'2026-03-11 05:11:12'),(5,'items_per_page','20','number','Default pagination items per page',0,NULL,'2026-03-11 05:11:12'),(6,'maintenance_mode','false','boolean','Enable maintenance mode',0,NULL,'2026-03-11 05:11:12'),(7,'allow_registration','true','boolean','Allow new user registrations',0,NULL,'2026-03-11 05:11:12'),(8,'password_min_length','6','number','Minimum password length',0,NULL,'2026-03-11 05:11:12'),(9,'email_notifications','true','boolean','Enable email notifications',0,NULL,'2026-03-11 05:11:12'),(10,'task_deadline_reminder','24','number','Task deadline reminder in hours',0,NULL,'2026-03-11 05:11:12');
/*!40000 ALTER TABLE `system_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
  `updated_at` varchar(255) DEFAULT NULL,
  KEY `idx_tasks_project` (`project_id`),
  KEY `idx_tasks_assigned` (`assigned_to`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks`
--

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
INSERT INTO `tasks` VALUES (NULL,'Update Database Schema','Modify schema to support new features',1,'1','high','in-progress',0,NULL,NULL,NULL,2026,NULL,NULL),(NULL,'Code Review - PR #123','Review API endpoints',2,'2','medium','completed',0,NULL,NULL,NULL,2026,NULL,NULL),(NULL,'Write Unit Tests','Tests for authentication module',1,'3','medium','in-progress',0,NULL,NULL,NULL,2026,NULL,NULL),(NULL,'Design System UI','Create reusable UI components',3,'4','high','in-progress',0,NULL,NULL,NULL,2026,NULL,NULL),(NULL,'Documentation Update','Update API documentation',2,'5','low','todo',0,NULL,NULL,NULL,2026,NULL,NULL);
/*!40000 ALTER TABLE `tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teams`
--

DROP TABLE IF EXISTS `teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `teams` (
  `id` int(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` varchar(255) DEFAULT NULL,
  `updated_at` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teams`
--

LOCK TABLES `teams` WRITE;
/*!40000 ALTER TABLE `teams` DISABLE KEYS */;
INSERT INTO `teams` VALUES (NULL,'Frontend Team','Responsible for UI/UX development',NULL,NULL),(NULL,'Backend Team','Handles server-side development',NULL,NULL),(NULL,'QA Team','Testing and quality assurance',NULL,NULL),(NULL,'Design Team','UI/UX design and branding',NULL,NULL),(NULL,'DevOps Team','Infrastructure and deployment',NULL,NULL),(802835,'kyle','gising','2026-03-12 00:23:21',NULL),(615069,'kyle','','2026-03-12 00:33:46',NULL);
/*!40000 ALTER TABLE `teams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_status` (`status`),
  KEY `idx_role` (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (12,'taikistay','taikistay@gmail.com','c4313fb081d54fb6474a664dde67631d70addca13a66fd4f20a2468f3988c5ac','taiki stayq',NULL,'Stay','user','active',NULL,0,NULL,'2026-03-11 04:45:36','2026-03-11 05:01:05');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-16 12:54:39
