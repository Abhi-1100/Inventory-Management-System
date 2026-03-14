const fs = require('fs');

const BASE_URL = 'http://localhost:5001';
let token = '';
let warehouseId = '';
let locationId = '';
let categoryId = '';
let productId = '';
let receiptId = '';
let deliveryId = '';
let secondLocationId = '';
let transferId = '';
let adjustmentId = '';
let dummyReceiptId = '';

async function testApi(name, method, endpoint, body = null, headers = {}, tokenNeeded = true) {
  console.log(`\n[...] Testing ${name} (${method} ${endpoint})`);
  
  const reqHeaders = { 'Content-Type': 'application/json', ...headers };
  if (tokenNeeded && token) {
    reqHeaders['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers: reqHeaders,
  };
  if (body) options.body = JSON.stringify(body);

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, options);
    let data;
    const text = await res.text();
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    if (res.ok) {
      console.log(`[PASS] ${name} - Status: ${res.status}`);
      return { ok: true, status: res.status, data };
    } else {
      console.log(`[FAIL] (Expected if testing error cases) ${name} - Status: ${res.status}`);
      if (res.status >= 500) console.error(`Response:`, data);
      return { ok: false, status: res.status, data };
    }
  } catch (err) {
    console.error(`[ERROR] ${name}: ${err.message}`);
    return { ok: false, error: err.message };
  }
}

async function runTests() {
  console.log('--- STARTING ALL API TESTS ---');

  // STEP 1 - AUTH APIs
  let res = await testApi('1. Login', 'POST', '/api/auth/login', { email: 'admin@coreinventory.com', password: 'Admin@1234' }, {}, false);
  if (!res.ok) return console.log('Login failed, stopping.');
  token = res.data.token;

  res = await testApi('2. Get Profile', 'GET', '/api/auth/me');
  res = await testApi('3. Update Profile', 'PUT', '/api/profile', { name: 'Admin Updated', email: 'admin@coreinventory.com' });
  res = await testApi('4. Change Password', 'PUT', '/api/profile/change-password', { currentPassword: 'Admin@1234', newPassword: 'Admin@1234' });

  // STEP 2 - SETTINGS
  res = await testApi('5. Create Warehouse', 'POST', '/api/settings/warehouses', { name: 'Test WH Auth', shortCode: 'TW' + Date.now().toString().slice(-4), address: 'Company HQ' });
  if (res.ok && res.data.id) warehouseId = res.data.id;
  
  res = await testApi('6. List Warehouses', 'GET', '/api/settings/warehouses');
  if (!warehouseId && res.ok && res.data.data.length > 0) {
    warehouseId = res.data.data[0].id;
  }

  res = await testApi('7. Update Warehouse', 'PUT', `/api/settings/warehouses/${warehouseId}`, { name: 'Main Warehouse Updated', shortCode: 'TW' + Date.now().toString().slice(-4), address: 'HQ Updated' });
  
  res = await testApi('8. Create Location', 'POST', '/api/settings/locations', { name: 'Test Loc', shortCode: 'TL' + Date.now().toString().slice(-4), warehouseId, warehouseType: 'INTERNAL' });
  if (res.ok && res.data.id) locationId = res.data.id;

  res = await testApi('9. List Locations', 'GET', '/api/settings/locations');
  if (!locationId && res.ok && res.data.data.length > 0) {
    locationId = res.data.data[0].id;
  }

  res = await testApi('10. List Locations by WH', 'GET', `/api/settings/locations?warehouseId=${warehouseId}`);

  // STEP 3 - PRODUCTS & CATEGORIES
  res = await testApi('11. Create Category', 'POST', '/api/products/categories', { name: 'Cat-' + Date.now() });
  if (res.ok && res.data.id) categoryId = res.data.id;
  
  res = await testApi('12. List Categories', 'GET', '/api/products/categories');
  if (!categoryId && res.ok && res.data.data && res.data.data.length > 0) {
    categoryId = res.data.data[0].id;
  }

  res = await testApi('13. Create Product', 'POST', '/api/products', { name: 'Product ' + Date.now(), sku: 'SKU-' + Date.now(), categoryId, unitOfMeasure: 'pcs', initialStock: 100, initialLocationId: locationId });
  if (res.ok && res.data.id) productId = res.data.id;

  res = await testApi('14. List Products', 'GET', '/api/products');
  if (!productId && res.ok && res.data.data && res.data.data.length > 0) {
    productId = res.data.data[0].id;
  }

  res = await testApi('15. Search Products', 'GET', '/api/products?search=Product');
  res = await testApi('16. Get Product', 'GET', `/api/products/${productId}`);
  res = await testApi('17. Update Product', 'PUT', `/api/products/${productId}`, { name: 'Updated Product ' + Date.now(), sku: 'SKU-' + Date.now(), categoryId, unitOfMeasure: 'pcs' });

  res = await testApi('18. Create Reorder Rule', 'POST', '/api/products/reorder-rules', { productId, locationId, minQty: 10, maxQty: 100 });
  res = await testApi('19. List Reorder Rules', 'GET', '/api/products/reorder-rules');

  // STEP 4 - RECEIPTS
  res = await testApi('20. Create Receipt', 'POST', '/api/operations/receipts', { supplierName: 'Supplier ABC', destLocationId: locationId, scheduledDate: '2026-03-20', lines: [{ productId, demandQty: 50, doneQty: 50 }] });
  if (res.ok && res.data.id) receiptId = res.data.id;

  res = await testApi('21. List Receipts', 'GET', '/api/operations/receipts');
  res = await testApi('22. Get Receipt', 'GET', `/api/operations/receipts/${receiptId}`);
  res = await testApi('23. Update Receipt', 'PUT', `/api/operations/receipts/${receiptId}`, { supplierName: 'Supplier XYZ', destLocationId: locationId, lines: [{ productId, demandQty: 50, doneQty: 50 }] });
  res = await testApi('24. Validate Receipt', 'POST', `/api/operations/receipts/${receiptId}/validate`);

  res = await testApi('25A. Create Dummy Receipt', 'POST', '/api/operations/receipts', { supplierName: 'Supplier Dummy', destLocationId: locationId, lines: [{ productId, demandQty: 10, doneQty: 10 }] });
  if (res.ok && res.data.id) dummyReceiptId = res.data.id;
  res = await testApi('25. Cancel Receipt', 'POST', `/api/operations/receipts/${dummyReceiptId}/cancel`);

  // STEP 5 - DELIVERIES
  res = await testApi('26. Create Delivery', 'POST', '/api/operations/deliveries', { customerName: 'Customer XYZ', sourceLocationId: locationId, scheduledDate: '2026-03-21', lines: [{ productId, demandQty: 10, doneQty: 10 }] });
  if (res.ok && res.data.id) deliveryId = res.data.id;

  res = await testApi('27. List Deliveries', 'GET', '/api/operations/deliveries');
  res = await testApi('28. Get Delivery', 'GET', `/api/operations/deliveries/${deliveryId}`);
  res = await testApi('29. Validate Delivery', 'POST', `/api/operations/deliveries/${deliveryId}/validate`);

  res = await testApi('30. Insufficient Stock Delivery', 'POST', '/api/operations/deliveries', { customerName: 'Greedy Customer', sourceLocationId: locationId, lines: [{ productId, demandQty: 99999, doneQty: 99999 }] });
  if (res.ok) {
     await testApi('30B. Validate Insufficient Stock', 'POST', `/api/operations/deliveries/${res.data.id}/validate`);
  }

  // STEP 6 - TRANSFERS
  res = await testApi('31. Create Second Location', 'POST', '/api/settings/locations', { name: 'Secondary Store', shortCode: 'SS' + Date.now().toString().slice(-4), warehouseId, warehouseType: 'INTERNAL' });
  if (res.ok && res.data.id) secondLocationId = res.data.id;

  res = await testApi('32. Create Transfer', 'POST', '/api/operations/transfers', { sourceLocationId: locationId, destLocationId: secondLocationId, scheduledDate: '2026-03-22', lines: [{ productId, qty: 5 }] });
  if (res.ok && res.data.id) transferId = res.data.id;

  res = await testApi('33. List Transfers', 'GET', '/api/operations/transfers');
  res = await testApi('34. Get Transfer', 'GET', `/api/operations/transfers/${transferId}`);
  res = await testApi('35. Validate Transfer', 'POST', `/api/operations/transfers/${transferId}/validate`);

  // STEP 7 - ADJUSTMENTS
  res = await testApi('36. Get Prefill Data', 'GET', `/api/operations/adjustments/prefill?productId=${productId}&locationId=${locationId}`);
  res = await testApi('37. Create Adjustment', 'POST', '/api/operations/adjustments', { locationId, lines: [{ productId, countedQty: 200, note: 'Physical count' }] });
  if (res.ok && res.data.id) adjustmentId = res.data.id;

  res = await testApi('38. List Adjustments', 'GET', '/api/operations/adjustments');
  res = await testApi('39. Get Adjustment', 'GET', `/api/operations/adjustments/${adjustmentId}`);
  res = await testApi('40. Validate Adjustment', 'POST', `/api/operations/adjustments/${adjustmentId}/validate`);

  // STEP 8 - DASHBOARD
  res = await testApi('41. Get KPIs', 'GET', '/api/dashboard/kpis');

  // STEP 9 - MOVE HISTORY
  res = await testApi('42. Move History', 'GET', '/api/move-history');
  res = await testApi('43. Move History (Receipt)', 'GET', '/api/move-history?type=RECEIPT');
  res = await testApi('44. Move History (Product)', 'GET', `/api/move-history?productId=${productId}`);
  res = await testApi('45. Move History (Date)', 'GET', '/api/move-history?from=2026-01-01&to=2026-12-31');

  // STEP 10 - ERROR CASES
  res = await testApi('46. Missing Token', 'GET', '/api/auth/me', null, {}, false);
  res = await testApi('47. Invalid Token', 'GET', '/api/auth/me', null, { Authorization: 'Bearer INVALID_TOKEN' }, false);
  res = await testApi('48. Edit DONE Operation', 'PUT', `/api/operations/deliveries/${deliveryId}`, { customerName: 'Illegal Update' });
  res = await testApi('49. Validate already DONE', 'POST', `/api/operations/receipts/${receiptId}/validate`);
  res = await testApi('50. Delete Category with Products', 'DELETE', `/api/products/categories/${categoryId}`);

  console.log('--- TEST RUN COMPLETE ---');
}

runTests();
