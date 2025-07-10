const linkedinService = require('../services/linkedinService');

const linkedinController = {
  // Get LinkedIn OAuth URL
  getAuthUrl: (req, res) => {
    try {
      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${process.env.LINKEDIN_REDIRECT_URI}&scope=profile%20email%20openid%20w_member_social`;
      res.json({ url: authUrl });
    } catch (error) {
      console.error('Error generating LinkedIn auth URL:', error);
      res.status(500).json({ error: 'Failed to generate LinkedIn auth URL' });
    }
  },

  // Handle OAuth callback
  handleCallback: async (req, res) => {
    try {
      const { code } = req.query;
      if (!code) {
        return res.status(400).json({ error: 'Authorization code is required' });
      }

      const tokens = await linkedinService.getAccessToken(code);
      // In a real app, you'd want to store these tokens securely
      res.json({ 
        success: true, 
        accessToken: tokens.access_token,
        expiresIn: tokens.expires_in
      });
    } catch (error) {
      console.error('Error in LinkedIn callback:', error);
      res.status(500).json({ error: 'Failed to authenticate with LinkedIn' });
    }
  },

  // Post content to LinkedIn
  postContent: async (req, res) => {
    try {
      const { content, accessToken } = req.body;
      
      if (!content || !accessToken) {
        return res.status(400).json({ error: 'Content and access token are required' });
      }

      const result = await linkedinService.postContent(accessToken, content);
      res.json({ 
        success: true, 
        postId: result.id,
        message: 'Successfully posted to LinkedIn'
      });
    } catch (error) {
      console.error('Error posting to LinkedIn:', error);
      res.status(500).json({ 
        error: 'Failed to post to LinkedIn',
        details: error.message 
      });
    }
  },
};

module.exports = linkedinController;
