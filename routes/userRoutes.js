const express = require('express');
const {
  signup,
  login,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { getAllUsers } = require('../controllers/userController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

router.route('/').get(protect, restrictTo('admin'), getAllUsers);

module.exports = router;
