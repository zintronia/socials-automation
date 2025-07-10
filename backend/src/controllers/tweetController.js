const db = require('../config/database');
const twitterService = require('../services/twitterService');
const aiService = require('../services/aiService');
const nodeCron = require('node-cron');

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

      // Save tweets to database
      const stmt = db.prepare(`
        INSERT INTO tweets (content, document_id, status, keywords, sentiment)
        VALUES (?, ?, ?, ?, ?)
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

      // Post to Twitter
      const twitterId = await twitterService.postTweet(tweet.content);

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
      // Get all tweets with their associated document information
      const tweets = await new Promise((resolve, reject) => {
        db.all(
          'SELECT t.*, d.filename FROM tweets t LEFT JOIN documents d ON t.document_id = d.id ORDER BY t.created_at DESC',
          (err, rows) => {
            if (err) {
              // If table doesn't exist, create it and retry
              if (err.message.includes('no such table')) {
                const createTweetsTable = `
                  CREATE TABLE tweets (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    content TEXT NOT NULL,
                    document_id INTEGER,
                    status TEXT DEFAULT 'pending',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    posted_at DATETIME,
                    scheduled_at DATETIME,
                    twitter_id TEXT,
                    FOREIGN KEY (document_id) REFERENCES documents(id)
                  )
                `;
                db.exec(createTweetsTable, (err) => {
                  if (err) reject(err);
                  // Retry the query
                  db.all(
                    'SELECT t.*, d.filename FROM tweets t LEFT JOIN documents d ON t.document_id = d.id ORDER BY t.created_at DESC',
                    (err, rows) => {
                      if (err) reject(err);
                      resolve(rows || []);
                    }
                  );
                });
              } else {
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

      const stats = await twitterService.getTweetStats(tweet.twitter_id);
      res.json(stats);
    } catch (error) {
      console.error('Error getting tweet stats:', error);
      res.status(500).json({ error: 'Failed to get tweet statistics' });
    }
  }
};

// Initialize cron jobs for scheduled tweets
nodeCron.schedule('*/1 * * * *', async () => {
  try {
    // Get all scheduled tweets that should be posted now
    const now = new Date();
    const tweets = await new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM tweets WHERE status = ? AND scheduled_at <= ? AND twitter_id IS NULL',
        ['scheduled', now.toISOString()],
        (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        }
      );
    });

    // Post each scheduled tweet
    for (const tweet of tweets) {
      try {
        await tweetController.post({ params: { tweetId: tweet.id } });
      } catch (error) {
        console.error(`Error posting scheduled tweet ${tweet.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in scheduled tweet job:', error);
  }
});

module.exports = tweetController;
