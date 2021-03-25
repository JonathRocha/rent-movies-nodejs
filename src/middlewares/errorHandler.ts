import HttpException from '../exceptions/HttpException';
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
    error: HttpException,
    _request: Request,
    response: Response,
    _next: NextFunction
) => {
    const isInternalError = !(error instanceof HttpException);
    if (isInternalError) {
        /**
         * Log exception
         * TODO: improve logs
         */
        console.error(error);
    }

    return response.status(isInternalError ? 500 : error.status).json({
        message: isInternalError ? 'A internal error ocurred.' : error.message,
    });
};
