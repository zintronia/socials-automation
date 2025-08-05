const express = require('express');
const { TwitterApi } = require('twitter-api-v2');
const { redis } = require('../config/database.js');
const { authenticate } = require('../middleware/auth.middleware.js');

const router = express.Router();

const getTwitterClient = (accessToken, refreshToken) => {
  return new TwitterApi({
    clientId: process.env.TWITTER_CLIENT_ID,
    clientSecret: process.env.TWITTER_CLIENT_SECRET,
    accessToken,
    refreshToken,
  });
};

// 1. Get Authorization URL
router.get('/auth/url', (req, res) => {
  try {
    const client = new TwitterApi({
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
    });

    const { url, codeVerifier, state } = client.generateOAuth2AuthLink(
      `${process.env.FRONTEND_URL}/twitter`,
      {
        scope: ['tweet.read', 'tweet.write', 'users.read', 'offline.access']
      }
    );

    // Store state and code_verifier in Redis for the callback
    redis.set(`twitter_oauth:${state}`, JSON.stringify({ codeVerifier }), 'EX', 600); // 10 minute expiry
    console.log(url, state, codeVerifier, 'authUrl, state, codeVerifier');

    res.json({
      url,
      state
      // Do NOT send the codeVerifier to the client
    });
  } catch (error) {
    console.error('Error generating Twitter auth URL:', error);
    res.status(500).send('Failed to generate auth URL');
  }
});

// 2. Handle Callback
router.post('/auth/callback', authenticate, async (req, res) => {
  const { code, state } = req.body;
  console.log(code, state, 'code, state from request');

  try {
    const storedData = await redis.get(`twitter_oauth:${state}`);
    if (!storedData) {
      return res.status(400).send('Invalid or expired state.');
    }

    const { codeVerifier: storedCodeVerifier } = JSON.parse(storedData);
    if (!storedCodeVerifier) {
      return res.status(400).send('Code verifier not found in session.');
    }

    const client = new TwitterApi({
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
    });

    const { accessToken, refreshToken, expiresIn } = await client.loginWithOAuth2({
      code,
      codeVerifier: storedCodeVerifier, // Use the verifier from Redis
      redirectUri: `${process.env.FRONTEND_URL}/twitter`,
    });

    const userClient = new TwitterApi(accessToken);
    const { data: userData } = await userClient.v2.me();
    // Store tokens securely, associated with your app's user ID
    const appUserId = req.user.id; // From your app's auth middleware
    const userKey = `user:${appUserId}:twitter`;
    await redis.set(userKey, JSON.stringify({
      accessToken,
      refreshToken,
      expiresAt: Date.now() + expiresIn * 1000,
      twitterUserId: userData.id,
      username: userData.username
    }));

    res.json({ success: true });

  } catch (error) {
    console.error('Error in Twitter OAuth callback:', error);
    res.status(500).send('Failed to authenticate with Twitter');
  }
});

// 3. Get Authenticated User
router.get('/me', authenticate, async (req, res) => {
  try {
    const userKey = `user:${req.user.id}:twitter`;
    const twitterData = await redis.get(userKey);
    if (!twitterData) {
      return res.status(404).json({ error: 'Twitter account not connected.' });
    }

    res.json(JSON.parse(twitterData));
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// 4. Disconnect User
router.post('/disconnect', authenticate, async (req, res) => {
  try {
    const userKey = `user:${req.user.id}:twitter`;
    await redis.del(userKey);
    res.json({ success: true });
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// 5. Post a Tweet
router.post('/tweets', authenticate, async (req, res) => {
  const { text } = req.body;
  try {
    const userKey = `user:${req.user.id}:twitter`;
    const twitterData = JSON.parse(await redis.get(userKey));

    if (!twitterData) {
      return res.status(401).send('Twitter account not connected.');
    }

    // Handle token refresh if necessary
    const client = getTwitterClient(twitterData.accessToken, twitterData.refreshToken);
    // The library handles refresh automatically if needed

    await client.v2.tweet(text);
    res.status(201).json({ success: true, message: 'Tweet posted' });

  } catch (error) {
    console.error('Error posting tweet:', error);
    res.status(500).send('Failed to post tweet');
  }
});

module.exports = router;
