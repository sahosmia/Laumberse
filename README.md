# Shop & Client Management System

An advanced, production-ready, enterprise-grade Shop & Client Management application. This system streamlines client relations, handles corporate pricing structures, automates payroll and material expenses, and handles complex invoicing.

---

## 🛠 Tech Stack Overview

The application is built on a modern, high-performance tech stack using a **Modular Monolith** architecture:

- **Backend:** [Laravel 12 (Latest)](https://laravel.com/) with Strict Type Hinting, dedicated Form Request validation, Service Layer isolation, and Eloquent Database relationships.
- **Frontend:** [React 19](https://react.dev/) integrated via [Inertia.js](https://inertiajs.com/) to form a seamless, single-page-application (SPA) experience with complete server-driven state.
- **TypeScript (Strict Mode):** Type-safe interfaces/types mapping all backend database models and Inertia props to frontend state.
- **Styling & Design System:** [Tailwind CSS v4](https://tailwindcss.com/) using a mobile-first, fully responsive design system, incorporating customized high-accessibility interactive hit targets.

---

## 🚀 Key System Features

1. **Client & Pricing Matrix Management:**
   - Supports two client types: **Consumers** (utilizing standard base pricing) and **Corporate Clients** (using custom customer-product pricing matrices).
   - Dynamic invoice rendering that automatically switches price priorities when corporate accounts are selected.
   - Dynamic, client-modal inline customization of the pricing matrix with `SearchableSelect` components.

2. **Unified Expense & Auxiliary Flow:**
   - Categorized transactions linked with auxiliary schemas (`expense_materials`, `expense_salaries`, `expense_assets`).
   - Automated asset-purchase expense generation and synchronization on cost/date updates.
   - Centralized financial operations inside `ExpenseService` wrapped in atomic database transactions.

3. **Intelligent Payroll Management:**
   - Month-aware and year-aware payroll generation.
   - Dynamic eligible employee fetching that excludes fully compensated employees for the chosen period.
   - Formula-driven salary calculation: `Net Salary = Base Salary + Bonus - Deduction`, with mandatory deduction notes when deductions are applied.

---

## 📋 Prerequisites

Before installing, ensure your environment meets these requirements:

- **PHP:** `^8.2` (with SQLite/MySQL, BCMath, and GD extensions enabled)
- **Composer:** `^2.6`
- **Node.js:** `^20.0` or `^22.0` (LTS recommended)
- **NPM:** `^10.0`
- **Database:** SQLite (default for development) or MySQL

---

## ⚙️ Installation & Setup Instructions

Follow these step-by-step commands to get the application running locally:

### 1. Clone the Repository & Copy Environment Files
```bash
cp .env.example .env
```

### 2. Install PHP Dependencies
```bash
composer install --no-interaction --prefer-dist --optimize-autoloader
```

### 3. Generate Application Key
```bash
php artisan key:generate
```

### 4. Setup SQLite Database
Create an empty database file for SQLite:
```bash
touch database/database.sqlite
```

### 5. Run Migrations & Seeders
Run all database migrations and populate the database with default categories, settings, assets, and users:
```bash
php artisan migrate:fresh --seed
```

### 6. Create Storage Link
Link public files to system storage for handling product images:
```bash
php artisan storage:link
```

### 7. Install & Build Frontend Dependencies
Install NPM packages and build production assets:
```bash
npm install
npm run build
```

---

## 📂 Project Folder Structure

An overview of the application architecture, highlighting the clean division between backend resources and front-end components:

```
├── app/
│   ├── Http/
│   │   ├── Controllers/             # Slim, resource-focused Controllers
│   │   └── Requests/                # Strict, dedicated Form Requests
│   │       ├── Clients/
│   │       ├── Employees/           # e.g., StoreEmployeeRequest, GetEligibleForPayrollRequest
│   │       ├── Invoices/            # e.g., StoreInvoiceRequest, UpdateInvoiceStatusRequest
│   │       ├── Materials/
│   │       └── Settings/            # e.g., UpdatePasswordRequest, UpdateGlobalSettingsRequest
│   ├── Models/                      # Eloquent models (Client, Product, Employee, Invoice, Expense, etc.)
│   └── Services/                    # Encapsulated Domain Logic (InvoiceService, ExpenseService)
│
├── bootstrap/
├── config/
├── database/
│   ├── migrations/                  # Schema blueprints & SQLite-safe dropping constraints
│   └── seeders/                     # Initial seeders (AssetCategorySeeder, ManageAssetSeeder, etc.)
│
├── resources/
│   ├── js/
│   │   ├── components/
│   │   │   ├── ui/                  # Reusable low-level Atomic UI Components
│   │   │   │   ├── form-input.tsx             # Custom Accessible Form Inputs
│   │   │   │   ├── form-label.tsx             # Form Labels with Required indicator
│   │   │   │   ├── form-error.tsx             # Smooth red inline form errors
│   │   │   │   └── form-button.tsx            # Standard Touch target Buttons with icons & loading
│   │   │   └── invoice-form.tsx     # Complex stateful multi-item invoice builder
│   │   ├── layouts/                 # Application wrapper (Sidebar & Navbar)
│   │   ├── pages/                   # InertiaJS SPA Views
│   │   │   ├── clients/
│   │   │   ├── employees/           # staff view refactored with Reusable UI Components
│   │   │   ├── expenses/
│   │   │   ├── invoices/            # history, edit, print, show, create pages
│   │   │   ├── settings/            # profile, password, global Settings refactored
│   │   │   └── units/               # unit management view refactored
│   │   └── types/                   # Deeply typed TypeScript models (index.ts)
│   └── views/                       # Blade views (root app.blade.php & PDF invoice template)
│
├── routes/
│   └── web.php                      # Application routes grouped by middleware
└── tests/                           # Feature & Unit test suites
```

---

## 🎨 Code Standards & Architecture Notes

### 1. Unified Form UI System
All form-based views (such as `Units`, `Employees`, `Global Settings`, `Password Settings`, and `Profile Settings`) are built using a unified, responsive design system. Low-level components are located under `resources/js/components/ui/` and consist of:
- **`FormInput`**: Supports labels, standard text/number/email/password inputs, customized red error indicators, helper texts, and accessibility-compliant auto-linking IDs.
- **`FormLabel`**: Standardized labeling with an optional `required` asterisk indicator.
- **`FormError`**: Renders clear validation errors inline with smooth transitions.
- **`FormButton`**: Handles primary, secondary, and ghost variants. Promotes a **minimum touch target height of 48px (`h-12`)** on small mobile viewports, automatically scaling to 40px (`h-10`) on large desktop displays.

### 2. Strict Backend Form Request Validations
To prevent controllers from becoming bloated, all incoming HTTP payloads are validated inside isolated **Form Request** classes (`app/Http/Requests`). They enforce strict rules:
- Controllers **only** utilize `$request->validated()` to retrieve fully sanitized data.
- Enforces numeric range validation, database entity existence (e.g. `exists`), specific string lengths, and nullable conditional parameters.

### 3. Type Safety
Implicit and explicit `any` types have been aggressively eliminated. The frontend relies exclusively on rich, descriptive TypeScript interfaces located inside `resources/js/types/index.ts`, assuring end-to-end type safety from Laravel models to React components.

---

## 🧪 Testing

To run the complete Feature and Unit test suite, execute:
```bash
php artisan test
```
The test suite validates that all controllers, models, and service classes behave correctly and verify that new validations and payroll/pricing computations work securely.
