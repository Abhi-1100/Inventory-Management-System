# 03 — Folder Structure

## Root Directory

```
Inventory-Management-System/
├── docs/                        ← 📚 Project documentation (this folder)
├── src/                         ← 📦 All source code
├── public/                      ← Static assets (favicon, images)
├── .env.local                   ← Environment variables (not committed)
├── .gitignore                   ← Git ignore rules
├── jsconfig.json                ← Path alias (@/* → src/*)
├── next.config.mjs              ← Next.js configuration
├── package.json                 ← Dependencies & scripts
├── postcss.config.mjs           ← PostCSS config for Tailwind
└── tailwind.config.js           ← Tailwind CSS theme customization
```

---

## Source Directory (`src/`)

```
src/
├── app/                         ← Next.js App Router pages
│   ├── layout.js                ← Root layout (global fonts, metadata)
│   ├── globals.css              ← Global CSS + Tailwind directives
│   ├── page.js                  ← Root redirect → /dashboard
│   │
│   ├── login/page.js            ← Sign in page
│   ├── signup/page.js           ← Register page
│   ├── forgot-password/page.js  ← 3-step OTP password recovery
│   │
│   ├── dashboard/page.js        ← KPI overview
│   │
│   ├── products/
│   │   ├── page.js              ← Products list (search, category filter)
│   │   ├── new/page.js          ← Create product form
│   │   ├── [id]/page.js         ← Product detail / edit / stock view
│   │   ├── categories/page.js   ← Manage product categories
│   │   └── reorder-rules/page.js ← Configure reorder thresholds
│   │
│   ├── operations/
│   │   ├── receipts/
│   │   │   ├── page.js          ← Receipts list
│   │   │   ├── new/page.js      ← Create receipt (demandQty + doneQty)
│   │   │   └── [id]/page.js     ← Receipt detail + validate/cancel
│   │   ├── deliveries/
│   │   │   ├── page.js          ← Deliveries list
│   │   │   ├── new/page.js      ← Create delivery
│   │   │   └── [id]/page.js     ← Delivery detail + validate/cancel
│   │   ├── transfers/
│   │   │   ├── page.js          ← Transfers list
│   │   │   ├── new/page.js      ← Create transfer (uses qty field)
│   │   │   └── [id]/page.js     ← Transfer detail + validate/cancel
│   │   └── adjustments/
│   │       ├── page.js          ← Adjustments list
│   │       ├── new/page.js      ← Create adjustment (countedQty)
│   │       └── [id]/page.js     ← Adjustment detail (shows difference)
│   │
│   ├── move-history/page.js     ← Full stock movement audit log
│   │
│   ├── settings/
│   │   ├── warehouses/page.js   ← Manage warehouses
│   │   └── locations/page.js    ← Manage locations per warehouse
│   │
│   └── profile/page.js          ← Edit name/email + change password
│
├── components/
│   ├── layout/                  ← Application shell components
│   │   ├── AppLayout.jsx        ← Main shell: auth guard + sidebar + navbar
│   │   ├── Sidebar.jsx          ← Navigation sidebar with all links
│   │   └── Navbar.jsx           ← Top bar with user info
│   │
│   └── shared/                  ← Reusable UI components
│       ├── DataTable.jsx        ← TanStack Table wrapper + pagination
│       ├── KPICard.jsx          ← Dashboard metric card
│       ├── StatusBadge.jsx      ← Color-coded status pill
│       ├── PageHeader.jsx       ← Page title + optional action button
│       ├── FormInput.jsx        ← Labeled input with error display
│       ├── FormSelect.jsx       ← Labeled select with error display
│       ├── SearchInput.jsx      ← Debounced search with clear button
│       ├── ConfirmModal.jsx     ← Confirmation dialog (danger mode)
│       ├── EmptyState.jsx       ← Empty list placeholder
│       └── LoadingSpinner.jsx   ← Spinner (full-page option)
│
├── lib/
│   └── axios.js                 ← Pre-configured Axios instance + interceptors
│
├── schemas/                     ← Zod validation schemas
│   ├── auth.schema.js
│   ├── product.schema.js
│   ├── receipt.schema.js
│   ├── delivery.schema.js
│   ├── transfer.schema.js
│   └── adjustment.schema.js
│
├── store/                       ← Zustand global state stores
│   ├── authStore.js             ← Auth state + localStorage persistence
│   └── filterStore.js           ← Per-page filter state
│
└── middleware.js                ← Next.js middleware (routing shell)
```

---

## Naming Conventions

| Pattern | Convention | Example |
|---------|-----------|---------|
| Page files | `page.js` | `src/app/dashboard/page.js` |
| Components | `PascalCase.jsx` | `DataTable.jsx`, `AppLayout.jsx` |
| Utility files | `camelCase.js` | `axios.js`, `authStore.js` |
| Schema files | `entity.schema.js` | `receipt.schema.js` |
| Dynamic routes | `[param]` folder | `products/[id]/page.js` |
| `'use client'` | Top of every file | Required for hooks and browser APIs |

---

## Path Aliases

Configured in `jsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": { "@/*": ["./src/*"] }
  }
}
```

Usage: `import api from '@/lib/axios'` instead of `../../../../lib/axios`
