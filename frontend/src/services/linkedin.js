import { API_BASE, handleResponse, createHeaders } from './config';

/**
 * LinkedIn service for handling LinkedIn-related API calls
 */

export const linkedin = {
  /**
   * Gets the LinkedIn OAuth URL
   * @returns {Promise<string>} OAuth URL
   */
  getAuthUrl: async () => {
    const response = await fetch(`${API_BASE}/linkedin/auth/url`, {
      headers: createHeaders(),
    });
    const data = await handleResponse(response);
    return data.url;
  },

  /**
   * Handles the OAuth callback
   * @param {string} code - Authorization code from LinkedIn
   * @returns {Promise<Object>} User data and access token
   */
  handleCallback: async (code) => {
    const response = await fetch(`${API_BASE}/linkedin/auth/callback?code=${code}`, {
      headers: createHeaders(),
    });
    const data = await handleResponse(response);
    // Store the access token in localStorage
    if (data.accessToken) {
      localStorage.setItem('linkedinAccessToken', data.accessToken);
    }
    return data;
  },

  /**
   * Generates a LinkedIn post from content
   * @param {string} content - Content to generate post from
   * @returns {Promise<Object>} Generated post
   */
  generatePost: async (content) => {
    const response = await fetch(`${API_BASE}/linkedin/generate`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ content }),
    });
    return handleResponse(response);
  },

  /**
   * Generates variations of a LinkedIn post
   * @param {string} content - Original content
   * @param {number} [count=3] - Number of variations to generate
   * @returns {Promise<Array>} Generated post variations
   */
  generatePostVariations: async (content, count = 3) => {
    const response = await fetch(`${API_BASE}/linkedin/generate/variations`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ content, count }),
    });
    return handleResponse(response);
  },

  /**
   * Posts content to LinkedIn
   * @param {string} content - Content to post
   * @param {string} accessToken - LinkedIn access token
   * @returns {Promise<Object>} Post result
   */
  postContent: async (content, accessToken) => {
    const response = await fetch(`${API_BASE}/linkedin/post`, {
      method: 'POST',
      headers: {
        ...createHeaders(),
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ content }),
    });
    return handleResponse(response);
  },

  /**
   * Generates and posts content to LinkedIn in one step
   * @param {string} content - Content to generate and post
   * @param {string} accessToken - LinkedIn access token
   * @returns {Promise<Object>} Post result
   */
  generateAndPost: async (content, accessToken) => {
    const response = await fetch(`${API_BASE}/linkedin/generate-and-post`, {
      method: 'POST',
      headers: {
        ...createHeaders(),
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ content }),
    });
    return handleResponse(response);
  },

  /**
   * Checks if user is connected to LinkedIn
   * @returns {boolean} True if connected
   */
  isConnected: () => {
    return !!localStorage.getItem('linkedinAccessToken');
  },

  /**
   * Disconnects the LinkedIn account
   */
  disconnect: () => {
    localStorage.removeItem('linkedinAccessToken');
  }
};

export default linkedin;
