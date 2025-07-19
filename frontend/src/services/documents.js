import { API_BASE, handleResponse, createHeaders } from './config';

/**
 * Document service for handling document-related API calls
 */

export const documents = {
  /**
   * Fetches all documents
   * @returns {Promise<Array>} List of documents
   */
  list: async () => {
    const response = await fetch(`${API_BASE}/documents`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  /**
   * Uploads a new document
   * @param {File} file - The file to upload
   * @returns {Promise<Object>} The uploaded document details
   */
  upload: async (file) => {
    const formData = new FormData();
    formData.append('document', file);
    
    const response = await fetch(`${API_BASE}/documents`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
    return handleResponse(response);
  },

  /**
   * Deletes a document by ID
   * @param {string} id - Document ID to delete
   * @returns {Promise<Object>} Deletion result
   */
  delete: async (id) => {
    const response = await fetch(`${API_BASE}/documents/${id}`, {
      method: 'DELETE',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  /**
   * Gets a single document by ID
   * @param {string} id - Document ID to fetch
   * @returns {Promise<Object>} Document details
   */
  getById: async (id) => {
    const response = await fetch(`${API_BASE}/documents/${id}`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  }
};

export default documents;
