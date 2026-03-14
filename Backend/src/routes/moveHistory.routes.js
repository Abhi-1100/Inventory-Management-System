const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/moveHistory.controller');

router.use(authenticate);
router.get('/', ctrl.list);

module.exports = router;
