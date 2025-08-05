import rateLimit from 'express-rate-limit';
import { config } from '../config/environment';

export const rateLimitMiddleware = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: {
        success: false,
        message: 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
}); 