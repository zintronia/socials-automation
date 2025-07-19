const express = require('express');
const router = express.Router();
const linkedinController = require('../controllers/linkedinController');

// LinkedIn OAuth flow
router.get('/auth/url', linkedinController.getAuthUrl);
router.get('/auth/callback', linkedinController.handleCallback);

// Content generation endpoints
router.post('/generate', linkedinController.generatePost);
router.post('/generate/variations', linkedinController.generatePostVariations);

// Posting endpoints
router.post('/post', linkedinController.postContent);
router.post('/generate-and-post', linkedinController.generateAndPost);

module.exports = router;
