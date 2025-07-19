const axios = require('axios');
const linkedinAIService = require('./linkedinAIService');

class LinkedInService {
  constructor() {
    this.clientId = process.env.LINKEDIN_CLIENT_ID;
    this.clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    this.redirectUri = process.env.LINKEDIN_REDIRECT_URI;
    this.apiBaseUrl = 'https://api.linkedin.com/v2';
    this.accessToken = null;
  }

  /**
   * Set the access token for API calls
   * @param {string} token - LinkedIn OAuth access token
   */
  setAccessToken(token) {
    this.accessToken = token;
  }

  /**
   * Get OAuth access token using authorization code
   * @param {string} code - Authorization code from LinkedIn
   * @returns {Promise<Object>} - Token response
   */
  async getAccessToken(code) {
    try {
      const response = await axios.post(
        'https://www.linkedin.com/oauth/v2/accessToken',
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.redirectUri,
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      this.accessToken = response.data.access_token;
      return response.data;
    } catch (error) {
      console.error('Error getting LinkedIn access token:', error.response?.data || error.message);
      throw new Error('Failed to get LinkedIn access token');
    }
  }

  /**
   * Generate a LinkedIn post from document content
   * @param {string} content - Document content
   * @returns {Promise<string>} - Generated post content
   */
  async generatePost(content) {
    try {
      return await linkedinAIService.generatePost(content);
    } catch (error) {
      console.error('Error in LinkedIn post generation:', error);
      throw error;
    }
  }

  /**
   * Generate multiple variations of a LinkedIn post
   * @param {string} content - Document content
   * @param {number} count - Number of variations to generate
   * @returns {Promise<Array>} - Array of post variations
   */
  async generatePostVariations(content, count = 3) {
    try {
      return await linkedinAIService.generatePostVariations(content, count);
    } catch (error) {
      console.error('Error generating LinkedIn post variations:', error);
      throw error;
    }
  }

  /**
   * Post content to LinkedIn
   * @param {string} content - Post content
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Post response
   */
  async postContent(content, options = {}) {
    const accessToken = options.accessToken || this.accessToken;
    if (!accessToken) {
      throw new Error('No access token available. Please authenticate first.');
    }

    try {
      // Get the current user's profile ID
      const profileResponse = await axios.get(
        `${this.apiBaseUrl}/me`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0',
          },
        }
      );

      const authorUrn = `urn:li:person:${profileResponse.data.id}`;

      // Prepare the post data
      const postData = {
        author: authorUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: content,
            },
            shareMediaCategory: 'NONE',
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': options.visibility || 'PUBLIC',
        },
      };

      // Add media if provided
      if (options.media) {
        postData.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'ARTICLE';
        postData.specificContent['com.linkedin.ugc.ShareContent'].media = [{
          status: 'READY',
          description: {
            text: options.media.description || '',
          },
          originalUrl: options.media.url,
          title: {
            text: options.media.title || '',
          },
        }];
      }

      // Make the API request
      const response = await axios.post(
        `${this.apiBaseUrl}/ugcPosts`,
        postData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0',
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error posting to LinkedIn:', error.response?.data || error.message);
      throw new Error('Failed to post to LinkedIn');
    }
  }

  /**
   * Generate and post content to LinkedIn
   * @param {string} content - Original content to generate post from
   * @param {Object} options - Posting options
   * @returns {Promise<Object>} - Post response
   */
  async generateAndPost(content, options = {}) {
    try {
      const postContent = await this.generatePost(content);
      return await this.postContent(postContent, options);
    } catch (error) {
      console.error('Error in generate and post:', error);
      throw error;
    }
  }
}

module.exports = new LinkedInService();
