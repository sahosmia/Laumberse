-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 03, 2026 at 09:18 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `laumberse`
--

-- --------------------------------------------------------

--
-- Table structure for table `accounts`
--

CREATE TABLE `accounts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `outlet_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `account_number` varchar(255) DEFAULT NULL,
  `opening_balance` decimal(15,2) NOT NULL DEFAULT 0.00,
  `current_balance` decimal(15,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `accounts`
--

INSERT INTO `accounts` (`id`, `outlet_id`, `name`, `account_number`, `opening_balance`, `current_balance`, `created_at`, `updated_at`) VALUES
(1, 1, 'cash in hand', NULL, 4000000.00, 4010000.00, '2026-09-01 00:45:51', '2026-09-01 00:51:37'),
(2, 1, 'Sonaly Bank', '01245', 50000.00, 50000.00, '2026-09-01 07:13:55', '2026-09-01 07:13:55');

-- --------------------------------------------------------

--
-- Table structure for table `account_transactions`
--

CREATE TABLE `account_transactions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `account_id` bigint(20) UNSIGNED NOT NULL,
  `type` enum('debit','credit') NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `description` text DEFAULT NULL,
  `reference_id` bigint(20) UNSIGNED DEFAULT NULL,
  `reference_type` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `account_transactions`
--

INSERT INTO `account_transactions` (`id`, `account_id`, `type`, `amount`, `description`, `reference_id`, `reference_type`, `created_at`, `updated_at`) VALUES
(1, 1, 'credit', 4000000.00, 'Opening balance', 1, 'App\\Models\\Account', '2026-09-01 00:45:51', '2026-09-01 00:45:51'),
(2, 1, 'credit', 10000.00, 'Investment from Yeasin Arafat', 2, 'App\\Models\\InvestorTransaction', '2026-09-01 00:51:37', '2026-09-01 00:51:37'),
(3, 2, 'credit', 50000.00, 'Opening balance', 2, 'App\\Models\\Account', '2026-09-01 07:13:55', '2026-09-01 07:13:55');

-- --------------------------------------------------------

--
-- Table structure for table `account_transfers`
--

CREATE TABLE `account_transfers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `from_account_id` bigint(20) UNSIGNED NOT NULL,
  `to_account_id` bigint(20) UNSIGNED NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `date` date NOT NULL,
  `note` text DEFAULT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `assets`
--

CREATE TABLE `assets` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `outlet_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `asset_category_id` bigint(20) UNSIGNED DEFAULT NULL,
  `purchase_date` date NOT NULL,
  `cost` decimal(15,2) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('Active','Maintenance','Disposed') NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `asset_categories`
--

CREATE TABLE `asset_categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `asset_categories`
--

INSERT INTO `asset_categories` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Machinery', 'Industrial machines and equipment', '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(2, 'Electronics', 'Computers, laptops, and gadgets', '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(3, 'Furniture', 'Chairs, tables, and desks', '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(4, 'Vehicles', 'Delivery vans and company cars', '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(5, 'Tools', 'Small hand tools and maintenance kits', '2026-09-01 00:07:20', '2026-09-01 00:07:20');

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('spatie.permission.cache', 'a:3:{s:5:\"alias\";a:4:{s:1:\"a\";s:2:\"id\";s:1:\"b\";s:4:\"name\";s:1:\"c\";s:10:\"guard_name\";s:1:\"r\";s:5:\"roles\";}s:11:\"permissions\";a:46:{i:0;a:4:{s:1:\"a\";i:1;s:1:\"b\";s:12:\"clients.view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:4;}}i:1;a:4:{s:1:\"a\";i:2;s:1:\"b\";s:14:\"clients.create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:4;}}i:2;a:4:{s:1:\"a\";i:3;s:1:\"b\";s:12:\"clients.edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:4;}}i:3;a:4:{s:1:\"a\";i:4;s:1:\"b\";s:14:\"clients.delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:4;a:4:{s:1:\"a\";i:5;s:1:\"b\";s:12:\"catalog.view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:5;a:4:{s:1:\"a\";i:6;s:1:\"b\";s:14:\"catalog.create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:6;a:4:{s:1:\"a\";i:7;s:1:\"b\";s:12:\"catalog.edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:7;a:4:{s:1:\"a\";i:8;s:1:\"b\";s:14:\"catalog.delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:8;a:4:{s:1:\"a\";i:9;s:1:\"b\";s:13:\"invoices.view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:4;}}i:9;a:4:{s:1:\"a\";i:10;s:1:\"b\";s:15:\"invoices.create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:4;}}i:10;a:4:{s:1:\"a\";i:11;s:1:\"b\";s:13:\"invoices.edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:4;}}i:11;a:4:{s:1:\"a\";i:12;s:1:\"b\";s:15:\"invoices.delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:12;a:4:{s:1:\"a\";i:13;s:1:\"b\";s:12:\"reports.view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}i:13;a:4:{s:1:\"a\";i:14;s:1:\"b\";s:14:\"employees.view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}i:14;a:4:{s:1:\"a\";i:15;s:1:\"b\";s:16:\"employees.create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:15;a:4:{s:1:\"a\";i:16;s:1:\"b\";s:14:\"employees.edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:16;a:4:{s:1:\"a\";i:17;s:1:\"b\";s:16:\"employees.delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:17;a:4:{s:1:\"a\";i:18;s:1:\"b\";s:14:\"payroll.create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:3;}}i:18;a:4:{s:1:\"a\";i:19;s:1:\"b\";s:13:\"expenses.view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:3;}}i:19;a:4:{s:1:\"a\";i:20;s:1:\"b\";s:15:\"expenses.create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:3;}}i:20;a:4:{s:1:\"a\";i:21;s:1:\"b\";s:13:\"expenses.edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:3;}}i:21;a:4:{s:1:\"a\";i:22;s:1:\"b\";s:15:\"expenses.delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:3;}}i:22;a:4:{s:1:\"a\";i:23;s:1:\"b\";s:11:\"assets.view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:23;a:4:{s:1:\"a\";i:24;s:1:\"b\";s:13:\"assets.create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:24;a:4:{s:1:\"a\";i:25;s:1:\"b\";s:11:\"assets.edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:25;a:4:{s:1:\"a\";i:26;s:1:\"b\";s:13:\"assets.delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:26;a:4:{s:1:\"a\";i:27;s:1:\"b\";s:13:\"accounts.view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:3;}}i:27;a:4:{s:1:\"a\";i:28;s:1:\"b\";s:15:\"accounts.create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:3;}}i:28;a:4:{s:1:\"a\";i:29;s:1:\"b\";s:13:\"accounts.edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:29;a:4:{s:1:\"a\";i:30;s:1:\"b\";s:19:\"investor-loans.view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:3;}}i:30;a:4:{s:1:\"a\";i:31;s:1:\"b\";s:21:\"investor-loans.create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:3;}}i:31;a:4:{s:1:\"a\";i:32;s:1:\"b\";s:13:\"settings.view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:32;a:4:{s:1:\"a\";i:33;s:1:\"b\";s:13:\"settings.edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:33;a:4:{s:1:\"a\";i:34;s:1:\"b\";s:10:\"roles.view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:34;a:4:{s:1:\"a\";i:35;s:1:\"b\";s:12:\"roles.create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:35;a:4:{s:1:\"a\";i:36;s:1:\"b\";s:10:\"roles.edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:36;a:4:{s:1:\"a\";i:37;s:1:\"b\";s:12:\"roles.delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:37;a:4:{s:1:\"a\";i:38;s:1:\"b\";s:10:\"notes.view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:38;a:4:{s:1:\"a\";i:39;s:1:\"b\";s:12:\"notes.create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:39;a:4:{s:1:\"a\";i:40;s:1:\"b\";s:10:\"notes.edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:40;a:4:{s:1:\"a\";i:41;s:1:\"b\";s:12:\"notes.delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:41;a:4:{s:1:\"a\";i:42;s:1:\"b\";s:15:\"meetings.notify\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:42;a:4:{s:1:\"a\";i:43;s:1:\"b\";s:12:\"outlets.view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:43;a:4:{s:1:\"a\";i:44;s:1:\"b\";s:14:\"outlets.create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:44;a:4:{s:1:\"a\";i:45;s:1:\"b\";s:12:\"outlets.edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:45;a:4:{s:1:\"a\";i:46;s:1:\"b\";s:14:\"outlets.switch\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}}s:5:\"roles\";a:4:{i:0;a:3:{s:1:\"a\";i:1;s:1:\"b\";s:5:\"Admin\";s:1:\"c\";s:3:\"web\";}i:1;a:3:{s:1:\"a\";i:2;s:1:\"b\";s:7:\"Manager\";s:1:\"c\";s:3:\"web\";}i:2;a:3:{s:1:\"a\";i:4;s:1:\"b\";s:11:\"Sales Staff\";s:1:\"c\";s:3:\"web\";}i:3;a:3:{s:1:\"a\";i:3;s:1:\"b\";s:10:\"Accountant\";s:1:\"c\";s:3:\"web\";}}}', 1788499685);

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Gents Item', 'gents-item', 'Laundry items for men', '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(2, 'Ladies Item', 'ladies-item', 'Laundry items for women', '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(3, 'Kids Item', 'kids-item', 'Laundry items for children', '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(4, 'Household Item', 'household-item', 'Household linens and fabrics', '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(5, 'Others Item', 'others-item', 'Everything else', '2026-09-01 00:07:20', '2026-09-01 00:07:20');

-- --------------------------------------------------------

--
-- Table structure for table `clients`
--

CREATE TABLE `clients` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `outlet_id` bigint(20) UNSIGNED DEFAULT NULL,
  `client_uuid` varchar(255) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `type` enum('Consumer','Corporate','B2B') NOT NULL DEFAULT 'Consumer',
  `address` varchar(255) DEFAULT NULL,
  `internal_note` text DEFAULT NULL,
  `total_orders` int(11) NOT NULL DEFAULT 0,
  `total_due` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_paid` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `clients`
--

INSERT INTO `clients` (`id`, `outlet_id`, `client_uuid`, `username`, `password`, `remember_token`, `name`, `phone`, `type`, `address`, `internal_note`, `total_orders`, `total_due`, `total_paid`, `created_at`, `updated_at`) VALUES
(1, 1, 'CLT-0001', NULL, NULL, NULL, 'Sahos Ridoy', '+56225600040', 'Consumer', 'asdf', NULL, 1, 500.00, 0.00, '2026-09-01 00:39:58', '2026-09-01 00:45:14'),
(2, NULL, 'CLT-0002', NULL, NULL, NULL, 'Client New 1', '01952827458', 'Corporate', NULL, NULL, 1, 1417.50, 0.00, '2026-09-01 07:17:57', '2026-09-01 08:19:05'),
(3, NULL, 'CLT-0003', NULL, NULL, NULL, 'Sahos Ridoy', '225600040', 'Corporate', 'asdf', NULL, 1, 30.00, 0.00, '2026-09-02 23:30:25', '2026-09-02 23:30:26');

-- --------------------------------------------------------

--
-- Table structure for table `client_activities`
--

CREATE TABLE `client_activities` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `outlet_id` bigint(20) UNSIGNED DEFAULT NULL,
  `client_id` bigint(20) UNSIGNED NOT NULL,
  `parent_activity_id` bigint(20) UNSIGNED DEFAULT NULL,
  `employee_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `type` enum('meeting','follow_up') NOT NULL,
  `scheduled_at` datetime NOT NULL,
  `note` text DEFAULT NULL,
  `status` enum('pending','done','cancelled') NOT NULL DEFAULT 'pending',
  `next_follow_up_date` date DEFAULT NULL,
  `reminder_minutes` int(10) UNSIGNED DEFAULT NULL,
  `meeting_day_notified_at` timestamp NULL DEFAULT NULL,
  `reminder_notified_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `client_activities`
--

INSERT INTO `client_activities` (`id`, `outlet_id`, `client_id`, `parent_activity_id`, `employee_id`, `created_by`, `type`, `scheduled_at`, `note`, `status`, `next_follow_up_date`, `reminder_minutes`, `meeting_day_notified_at`, `reminder_notified_at`, `created_at`, `updated_at`) VALUES
(1, 1, 1, NULL, NULL, 1, 'meeting', '2026-08-31 06:40:00', NULL, 'pending', NULL, NULL, NULL, NULL, '2026-09-01 00:40:20', '2026-09-01 00:40:20'),
(2, 1, 1, NULL, NULL, 1, 'follow_up', '2026-09-24 06:41:00', NULL, 'pending', NULL, NULL, NULL, NULL, '2026-09-01 00:41:59', '2026-09-01 00:41:59');

-- --------------------------------------------------------

--
-- Table structure for table `company_loans`
--

CREATE TABLE `company_loans` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `lender_name` varchar(255) NOT NULL,
  `initial_loan_amount` decimal(15,2) NOT NULL,
  `current_balance` decimal(15,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `company_loans`
--

INSERT INTO `company_loans` (`id`, `lender_name`, `initial_loan_amount`, `current_balance`, `created_at`, `updated_at`) VALUES
(1, 'BD Loan', 5000.00, 5000.00, '2026-09-01 00:54:10', '2026-09-01 00:54:10');

-- --------------------------------------------------------

--
-- Table structure for table `company_loan_transactions`
--

CREATE TABLE `company_loan_transactions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `outlet_id` bigint(20) UNSIGNED DEFAULT NULL,
  `company_loan_id` bigint(20) UNSIGNED NOT NULL,
  `account_id` bigint(20) UNSIGNED DEFAULT NULL,
  `transaction_type` enum('loan','repay','interest') NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `date` date NOT NULL,
  `note` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `company_loan_transactions`
--

INSERT INTO `company_loan_transactions` (`id`, `outlet_id`, `company_loan_id`, `account_id`, `transaction_type`, `amount`, `date`, `note`, `created_at`, `updated_at`) VALUES
(1, NULL, 1, NULL, 'loan', 5000.00, '2026-09-01', 'Opening loan amount', '2026-09-01 00:54:10', '2026-09-01 00:54:10');

-- --------------------------------------------------------

--
-- Table structure for table `customer_product_prices`
--

CREATE TABLE `customer_product_prices` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `customer_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `custom_price` decimal(15,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customer_product_prices`
--

INSERT INTO `customer_product_prices` (`id`, `customer_id`, `product_id`, `custom_price`, `created_at`, `updated_at`) VALUES
(1, 2, 31, 15.00, '2026-09-01 07:17:57', '2026-09-01 07:17:57'),
(2, 2, 83, 30.00, '2026-09-01 07:17:57', '2026-09-01 07:17:57'),
(3, 3, 5, 30.00, '2026-09-02 23:30:25', '2026-09-02 23:30:25');

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `outlet_id` bigint(20) UNSIGNED DEFAULT NULL,
  `employee_id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `designation` varchar(255) DEFAULT NULL,
  `base_salary` decimal(15,2) NOT NULL,
  `opening_balance` decimal(12,2) NOT NULL DEFAULT 0.00,
  `current_balance` decimal(12,2) NOT NULL DEFAULT 0.00,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employee_transactions`
--

CREATE TABLE `employee_transactions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `employee_id` bigint(20) UNSIGNED NOT NULL,
  `account_id` bigint(20) UNSIGNED NOT NULL,
  `transaction_type` enum('salary','advance','loan','loan_return') NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `date` date NOT NULL,
  `note` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `expenses`
--

CREATE TABLE `expenses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `outlet_id` bigint(20) UNSIGNED DEFAULT NULL,
  `expense_category_id` bigint(20) UNSIGNED NOT NULL,
  `account_id` bigint(20) UNSIGNED DEFAULT NULL,
  `payroll_id` bigint(20) UNSIGNED DEFAULT NULL,
  `asset_id` bigint(20) UNSIGNED DEFAULT NULL,
  `type` enum('general','salary','material','asset') NOT NULL DEFAULT 'general',
  `amount` decimal(15,2) NOT NULL,
  `payment_method` varchar(255) DEFAULT NULL,
  `date` date NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `expense_categories`
--

CREATE TABLE `expense_categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `expense_categories`
--

INSERT INTO `expense_categories` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Material', 'Expenses for raw materials', '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(2, 'Salary', 'Employee salary payments', '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(3, 'Asset Purchase', 'Expenses related to new asset purchases', '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(4, 'Business Transportation', 'Business-related transportation costs', '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(5, 'Delivery Transportation', 'Delivery-related transportation costs', '2026-09-01 00:07:20', '2026-09-01 00:07:20');

-- --------------------------------------------------------

--
-- Table structure for table `expense_materials`
--

CREATE TABLE `expense_materials` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `expense_id` bigint(20) UNSIGNED NOT NULL,
  `material_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` decimal(15,2) NOT NULL,
  `unit_price` decimal(15,2) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `global_settings`
--

CREATE TABLE `global_settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `key` varchar(255) NOT NULL,
  `value` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `global_settings`
--

INSERT INTO `global_settings` (`id`, `key`, `value`, `created_at`, `updated_at`) VALUES
(1, 'material_expense_category_id', '1', '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(2, 'salary_category_id', '2', '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(3, 'asset_purchase_category_id', '3', '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(4, 'business_transportation_category_id', '4', '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(5, 'delivery_transportation_category_id', '5', '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(6, 'business_name', NULL, '2026-09-01 08:15:20', '2026-09-01 08:15:20'),
(7, 'business_address', 'Washpur Garden City, Road No 01, Washpur Dhaka, 1312', '2026-09-01 08:15:20', '2026-09-01 08:15:20'),
(8, 'business_phone', '01707026776', '2026-09-01 08:15:20', '2026-09-01 08:15:20'),
(9, 'business_email', 'info@launverse.com', '2026-09-01 08:15:20', '2026-09-01 08:15:20'),
(10, 'week_start_day', '6', '2026-09-01 08:15:20', '2026-09-01 08:15:20');

-- --------------------------------------------------------

--
-- Table structure for table `investors`
--

CREATE TABLE `investors` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `opening_balance` decimal(15,2) NOT NULL DEFAULT 0.00,
  `current_balance` decimal(15,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `investors`
--

INSERT INTO `investors` (`id`, `name`, `phone`, `opening_balance`, `current_balance`, `created_at`, `updated_at`) VALUES
(1, 'Yeasin Arafat', '01544556677', 60000.00, 70000.00, '2026-09-01 00:49:59', '2026-09-01 00:51:36');

-- --------------------------------------------------------

--
-- Table structure for table `investor_transactions`
--

CREATE TABLE `investor_transactions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `outlet_id` bigint(20) UNSIGNED DEFAULT NULL,
  `investor_id` bigint(20) UNSIGNED NOT NULL,
  `account_id` bigint(20) UNSIGNED DEFAULT NULL,
  `transaction_type` enum('invest','withdraw') NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `date` date NOT NULL,
  `note` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `investor_transactions`
--

INSERT INTO `investor_transactions` (`id`, `outlet_id`, `investor_id`, `account_id`, `transaction_type`, `amount`, `date`, `note`, `created_at`, `updated_at`) VALUES
(1, NULL, 1, NULL, 'invest', 60000.00, '2026-09-01', 'Opening balance', '2026-09-01 00:49:59', '2026-09-01 00:49:59'),
(2, 1, 1, 1, 'invest', 10000.00, '2026-09-01', NULL, '2026-09-01 00:51:36', '2026-09-01 00:51:36');

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `outlet_id` bigint(20) UNSIGNED DEFAULT NULL,
  `invoice_uuid` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `client_id` bigint(20) UNSIGNED NOT NULL,
  `account_id` bigint(20) UNSIGNED DEFAULT NULL,
  `discount_type` enum('Fixed','Percentage') NOT NULL DEFAULT 'Fixed',
  `discount_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `delivery_charge` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL,
  `paid` decimal(10,2) NOT NULL,
  `due` decimal(10,2) NOT NULL,
  `payment_status` enum('Paid','Unpaid') NOT NULL DEFAULT 'Unpaid',
  `payment_date` date DEFAULT NULL,
  `status` enum('In House','Pre Wash','Washing','Extract','Drying','Pressing','Ready','Delivered','Cancelled') NOT NULL,
  `method` varchar(255) NOT NULL,
  `remarks` text DEFAULT NULL,
  `internal_note` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `invoices`
--

INSERT INTO `invoices` (`id`, `outlet_id`, `invoice_uuid`, `date`, `client_id`, `account_id`, `discount_type`, `discount_amount`, `delivery_charge`, `total`, `paid`, `due`, `payment_status`, `payment_date`, `status`, `method`, `remarks`, `internal_note`, `created_at`, `updated_at`) VALUES
(1, 1, 'INV-0001', '2026-09-01', 1, NULL, 'Fixed', 0.00, 0.00, 500.00, 0.00, 500.00, 'Unpaid', NULL, 'In House', '', NULL, NULL, '2026-09-01 00:45:14', '2026-09-01 00:45:14'),
(2, 1, 'INV-0002', '2026-09-01', 2, NULL, 'Percentage', 10.00, 0.00, 1417.50, 0.00, 1417.50, 'Unpaid', NULL, 'In House', '', 'Remark for test', 'our internal notes', '2026-09-01 07:17:59', '2026-09-01 08:19:05'),
(3, 1, 'INV-0003', '2026-09-03', 3, NULL, 'Fixed', 0.00, 0.00, 30.00, 0.00, 30.00, 'Unpaid', NULL, 'In House', '', NULL, NULL, '2026-09-02 23:30:26', '2026-09-02 23:30:26');

-- --------------------------------------------------------

--
-- Table structure for table `invoice_histories`
--

CREATE TABLE `invoice_histories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `invoice_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `changes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`changes`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `invoice_histories`
--

INSERT INTO `invoice_histories` (`id`, `invoice_id`, `user_id`, `action`, `changes`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'created', '{\"fields\":[],\"items\":[]}', '2026-09-01 00:45:14', '2026-09-01 00:45:14'),
(2, 2, 1, 'created', '{\"fields\":[],\"items\":[]}', '2026-09-01 07:17:59', '2026-09-01 07:17:59'),
(3, 2, 1, 'updated', '{\"fields\":[{\"field\":\"remarks\",\"label\":\"Remarks\",\"old\":null,\"new\":\"Remark for test\"},{\"field\":\"internal_note\",\"label\":\"Internal Note\",\"old\":null,\"new\":\"our internal notes\"}],\"items\":[]}', '2026-09-01 07:18:27', '2026-09-01 07:18:27'),
(4, 2, 1, 'updated', '{\"fields\":[{\"field\":\"total\",\"label\":\"Total\",\"old\":1575,\"new\":1417.5},{\"field\":\"due\",\"label\":\"Due\",\"old\":1575,\"new\":1417.5},{\"field\":\"discount_type\",\"label\":\"Discount Type\",\"old\":\"Fixed\",\"new\":\"Percentage\"},{\"field\":\"discount_amount\",\"label\":\"Discount Amount\",\"old\":0,\"new\":10}],\"items\":[]}', '2026-09-01 08:19:05', '2026-09-01 08:19:05'),
(5, 3, 1, 'created', '{\"fields\":[],\"items\":[]}', '2026-09-02 23:30:26', '2026-09-02 23:30:26');

-- --------------------------------------------------------

--
-- Table structure for table `invoice_items`
--

CREATE TABLE `invoice_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `invoice_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `qty` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `invoice_items`
--

INSERT INTO `invoice_items` (`id`, `invoice_id`, `product_id`, `qty`, `price`, `created_at`, `updated_at`) VALUES
(1, 1, 35, 5, 100.00, '2026-09-01 00:45:14', '2026-09-01 00:45:14'),
(6, 2, 31, 5, 15.00, '2026-09-01 08:19:05', '2026-09-01 08:19:05'),
(7, 2, 83, 50, 30.00, '2026-09-01 08:19:05', '2026-09-01 08:19:05'),
(8, 3, 5, 1, 30.00, '2026-09-02 23:30:26', '2026-09-02 23:30:26');

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `materials`
--

CREATE TABLE `materials` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `unit_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_08_25_000001_create_permission_tables', 1),
(5, '2026_08_25_000002_create_units_table', 1),
(6, '2026_08_25_000003_create_categories_table', 1),
(7, '2026_08_25_000004_create_asset_categories_table', 1),
(8, '2026_08_25_000005_create_expense_categories_table', 1),
(9, '2026_08_25_000006_create_global_settings_table', 1),
(10, '2026_08_25_000007_create_accounts_table', 1),
(11, '2026_08_25_000008_create_employees_table', 1),
(12, '2026_08_25_000009_create_clients_table', 1),
(13, '2026_08_25_000010_create_products_table', 1),
(14, '2026_08_25_000011_create_materials_table', 1),
(15, '2026_08_25_000012_create_assets_table', 1),
(16, '2026_08_25_000013_create_invoices_table', 1),
(17, '2026_08_25_000014_create_invoice_items_table', 1),
(18, '2026_08_25_000015_create_customer_product_prices_table', 1),
(19, '2026_08_25_000016_create_payrolls_table', 1),
(20, '2026_08_25_000017_create_account_transactions_table', 1),
(21, '2026_08_25_000018_create_investors_table', 1),
(22, '2026_08_25_000019_create_investor_transactions_table', 1),
(23, '2026_08_25_000020_create_company_loans_table', 1),
(24, '2026_08_25_000021_create_company_loan_transactions_table', 1),
(25, '2026_08_25_000022_create_employee_transactions_table', 1),
(26, '2026_08_25_000023_create_client_activities_table', 1),
(27, '2026_08_25_000024_create_expenses_table', 1),
(28, '2026_08_25_000025_create_expense_materials_table', 1),
(29, '2026_08_25_000027_create_note_categories_table', 1),
(30, '2026_08_25_000028_create_notes_table', 1),
(31, '2026_08_26_062243_create_invoice_histories_table', 1),
(32, '2026_08_26_115520_create_account_transfers_table', 1),
(33, '2026_08_27_090000_add_asset_purchase_category_id_setting', 1),
(34, '2026_08_28_000001_create_notifications_table', 1),
(35, '2026_08_30_000001_create_outlets_table', 1),
(36, '2026_08_30_000002_add_outlet_id_to_users_table', 1),
(37, '2026_08_30_000003_add_outlet_id_to_invoices_table', 1),
(38, '2026_08_30_000004_add_outlet_id_to_expenses_table', 1),
(39, '2026_08_30_000005_add_outlet_id_to_employees_table', 1),
(40, '2026_08_30_000006_add_outlet_id_to_assets_table', 1),
(41, '2026_08_30_000007_add_outlet_id_to_accounts_table', 1),
(42, '2026_08_30_000008_add_outlet_id_to_client_activities_table', 1),
(43, '2026_08_31_000001_add_outlet_id_to_investor_transactions_table', 1),
(44, '2026_08_31_000002_add_outlet_id_to_company_loan_transactions_table', 1),
(45, '2026_09_01_000001_create_outlet_product_prices_table', 1),
(46, '2026_09_03_000001_add_outlet_id_to_clients_table', 2),
(47, '2026_09_03_000002_update_invoices_status_enum_values', 2);

-- --------------------------------------------------------

--
-- Table structure for table `model_has_permissions`
--

CREATE TABLE `model_has_permissions` (
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `model_has_roles`
--

CREATE TABLE `model_has_roles` (
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `model_has_roles`
--

INSERT INTO `model_has_roles` (`role_id`, `model_type`, `model_id`) VALUES
(1, 'App\\Models\\User', 1);

-- --------------------------------------------------------

--
-- Table structure for table `notes`
--

CREATE TABLE `notes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `note_category_id` bigint(20) UNSIGNED DEFAULT NULL,
  `details` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `note_categories`
--

CREATE TABLE `note_categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` char(36) NOT NULL,
  `type` varchar(255) NOT NULL,
  `notifiable_type` varchar(255) NOT NULL,
  `notifiable_id` bigint(20) UNSIGNED NOT NULL,
  `data` text NOT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES
('52280506-b636-4cbb-9cfb-6dae20196c72', 'App\\Notifications\\MeetingActivityNotification', 'App\\Models\\User', 1, '{\"notification_type\":\"meeting_created\",\"activity_id\":2,\"activity_type\":\"follow_up\",\"client_id\":1,\"client_name\":\"Sahos Ridoy\",\"title\":\"Follow-up scheduled\",\"message\":\"New follow-up scheduled with Sahos Ridoy for Sep 24, 2026 at 6:41 AM.\",\"scheduled_at\":\"2026-09-24T06:41\",\"url\":\"http:\\/\\/localhost:8000\\/clients\\/1\"}', NULL, '2026-09-01 00:41:59', '2026-09-01 00:41:59'),
('cdba4e62-332e-44a6-8069-26acf4fb8e75', 'App\\Notifications\\MeetingActivityNotification', 'App\\Models\\User', 1, '{\"notification_type\":\"meeting_created\",\"activity_id\":1,\"activity_type\":\"meeting\",\"client_id\":1,\"client_name\":\"Sahos Ridoy\",\"title\":\"Meeting scheduled\",\"message\":\"New meeting scheduled with Sahos Ridoy for Aug 31, 2026 at 6:40 AM.\",\"scheduled_at\":\"2026-08-31T06:40\",\"url\":\"http:\\/\\/localhost:8000\\/clients\\/1\"}', NULL, '2026-09-01 00:40:20', '2026-09-01 00:40:20');

-- --------------------------------------------------------

--
-- Table structure for table `outlets`
--

CREATE TABLE `outlets` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `outlets`
--

INSERT INTO `outlets` (`id`, `name`, `code`, `address`, `phone`, `email`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Main Outlet', 'MAIN', NULL, NULL, NULL, 'active', '2026-09-01 00:07:19', '2026-09-01 00:07:19'),
(2, 'Uttora', 'UTR', NULL, NULL, NULL, 'active', '2026-09-01 00:38:42', '2026-09-01 00:38:42');

-- --------------------------------------------------------

--
-- Table structure for table `outlet_product_prices`
--

CREATE TABLE `outlet_product_prices` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `outlet_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payrolls`
--

CREATE TABLE `payrolls` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `employee_id` bigint(20) UNSIGNED NOT NULL,
  `expense_id` bigint(20) UNSIGNED DEFAULT NULL,
  `month` tinyint(4) NOT NULL,
  `year` int(11) NOT NULL,
  `base_salary` decimal(15,2) NOT NULL,
  `bonus` decimal(15,2) NOT NULL DEFAULT 0.00,
  `deduction` decimal(15,2) NOT NULL DEFAULT 0.00,
  `net_salary` decimal(15,2) NOT NULL,
  `paid_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `status` enum('pending','partial','completed') NOT NULL DEFAULT 'pending',
  `deduction_note` text DEFAULT NULL,
  `note` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `guard_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `guard_name`, `created_at`, `updated_at`) VALUES
(1, 'clients.view', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19'),
(2, 'clients.create', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19'),
(3, 'clients.edit', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19'),
(4, 'clients.delete', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19'),
(5, 'catalog.view', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19'),
(6, 'catalog.create', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19'),
(7, 'catalog.edit', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19'),
(8, 'catalog.delete', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19'),
(9, 'invoices.view', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19'),
(10, 'invoices.create', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19'),
(11, 'invoices.edit', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19'),
(12, 'invoices.delete', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19'),
(13, 'reports.view', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19'),
(14, 'employees.view', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19'),
(15, 'employees.create', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19'),
(16, 'employees.edit', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19'),
(17, 'employees.delete', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19'),
(18, 'payroll.create', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19'),
(19, 'expenses.view', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19'),
(20, 'expenses.create', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19'),
(21, 'expenses.edit', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19'),
(22, 'expenses.delete', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19'),
(23, 'assets.view', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19'),
(24, 'assets.create', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19'),
(25, 'assets.edit', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19'),
(26, 'assets.delete', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19'),
(27, 'accounts.view', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19'),
(28, 'accounts.create', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19'),
(29, 'accounts.edit', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19'),
(30, 'investor-loans.view', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19'),
(31, 'investor-loans.create', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19'),
(32, 'settings.view', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19'),
(33, 'settings.edit', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19'),
(34, 'roles.view', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19'),
(35, 'roles.create', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19'),
(36, 'roles.edit', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19'),
(37, 'roles.delete', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19'),
(38, 'notes.view', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19'),
(39, 'notes.create', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19'),
(40, 'notes.edit', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19'),
(41, 'notes.delete', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19'),
(42, 'meetings.notify', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19'),
(43, 'outlets.view', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19'),
(44, 'outlets.create', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19'),
(45, 'outlets.edit', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19'),
(46, 'outlets.switch', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `category_id` bigint(20) UNSIGNED NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `category_id`, `image`, `price`, `created_at`, `updated_at`) VALUES
(1, 'Shirt - Gents (শার্ট)', 1, NULL, 15.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(2, 'T-Shirt - Gents (টি-শার্ট)', 1, NULL, 15.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(3, 'Fatua (ফতুয়া)', 1, NULL, 20.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(4, 'Panjabi Cotton (পাঞ্জাবি সুতি)', 1, NULL, 25.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(5, 'Panjabi Cotton With Starch - Gents (পাঞ্জাবি সুতি - মাড় সহ)', 1, NULL, 30.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(6, 'Panjabi Silk - Gents (পাঞ্জাবি সিল্ক)', 1, NULL, 40.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(7, 'Jubba (জুব্বা)', 1, NULL, 30.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(8, 'Pant Formal - Gents (প্যান্ট ফরমাল)', 1, NULL, 15.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(9, 'Jeans Pant (জিন্স প্যান্ট)', 1, NULL, 25.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(10, 'Pajama - Gents (পায়জামা)', 1, NULL, 15.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(11, 'Trouser - Gents (টাউজার)', 1, NULL, 15.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(12, 'Half Pant (হাফ প্যান্ট)', 1, NULL, 15.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(13, 'Lungi With Starch (লুঙ্গি - মাড় সহ)', 1, NULL, 25.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(14, 'Shawl - Gents (শাল)', 1, NULL, 40.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(15, 'Sweater - Gents (সোয়েটার)', 1, NULL, 80.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(16, 'Sherwani Normal - Gents (শেরওয়ানি সাধারণ)', 1, NULL, 170.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(17, 'Sherwani Designer - Gents (শেরওয়ানি ডিজাইনার)', 1, NULL, 250.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(18, 'Blazer / Coat (ব্লেজার / কোট)', 1, NULL, 120.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(19, 'Suit 3 Pcs - Gents (স্যুট ৩ পিস)', 1, NULL, 160.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(20, 'Prince Coat - Gents (প্রিন্স কোট)', 1, NULL, 120.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(21, 'Koti (কটি)', 1, NULL, 80.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(22, 'Tie - Gents (টাই)', 1, NULL, 15.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(23, 'Jacket Fabric - Gents (জ্যাকেট কাপড়)', 1, NULL, 80.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(24, 'Jacket Leather - Gents (জ্যাকেট চামড়া)', 1, NULL, 180.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(25, 'Kameez / Kurti (কামিজ / কুর্তি)', 2, NULL, 30.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(26, '3 Piece Normal (৩ পিস সাধারণ)', 2, NULL, 60.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(27, '3 Piece Designer (৩ পিস ডিজাইনার)', 2, NULL, 150.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(28, 'Orna - Ladies (ওড়না)', 2, NULL, 30.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(29, 'Hijab (হিজাব)', 2, NULL, 20.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(30, 'Scarf (স্কার্ফ)', 2, NULL, 20.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(31, 'Shirt - Ladies (শার্ট)', 2, NULL, 20.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(32, 'Pant Formal - Ladies (প্যান্ট ফরমাল)', 2, NULL, 20.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(33, 'Salwar (সিল্ক/সেলোয়ার)', 2, NULL, 20.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(34, 'Skirt (স্কার্ট)', 2, NULL, 40.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(35, 'Saree Cotton With Starch (শাড়ি সুতি - মাড় সহ)', 2, NULL, 100.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(36, 'Saree Benarasi Katan (শাড়ি বেনারসি কাতান)', 2, NULL, 350.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(37, 'Saree Georgette (শাড়ি জর্জেট)', 2, NULL, 150.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(38, 'Saree Jamdani Cotton (শাড়ি জামদানি সুতি)', 2, NULL, 140.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(39, 'Saree Silk (শাড়ি সিল্ক)', 2, NULL, 160.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(40, 'Lehenga - Ladies (লেহেঙ্গা)', 2, NULL, 350.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(41, 'Gown Normal (গাউন সাধারণ)', 2, NULL, 220.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(42, 'Gown Designer (গাউন ডিজাইনার)', 2, NULL, 300.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(43, 'Blouse (ব্লাউজ)', 2, NULL, 25.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(44, 'Maxi (মেক্সি)', 2, NULL, 35.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(45, 'Petticoat (পেটিকোট)', 2, NULL, 35.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(46, 'Suit 2 Pcs (স্যুট ২ পিস)', 2, NULL, 160.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(47, 'Blazer - Ladies (ব্লেজার)', 2, NULL, 140.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(48, 'Sweater - Ladies (সোয়েটার)', 2, NULL, 80.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(49, 'Shawl - Ladies (শাল)', 2, NULL, 40.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(50, 'Burqa (বোরকা)', 2, NULL, 60.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(51, 'Abaya (আবায়া)', 2, NULL, 60.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(52, 'Shirt - Kids (শার্ট)', 3, NULL, 15.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(53, 'T-Shirt - Kids (টি-শার্ট)', 3, NULL, 15.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(54, 'Panjabi Cotton With Starch - Kids (পাঞ্জাবি সুতি - মাড় সহ)', 3, NULL, 25.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(55, 'Panjabi Silk - Kids (পাঞ্জাবি সিল্ক)', 3, NULL, 30.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(56, 'Pant (প্যান্ট)', 3, NULL, 15.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(57, 'Pajama - Kids (পায়জামা)', 3, NULL, 15.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(58, 'Trouser - Kids (টাউজার)', 3, NULL, 15.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(59, 'Kameez 2 Pcs (কামিজ ২ পিস)', 3, NULL, 40.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(60, 'Kameez 3 Pcs (কামিজ ৩ পিস)', 3, NULL, 60.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(61, 'Frock Heavy (ফ্রক - ভারী)', 3, NULL, 120.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(62, 'Orna - Kids (ওড়না)', 3, NULL, 25.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(63, 'Lehenga - Kids (লেহেঙ্গা)', 3, NULL, 300.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(64, 'School Dress (স্কুল ড্রেস)', 3, NULL, 60.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(65, 'Suit 3 Pcs - Kids (স্যুট ৩ পিস)', 3, NULL, 160.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(66, 'Blazer - Kids (ব্লেজার)', 3, NULL, 100.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(67, 'Jacket Fabric - Kids (জ্যাকেট কাপড়)', 3, NULL, 60.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(68, 'Jacket Leather - Kids (জ্যাকেট চামড়া)', 3, NULL, 120.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(69, 'Jacket Wool (জ্যাকেট উল)', 3, NULL, 80.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(70, 'Sherwani Normal - Kids (শেরওয়ানি সাধারণ)', 3, NULL, 150.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(71, 'Sherwani Designer - Kids (শেরওয়ানি ডিজাইনার)', 3, NULL, 220.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(72, 'Prince Coat - Kids (প্রিন্স কোট)', 3, NULL, 80.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(73, 'Tie - Kids (টাই)', 3, NULL, 15.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(74, 'Baby Blanket (বেবি কম্বল)', 3, NULL, 100.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(75, 'Curtain Small (পর্দা ছোট)', 4, NULL, 50.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(76, 'Curtain Large (পর্দা বড়)', 4, NULL, 70.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(77, 'Curtain Small Heavy (পর্দা ছোট - ভারী)', 4, NULL, 70.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(78, 'Curtain Large Heavy (পর্দা বড় - ভারী)', 4, NULL, 90.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(79, 'Sofa Cover Small (সোফা কাভার ছোট)', 4, NULL, 30.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(80, 'Sofa Cover Large (সোফা কাভার বড়)', 4, NULL, 50.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(81, 'TV Cover (টিভি কাভার)', 4, NULL, 30.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(82, 'Table Cloth Small (টেবিল ক্লথ ছোট)', 4, NULL, 30.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(83, 'Table Cloth Large (টেবিল ক্লথ বড়)', 4, NULL, 50.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(84, 'Chair Cover (চেয়ার কাভার)', 4, NULL, 25.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(85, 'Bed Sheet Small (বেড শিট ছোট)', 4, NULL, 30.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(86, 'Bed Sheet Large (বেড শিট বড়)', 4, NULL, 50.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(87, 'Bed Cover Small (বেড কাভার ছোট)', 4, NULL, 40.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(88, 'Bed Cover Large (বেড কাভার বড়)', 4, NULL, 60.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(89, 'Pillow Cover (বালিশ কাভার)', 4, NULL, 20.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(90, 'Quilt Cover Small (লেপের কাভার ছোট)', 4, NULL, 60.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(91, 'Quilt Cover Large (লেপের কাভার বড়)', 4, NULL, 80.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(92, 'Kantha Small (কাঁথা ছোট)', 4, NULL, 80.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(93, 'Kantha Large (কাঁথা বড়)', 4, NULL, 120.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(94, 'Blanket Small (কম্বল ছোট)', 4, NULL, 120.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(95, 'Blanket Large (কম্বল বড়)', 4, NULL, 150.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(96, 'Comforter Small (কমফোর্টার ছোট)', 4, NULL, 120.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(97, 'Comforter Large (কমফোর্টার বড়)', 4, NULL, 150.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(98, 'Janamaz (জায়নামাজ)', 4, NULL, 40.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(99, 'Towel (টাওয়েল)', 4, NULL, 40.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(100, 'Doll Small (পুতুল ছোট)', 5, NULL, 100.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(101, 'Doll Medium (পুতুল মাঝারি)', 5, NULL, 300.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(102, 'Doll Large (পুতুল বড়)', 5, NULL, 500.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(103, 'Backpack (পিঠের ব্যাগ)', 5, NULL, 200.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(104, 'Carry Bag (কেরি ব্যাগ)', 5, NULL, 250.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(105, 'Sneakers (স্নিকার্স)', 5, NULL, 150.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(106, 'Ladies Handbag (লেডিস হ্যান্ড ব্যাগ)', 5, NULL, 200.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(107, 'Car Seat Cover Small (কার সিট কাভার ছোট)', 5, NULL, 80.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(108, 'Car Seat Cover Large (কার সিট কাভার বড়)', 5, NULL, 150.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(109, 'Carpet - Per SqFt (কার্পেট - স্কয়ার ফিট)', 5, NULL, 15.00, '2026-09-01 00:07:20', '2026-09-01 00:07:20');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `guard_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `guard_name`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19'),
(2, 'Manager', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19'),
(3, 'Accountant', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19'),
(4, 'Sales Staff', 'web', '2026-09-01 00:07:19', '2026-09-01 00:07:19');

-- --------------------------------------------------------

--
-- Table structure for table `role_has_permissions`
--

CREATE TABLE `role_has_permissions` (
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `role_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role_has_permissions`
--

INSERT INTO `role_has_permissions` (`permission_id`, `role_id`) VALUES
(1, 1),
(1, 2),
(1, 4),
(2, 1),
(2, 2),
(2, 4),
(3, 1),
(3, 2),
(3, 4),
(4, 1),
(4, 2),
(5, 1),
(5, 2),
(6, 1),
(6, 2),
(7, 1),
(7, 2),
(8, 1),
(8, 2),
(9, 1),
(9, 2),
(9, 4),
(10, 1),
(10, 2),
(10, 4),
(11, 1),
(11, 2),
(11, 4),
(12, 1),
(12, 2),
(13, 1),
(13, 2),
(13, 3),
(14, 1),
(14, 2),
(14, 3),
(15, 1),
(15, 2),
(16, 1),
(16, 2),
(17, 1),
(17, 2),
(18, 1),
(18, 3),
(19, 1),
(19, 3),
(20, 1),
(20, 3),
(21, 1),
(21, 3),
(22, 1),
(22, 3),
(23, 1),
(23, 2),
(24, 1),
(24, 2),
(25, 1),
(25, 2),
(26, 1),
(26, 2),
(27, 1),
(27, 3),
(28, 1),
(28, 3),
(29, 1),
(30, 1),
(30, 3),
(31, 1),
(31, 3),
(32, 1),
(33, 1),
(34, 1),
(35, 1),
(36, 1),
(37, 1),
(38, 1),
(38, 2),
(39, 1),
(39, 2),
(40, 1),
(40, 2),
(41, 1),
(41, 2),
(42, 1),
(43, 1),
(44, 1),
(45, 1),
(46, 1);

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('gFEz381TiIKnJYiob8oY9nmF2JDAaTRs7toTq8rV', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiaFJhQ21Sbm1KSXdLZnpBWW5wRW44NENlQTlMd0dmcFBNd3BQTGZpUSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NjQ6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9jbGllbnRzP3Blcl9wYWdlPTUwJnNvcnQ9Y3JlYXRlZF9hdCUzQWRlc2MiO3M6NToicm91dGUiO3M6MTM6ImNsaWVudHMuaW5kZXgiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX1zOjUwOiJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI7aToxO30=', 1788419122);

-- --------------------------------------------------------

--
-- Table structure for table `units`
--

CREATE TABLE `units` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `short_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `units`
--

INSERT INTO `units` (`id`, `name`, `short_name`, `created_at`, `updated_at`) VALUES
(1, 'Pieces', 'pcs', '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(2, 'Kilogram', 'kg', '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(3, 'Liter', 'ltr', '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(4, 'Box', 'box', '2026-09-01 00:07:20', '2026-09-01 00:07:20'),
(5, 'Packet', 'pkt', '2026-09-01 00:07:20', '2026-09-01 00:07:20');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `outlet_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `outlet_id`, `name`, `email`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, NULL, 'Admin User', 'admin@example.com', NULL, '$2y$12$bZBy5igNVzwDGk51D43B0u9NkEDozoBEOreiy7mHkPI4DSSRuaEvy', NULL, '2026-09-01 00:07:20', '2026-09-01 00:07:20');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `accounts`
--
ALTER TABLE `accounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `accounts_account_number_unique` (`account_number`),
  ADD KEY `accounts_outlet_id_foreign` (`outlet_id`);

--
-- Indexes for table `account_transactions`
--
ALTER TABLE `account_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `account_transactions_account_id_foreign` (`account_id`);

--
-- Indexes for table `account_transfers`
--
ALTER TABLE `account_transfers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `account_transfers_from_account_id_foreign` (`from_account_id`),
  ADD KEY `account_transfers_to_account_id_foreign` (`to_account_id`),
  ADD KEY `account_transfers_user_id_foreign` (`user_id`);

--
-- Indexes for table `assets`
--
ALTER TABLE `assets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `assets_asset_category_id_foreign` (`asset_category_id`),
  ADD KEY `assets_outlet_id_foreign` (`outlet_id`);

--
-- Indexes for table `asset_categories`
--
ALTER TABLE `asset_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `asset_categories_name_unique` (`name`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `categories_name_unique` (`name`),
  ADD UNIQUE KEY `categories_slug_unique` (`slug`);

--
-- Indexes for table `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `clients_client_uuid_unique` (`client_uuid`),
  ADD UNIQUE KEY `clients_username_unique` (`username`),
  ADD KEY `clients_outlet_id_foreign` (`outlet_id`);

--
-- Indexes for table `client_activities`
--
ALTER TABLE `client_activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `client_activities_client_id_foreign` (`client_id`),
  ADD KEY `client_activities_employee_id_foreign` (`employee_id`),
  ADD KEY `client_activities_created_by_foreign` (`created_by`),
  ADD KEY `client_activities_parent_activity_id_foreign` (`parent_activity_id`),
  ADD KEY `client_activities_outlet_id_foreign` (`outlet_id`);

--
-- Indexes for table `company_loans`
--
ALTER TABLE `company_loans`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `company_loan_transactions`
--
ALTER TABLE `company_loan_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `company_loan_transactions_company_loan_id_foreign` (`company_loan_id`),
  ADD KEY `company_loan_transactions_account_id_foreign` (`account_id`),
  ADD KEY `company_loan_transactions_outlet_id_foreign` (`outlet_id`);

--
-- Indexes for table `customer_product_prices`
--
ALTER TABLE `customer_product_prices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_product_prices_customer_id_foreign` (`customer_id`),
  ADD KEY `customer_product_prices_product_id_foreign` (`product_id`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `employees_employee_id_unique` (`employee_id`),
  ADD KEY `employees_outlet_id_foreign` (`outlet_id`);

--
-- Indexes for table `employee_transactions`
--
ALTER TABLE `employee_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_transactions_employee_id_foreign` (`employee_id`),
  ADD KEY `employee_transactions_account_id_foreign` (`account_id`);

--
-- Indexes for table `expenses`
--
ALTER TABLE `expenses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `expenses_expense_category_id_foreign` (`expense_category_id`),
  ADD KEY `expenses_account_id_foreign` (`account_id`),
  ADD KEY `expenses_payroll_id_foreign` (`payroll_id`),
  ADD KEY `expenses_asset_id_foreign` (`asset_id`),
  ADD KEY `expenses_outlet_id_foreign` (`outlet_id`);

--
-- Indexes for table `expense_categories`
--
ALTER TABLE `expense_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `expense_categories_name_unique` (`name`);

--
-- Indexes for table `expense_materials`
--
ALTER TABLE `expense_materials`
  ADD PRIMARY KEY (`id`),
  ADD KEY `expense_materials_expense_id_foreign` (`expense_id`),
  ADD KEY `expense_materials_material_id_foreign` (`material_id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `global_settings`
--
ALTER TABLE `global_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `global_settings_key_unique` (`key`);

--
-- Indexes for table `investors`
--
ALTER TABLE `investors`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `investor_transactions`
--
ALTER TABLE `investor_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `investor_transactions_investor_id_foreign` (`investor_id`),
  ADD KEY `investor_transactions_account_id_foreign` (`account_id`),
  ADD KEY `investor_transactions_outlet_id_foreign` (`outlet_id`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoices_invoice_uuid_unique` (`invoice_uuid`),
  ADD KEY `invoices_client_id_foreign` (`client_id`),
  ADD KEY `invoices_account_id_foreign` (`account_id`),
  ADD KEY `invoices_outlet_id_foreign` (`outlet_id`);

--
-- Indexes for table `invoice_histories`
--
ALTER TABLE `invoice_histories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `invoice_histories_invoice_id_foreign` (`invoice_id`),
  ADD KEY `invoice_histories_user_id_foreign` (`user_id`);

--
-- Indexes for table `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `invoice_items_invoice_id_foreign` (`invoice_id`),
  ADD KEY `invoice_items_product_id_foreign` (`product_id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `materials`
--
ALTER TABLE `materials`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `materials_name_unique` (`name`),
  ADD KEY `materials_unit_id_foreign` (`unit_id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`model_id`,`model_type`),
  ADD KEY `model_has_permissions_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Indexes for table `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD PRIMARY KEY (`role_id`,`model_id`,`model_type`),
  ADD KEY `model_has_roles_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Indexes for table `notes`
--
ALTER TABLE `notes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notes_note_category_id_foreign` (`note_category_id`);

--
-- Indexes for table `note_categories`
--
ALTER TABLE `note_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `note_categories_name_unique` (`name`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_notifiable_type_notifiable_id_index` (`notifiable_type`,`notifiable_id`);

--
-- Indexes for table `outlets`
--
ALTER TABLE `outlets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `outlets_code_unique` (`code`);

--
-- Indexes for table `outlet_product_prices`
--
ALTER TABLE `outlet_product_prices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `outlet_product_prices_outlet_id_product_id_unique` (`outlet_id`,`product_id`),
  ADD KEY `outlet_product_prices_product_id_foreign` (`product_id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `payrolls`
--
ALTER TABLE `payrolls`
  ADD PRIMARY KEY (`id`),
  ADD KEY `payrolls_employee_id_foreign` (`employee_id`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permissions_name_guard_name_unique` (`name`,`guard_name`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `products_name_unique` (`name`),
  ADD KEY `products_category_id_foreign` (`category_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_name_guard_name_unique` (`name`,`guard_name`);

--
-- Indexes for table `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`role_id`),
  ADD KEY `role_has_permissions_role_id_foreign` (`role_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `units`
--
ALTER TABLE `units`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD KEY `users_outlet_id_foreign` (`outlet_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `accounts`
--
ALTER TABLE `accounts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `account_transactions`
--
ALTER TABLE `account_transactions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `account_transfers`
--
ALTER TABLE `account_transfers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `assets`
--
ALTER TABLE `assets`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `asset_categories`
--
ALTER TABLE `asset_categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `clients`
--
ALTER TABLE `clients`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `client_activities`
--
ALTER TABLE `client_activities`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `company_loans`
--
ALTER TABLE `company_loans`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `company_loan_transactions`
--
ALTER TABLE `company_loan_transactions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `customer_product_prices`
--
ALTER TABLE `customer_product_prices`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employee_transactions`
--
ALTER TABLE `employee_transactions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `expenses`
--
ALTER TABLE `expenses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `expense_categories`
--
ALTER TABLE `expense_categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `expense_materials`
--
ALTER TABLE `expense_materials`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `global_settings`
--
ALTER TABLE `global_settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `investors`
--
ALTER TABLE `investors`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `investor_transactions`
--
ALTER TABLE `investor_transactions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `invoices`
--
ALTER TABLE `invoices`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `invoice_histories`
--
ALTER TABLE `invoice_histories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `invoice_items`
--
ALTER TABLE `invoice_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `materials`
--
ALTER TABLE `materials`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT for table `notes`
--
ALTER TABLE `notes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `note_categories`
--
ALTER TABLE `note_categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `outlets`
--
ALTER TABLE `outlets`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `outlet_product_prices`
--
ALTER TABLE `outlet_product_prices`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payrolls`
--
ALTER TABLE `payrolls`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=110;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `units`
--
ALTER TABLE `units`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `accounts`
--
ALTER TABLE `accounts`
  ADD CONSTRAINT `accounts_outlet_id_foreign` FOREIGN KEY (`outlet_id`) REFERENCES `outlets` (`id`);

--
-- Constraints for table `account_transactions`
--
ALTER TABLE `account_transactions`
  ADD CONSTRAINT `account_transactions_account_id_foreign` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`);

--
-- Constraints for table `account_transfers`
--
ALTER TABLE `account_transfers`
  ADD CONSTRAINT `account_transfers_from_account_id_foreign` FOREIGN KEY (`from_account_id`) REFERENCES `accounts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `account_transfers_to_account_id_foreign` FOREIGN KEY (`to_account_id`) REFERENCES `accounts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `account_transfers_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `assets`
--
ALTER TABLE `assets`
  ADD CONSTRAINT `assets_asset_category_id_foreign` FOREIGN KEY (`asset_category_id`) REFERENCES `asset_categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `assets_outlet_id_foreign` FOREIGN KEY (`outlet_id`) REFERENCES `outlets` (`id`);

--
-- Constraints for table `clients`
--
ALTER TABLE `clients`
  ADD CONSTRAINT `clients_outlet_id_foreign` FOREIGN KEY (`outlet_id`) REFERENCES `outlets` (`id`);

--
-- Constraints for table `client_activities`
--
ALTER TABLE `client_activities`
  ADD CONSTRAINT `client_activities_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `client_activities_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `client_activities_employee_id_foreign` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `client_activities_outlet_id_foreign` FOREIGN KEY (`outlet_id`) REFERENCES `outlets` (`id`),
  ADD CONSTRAINT `client_activities_parent_activity_id_foreign` FOREIGN KEY (`parent_activity_id`) REFERENCES `client_activities` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `company_loan_transactions`
--
ALTER TABLE `company_loan_transactions`
  ADD CONSTRAINT `company_loan_transactions_account_id_foreign` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`),
  ADD CONSTRAINT `company_loan_transactions_company_loan_id_foreign` FOREIGN KEY (`company_loan_id`) REFERENCES `company_loans` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `company_loan_transactions_outlet_id_foreign` FOREIGN KEY (`outlet_id`) REFERENCES `outlets` (`id`);

--
-- Constraints for table `customer_product_prices`
--
ALTER TABLE `customer_product_prices`
  ADD CONSTRAINT `customer_product_prices_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `customer_product_prices_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `employees`
--
ALTER TABLE `employees`
  ADD CONSTRAINT `employees_outlet_id_foreign` FOREIGN KEY (`outlet_id`) REFERENCES `outlets` (`id`);

--
-- Constraints for table `employee_transactions`
--
ALTER TABLE `employee_transactions`
  ADD CONSTRAINT `employee_transactions_account_id_foreign` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`),
  ADD CONSTRAINT `employee_transactions_employee_id_foreign` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `expenses`
--
ALTER TABLE `expenses`
  ADD CONSTRAINT `expenses_account_id_foreign` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`),
  ADD CONSTRAINT `expenses_asset_id_foreign` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `expenses_expense_category_id_foreign` FOREIGN KEY (`expense_category_id`) REFERENCES `expense_categories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `expenses_outlet_id_foreign` FOREIGN KEY (`outlet_id`) REFERENCES `outlets` (`id`),
  ADD CONSTRAINT `expenses_payroll_id_foreign` FOREIGN KEY (`payroll_id`) REFERENCES `payrolls` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `expense_materials`
--
ALTER TABLE `expense_materials`
  ADD CONSTRAINT `expense_materials_expense_id_foreign` FOREIGN KEY (`expense_id`) REFERENCES `expenses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `expense_materials_material_id_foreign` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `investor_transactions`
--
ALTER TABLE `investor_transactions`
  ADD CONSTRAINT `investor_transactions_account_id_foreign` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`),
  ADD CONSTRAINT `investor_transactions_investor_id_foreign` FOREIGN KEY (`investor_id`) REFERENCES `investors` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `investor_transactions_outlet_id_foreign` FOREIGN KEY (`outlet_id`) REFERENCES `outlets` (`id`);

--
-- Constraints for table `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `invoices_account_id_foreign` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `invoices_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `invoices_outlet_id_foreign` FOREIGN KEY (`outlet_id`) REFERENCES `outlets` (`id`);

--
-- Constraints for table `invoice_histories`
--
ALTER TABLE `invoice_histories`
  ADD CONSTRAINT `invoice_histories_invoice_id_foreign` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `invoice_histories_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD CONSTRAINT `invoice_items_invoice_id_foreign` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `invoice_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `materials`
--
ALTER TABLE `materials`
  ADD CONSTRAINT `materials_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD CONSTRAINT `model_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD CONSTRAINT `model_has_roles_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notes`
--
ALTER TABLE `notes`
  ADD CONSTRAINT `notes_note_category_id_foreign` FOREIGN KEY (`note_category_id`) REFERENCES `note_categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `outlet_product_prices`
--
ALTER TABLE `outlet_product_prices`
  ADD CONSTRAINT `outlet_product_prices_outlet_id_foreign` FOREIGN KEY (`outlet_id`) REFERENCES `outlets` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `outlet_product_prices_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payrolls`
--
ALTER TABLE `payrolls`
  ADD CONSTRAINT `payrolls_employee_id_foreign` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD CONSTRAINT `role_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_has_permissions_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_outlet_id_foreign` FOREIGN KEY (`outlet_id`) REFERENCES `outlets` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
