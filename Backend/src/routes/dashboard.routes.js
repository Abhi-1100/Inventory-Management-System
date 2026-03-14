const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/dashboard.controller');

router.use(authenticate);
router.get('/kpis', ctrl.getKPIs);

module.exports = router;
