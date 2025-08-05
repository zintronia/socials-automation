const twitterService = require('../services/social/twitter.service');
const { validationResult } = require('express-validator');

class TweetController {
  async generateTweets(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { documentId } = req.params;
      const { count = 3 } = req.body;
      const userId = req.user.id;

      const tweets = await twitterService.generateTweets(documentId, userId, count);
      res.status(201).json({ success: true, data: tweets });
    } catch (error) {
      next(error);
    }
  }

  async scheduleTweet(req, res, next) {
    try {
      const { tweetId } = req.params;
      const { scheduleTime } = req.body;
      const userId = req.user.id;

      // Verify ownership
      const tweet = await tweetModel.findOne(tweetId);
      if (!tweet || tweet.user_id !== userId) {
        return res.status(404).json({ error: 'Tweet not found or access denied' });
      }

      const result = await twitterService.scheduleTweet(tweetId, scheduleTime);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async postTweet(req, res, next) {
    try {
      const { tweetId } = req.params;
      const userId = req.user.id;

      // Verify ownership
      const tweet = await tweetModel.findOne(tweetId);
      if (!tweet || tweet.user_id !== userId) {
        return res.status(404).json({ error: 'Tweet not found or access denied' });
      }

      const result = await twitterService.postTweet(tweetId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async listTweets(req, res, next) {
    try {
      const { status, limit = 10, page = 1 } = req.query;
      const userId = req.user.id;

      const tweets = await twitterService.getUserTweets(userId, {
        status,
        limit: parseInt(limit),
        offset: (page - 1) * limit
      });

      res.json({ success: true, data: tweets });
    } catch (error) {
      next(error);
    }
  }

  async getTweetStats(req, res, next) {
    try {
      const userId = req.user.id;
      const stats = await twitterService.getTweetStats(userId);
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TweetController();
