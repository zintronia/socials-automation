const { db } = require('../config/database');
const tweetController = require('../controllers/tweetController');
const nodeCron = require('node-cron');

// Initialize cron jobs for scheduled tweets
function initScheduledJobs() {
  console.log('Initializing scheduled tweet jobs...');

  // Run every minute to check for tweets to post
  nodeCron.schedule('* * * * *', async () => {
    try {
      console.log('Checking for scheduled tweets...');
      // Get all scheduled tweets that should be posted now

      //get all the tweets which are scheldued and printyed to console just for debuggiung

      const now = new Date();
      const tweets = await new Promise((resolve, reject) => {
        db.all(
          'SELECT * FROM tweets WHERE status = ? AND scheduled_at <= ? AND twitter_id IS NULL',
          ['scheduled', now.toISOString()],
          (err, rows) => {
            if (err) {
              console.error('Error fetching scheduled tweets:', err);
              resolve([]);
            } else {
              resolve(rows || []);
            }
          }
        );
      });

      console.log(`Found ${tweets.length} tweets to post-----`);

      // Post each scheduled tweet
      for (const tweet of tweets) {
        try {
          if (!tweet.user_id) {
            console.error(`Skipping tweet ${tweet.id}: No user_id associated`);
            continue;
          }

          // Get the tweet with user information
          const fullTweet = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM tweets WHERE id = ?', [tweet.id], (err, row) => {
              if (err) reject(err);
              resolve(row);
            });
          });

          if (!fullTweet) {
            console.error(`Tweet ${tweet.id} not found`);
            continue;
          }

          // Create a mock request object with the tweet's user ID
          const mockReq = {
            params: { tweetId: tweet.id },
            user: { id: tweet.user_id },
            tweet: fullTweet
          };

          // Create a mock response object
          const mockRes = {
            json: (data) => {
              console.log(`Successfully posted tweet ${tweet.id} for user ${tweet.user_id}:`, data);
            },
            status: (code) => ({
              json: (data) => {
                console.error(`Error posting tweet ${tweet.id} for user ${tweet.user_id} (${code}):`, data);
              }
            })
          };

          // Call the post method with the mock request/response
          await tweetController.post(mockReq, mockRes);
        } catch (error) {
          console.error(`Error in scheduled job for tweet ${tweet.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in scheduled tweet job:', error);
    }
  });
}

module.exports = { initScheduledJobs };
