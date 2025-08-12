import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../../config/environment';
import { database } from '../../../config/database';
import { logger } from '../../../utils/logger.utils';

interface AuthenticatedRequest extends Request {
    user?: any;
}

export const authMiddleware = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Access token required'
            });
            return;
        }
        const decoded = jwt.verify(token, config.jwt.secret) as any;
        // Fetch user from database
        const userQuery = 'SELECT id, email, first_name, last_name, role, is_active FROM users WHERE id = $1';
        const userResult = await database.query(userQuery, [decoded.userId]);
        if (userResult.rows.length === 0) {
            res.status(401).json({
                success: false,
                message: 'Invalid token - user not found'
            });
            return;
        }
        const user = userResult.rows[0];
        if (!user.is_active) {
            res.status(401).json({
                success: false,
                message: 'Account is deactivated'
            });
            return;
        }
        logger.info('User authenticated:-------------------', user);
        req.user = user;
        next();
    } catch (error) {
        logger.error('Authentication error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};

export const optionalAuthMiddleware = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        next();
        return;
    }
    try {
        const decoded = jwt.verify(token, config.jwt.secret) as any;
        const userQuery = 'SELECT id, email, first_name, last_name, role FROM users WHERE id = $1';
        const userResult = await database.query(userQuery, [decoded.userId]);
        if (userResult.rows.length > 0) {
            req.user = userResult.rows[0];
        }
    } catch (error) {
        logger.debug('Optional auth failed:', error);
    }
    next();
}; 