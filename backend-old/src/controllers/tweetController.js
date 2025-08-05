const { db, redis } = require('../config/database');
const twitterService = require('../services/twitterService');
const aiService = require('../services/aiService');
const nodeCron = require('node-cron');
const { log } = require('winston');

const tweetController = {
  async generate(req, res) {
    try {
      const { documentId } = req.params;
      const { count = 3 } = req.body;

      // Get document content
      const doc = await new Promise((resolve, reject) => {
        db.get('SELECT content FROM documents WHERE id = ?', [documentId], (err, row) => {
          if (err) reject(err);
          resolve(row);
        });
      });

      if (!doc) {
        return res.status(404).json({ error: 'Document not found' });
      }

      // Generate tweet variations
      const variations = await aiService.generateVariations(doc.content, count);

      // Get the authenticated user ID
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Save tweets to database
      const stmt = db.prepare(`
        INSERT INTO tweets (content, document_id, user_id, status, keywords, sentiment)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      // Process variations and handle both JSON and plain text responses
      const processedVariations = variations.map(variation => {
        // If the response is a string (plain text), create a basic tweet object
        if (typeof variation === 'string') {
          return {
            tweet: variation.trim().substring(0, 277) + (variation.length > 277 ? '...' : ''),
            keywords: [],
            sentiment: 'neutral'
          };
        }
        // If the response is an object, use its properties
        return {
          tweet: variation.tweet || variation.text || variation.content,
          keywords: variation.keywords || [],
          sentiment: variation.sentiment || 'neutral'
        };
      });

      // Insert tweets into database
      const results = await Promise.all(processedVariations.map(async (variation) => {
        const result = await stmt.run(
          variation.tweet,
          documentId,
          userId, // Add user ID to the tweet
          'pending',
          JSON.stringify(variation.keywords),
          variation.sentiment
        );
        return {
          id: result.lastID,
          content: variation.tweet,
          status: 'pending',
          keywords: variation.keywords,
          sentiment: variation.sentiment
        };
      }));

      res.json({
        success: true,
        tweets: results
      });
    } catch (error) {
      console.error('Error generating tweets:', error);
      res.status(500).json({
        error: 'Failed to generate tweets',
        details: error.message
      });
    }
  },

  async schedule(req, res) {
    try {
      const { tweetId, scheduledAt } = req.body;

      // Update tweet status and scheduled time
      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE tweets SET status = ?, scheduled_at = ? WHERE id = ?',
          ['scheduled', scheduledAt, tweetId],
          (err) => {
            if (err) reject(err);
            resolve();
          }
        );
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Error scheduling tweet:', error);
      res.status(500).json({ error: 'Failed to schedule tweet' });
    }
  },

  async post(req, res) {
    try {
      const { tweetId } = req.params;
      console.log(tweetId, 'tweetId*********');
      // Get tweet content
      const tweet = await new Promise((resolve, reject) => {
        db.get('SELECT content FROM tweets WHERE id = ?', [tweetId], (err, row) => {
          if (err) reject(err);
          resolve(row);
        });
      });
      if (!tweet) {
        return res.status(404).json({ error: 'Tweet not found' });
      }

      const appUserId = req.user.id;

      const userKey = `user:${appUserId}:twitter`;

      let tokenDataString
      try {
        tokenDataString = await redis.get(userKey);

      } catch (error) {
        console.error('Error getting token data:', error);
        return res.status(500).json({ error: 'Failed to get token data' });
      }

      if (!tokenDataString) {
        return res.status(401).json({ error: 'Twitter account not connected.' });
      }
      const { accessToken } = JSON.parse(tokenDataString);
      // Post to Twitter
      const twitterId = await twitterService.postTweet(accessToken, tweet.content);
      // Update tweet status
      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE tweets SET status = ?, twitter_id = ?, posted_at = CURRENT_TIMESTAMP WHERE id = ?',
          ['posted', twitterId, tweetId],
          (err) => {
            if (err) reject(err);
            resolve();
          }
        );
      });

      res.json({ success: true, twitterId });
    } catch (error) {
      console.error('Error posting tweet:', error);
      res.status(500).json({ error: 'Failed to post tweet' });
    }
  },

  async list(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Get tweets for the authenticated user with their associated document information
      const tweets = await new Promise((resolve, reject) => {
        db.all(
          `SELECT t.*, d.filename 
           FROM tweets t 
           LEFT JOIN documents d ON t.document_id = d.id 
           WHERE t.user_id = ? 
           ORDER BY t.created_at DESC`,
          [userId],
          (err, rows) => {
            if (err) {
              // If table doesn't exist, create it and retry
              if (err.message.includes('no such table')) {
                const createTweetsTable = `
                  CREATE TABLE tweets (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    content TEXT NOT NULL,
                    document_id INTEGER,
                    user_id INTEGER NOT NULL,
                    status TEXT DEFAULT 'pending',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    posted_at DATETIME,
                    scheduled_at DATETIME,
                    twitter_id TEXT,
                    keywords TEXT,
                    sentiment TEXT,
                    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                  )
                `;
                db.exec(createTweetsTable, (err) => {
                  if (err) {
                    console.error('Error creating tweets table:', err);
                    return reject(err);
                  }
                  // Return empty array since we just created the table
                  resolve([]);
                });
              } else {
                console.error('Error fetching tweets:', err);
                reject(err);
              }
            } else {
              resolve(rows || []);
            }
          }
        );
      });

      res.json(tweets);
    } catch (error) {
      console.error('Error listing tweets:', error);
      res.status(500).json({
        error: 'Failed to list tweets',
        details: error.message
      });
    }
  },

  async getStats(req, res) {
    try {
      const { tweetId } = req.params;

      const tweet = await new Promise((resolve, reject) => {
        db.get('SELECT twitter_id FROM tweets WHERE id = ?', [tweetId], (err, row) => {
          if (err) reject(err);
          resolve(row);
        });
      });

      if (!tweet || !tweet.twitter_id) {
        return res.status(404).json({ error: 'Tweet statistics not available' });
      }

      const appUserId = req.user.id;
      const userKey = `user:${req.user.id}:twitter`;
      const twitterData = await redis.get(userKey);

      if (!tokentwitterDataDataString) {
        return res.status(401).json({ error: 'Twitter account not connected.' });
      }

      const { accessToken } = JSON.parse(tokenDataString);

      const stats = await twitterService.getTweetStats(accessToken, tweet.twitter_id);
      res.json(stats);
    } catch (error) {
      console.error('Error getting tweet stats:', error);
      res.status(500).json({ error: 'Failed to get tweet statistics' });
    }
  }
};

module.exports = tweetController;
