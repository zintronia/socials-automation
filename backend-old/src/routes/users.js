const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes (require authentication)
router.use(authenticate);
router.get('/me', userController.getCurrentUser);
router.get('/connected-apps', userController.getConnectedApps);

module.exports = router;
