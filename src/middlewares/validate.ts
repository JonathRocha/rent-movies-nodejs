import { transformAndValidate } from 'class-transformer-validator';
import { Request, Response, NextFunction } from 'express';

export function validateBody<T>(c: T, whitelist = true) {
    return (request: Request, response: Response, next: NextFunction) => {
        const { body } = request;

        if (!body || !Object.keys(body).length) {
            return response
                .status(400)
                .json({ message: 'No request body found.' });
        }

        console.log(body);

        transformAndValidate(c as any, body, { validator: { whitelist } })
            .then((transformed) => {
                request.body = transformed;
                next();
            })
            .catch((err) => {
                console.log(err);
                response.status(400).json({ message: err.message });
            });
    };
}
