# 02 — Technology Stack

## Language

| Language | Version | Usage |
|----------|---------|-------|
| **JavaScript (ES2022+)** | ES Modules | All source code — no TypeScript |
| **JSX** | React flavor | All component files (`.jsx`, `.js`) |
| **CSS** | Tailwind utility classes | All styling |
| **Markdown** | — | Documentation |

---

## Core Framework

### Next.js 14
- **Version:** `14.2.5`
- **Router:** App Router (`/app` directory)
- **Rendering:** Client-Side Rendering (CSR) — all pages are `'use client'`
- **Why:** Industry-standard React framework with built-in routing, code splitting, image optimization, and API route support
- **Key features used:** Dynamic routes (`[id]`), Middleware, Environment variables, `next/navigation`, `next/link`

### React 18
- **Version:** `^18`
- **Paradigm:** Functional components + Hooks only (no class components)
- **Hooks used:** `useState`, `useEffect`, `useCallback`, `useForm`, `useFieldArray`, `useRouter`, `useParams`

---

## UI & Styling

### Tailwind CSS
- **Version:** `^3.4.1`
- **Config:** `tailwind.config.js` — custom dark theme with CSS variables
- **Theme tokens:**

```js
// Custom colors defined in tailwind.config.js
bg:          '#0f1117'   // Page background
bg-card:     '#1a1d27'   // Card surfaces  
bg-surface:  '#1e2130'   // Input surfaces
border:      '#2a2d3e'   // Borders
text-primary: '#e2e8f0'  // Main text
text-secondary: '#94a3b8' // Sub-labels
accent:      '#3b82f6'   // Blue accent (buttons, links)
success:     '#22c55e'   // Green
danger:      '#ef4444'   // Red
warning:     '#f59e0b'   // Amber
```

### Lucide React
- **Version:** `^0.400.0`
- **Purpose:** SVG icon library — used across all pages for consistent iconography
- **Examples:** `Package`, `Truck`, `ArrowLeftRight`, `Plus`, `Trash2`, `Check`, `Eye`, `Boxes`

---

## State Management

### Zustand
- **Version:** `^4.5.4`
- **Stores:**

| Store | File | Manages |
|-------|------|---------|
| `authStore` | `src/store/authStore.js` | `user`, `token`, `setAuth()`, `clearAuth()`, localStorage sync |
| `filterStore` | `src/store/filterStore.js` | Per-resource filter state (search, status, dates, page) |

- **Why Zustand over Redux:** Minimal boilerplate, no Provider needed, built-in persistence helpers

---

## HTTP Client

### Axios
- **Version:** `^1.7.2`
- **Instance:** `src/lib/axios.js`
- **Features:**
  - `baseURL` from `process.env.NEXT_PUBLIC_API_BASE_URL`
  - Request interceptor: injects `Authorization: Bearer <token>` from localStorage
  - Response interceptor: on 401 → calls `clearAuth()` + redirects to `/login`

---

## Forms & Validation

### React Hook Form (RHF)
- **Version:** `^7.52.1`
- **Usage:** All forms — login, signup, product create/edit, receipt/delivery/transfer/adjustment lines
- **Key hooks:** `useForm`, `useFieldArray` (for dynamic product line arrays)

### Zod
- **Version:** `^3.23.8`
- **Integration:** `@hookform/resolvers/zod` (`^3.9.0`) connects Zod schemas to RHF
- **Schema files:**

| File | Validates |
|------|-----------|
| `auth.schema.js` | login, register, forgot-password, OTP, reset-password |
| `product.schema.js` | create product, update product, category, reorder rule |
| `receipt.schema.js` | receipt header + lines (demandQty, doneQty) |
| `delivery.schema.js` | delivery header + lines (demandQty, doneQty) |
| `transfer.schema.js` | transfer header + lines (qty) |
| `adjustment.schema.js` | adjustment header + lines (countedQty) |

---

## Data Display

### TanStack Table v8
- **Version:** `^8.19.2` (`@tanstack/react-table`)
- **Wrapper:** `src/components/shared/DataTable.jsx`
- **Features:** Column definition with `createColumnHelper`, client-side sorting, pagination controls

---

## Notifications

### React Hot Toast
- **Version:** `^2.4.1`
- **Placement:** `Toaster` in every page that makes API calls (`position="top-right"`)
- **Usage pattern:** All API errors shown as `toast.error(err.response?.data?.error)`, successes as `toast.success(...)`

---

## Date Utilities

### date-fns
- **Version:** `^3.6.0`
- **Usage:** Formatting dates in tables (`format(new Date(val), 'MMM d, yyyy')`), default date in forms (`format(new Date(), 'yyyy-MM-dd')`)

---

## Development Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **ESLint** | `^8` | Code linting |
| **eslint-config-next** | `14.2.5` | Next.js specific lint rules |
| **PostCSS** | `^8` | CSS processing for Tailwind |
| **Autoprefixer** | `^10` | Cross-browser CSS prefixes |

---

## Summary Table

```
Layer               Library / Tool          Version
─────────────────────────────────────────────────
Framework           Next.js                 14.2.5
UI Runtime          React                   18.x
Language            JavaScript (ES2022)     —
Styling             Tailwind CSS            3.4.1
Icons               Lucide React            0.400.0
State               Zustand                 4.5.4
HTTP Client         Axios                   1.7.2
Forms               React Hook Form         7.52.1
Schema Validation   Zod                     3.23.8
Table               TanStack Table          8.19.2
Toasts              React Hot Toast         2.4.1
Date Utils          date-fns                3.6.0
Linting             ESLint + Next config    8.x
```
