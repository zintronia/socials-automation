const API_BASE = 'http://localhost:3000/api';

export const api = {
  // Documents
  getDocuments: async () => {
    const response = await fetch(`${API_BASE}/documents`);
    return await response.json();
  },

  uploadDocument: async (file) => {
    const formData = new FormData();
    formData.append('document', file);
    
    const response = await fetch(`${API_BASE}/documents`, {
      method: 'POST',
      body: formData,
    });
    return await response.json();
  },

  deleteDocument: async (id) => {
    const response = await fetch(`${API_BASE}/documents/${id}`, {
      method: 'DELETE',
    });
    return await response.json();
  },

  // Tweets
  getTweets: async () => {
    const response = await fetch(`${API_BASE}/tweets`);
    return await response.json();
  },

  generateTweets: async (documentId) => {
    const response = await fetch(`${API_BASE}/tweets/generate/${documentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ count: 3 })
    });
    return await response.json();
  },

  postTweet: async (tweetId) => {
    const response = await fetch(`${API_BASE}/tweets/${tweetId}/post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to post tweet');
    }
    return await response.json();
  },

  scheduleTweet: async (tweetId, scheduledTime) => {
    const response = await fetch(`${API_BASE}/tweets/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        tweetId,
        scheduledAt: scheduledTime.toISOString()
      })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to schedule tweet');
    }
    return await response.json();
  },

  getTweetStats: async (tweetId) => {
    const response = await fetch(`${API_BASE}/tweets/${tweetId}/stats`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch tweet stats');
    }
    return await response.json();
  },
};
