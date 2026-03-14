const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/settings.controller');

router.use(authenticate);

router.get('/warehouses', ctrl.listWarehouses);
router.post('/warehouses', ctrl.createWarehouse);
router.put('/warehouses/:id', ctrl.updateWarehouse);
router.get('/locations', ctrl.listLocations);
router.post('/locations', ctrl.createLocation);
router.put('/locations/:id', ctrl.updateLocation);

module.exports = router;
