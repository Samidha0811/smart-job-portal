const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Register API
router.post('/register', authController.register);

// Login API
router.post('/login', authController.login);

// Logout API
router.get('/logout', authController.logout);

// Get Current Logged-in User
router.get('/me', auth(), authController.getMe);

// Get User by ID (Simple for admin/demo)
router.get('/user/:userId', authController.getUserById);

module.exports = router;
