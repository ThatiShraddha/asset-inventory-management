# AssetFlow — Enterprise Inventory Management System

<div align="center">

![AssetFlow Banner](https://img.shields.io/badge/AssetFlow-Enterprise%20EIMS-39A5AD?style=for-the-badge&logo=databricks&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)

**A production-grade enterprise asset and inventory management platform built for teams managing physical assets, procurement workflows, budgets, and audit compliance.**

[Features](#features) • [Architecture](#architecture) • [Quick Start](#quick-start) • [API Reference](#api-reference) • [Roles](#role-matrix) • [Docker](#docker-deployment)

</div>

---

## What is AssetFlow?

AssetFlow is a full-stack enterprise web application that replaces spreadsheets and manual tracking for organizations that manage physical assets (laptops, peripherals, furniture, test equipment, etc.).

Key capabilities:
- **Inventory Ledger** — Track every asset by SKU, location, quantity, and cost
- **Procurement Workflow** — Employees request assets → Admins approve → Stock auto-decrements → Notifications sent
- **Budget Tracking** — Per-department budget limits enforced at approval time
- **Audit Logs** — Every action (login, stock-in, approve, deny, return) is recorded immutably
- **Role-Based Access Control** — 5 roles with granular permissions enforced server-side
- **Real-Time Notifications** — In-app notification feed for approvals, denials, and stock alerts

---

## Features

| Feature | Status |
|---------|--------|
| JWT Authentication (access + refresh tokens, HttpOnly cookies) | ✅ |
| Role-Based Access Control (server-side enforcement) | ✅ |
| Full Inventory CRUD | ✅ |
| Stock-In with audit trail | ✅ |
| Requisition Workflow (submit → approve/deny → return) | ✅ |
| Budget enforcement at approval time | ✅ |
| Audit Logs (immutable, timestamped) | ✅ |
| In-app Notifications | ✅ |
| BI Analytics Dashboard (Recharts) | ✅ |
| Report Builder (export CSV/PDF stub) | ✅ |
| Command Palette (Ctrl+K) | ✅ |
| Keyboard Navigation (g+d, g+i, etc.) | ✅ |
| Responsive (mobile + desktop) | ✅ |
| Docker Compose (full stack) | ✅ |
| PostgreSQL + Prisma ORM | ✅ |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT BROWSER                          │
│                    React 19 + Vite + TailwindCSS                 │
│            TypeScript · Lucide Icons · Recharts · Motion         │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP/REST  (credentials: include)
                            │ /api/* → proxy → :4000
┌───────────────────────────▼─────────────────────────────────────┐
│                       EXPRESS BACKEND                            │
│                    Node.js 20 · Express 4                        │
│          JWT (access 15m + refresh 7d) · bcryptjs · CORS         │
│              Role-based middleware on every route                 │
└───────────────────────────┬─────────────────────────────────────┘
                            │ Prisma ORM
┌───────────────────────────▼─────────────────────────────────────┐
│                      PostgreSQL 15                               │
│     Users · Departments · Categories · Vendors · Inventory       │
│     Requisitions · AuditLogs · Notifications                     │
└─────────────────────────────────────────────────────────────────┘
```

### Project Structure

```
ASSET-INVENTORY/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── seed.js             # Demo data seed script
│   ├── server.js               # Express API server (Prisma-backed)
│   ├── package.json
│   └── .env.example            # Copy to .env and configure
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthPages.tsx       # Login, register, forgot password
│   │   │   ├── MainApplication.tsx # App shell, sidebar, routing
│   │   │   ├── AppDashboard.tsx    # Role-specific dashboards
│   │   │   ├── AppInventory.tsx    # Inventory ledger + CRUD
│   │   │   ├── AppRequisitions.tsx # Request & approval workflow
│   │   │   ├── AppReports.tsx      # Report builder
│   │   │   ├── AppAnalytics.tsx    # BI charts
│   │   │   ├── AppSettings.tsx     # Settings + role switcher
│   │   │   └── MarketingPage.tsx   # Public landing page
│   │   ├── data/
│   │   │   └── dbStore.ts          # API bridge (all fetch calls)
│   │   ├── types.ts                # TypeScript types + RBAC
│   │   └── index.css               # Global styles
│   ├── vite.config.ts              # Vite + proxy config
│   └── package.json
│
├── docker-compose.yml          # Full stack orchestration
├── Dockerfile.backend          # Express backend image
├── Dockerfile.frontend         # React frontend image
└── README.md
```

---

## Role Matrix

| Permission | Super Admin | Admin | Store Manager | Employee | Auditor |
|-----------|:-----------:|:-----:|:-------------:|:--------:|:-------:|
| View Inventory | ✅ | ✅ | ✅ | ✅ | ✅ |
| Add/Edit Inventory | ✅ | ✅ | ✅ | ❌ | ❌ |
| Stock-In Delivery | ✅ | ✅ | ✅ | ❌ | ❌ |
| Submit Requisition | ✅ | ✅ | ✅ | ✅ | ❌ |
| Approve/Deny Request | ✅ | ✅ | ❌ | ❌ | ❌ |
| Process Return | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Audit Logs | ✅ | ✅ | ❌ | ❌ | ✅ |
| View Reports | ✅ | ✅ | Inventory only | ❌ | ✅ |
| Manage Budgets | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage Users | ✅ | ✅ | ❌ | ❌ | ❌ |
| System Reset | ✅ | ❌ | ❌ | ❌ | ❌ |

> **Note:** All role checks are enforced **server-side** via JWT payload. Calling a protected endpoint without the correct role returns `403 Forbidden`.

---

## Quick Start

### Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for PostgreSQL)
- npm or yarn

---

### Option 1: Local Development (Recommended)

#### Step 1 — Start PostgreSQL via Docker

```bash
# Start only the database container
docker-compose up postgres -d
```

This starts PostgreSQL on port `5432` with:
- **User:** `eims_admin`
- **Password:** `eims_secure_password_9021`
- **Database:** `eims_inventory_db`

#### Step 2 — Setup the Backend

```bash
cd backend

# Copy environment config
cp .env.example .env

# Install dependencies (includes Prisma, JWT, bcrypt, etc.)
npm install

# Generate Prisma Client
npx prisma generate

# Run database migrations (creates all tables)
npx prisma migrate dev --name init

# Seed the database with demo data
node prisma/seed.js
```

#### Step 3 — Start the Backend

```bash
# In the backend/ directory
npm run dev
# → Backend running at http://localhost:4000
```

Verify it's running:
```bash
curl http://localhost:4000/api/health
# → {"status":"ok","service":"AssetFlow Backend"}
```

#### Step 4 — Start the Frontend

```bash
# In a new terminal
cd frontend
npm install
npm run dev
# → Frontend at http://localhost:3000
```

#### Step 5 — Open in Browser

Navigate to **http://localhost:3000**

You'll see the marketing landing page. Click **"Launch Console"** to go to the login page.

---

### Demo Credentials

All accounts use the same password: **`secret-passkey`**

| Role | Email | Permissions |
|------|-------|-------------|
| 👑 Super Admin | `a.wright@enterprise.com` | Full access + system reset |
| 👩‍💼 Admin | `s.jenkins@enterprise.com` | Operations, approvals, reports |
| 📦 Store Manager | `e.rostova@enterprise.com` | Stock-in, returns, inventory |
| 👨‍💻 Employee | `m.thorne@enterprise.com` | Browse assets, submit requests |
| 🕵️ Auditor | `d.prince@enterprise.com` | Read-only logs and reports |

> **Tip:** On the login page, click any persona card to auto-fill the credentials — no need to type!

---

### Option 2: Full Docker Deployment

```bash
# Build and start all services
docker-compose up --build

# Services will start in order:
# 1. PostgreSQL (health check passes)
# 2. Backend (runs prisma migrate deploy, then starts server)
# 3. Frontend (served on port 3000)

# After startup, seed the database:
docker exec eims_backend node prisma/seed.js
```

Access points:
| Service | URL |
|---------|-----|
| Frontend App | http://localhost:3000 |
| Backend API | http://localhost:4000 |
| Mailpit (email sandbox) | http://localhost:8025 |
| Prisma Studio (DB GUI) | `npx prisma studio` (from backend/) |

---

## API Reference

### Authentication

| Method | Endpoint | Auth Required | Description |
|--------|----------|:---:|-------------|
| `POST` | `/api/auth/login` | ❌ | Login with email + password. Returns JWT in HttpOnly cookie |
| `POST` | `/api/auth/refresh` | ❌ | Refresh access token using refresh token cookie |
| `POST` | `/api/auth/logout` | ✅ | Clear auth cookies |
| `GET`  | `/api/auth/me` | ✅ | Get current authenticated user |

**Login Example:**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"a.wright@enterprise.com","password":"secret-passkey"}'
```

### Dashboard

| Method | Endpoint | Auth Required | Description |
|--------|----------|:---:|-------------|
| `GET` | `/api/dashboard` | ✅ | Returns all state: inventory, requisitions, departments, audit logs, notifications |

### Inventory

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| `GET` | `/api/inventory` | All | List all inventory items |
| `POST` | `/api/inventory` | Admin+ | Create new item |
| `POST` | `/api/inventory/:id/stock` | Admin+, Store Manager | Stock-in delivery |
| `POST` | `/api/inventory/:id/stock-point` | Admin+, Store Manager | Update reorder point & location |

### Requisitions

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| `GET` | `/api/requisitions` | All | List requisitions (employees see own only) |
| `POST` | `/api/requisitions` | All | Submit new request |
| `POST` | `/api/requisitions/:id/approve` | Admin+ | Approve (deducts stock + budget) |
| `POST` | `/api/requisitions/:id/deny` | Admin+ | Deny with reason |
| `POST` | `/api/requisitions/:id/return` | Admin+, Store Manager | Process return (restores stock) |

### Other

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| `GET` | `/api/audit-logs` | All | Audit trail (last 200 entries) |
| `GET` | `/api/notifications` | All | User's notifications |
| `PATCH` | `/api/notifications/:id/read` | All | Mark notification read |
| `PATCH` | `/api/notifications/read-all` | All | Mark all read |
| `GET` | `/api/departments` | All | List departments |
| `PATCH` | `/api/departments/:id/budget` | Admin+ | Update budget limit |
| `GET` | `/api/categories` | All | List categories |
| `POST` | `/api/categories` | Admin+ | Create category |
| `GET` | `/api/vendors` | All | List vendors |
| `GET` | `/api/users` | Admin+, Auditor | List users |
| `POST` | `/api/reset` | Super Admin | Wipe database |

---

## Workflow: Complete Requisition Lifecycle

```
Employee (Marcus)         Admin/Store Manager              System
     │                          │                            │
     │── Submit Request ─────→  │                            │
     │   POST /api/requisitions │                            │
     │                          │←── Notification created ───│
     │                          │                            │
     │                   Review & Approve                    │
     │                   POST /requisitions/:id/approve       │
     │                          │                            │
     │                          │── Stock decremented ──────→│
     │                          │── Budget deducted ─────────│
     │                          │── Audit log created ───────│
     │                          │── Notification to Marcus ──│
     │←── "Approved ✅" ─────── │                            │
     │                          │                            │
     │             ... time passes ...                       │
     │                          │                            │
     │── Return Item ──────────→│                            │
     │   POST /requisitions/:id/return                       │
     │                          │── Stock restored ──────────│
     │                          │── Audit log created ───────│
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `4000` | Backend server port |
| `NODE_ENV` | `development` | `development` or `production` |
| `DATABASE_URL` | — | PostgreSQL connection string |
| `JWT_SECRET` | `assetflow-dev-...` | Access token signing secret |
| `REFRESH_SECRET` | `assetflow-refresh-...` | Refresh token signing secret |
| `CORS_ORIGINS` | `http://localhost:3000` | Comma-separated allowed origins |

### Frontend (`frontend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `/api` (proxied) | API base URL (set for production) |

---

## Database Schema

```
┌──────────┐     ┌──────────────┐     ┌────────────────┐
│  users   │────→│ departments  │     │   categories   │
│  ────────│     │ ─────────────│     │ ──────────────  │
│  id      │     │ id           │     │ id             │
│  name    │     │ name         │     │ name           │
│  email   │     │ budgetLimit  │     │ description    │
│  role    │     │ budgetConsumed│    └────────────────┘
│  avatar  │     └──────────────┘              │
└──────────┘                                   │
     │                            ┌────────────▼──────┐
     │                            │  inventory_items  │
     ▼                            │ ─────────────────  │
┌──────────────┐                  │ id                │
│ requisitions │──────────────────│ sku               │
│ ─────────────│                  │ name              │
│ id           │                  │ quantityInStock   │
│ requesterId  │                  │ reorderPoint      │
│ departmentId │                  │ unitCost          │
│ itemId       │                  │ locationCode      │
│ status       │                  └───────────────────┘
│ justification│
└──────────────┘
     
┌──────────────┐     ┌──────────────┐
│  audit_logs  │     │ notifications│
│ ─────────────│     │ ─────────────│
│ id           │     │ id           │
│ actorName    │     │ userId       │
│ actionType   │     │ title        │
│ details      │     │ message      │
│ timestamp    │     │ isRead       │
└──────────────┘     └──────────────┘
```

---

## Development Commands

```bash
# ── Backend ───────────────────────────────────────────────────────
cd backend

npm run dev           # Start server with nodemon (hot-reload)
npm run db:generate   # Regenerate Prisma Client after schema changes
npm run db:migrate    # Create + apply new migration
npm run db:push       # Push schema changes without migration (dev only)
npm run db:seed       # Seed demo data
npm run db:studio     # Open Prisma Studio (visual DB browser)

# ── Frontend ──────────────────────────────────────────────────────
cd frontend

npm run dev           # Start Vite dev server (port 3000)
npm run build         # Build for production
npm run preview       # Preview production build locally
npm run lint          # TypeScript type check
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite, TailwindCSS v4 |
| **UI Components** | Lucide Icons, Recharts (charts), Motion (animations) |
| **Backend** | Node.js 20, Express 4 |
| **ORM** | Prisma 5 |
| **Database** | PostgreSQL 15 |
| **Auth** | JWT (jsonwebtoken), bcryptjs, HttpOnly cookies |
| **Containers** | Docker, Docker Compose |
| **Email (dev)** | Mailpit (SMTP sandbox) |

---

## Security Highlights

- 🔐 **Passwords** hashed with bcrypt (cost factor 10)
- 🍪 **Tokens** stored in HttpOnly, SameSite=Lax cookies (not localStorage)
- ⏱️ **Access tokens** expire in 15 minutes; **refresh tokens** in 7 days
- 🛡️ **RBAC enforced server-side** — frontend role checks are UI-only; all destructive operations verified in middleware
- 🔒 **CORS** configured with explicit origin allowlist
- 📋 **Audit logs** created for every state-changing action

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push and open a Pull Request

---

## License

MIT License — feel free to use this for college projects, portfolios, and hackathons.

---

<div align="center">
Built with ❤️ · AssetFlow Enterprise EIMS v2.0
</div>
