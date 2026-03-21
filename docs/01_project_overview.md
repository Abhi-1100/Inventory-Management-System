# 01 — Project Overview

## What is CoreInventory?

**CoreInventory** is a modern, full-featured **Inventory Management System (IMS)** frontend application built with Next.js 14. It provides businesses with a complete interface to manage stock, track product movements, process receipts and deliveries, perform inventory adjustments, and monitor warehouse operations in real time.

---

## Goals & Purpose

| Goal | Description |
|------|-------------|
| **Centralized Inventory Control** | Single dashboard view of all stock, movements, and KPIs |
| **Multi-Warehouse Support** | Manage multiple warehouses and their internal locations |
| **Operations Management** | Process Receipts, Deliveries, Transfers, and Adjustments |
| **Audit Trail** | Full move history with filtering by product, location, type, and date |
| **Reorder Automation** | Configure min/max stock rules per product per location |
| **Secure Access** | JWT-based authentication with role-based user context |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    BROWSER (Client)                     │
│                                                         │
│  Next.js 14 App Router (React 18)                       │
│  ┌─────────────┐  ┌────────────┐  ┌──────────────────┐  │
│  │  Auth Pages │  │  App Pages │  │  Shared Components│  │
│  │  /login     │  │  /dashboard│  │  Sidebar, Navbar  │  │
│  │  /signup    │  │  /products │  │  DataTable, KPICard│  │
│  │  /forgot-pw │  │  /operations│  │  Forms, Modals   │  │
│  └─────────────┘  └────────────┘  └──────────────────┘  │
│                                                         │
│  State: Zustand Store  │  Validation: Zod + RHF         │
│  HTTP: Axios Instance  │  Styles: Tailwind CSS          │
└──────────────────────────────────┬──────────────────────┘
                                   │ HTTP / REST API
                                   │ JWT Bearer Token
                    ───────────────▼───────────────
                    │     Backend API Server        │
                    │  http://localhost:5000/api    │
                    │  (Node.js / Express expected) │
                    └──────────────────────────────┘
```

---

## Key Design Decisions

### 1. Client-Side Authentication
JWT is stored in `localStorage` under the key `ci_token`. Auth guard runs client-side inside `AppLayout.jsx` using `useEffect` — this is necessary because Next.js middleware cannot read `localStorage`.

### 2. App Router (Next.js 14)
All routes use the `/app` directory. Pages are `'use client'` components since they require hooks and browser APIs.

### 3. Centralized HTTP Client
A single Axios instance (`src/lib/axios.js`) handles:
- Injecting `Authorization: Bearer <token>` on every request
- Auto-logout on 401 Unauthorized responses

### 4. Dark Design System
Custom Tailwind theme with CSS variables for a premium dark UI consistent across all pages.

---

## Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL | `http://localhost:5000/api` |
| `NEXT_PUBLIC_APP_NAME` | Application display name | `CoreInventory` |
