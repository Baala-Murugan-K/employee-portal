# 🏢 Custom Employee Portal with Zoho One Integration & RBAC

> A web-based enterprise employee portal featuring built-in authentication, fine-grained Role-Based Access Control (RBAC), and secure backend integration with Zoho One APIs. Employees never need individual Zoho credentials; all Zoho OAuth operations are handled by a single backend service account.

---

## 🌟 Key Highlights

- **🔒 True Role-Based Access Control (RBAC)**: Enforces role permissions at the database, JWT middleware, backend API proxy, and frontend navigation layers.
- **🛡️ Single Service Account Zoho OAuth**: Backend automatically manages, caches, and refreshes Zoho OAuth tokens. Zero Zoho credentials or usernames are ever entered or seen by employees.
- **🎯 Role-to-Application Dynamic Filtering**:
  - **HR** $\rightarrow$ **Zoho People** (Employee directory, leave requests, attendance metrics)
  - **Sales** $\rightarrow$ **Zoho CRM** (Leads, contacts, deals pipeline, win rates)
  - **Support** $\rightarrow$ **Zoho Desk** (Customer tickets, priority SLAs, resolution tracking)
  - **Finance** $\rightarrow$ **Zoho Books** (Invoices, payments, expense records, revenue totals)
  - **Admin** $\rightarrow$ **Full Unrestricted Access** across all Zoho services + User Management & Security Audit Logs
- **📜 Immutable Audit Logging**: Automatically records logins, logouts, Zoho API proxy access, and unauthorized 403 access attempts with user IP, role, and timestamp.
- **⚡ Hybrid Live / Demo Mode**: Runs instantly out of the box with high-fidelity simulated Zoho records, and seamlessly switches to live Zoho APIs the moment you paste your Zoho API credentials into `backend/.env`.
- **🧪 100% Passing Automated RBAC Test Suite**: Verifies JWT issuance, role isolation, and security event logging.

---

## 🏗️ Architecture & Security Flow

```
┌────────────────────────────────────────────────────────┐
│             React / Vite Frontend Portal               │
│  - Conditional dashboard rendering based on role       │
│  - One-click demo role switcher for easy evaluation   │
└──────────────────────────┬─────────────────────────────┘
                           │ (Bearer JWT on every request)
                           ▼
┌────────────────────────────────────────────────────────┐
│             Node.js / Express.js Backend               │
│  1. verifyToken middleware (Authenticates JWT)         │
│  2. verifyRole middleware (Enforces RBAC)              │
│  3. auditService (Records access & security events)    │
└──────────────────────────┬─────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
┌───────────────────────────┐ ┌──────────────────────────┐
│   Relational Database     │ │ Zoho One Service Account │
│ - Users                   │ │ - OAuth Refresh Token    │
│ - Roles & Permissions     │ │ - Cached Access Token    │
│ - UserRoles & Junctions   │ │ - Direct API Proxy       │
│ - AuditLogs               │ │   (People, CRM, Desk,    │
└───────────────────────────┘ │    Books)                │
                              └──────────────────────────┘
```

---

## 👥 Role & Zoho Application Matrix

| Role | Permitted Zoho Application | Accessible APIs / Scope | Admin Panel Access |
| :--- | :--- | :--- | :---: |
| **Admin** | **All Integrated Services** | People, CRM, Desk, Books + Full System Controls | ✅ Yes |
| **HR** | **Zoho People** | Employee records, leave requests, attendance | ❌ No |
| **Sales** | **Zoho CRM** | Customer leads, pipeline deals, account value | ❌ No |
| **Support** | **Zoho Desk** | Support tickets, customer SLAs, issue statuses | ❌ No |
| **Finance** | **Zoho Books** | Invoices, expenses, payment statuses | ❌ No |
| **Manager** | **Zoho People & CRM** | Team directory and departmental sales stats | ❌ No |

---

## 🔑 Pre-Seeded Demo Accounts

For fast evaluation and video presentations, the login screen provides **one-click quick login buttons** alongside standard credentials:

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| 👑 **Admin** | `admin@portal.com` | `admin123` | Full portal access, all 4 Zoho apps, User CRUD, Audit logs |
| 👥 **HR** | `hr@portal.com` | `hr123` | Zoho People exclusively; CRM, Desk, Books are hidden & blocked |
| 💼 **Sales** | `sales@portal.com` | `sales123` | Zoho CRM exclusively; Books, People, Desk are hidden & blocked |
| 🎧 **Support** | `support@portal.com` | `support123` | Zoho Desk exclusively; other applications hidden & blocked |
| 📊 **Finance** | `finance@portal.com` | `finance123` | Zoho Books exclusively; other applications hidden & blocked |

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- **Node.js**: v18 or higher (v20+ recommended)
- **npm**: v9 or higher

### 1. Clone & Install
```bash
# Clone repository
git clone <repository-url>
cd custom-employee-portal

# Install all dependencies (backend and frontend)
npm run install:all
```

### 2. Environment Configuration
The backend comes pre-configured with a working SQLite configuration:
```bash
# Copy template if not already present
cp backend/.env.example backend/.env
```

Your `backend/.env` will look like this:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=super_secret_jwt_key_zoho_custom_portal_2026_!@#
JWT_EXPIRES_IN=8h

# Relational Database (SQLite requires zero setup; PostgreSQL or MySQL also supported)
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite

# Zoho One API OAuth Credentials (Single Service Account)
ZOHO_CLIENT_ID=your_zoho_client_id_here
ZOHO_CLIENT_SECRET=your_zoho_client_secret_here
ZOHO_REFRESH_TOKEN=your_zoho_refresh_token_here
ZOHO_DOMAIN=com

FRONTEND_URL=http://localhost:5173
```

### 3. Initialize & Seed Database
Initialize the database tables (`Users`, `Roles`, `Permissions`, `UserRoles`, `RolePermissions`, `AuditLogs`) and seed with default demo credentials:
```bash
npm run seed
```

### 4. Run Automated RBAC Test Suite
Run the test suite to verify JWT authentication, role restrictions, and audit logging:
```bash
npm run test
```
*Expected output: 13 Passed, 0 Failed.*

### 5. Launch Application
Launch both backend and frontend servers:
```bash
# From root directory:
npm run dev
```
Or start them individually:
```bash
# Terminal 1 (Backend - http://localhost:5000)
npm run backend

# Terminal 2 (Frontend - http://localhost:5173)
npm run frontend
```

Open your browser at **`http://localhost:5173`**!

---

## 🌐 Connecting Real Zoho API Credentials

The portal is designed with a **hybrid architecture**:
1. **Out of the box**: Operates in simulated proxy mode with realistic datasets so all features, RBAC filters, and UI flows can be tested immediately.
2. **With real credentials**: As soon as you add your Zoho keys to `backend/.env`, it automatically executes live OAuth token exchanges and routes requests to Zoho APIs.

### Steps to obtain Zoho API Credentials:
1. Visit the [Zoho API Console](https://api-console.zoho.com).
2. Choose **Server-based Applications** or **Self Client**.
3. Copy your **Client ID** and **Client Secret**.
4. Generate a code with the following scopes and exchange it for a **Refresh Token**:
   - `ZohoPeople.employee.ALL`
   - `ZohoCRM.modules.ALL`
   - `Desk.tickets.ALL`
   - `ZohoBooks.invoices.ALL`
5. Place them in `backend/.env`:
   ```env
   ZOHO_CLIENT_ID=1000.XXXXX
   ZOHO_CLIENT_SECRET=YYYYY
   ZOHO_REFRESH_TOKEN=1000.ZZZZZ
   ZOHO_DOMAIN=com   # Use 'in' for India, 'eu' for Europe
   ```
6. Restart the backend server.
7. Navigate to **Admin $\rightarrow$ Zoho OAuth Service** in the portal to click **Test Connection** and verify live connectivity!

---

## 🗄️ Relational Database Schema

The database strictly complies with the BrainWave schema specification:

- **`Users`**: `id`, `name`, `email`, `password_hash`, `department`, `is_active`, `created_at`, `updated_at`
- **`Roles`**: `id`, `name` (`Admin`, `HR`, `Sales`, `Support`, `Finance`, `Manager`), `description`
- **`Permissions`**: `id`, `name` (`access:zoho_people`, `access:zoho_crm`, `access:zoho_desk`, `access:zoho_books`, `manage:users`, `manage:roles`, `view:audit_logs`, `manage:settings`), `module`, `description`
- **`UserRoles`**: `user_id`, `role_id` (Many-to-many junction)
- **`RolePermissions`**: `role_id`, `permission_id` (Many-to-many junction)
- **`AuditLogs`**: `id`, `user_id`, `user_email`, `user_role`, `action`, `resource`, `status` (`SUCCESS`, `FORBIDDEN`, `FAILED`), `ip_address`, `user_agent`, `details`, `timestamp`

---

## 📡 API Endpoints Reference

### Authentication
- `POST /api/auth/login`: Authenticates portal credentials, returns signed JWT.
- `GET /api/auth/me`: Returns current user profile with roles & permissions.
- `POST /api/auth/logout`: Records logout event in audit logs.

### Zoho Applications (RBAC Protected)
- `GET /api/zoho/apps`: Returns permitted Zoho applications for the current user.
- `GET /api/zoho/people`: Proxies Zoho People data *(HR & Admin only)*.
- `GET /api/zoho/crm`: Proxies Zoho CRM data *(Sales & Admin only)*.
- `GET /api/zoho/desk`: Proxies Zoho Desk data *(Support & Admin only)*.
- `GET /api/zoho/books`: Proxies Zoho Books data *(Finance & Admin only)*.
- `GET /api/zoho/test-connection`: Tests Zoho OAuth service account status *(Admin only)*.

### Administration (Admin Only)
- `GET /api/admin/users`: List all users with assigned roles.
- `POST /api/admin/users`: Create new employee with hashed password and role.
- `PUT /api/admin/users/:id`: Edit user details, active state, or role.
- `DELETE /api/admin/users/:id`: Remove user from portal.
- `GET /api/admin/audit-logs`: Query paginated, filterable system audit trail.
- `GET /api/admin/stats`: Overview metrics of users, roles, and audit events.
- `GET /api/roles`: List all system roles and permissions matrix.

---

## 🎥 Video Presentation Script

A ready-to-read, 3-to-5 minute video narration script specifically structured for the submission evaluation criteria is provided in:
👉 [`VIDEO_DEMO_SCRIPT.md`](./VIDEO_DEMO_SCRIPT.md)