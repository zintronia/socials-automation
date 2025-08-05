const express = require('express');
const router = express.Router();
const tweetController = require('../controllers/tweetController');

// Routes
router.post('/generate/:documentId', tweetController.generate);
router.post('/schedule', tweetController.schedule);
router.post('/:tweetId/post', tweetController.post);
router.get('/', tweetController.list);
router.get('/:tweetId/stats', tweetController.getStats);

module.exports = router;
