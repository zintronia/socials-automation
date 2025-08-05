const userModel = require('../../models/user.model');
const jwt = require('jsonwebtoken');
const { ErrorHandler } = require('../../middleware/error.middleware');
const { v4: uuidv4 } = require('uuid');

class UserService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.tokenExpiry = process.env.TOKEN_EXPIRY || '24h';
  }

  async register(email, password, first_name, last_name) {
    try {
      // Check if user already exists
      const existingUser = await userModel.findByEmail(email);
      if (existingUser) {
        throw new ErrorHandler(409, 'User with this email already exists');
      }

      // Create new user
      const newUser = await userModel.createUser(email, password, first_name, last_name);

      // Generate JWT token
      const token = this.generateToken(newUser.id);

      return {
        user: { id: newUser.id, email: newUser.email, first_name: newUser.first_name, last_name: newUser.last_name },
        token
      };
    } catch (error) {
      throw new ErrorHandler(
        error.statusCode || 500,
        error.message || 'Failed to register user',
        error.details
      );
    }
  }

  async login(email, password) {
    try {
      // Verify credentials
      const user = await userModel.verifyPassword(email, password);
      if (!user) {
        throw new ErrorHandler(401, 'Invalid email or password');
      }

      // Update last login
      await userModel.updateLastLogin(user.id);

      // Generate JWT token
      const token = this.generateToken(user.id);

      return {
        user: { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name },
        token
      };
    } catch (error) {
      throw new ErrorHandler(
        error.statusCode || 500,
        error.message || 'Login failed',
        error.details
      );
    }
  }

  async getCurrentUser(userId) {
    try {
      const user = await userModel.findOne(userId);
      if (!user) {
        throw new ErrorHandler(404, 'User not found');
      }
      console.log('User found:', user);
      // Remove sensitive data
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      throw new ErrorHandler(
        error.statusCode || 500,
        error.message || 'Failed to fetch user',
        error.details
      );
    }
  }

  generateToken(userId) {
    return jwt.sign({ id: userId }, this.jwtSecret, {
      expiresIn: this.tokenExpiry
    });
  }

  /**
   * Get connected social accounts for a user
   * @param {number} userId - The ID of the user
   * @returns {Promise<Array>} - Array of connected social accounts
   */
  async getConnectedSocialAccounts(userId) {
    try {
      const accounts = await userModel.getConnectedSocialAccounts(userId);
      return accounts;
    } catch (error) {
      throw new ErrorHandler(
        error.statusCode || 500,
        error.message || 'Failed to fetch connected accounts',
        error.details
      );
    }
  }

  /**
   * Connect a social account to a user
   * @param {number} userId - The ID of the user
   * @param {string} provider - The social provider (e.g., 'twitter', 'facebook')
   * @param {string} providerUserId - The user's ID from the provider
   * @param {Object} data - Additional connection data
   * @returns {Promise<Object>} - The created/updated connection
   */
  async connectSocialAccount(userId, provider, providerUserId, data = {}) {
    try {
      const connection = await userModel.upsertSocialConnection(
        userId,
        provider,
        providerUserId,
        {
          username: data.username,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresAt: data.expiresAt
        }
      );
      return connection;
    } catch (error) {
      throw new ErrorHandler(
        error.statusCode || 500,
        error.message || `Failed to connect ${provider} account`,
        error.details
      );
    }
  }

  /**
   * Disconnect a social account from a user
   * @param {number} userId - The ID of the user
   * @param {string} provider - The social provider to disconnect
   * @returns {Promise<boolean>} - True if the connection was removed
   */
  async disconnectSocialAccount(userId, provider) {
    try {
      const success = await userModel.removeSocialConnection(userId, provider);
      if (!success) {
        throw new ErrorHandler(404, `No ${provider} account connected`);
      }
      return true;
    } catch (error) {
      throw new ErrorHandler(
        error.statusCode || 500,
        error.message || `Failed to disconnect ${provider} account`,
        error.details
      );
    }
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new ErrorHandler(401, 'Invalid or expired token');
    }
  }
}

// Export singleton instance
module.exports = new UserService();
