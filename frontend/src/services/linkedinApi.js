import axios from 'axios';

const API_BASE_URL = '/api/linkedin';

export const linkedinApi = {
  // Get LinkedIn OAuth URL
  getAuthUrl: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/url`);
      return response.data.url;
    } catch (error) {
      console.error('Error getting LinkedIn auth URL:', error);
      throw error;
    }
  },

  // Handle OAuth callback
  handleCallback: async (code) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/callback`, {
        params: { code }
      });
      return response.data;
    } catch (error) {
      console.error('Error handling LinkedIn callback:', error);
      throw error;
    }
  },

  // Post content to LinkedIn
  postContent: async (content, accessToken) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/post`,
        { content, accessToken },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error posting to LinkedIn:', error);
      throw error;
    }
  },
};

export default linkedinApi;
