const { db } = require('../config/database');
const BaseRepository = require('./base/BaseRepository');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class UserModel extends BaseRepository {
  constructor() {
    super('users');
  }

  async findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  }

  async createUser(email, password, first_name, last_name) {
    const hashedPassword = await bcrypt.hash(password, 10);

    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (email, password, first_name, last_name) VALUES (?, ? , ?, ?)',
        [email, hashedPassword, first_name, last_name],
        function (err) {
          if (err) return reject(err);
          resolve({ id: this.lastID, email });
        }
      );
    });
  }

  async verifyPassword(email, password) {
    const user = await this.findByEmail(email);
    if (!user) return false;

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return false;

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateLastLogin(userId) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
        [userId],
        function (err) {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  }

  /**
   * Get all connected social accounts for a user
   * @param {number} userId - The ID of the user
   * @returns {Promise<Array>} - Array of connected social accounts
   */
  async getConnectedSocialAccounts(userId) {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT id, provider, provider_user_id as providerUserId, username, created_at as connectedAt ' +
        'FROM social_connections WHERE user_id = ?',
        [userId],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows || []);
        }
      );
    });
  }

  /**
   * Add or update a social connection for a user
   * @param {number} userId - The ID of the user
   * @param {string} provider - The social provider (e.g., 'twitter', 'facebook')
   * @param {string} providerUserId - The user's ID from the provider
   * @param {Object} data - Additional connection data
   * @param {string} [data.username] - The username from the provider
   * @param {string} [data.accessToken] - OAuth access token
   * @param {string} [data.refreshToken] - OAuth refresh token
   * @param {Date} [data.expiresAt] - Token expiration date
   * @returns {Promise<Object>} - The created/updated connection
   */
  async upsertSocialConnection(userId, provider, providerUserId, data = {}) {
    const { username, accessToken, refreshToken, expiresAt } = data;
    
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO social_connections (user_id, provider, provider_user_id, username, access_token, refresh_token, expires_at, updated_at) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP) ' +
        'ON CONFLICT(user_id, provider) DO UPDATE SET ' +
        'provider_user_id = excluded.provider_user_id, ' +
        'username = COALESCE(excluded.username, username), ' +
        'access_token = COALESCE(excluded.access_token, access_token), ' +
        'refresh_token = COALESCE(excluded.refresh_token, refresh_token), ' +
        'expires_at = COALESCE(excluded.expires_at, expires_at), ' +
        'updated_at = CURRENT_TIMESTAMP ' +
        'RETURNING *',
        [userId, provider, providerUserId, username, accessToken, refreshToken, expiresAt],
        function(err) {
          if (err) return reject(err);
          
          // SQLite doesn't support RETURNING in ON CONFLICT UPDATE, so we need to fetch the record
          db.get(
            'SELECT * FROM social_connections WHERE user_id = ? AND provider = ?',
            [userId, provider],
            (err, row) => {
              if (err) return reject(err);
              resolve(row);
            }
          );
        }
      );
    });
  }

  /**
   * Remove a social connection for a user
   * @param {number} userId - The ID of the user
   * @param {string} provider - The social provider to remove
   * @returns {Promise<boolean>} - True if a connection was removed
   */
  async removeSocialConnection(userId, provider) {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM social_connections WHERE user_id = ? AND provider = ?',
        [userId, provider],
        function(err) {
          if (err) return reject(err);
          resolve(this.changes > 0);
        }
      );
    });
  }
}

module.exports = new UserModel();
