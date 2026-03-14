const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/delivery.controller');

router.use(authenticate);

router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.get('/:id', ctrl.getOne);
router.put('/:id', ctrl.update);
router.post('/:id/validate', ctrl.validate);
router.post('/:id/cancel', ctrl.cancel);

module.exports = router;
