const express = require('express');
const { signup, login, protect } = require('../controllers/authController');
const { getAllUsers } = require('../controllers/userController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

router.route('/').get(protect, getAllUsers);

module.exports = router;
