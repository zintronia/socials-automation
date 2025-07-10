const { TwitterApi } = require('twitter-api-v2');

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

const twitterService = {
  async postTweet(content) {
    try {
      const tweet = await twitterClient.v2.tweet(content);
      return tweet.data.id;
    } catch (error) {
      console.error('Error posting tweet:', error);
      throw error;
    }
  },

  async getTweetStats(tweetId) {
    try {
      const tweet = await twitterClient.v2.singleTweet(tweetId, { 
        'tweet.fields': ['public_metrics'] 
      });
      return tweet.data.public_metrics;
    } catch (error) {
      console.error('Error getting tweet stats:', error);
      throw error;
    }
  },

  async verifyCredentials() {
    try {
      const user = await twitterClient.v2.me();
      return user.data;
    } catch (error) {
      console.error('Error verifying credentials:', error);
      throw error;
    }
  }
};

module.exports = twitterService;
