# 🎬 3-5 Minute Video Recording Presentation Script
## Custom Employee Portal with Zoho One Integration & RBAC

Use this guide and script to record your 3-to-5-minute screen presentation with voice narration for your interview submission.

---

### ⏱️ Timeline Overview

| Timestamp | Topic | Screen Action |
| :--- | :--- | :--- |
| **0:00 - 0:45** | **1. Project Overview & Architecture** | Show Login page with one-click role demo buttons |
| **0:45 - 1:45** | **2. RBAC Enforcement in Action** | Log in as HR, then Sales, then Finance to show application isolation |
| **1:45 - 2:45** | **3. Zoho API Integration & Backend Security** | Open code editor (`backend/src/services/zohoService.js` and `middlewares/rbac.js`) |
| **2:45 - 3:45** | **4. Admin Control Panel & Audit Logging** | Log in as Admin: show User Management, Role Matrix, and Security Audit Logs |
| **3:45 - 4:00** | **Conclusion & Wrap-Up** | Summary of security guarantees and single service account model |

---

### 🎙️ Word-for-Word Narration Script

#### Section 1: Project Overview (0:00 - 0:45)
> **[On Screen: Show the Login Page at `http://localhost:5173/login`]**
> 
> *"Hello everyone! Today, I am presenting the Custom Employee Portal integrated with Zoho One APIs and fine-grained Role-Based Access Control (RBAC).*
>
> *The primary objective of this project is to provide a single, centralized corporate portal where employees access only the specific Zoho applications permitted by their role—without employees ever having or entering personal Zoho credentials.*
>
> *Our backend utilizes a single service account OAuth integration, managing refresh tokens and access tokens securely behind an Express API, while the frontend is built using React, Vite, and Tailwind CSS for a modern, responsive user experience.*
>
> *On the login screen, we have both traditional email/password authentication and a Quick Demo Switcher for fast evaluation across roles."*

---

#### Section 2: RBAC Implementation (0:45 - 1:45)
> **[On Screen: Click the "HR" button to log in as `hr@portal.com`]**
>
> *"Let's test Role-Based Access Control. First, I will log in as an HR employee, Sarah Connor.*
>
> *Notice that upon logging in, the dashboard dynamically queries the backend for authorized applications. In accordance with our RBAC policy, Sarah only sees **Zoho People**.*
>
> *The sidebar and dashboard strictly hide Zoho CRM, Desk, and Books. When we click **View Live Data**, our backend proxies the employee records and leave requests directly from Zoho People.*
>
> *Now, let's log out and log in as Michael Scott from **Sales**.*
>
> **[On Screen: Log in as Sales `sales@portal.com`]**
>
> *Instantly, the view adapts: Michael sees only **Zoho CRM**, with access to customer leads and deal pipelines. If a sales employee attempts to navigate to `/zoho/books` or `/zoho/people`, our route guards and backend RBAC middleware intercept the request and return a 403 Forbidden with an Access Denied screen.*
>
> *Similarly, **Finance** users see only **Zoho Books** for invoicing, and **Support** users see only **Zoho Desk**."*

---

#### Section 3: Zoho API Integration & Backend Architecture (1:45 - 2:45)
> **[On Screen: Switch to VS Code / Code Editor]**
>
> *"Now let's inspect the backend code to see how credentials and OAuth tokens are secured.*
>
> *In `backend/src/services/zohoService.js`, notice our `getZohoAccessToken` function. The portal uses a single backend service account configured with `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, and `ZOHO_REFRESH_TOKEN` stored securely in the `.env` file.*
>
> *The backend caches the access token in memory with an expiration calculation and automatically refreshes it before it expires. Employees never see or manage tokens.*
>
> *Next, in `backend/src/middlewares/rbac.js`, we implemented the `verifyRole` middleware. Every incoming request must provide a signed JWT. The middleware inspects the token's decoded roles and permissions against allowed roles. If an unauthorized role attempts access, the system immediately records an audit log with status `FORBIDDEN` and responds with HTTP 403."*

---

#### Section 4: Admin Capabilities & Audit Logs (2:45 - 3:45)
> **[On Screen: Log in as Admin `admin@portal.com`]**
>
> *"Now let's log in as the **Admin**, Alexander Wright.*
>
> *As an Administrator, I have unrestricted visibility across all four Zoho services: Zoho People, Zoho CRM, Zoho Desk, and Zoho Books.*
>
> *In addition, the Admin section in the sidebar unlocks dedicated administrative tools:*
> 1. *In **User Management**, admins can view all employees, create new accounts, assign roles, edit departments, or deactivate accounts.*
> 2. *In **Roles & Permissions**, we have an interactive RBAC matrix displaying exactly which permissions and Zoho services belong to each role.*
> 3. *In **System Audit Logs**, every security event is tracked in real-time. Notice how earlier unauthorized attempts triggered `FORBIDDEN` audit entries detailing the user, IP address, target resource, and timestamp.*
> 4. *In **Zoho OAuth Service**, admins can run live connection diagnostics with our `Test Connection` button, displaying token status, latency, and data center domains."*

---

#### Section 5: Conclusion (3:45 - 4:00)
> **[On Screen: Return to the Dashboard]**
>
> *"To summarize:
> - Full relational database schema with Users, Roles, Permissions, UserRoles, RolePermissions, and AuditLogs.
> - Zero Zoho credential exposure for end users via backend OAuth service proxying.
> - Strict RBAC enforcement across backend endpoints and frontend components.
> - A 100% passing automated test suite and production-ready documentation.
>
> Thank you for your time!"*