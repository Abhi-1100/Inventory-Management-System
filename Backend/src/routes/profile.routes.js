const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const ctrl = require('../controllers/profile.controller');

router.use(authenticate);

router.put(
  '/',
  [body('name').notEmpty(), body('email').isEmail()],
  validate,
  ctrl.updateProfile
);

router.put(
  '/change-password',
  [body('currentPassword').notEmpty(), body('newPassword').isLength({ min: 8 })],
  validate,
  ctrl.changePassword
);

module.exports = router;
