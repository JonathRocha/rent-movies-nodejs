import { transformAndValidate } from 'class-transformer-validator';
import { ValidationError } from 'class-validator';
import { Request, Response, NextFunction } from 'express';

export function validate<T>(dtoClass: T, whitelist = true) {
    return (request: Request, response: Response, next: NextFunction) => {
        const { body } = request;

        if (!body || !Object.keys(body).length) {
            return response
                .status(400)
                .json({ message: 'No request body found.' });
        }

        transformAndValidate(dtoClass as any, body, {
            validator: { whitelist },
        })
            .then((transformed) => {
                request.body = transformed;
                next();
            })
            .catch((err: ValidationError[]) => {
                response.status(400).json({
                    message: 'Fields validation failed.',
                    errors: err.map((object) => {
                        const { target, ...otherProperties } = object;
                        return { ...otherProperties };
                    }),
                });
            });
    };
}
