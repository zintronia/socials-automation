// API base URL configuration
export const API_BASE = 'http://localhost:3000/api';

/**
 * Handles API responses
 * @param {Response} response - The fetch response object
 * @returns {Promise<any>} The parsed JSON response
 * @throws {Error} If the response is not OK
 */
export const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.message || 'Something went wrong');
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
};

/**
 * Creates headers for API requests
 * @param {boolean} [useAuth=true] - Whether to include auth token
 * @returns {Object} Headers object
 */
export const createHeaders = (useAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (useAuth) {
    const token = localStorage.getItem('authToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};
