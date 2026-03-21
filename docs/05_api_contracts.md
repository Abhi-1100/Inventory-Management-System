# 05 — API Contracts

> All requests go through `src/lib/axios.js` (never `fetch()` directly).  
> Base URL: `process.env.NEXT_PUBLIC_API_BASE_URL` (default: `http://localhost:5000/api`)  
> Auth header: `Authorization: Bearer <ci_token>`

---

## Critical Business Rules

| Rule | Detail |
|------|--------|
| JWT key | `localStorage.getItem('ci_token')` |
| 401 response | Auto-clear token + redirect to `/login` |
| Error shape | `{ error: string, code: string }` — always show `error.error` in toast |
| Dates | Always sent as `YYYY-MM-DD` strings |
| Validate endpoints | `POST /resource/{id}/validate` — **no request body** |
| Transfers qty field | Use `qty` (NOT `demandQty`/`doneQty`) |
| Adjustments qty | Use `countedQty` — `systemQty` and `difference` come from backend |

---

## 🔐 Authentication Endpoints

### POST `/auth/login`
```json
// Request
{ "email": "user@example.com", "password": "secret123" }

// Response 200
{ "user": { "id": "...", "name": "...", "email": "...", "role": "admin" }, "token": "jwt..." }

// Error 401
{ "error": "Invalid credentials", "code": "INVALID_CREDENTIALS" }
```

### POST `/auth/register`
```json
// Request
{ "name": "John Doe", "email": "user@example.com", "password": "secret123" }

// Response 201
{ "user": { ... }, "token": "jwt..." }
```

### POST `/auth/forgot-password`
```json
// Request
{ "email": "user@example.com" }
// Response 200: { "message": "OTP sent" }
```

### POST `/auth/verify-otp`
```json
// Request
{ "email": "user@example.com", "otp": "123456" }
// Response 200: { "valid": true }
```

### POST `/auth/reset-password`
```json
// Request
{ "email": "user@example.com", "otp": "123456", "newPassword": "newSecret!" }
// Response 200: { "message": "Password reset" }
```

### GET `/auth/me`
```json
// Response 200
{ "id": "...", "name": "...", "email": "...", "role": "admin" }
```

---

## 📊 Dashboard

### GET `/dashboard/kpis`
```json
// Response 200
{
  "totalProductsInStock": 248,
  "lowStockItems": 12,
  "outOfStockItems": 3,
  "pendingReceipts": 7,
  "pendingDeliveries": 5,
  "scheduledTransfers": 4
}
```

---

## 📦 Products

### GET `/products`
```
Query: ?search=cable&categoryId=uuid&page=1&limit=20
Response: { data: [...], total: 100, page: 1 }
```

### POST `/products`
```json
{
  "name": "USB-C Cable",
  "sku": "USB-C-001",
  "categoryId": "uuid",
  "unitOfMeasure": "pcs",
  "reorderPoint": 10,
  "initialQty": 50,       // optional
  "locationId": "uuid"    // optional, required if initialQty set
}
```

### GET `/products/{id}`
```json
{ "id": "...", "name": "...", "sku": "...", "category": {...}, "stock": [{ "location": {...}, "qty": 25 }] }
```

### PUT `/products/{id}`
```json
{ "name": "...", "sku": "...", "categoryId": "...", "unitOfMeasure": "...", "reorderPoint": 10 }
```

### DELETE `/products/{id}` → `204 No Content`

---

## 📁 Categories

### GET `/products/categories` → `{ data: [{ id, name, productCount }] }`
### POST `/products/categories` → `{ "name": "Electronics" }`
### DELETE `/products/categories/{id}` → `204`

---

## 🔄 Reorder Rules

### GET `/products/reorder-rules` → `{ data: [{ id, product, location, minQty, maxQty }] }`
### POST `/products/reorder-rules`
```json
{ "productId": "uuid", "locationId": "uuid", "minQty": 10, "maxQty": 100 }
```

---

## 🚚 Operations — Shared Pattern

All 4 operations follow this URL pattern:

| Action | Method + URL |
|--------|-------------|
| List | `GET /operations/{type}?status=draft&search=...&page=1` |
| Get one | `GET /operations/{type}/{id}` |
| Create | `POST /operations/{type}` |
| Update | `PUT /operations/{type}/{id}` |
| Validate | `POST /operations/{type}/{id}/validate` *(no body)* |
| Cancel | `POST /operations/{type}/{id}/cancel` *(no body)* |

Where `{type}` is: `receipts`, `deliveries`, `transfers`, `adjustments`

---

## 📥 Receipts

### POST `/operations/receipts`
```json
{
  "supplierName": "Acme Corp",
  "destLocationId": "uuid",
  "scheduledDate": "2024-12-01",
  "lines": [
    { "productId": "uuid", "demandQty": 100, "doneQty": 95 }
  ]
}
```

### GET `/operations/receipts/{id}`
```json
{
  "id": "...", "referenceNo": "REC-0001",
  "status": "draft",
  "supplierName": "Acme Corp",
  "destLocation": { "id": "...", "name": "Main Warehouse" },
  "scheduledDate": "2024-12-01",
  "lines": [{ "id": "...", "product": {...}, "demandQty": 100, "doneQty": 95 }]
}
```

---

## 📤 Deliveries

### POST `/operations/deliveries`
```json
{
  "customerName": "Widget Co.",
  "sourceLocationId": "uuid",
  "scheduledDate": "2024-12-05",
  "lines": [
    { "productId": "uuid", "demandQty": 50, "doneQty": 50 }
  ]
}
```
> ⚠️ Validate may return `422` if insufficient stock — show `err.response.data.error` toast.

---

## 🔁 Transfers

### POST `/operations/transfers`
```json
{
  "sourceLocationId": "uuid",
  "destLocationId": "uuid",
  "scheduledDate": "2024-12-10",
  "lines": [
    { "productId": "uuid", "qty": 30 }
  ]
}
```
> ⚠️ Uses `qty` field — **not** `demandQty`/`doneQty`

---

## 🔧 Adjustments

### POST `/operations/adjustments`
```json
{
  "locationId": "uuid",
  "lines": [
    { "productId": "uuid", "countedQty": 45, "note": "Annual count" }
  ]
}
```

### GET `/operations/adjustments/prefill`
```
Query: ?productId=uuid&locationId=uuid
Response: { "systemQty": 50 }
```
> Used on the new adjustment form to pre-populate system quantity when a product is selected.

### GET `/operations/adjustments/{id}` — response includes:
```json
{
  "lines": [
    { "product": {...}, "systemQty": 50, "countedQty": 45, "difference": -5, "note": "..." }
  ]
}
```

---

## 📋 Move History

### GET `/move-history`
```
Query: ?type=receipt&productId=uuid&locationId=uuid&from=2024-01-01&to=2024-12-31&page=1&limit=50
Response: { data: [...], total: 500 }
```

```json
// Move record shape
{
  "id": "...",
  "createdAt": "2024-12-01T10:00:00Z",
  "referenceNo": "REC-0001",
  "type": "receipt",
  "product": { "id": "...", "name": "USB-C Cable", "sku": "USB-C-001" },
  "fromLocation": { "id": "...", "name": "Vendor" },
  "toLocation": { "id": "...", "name": "Main Warehouse" },
  "quantityChange": 95,
  "status": "done"
}
```

---

## ⚙️ Settings

### Warehouses
- `GET /settings/warehouses` → `{ data: [{ id, name, shortCode, address, locationCount }] }`
- `POST /settings/warehouses` → `{ name, shortCode, address? }`
- `PUT /settings/warehouses/{id}` → `{ name, shortCode, address? }`

### Locations
- `GET /settings/locations?warehouseId=uuid` → `{ data: [{ id, name, shortCode, warehouseType, warehouse }] }`
- `POST /settings/locations` → `{ name, shortCode, warehouseId, warehouseType }`
- `PUT /settings/locations/{id}` → `{ name, shortCode, warehouseType }`

---

## 👤 Profile

- `GET /auth/me` → current user object
- `PUT /profile` → `{ name, email }` → returns updated user object
- `PUT /profile/change-password` → `{ currentPassword, newPassword }`
