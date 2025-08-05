const linkedinService = require('../services/linkedinService');

const linkedinController = {
  /**
   * Get LinkedIn OAuth URL for authentication
   */
  getAuthUrl: (req, res) => {
    try {
      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${process.env.LINKEDIN_REDIRECT_URI}&scope=profile%20email%20openid%20w_member_social%20w_organization_social`;
      res.json({ url: authUrl });
    } catch (error) {
      console.error('Error generating LinkedIn auth URL:', error);
      res.status(500).json({ error: 'Failed to generate LinkedIn auth URL' });
    }
  },

  /**
   * Handle OAuth callback from LinkedIn
   */
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
        expiresIn: tokens.expires_in,
        refreshToken: tokens.refresh_token
      });
    } catch (error) {
      console.error('Error in LinkedIn callback:', error);
      res.status(500).json({ 
        error: 'Failed to authenticate with LinkedIn',
        details: error.message 
      });
    }
  },

  /**
   * Generate LinkedIn post content from document content
   */
  generatePost: async (req, res) => {
    try {
      const { content } = req.body;
      
      if (!content) {
        return res.status(400).json({ error: 'Content is required' });
      }

      const postContent = await linkedinService.generatePost(content);
      res.json({ 
        success: true, 
        content: postContent
      });
    } catch (error) {
      console.error('Error generating LinkedIn post:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to generate LinkedIn post',
        details: error.message 
      });
    }
  },

  /**
   * Generate multiple variations of a LinkedIn post
   */
  generatePostVariations: async (req, res) => {
    try {
      const { content, count = 3 } = req.body;
      
      if (!content) {
        return res.status(400).json({ error: 'Content is required' });
      }

      const variations = await linkedinService.generatePostVariations(content, count);
      res.json({ 
        success: true, 
        count: variations.length,
        variations 
      });
    } catch (error) {
      console.error('Error generating LinkedIn post variations:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to generate LinkedIn post variations',
        details: error.message 
      });
    }
  },

  /**
   * Post content to LinkedIn
   */
  postContent: async (req, res) => {
    try {
      const { content, accessToken, media, visibility = 'PUBLIC' } = req.body;
      
      if (!content || !accessToken) {
        return res.status(400).json({ 
          success: false,
          error: 'Content and access token are required' 
        });
      }

      const result = await linkedinService.postContent(content, { 
        accessToken,
        media,
        visibility
      });

      res.json({ 
        success: true, 
        postId: result.id || result.updateUrl,
        message: 'Successfully posted to LinkedIn',
        data: result
      });
    } catch (error) {
      console.error('Error posting to LinkedIn:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to post to LinkedIn',
        details: error.message 
      });
    }
  },

  /**
   * Generate and post content to LinkedIn in one step
   */
  generateAndPost: async (req, res) => {
    try {
      const { content, accessToken, media, visibility = 'PUBLIC' } = req.body;
      
      if (!content || !accessToken) {
        return res.status(400).json({ 
          success: false,
          error: 'Content and access token are required' 
        });
      }

      // Set the access token for this request
      linkedinService.setAccessToken(accessToken);
      
      // Generate and post the content
      const result = await linkedinService.generateAndPost(content, { 
        media,
        visibility
      });

      res.json({ 
        success: true, 
        postId: result.id || result.updateUrl,
        message: 'Successfully generated and posted to LinkedIn',
        data: result
      });
    } catch (error) {
      console.error('Error in generate and post to LinkedIn:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to generate and post to LinkedIn',
        details: error.message 
      });
    }
  }
};

module.exports = linkedinController;
