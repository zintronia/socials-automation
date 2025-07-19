import { API_BASE, handleResponse, createHeaders } from './config';

/**
 * Twitter service for handling Twitter-related API calls
 */

export const twitter = {
  /**
   * Generates tweets from a document
   * @param {string} documentId - ID of the document to generate tweets from
   * @returns {Promise<Array>} Generated tweets
   */
  generateTweets: async (documentId) => {
    const response = await fetch(`${API_BASE}/tweets/generate/${documentId}`, {
      method: 'POST',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  /**
   * Schedules a tweet
   * @param {string} content - Tweet content
   * @param {string} scheduledTime - ISO string of when to schedule the tweet
   * @returns {Promise<Object>} Scheduled tweet details
   */
  scheduleTweet: async (content, scheduledTime) => {
    const response = await fetch(`${API_BASE}/tweets/schedule`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ content, scheduledTime }),
    });
    return handleResponse(response);
  },

  /**
   * Posts a tweet immediately
   * @param {string} content - Tweet content
   * @returns {Promise<Object>} Posted tweet details
   */
  postTweet: async (content) => {
    const response = await fetch(`${API_BASE}/tweets`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ content }),
    });
    return handleResponse(response);
  },

  /**
   * Gets a list of tweets
   * @returns {Promise<Array>} List of tweets
   */
  listTweets: async () => {
    const response = await fetch(`${API_BASE}/tweets`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  /**
   * Gets stats for a specific tweet
   * @param {string} tweetId - ID of the tweet to get stats for
   * @returns {Promise<Object>} Tweet statistics
   */
  getTweetStats: async (tweetId) => {
    const response = await fetch(`${API_BASE}/tweets/${tweetId}/stats`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  }
};

export default twitter;
