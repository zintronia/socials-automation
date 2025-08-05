import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { respondWithError } from '../utils/response.utils';

export function validateRequest(schema: Joi.ObjectSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error } = schema.validate(req.body, { abortEarly: false, allowUnknown: true });
        if (error) {
            respondWithError(res, 'Validation error', 400, error.details);
            return;
        }
        next();
    };
} 