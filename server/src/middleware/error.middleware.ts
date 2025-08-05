import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.utils';
import { respondWithError } from '../utils/response.utils';

export function errorMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
    logger.error('Unhandled error:', err);
    respondWithError(res, 'Internal server error', 500, err);
} 