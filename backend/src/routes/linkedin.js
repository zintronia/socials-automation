const express = require('express');
const router = express.Router();
const linkedinController = require('../controllers/linkedinController');

// LinkedIn OAuth flow
router.get('/auth/url', linkedinController.getAuthUrl);
router.get('/auth/callback', linkedinController.handleCallback);

// LinkedIn posting
router.post('/post', linkedinController.postContent);

module.exports = router;
