import { Response } from 'express';
import { ApiResponse } from '../types';

export function respondWithSuccess<T>(res: Response, data: T, message = 'Success', status = 200) {
    const response: ApiResponse<T> = {
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
    };
    res.status(status).json(response);
}

export function respondWithError(res: Response, message = 'Error', status = 500, error?: any) {
    const response: ApiResponse = {
        success: false,
        message,
        error: error?.message || error || undefined,
        timestamp: new Date().toISOString()
    };
    res.status(status).json(response);
} 