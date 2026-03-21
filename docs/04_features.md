# 04 — Features & Modules

## Feature Summary

CoreInventory provides **7 major modules** visible in the sidebar navigation:

```
Dashboard  →  Products  →  Operations  →  Move History  →  Settings  →  Profile
```

---

## 🔐 Module 1: Authentication

### Pages
| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | Email + password sign in |
| Sign Up | `/signup` | New user registration |
| Forgot Password | `/forgot-password` | 3-step OTP reset flow |

### Features
- **Email/password login** with Zod validation
- **JWT stored in `localStorage`** as `ci_token`
- **Auto-logout on 401** — Axios interceptor triggers `clearAuth()` + redirect
- **3-step password recovery:**
  1. Enter email → `POST /auth/forgot-password`
  2. Verify 6-digit OTP → `POST /auth/verify-otp`
  3. Enter new password → `POST /auth/reset-password`
- **Show/hide password** toggle on all password fields
- **Demo mode** — `admin@demo.com` / `demo1234` bypasses the API for UI testing
- **Protected routes** — `AppLayout.jsx` checks token on every mount

---

## 📊 Module 2: Dashboard

### Page: `/dashboard`

### Features
- **6 live KPI cards** fetched from `/dashboard/kpis`:
  - Total Products in Stock
  - Low Stock Items
  - Out of Stock Items
  - Pending Receipts
  - Pending Deliveries
  - Scheduled Transfers
- **Skeleton loading** — animated pulse placeholders while data loads
- **Demo fallback** — shows realistic mock numbers when backend is unavailable
- **Color-coded cards** — blue, amber, red, info, green, accent per metric type

---

## 📦 Module 3: Products

### 3A — Products List (`/products`)
- Searched by name or SKU (debounced input)
- Filtered by category (dropdown)
- Paginated table using `DataTable` component
- Click row to view product detail
- "New Product" button links to `/products/new`

### 3B — Create Product (`/products/new`)
- Fields: Name, SKU, Category, Unit of Measure, Reorder Point, description
- Optional initial stock: Initial Quantity + Location
- Zod schema validation on all fields
- Success → redirect to product detail

### 3C — Product Detail (`/products/[id]`)
- **Edit form** — update name, SKU, category, UoM, reorder point
- **Stock by location** table — shows all warehouse locations with current stock quantity
- **Delete product** — confirmation modal with danger styling
- Inline save / error feedback

### 3D — Categories (`/products/categories`)
- **Inline create** — type name + press "Add" button
- **List view** — shows all categories with product count
- **Delete** — with confirmation modal

### 3E — Reorder Rules (`/products/reorder-rules`)
- **Configurable thresholds** — Min Qty / Max Qty per product per location
- **Create form** — select product + location + set thresholds
- **Rules table** — all active rules shown with product SKU and location

---

## 🚚 Module 4: Operations

All 4 operation types follow the same pattern:
- **List page** → filter by status + search → click row to open detail
- **New page** → header fields + dynamic product lines
- **Detail page** → view/edit + status stepper + Validate/Cancel actions

### ⚙️ Common Operation Fields

| Field | Receipts | Deliveries | Transfers | Adjustments |
|-------|----------|------------|-----------|-------------|
| Reference No | Auto-generated | Auto-generated | Auto-generated | Auto-generated |
| Scheduled Date | ✅ | ✅ | ✅ | — |
| Supplier/Customer | Supplier Name | Customer Name | — | — |
| Source Location | — | ✅ | ✅ | — |
| Dest Location | ✅ | — | ✅ | — |
| Location | — | — | — | ✅ |

### ⚙️ Product Line Fields

| Operation | Line Fields |
|-----------|-------------|
| Receipts | `productId`, `demandQty`, `doneQty` |
| Deliveries | `productId`, `demandQty`, `doneQty` |
| Transfers | `productId`, `qty` |
| Adjustments | `productId`, `countedQty` (systemQty + difference from backend) |

### 4A — Receipts (`/operations/receipts`)
- Inbound stock from supplier
- Statuses: `draft → waiting → ready → done`
- Cancel available for non-done operations
- **Validate** = `POST /operations/receipts/{id}/validate` (no body)

### 4B — Deliveries (`/operations/deliveries`)
- Outbound stock to customer
- Same status flow and validate/cancel as receipts
- Validates stock availability — shows 422 error message from backend

### 4C — Transfers (`/operations/transfers`)
- Internal stock movement between warehouses/locations
- Uses `qty` field (not `demandQty`/`doneQty`)
- Same validate/cancel pattern

### 4D — Adjustments (`/operations/adjustments`)
- Physical inventory count correction
- Uses `countedQty` — backend calculates `systemQty` and `difference`
- Difference shown in color: 🟢 positive, 🔴 negative, ⚫ zero
- `/prefill` endpoint fetches current system qty when product is selected

### Status Stepper
All detail pages display a visual step indicator showing progress:
```
Draft ──── Waiting ──── Ready ──── Done
  ●─────────────○────────────○────────○
```

---

## 📋 Module 5: Move History

### Page: `/move-history`

### Features
- **Full audit log** of all stock movements across all operations
- **Multi-filter system:**
  - Type (receipt / delivery / transfer / adjustment)
  - Product (dropdown)
  - Location (dropdown)
  - Date range (from / to)
  - "Clear Filters" button
- **Quantity change column** — signed display (+15 / -3) with color coding
- **Paginated** — 50 records per page

---

## ⚙️ Module 6: Settings

### 6A — Warehouses (`/settings/warehouses`)
- **Create** — name, short code, optional address
- **Edit** — inline form (click pencil icon)
- **List view** — shows all warehouses with location count

### 6B — Locations (`/settings/locations`)
- **Create** — name, short code, warehouse, type (internal/view/production/vendor/customer)
- **Edit** — inline form
- **Filter by warehouse** — dropdown to narrow list
- **Location types:** `internal`, `view`, `production`, `vendor`, `customer`

---

## 👤 Module 7: Profile

### Page: `/profile`

### Features
- **Personal Information** — update full name and email address
- **Change Password** — current password + new password + confirm password
- Zustand `setAuth` called after profile update to sync the navbar user display
- Error toasts for all failure cases

---

## Shared UI Components

| Component | Where Used | Purpose |
|-----------|-----------|---------|
| `DataTable` | Products, all operations, move history | TanStack Table with pagination |
| `StatusBadge` | All operation lists and detail pages | Color-coded status pill |
| `KPICard` | Dashboard | Metric card with icon and color |
| `PageHeader` | All pages | Title + subtitle + optional CTA button |
| `FormInput` | All forms | Labeled input with RHF error display |
| `FormSelect` | All forms | Labeled select with RHF error display |
| `SearchInput` | Products, receipts, deliveries, transfers | 300ms debounced search |
| `ConfirmModal` | Delete product, cancel operations | Backdrop modal with danger option |
| `EmptyState` | Empty lists | "Nothing here yet" placeholder |
| `LoadingSpinner` | Detail page loading | Centered spinner, fullPage mode |
