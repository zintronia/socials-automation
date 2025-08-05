const { TwitterApi } = require('twitter-api-v2');

const twitterService = {
  async postTweet(accessToken, content) {
    console.log('Posting tweet with access token:', accessToken);
    console.log('Posting tweet with content:', content);
    try {
      const userClient = new TwitterApi(accessToken);
      const tweet = await userClient.v2.tweet(content);
      return tweet.data.id;
    } catch (error) {
      console.error('Error posting tweet:', error);
      throw error;
    }
  },

  async getTweetStats(accessToken, tweetId) {
    try {
      const userClient = new TwitterApi(accessToken);
      const tweet = await userClient.v2.singleTweet(tweetId, {
        'tweet.fields': ['public_metrics'],
      });
      return tweet.data.public_metrics;
    } catch (error) {
      console.error('Error getting tweet stats:', error);
      throw error;
    }
  },
};

module.exports = twitterService;
