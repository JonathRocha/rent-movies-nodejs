import { Request, Response, NextFunction, Router } from 'express';
import { Rent, RentRenew, RentUpdate } from './rents.dto';
import RentsService from './rents.service';
import BaseController from '../../base/base.controller';
import { validate } from '../../middlewares/validate';

export default class RentsController extends BaseController {
    private readonly rentsService: RentsService;

    constructor() {
        super();

        this.path = '/rents';
        this.router = Router();
        this.rentsService = new RentsService();

        this.intializeRoutes();
    }

    private intializeRoutes() {
        this.router.get(this.path, this.list.bind(this));
        this.router.post(this.path, validate(Rent), this.create.bind(this));
        this.router.post(
            `${this.path}/:id/renew`,
            validate(RentRenew),
            this.renew.bind(this)
        );
        this.router.get(`${this.path}/:id`, this.getById.bind(this));
        this.router.patch(
            `${this.path}/:id`,
            validate(RentUpdate),
            this.update.bind(this)
        );
        this.router.delete(`${this.path}/:id`, this.delete.bind(this));
    }

    private create = (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const { body } = request;

        return this.rentsService
            .save(body)
            .then((data) => response.status(201).json(data))
            .catch(next);
    };

    private renew = (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const { id } = request.params;
        const { days } = request.body;

        if (Number.isNaN(Number(id))) {
            return response
                .status(400)
                .json({ message: `Invalid value for param id: ${id}` });
        }

        return this.rentsService
            .renewById(Number(id), days)
            .then((data) => response.status(200).json(data))
            .catch(next);
    };

    private list = (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        let { limit, page } = request.query;

        if (limit || page) {
            if (Number.isNaN(Number(limit)) && Number(limit) > 0) {
                return response.status(400).json({
                    message:
                        'Limit query param invalid. Must be a number greater than zero.',
                });
            }

            if (Number.isNaN(Number(page)) && Number(page) > 0) {
                return response.status(400).json({
                    message:
                        'Page query param invalid. Must be a number greater than zero.',
                });
            }
        }

        const params = Object.keys(request.query).filter(
            (param) => !['limit', 'page'].includes(param)
        );
        if (params.length) {
            return response.status(400).json({
                message: `Unrecognized query params: ${params.join(', ')}`,
            });
        }

        return this.rentsService
            .findAll(Number(limit ?? 10), Number(page ?? 1))
            .then((data) => response.status(200).json(data))
            .catch(next);
    };

    private getById = (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const { id } = request.params;

        if (Number.isNaN(Number(id))) {
            return response
                .status(400)
                .json({ message: `Invalid value for param id: ${id}` });
        }

        return this.rentsService
            .findById(Number(id))
            .then((data) => response.status(200).json(data))
            .catch(next);
    };

    private update = (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const { id } = request.params;
        const { body } = request;

        if (Number.isNaN(Number(id))) {
            return response
                .status(400)
                .json({ message: `Invalid value for param id: ${id}` });
        }

        return this.rentsService
            .updateById(Number(id), body)
            .then((data) => response.status(200).json(data))
            .catch(next);
    };

    private delete = (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const { id } = request.params;

        if (Number.isNaN(Number(id))) {
            return response
                .status(400)
                .json({ message: `Invalid value for param id: ${id}` });
        }

        return this.rentsService
            .deleteById(Number(id))
            .then(() => response.status(204).end())
            .catch(next);
    };
}
