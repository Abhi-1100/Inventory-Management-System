const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/auth.controller');

router.post(
  '/register',
  [body('name').notEmpty(), body('email').isEmail(), body('password').isLength({ min: 8 })],
  validate,
  ctrl.register
);

router.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty()],
  validate,
  ctrl.login
);

router.post(
  '/forgot-password',
  [body('email').isEmail()],
  validate,
  ctrl.forgotPassword
);

router.post(
  '/verify-otp',
  [body('email').isEmail(), body('otp').notEmpty()],
  validate,
  ctrl.verifyOTP
);

router.post(
  '/reset-password',
  [body('email').isEmail(), body('otp').notEmpty(), body('newPassword').isLength({ min: 8 })],
  validate,
  ctrl.resetPassword
);

router.get('/me', authenticate, ctrl.getMe);

module.exports = router;
