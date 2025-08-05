const userService = require('../services/auth/user.service');
const { validationResult } = require('express-validator');
const { ErrorHandler } = require('../middleware/error.middleware');

class UserController {
  async register(req, res, next) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ErrorHandler(400, 'Validation error', errors.array());
      }

      const { email, password, first_name, last_name } = req.body;

      // Call user service to register new user
      const result = await userService.register(email, password, first_name, last_name);

      // Return success response
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ErrorHandler(400, 'Validation error', errors.array());
      }

      const { email, password } = req.body;

      // Call user service to authenticate user
      const result = await userService.login(email, password);

      // Return success response with token
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req, res, next) {
    try {
      // User is already attached to the request by the auth middleware
      const user = req.user;
      
      // Remove sensitive data
      const { password, ...userData } = user;
      
      res.json({
        success: true,
        data: userData
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all connected social accounts for the current user
   */
  async getConnectedApps(req, res, next) {
    try {
      const userId = req.user.id;
      const connectedAccounts = await userService.getConnectedSocialAccounts(userId);
      
      // Map the connected accounts to a more client-friendly format
      const connectedApps = connectedAccounts.map(account => ({
        id: account.id,
        provider: account.provider,
        username: account.username || undefined,
        connectedAt: account.connectedAt,
        // Add provider-specific data if needed
        ...(account.provider === 'twitter' && {
          // Twitter-specific data
          url: account.username ? `https://twitter.com/${account.username.replace('@', '')}` : null
        })
      }));
      
      res.json({
        success: true,
        data: connectedApps
      });
    } catch (error) {
      next(error);
    }
  }
}

// Export singleton instance
module.exports = new UserController();
