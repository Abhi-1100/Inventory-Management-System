const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/dashboard.controller');

router.use(authenticate);
router.get('/kpis', ctrl.getKPIs);
router.get('/stock-movement', ctrl.getStockMovement);
router.get('/inventory-alerts', ctrl.getInventoryAlerts);
router.get('/recent-activity', ctrl.getRecentActivity);

module.exports = router;
