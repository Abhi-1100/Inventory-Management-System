const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/product.controller');

router.use(authenticate);

router.get('/', ctrl.listProducts);
router.post('/', ctrl.createProduct);
router.get('/categories', ctrl.listCategories);
router.post('/categories', ctrl.createCategory);
router.delete('/categories/:id', ctrl.deleteCategory);
router.get('/reorder-rules', ctrl.listReorderRules);
router.post('/reorder-rules', ctrl.upsertReorderRule);
router.get('/alerts/low-stock', ctrl.getLowStockAlerts);
router.get('/:id', ctrl.getProduct);
router.put('/:id', ctrl.updateProduct);
router.delete('/:id', ctrl.deleteProduct);

module.exports = router;
