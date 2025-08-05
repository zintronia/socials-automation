const userService = require('../services/auth/user.service');
const { ErrorHandler } = require('./error.middleware');

class AuthMiddleware {
  constructor() {
    this.authenticate = this.authenticate.bind(this);
  }

  async authenticate(req, res, next) {
    try {
      // Get token from header
      const authHeader = req.header('Authorization');
      console.log('Auth header:', authHeader);
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('No or invalid Authorization header');
        throw new ErrorHandler(401, 'No token provided');
      }

      const token = authHeader.split(' ')[1];
      console.log('Extracted token:', token ? 'Token exists' : 'No token');
      
      try {
        // Verify token
        console.log('Verifying token...');
        const decoded = userService.verifyToken(token);
        console.log('Decoded token:', JSON.stringify(decoded, null, 2));
        
        if (!decoded || !decoded.userId) {
          console.log('Invalid token payload:', decoded);
          throw new ErrorHandler(401, 'Invalid token payload');
        }
        
        // Get user from database
        console.log('Fetching user with ID:', decoded.userId);
        const user = await userService.getCurrentUser(decoded.userId);
        
        if (!user) {
          console.log('User not found for ID:', decoded.userId);
          throw new ErrorHandler(401, 'User not found');
        }

        console.log('User authenticated successfully:', user.email);
        // Attach user to request object
        req.user = user;
        next();
      } catch (error) {
        console.error('Authentication error:', error);
        throw new ErrorHandler(401, error.message || 'Invalid or expired token');
      }
    } catch (error) {
      next(error);
    }
  }

  // Role-based access control middleware
  authorize(roles = []) {
    return (req, res, next) => {
      try {
        if (!req.user) {
          throw new ErrorHandler(401, 'Authentication required');
        }

        if (roles.length && !roles.includes(req.user.role)) {
          throw new ErrorHandler(403, 'Insufficient permissions');
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }
}

// Export singleton instance
module.exports = new AuthMiddleware();
