const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register
router.post('/register', authController.register);

// Login
router.post('/login', authController.login);

// Get user profile
router.get('/profile/:id', authController.getProfile);

// Admin: list all users
router.get('/users', authController.getAllUsers);

// Admin: delete user
router.delete('/users/:id', authController.deleteUser);

module.exports = router;
