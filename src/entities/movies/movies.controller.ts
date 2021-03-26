import { NextFunction, Request, Response, Router } from 'express';
import MoviesService from './movies.service';
import { Movie, MovieUpdate } from './movies.dto';
import { validate } from '../../middlewares/validate';
import BaseController from '../../base/base.controller';

export default class MoviesController extends BaseController {
    private readonly moviesService: MoviesService;

    constructor() {
        super();

        this.path = '/movies';
        this.router = Router();
        this.moviesService = new MoviesService();

        this.intializeRoutes();
    }

    private intializeRoutes() {
        this.router.get(this.path, this.list.bind(this));
        this.router.post(this.path, validate(Movie), this.create.bind(this));
        this.router.get(`${this.path}/histories`, this.historyList.bind(this));
        this.router.get(`${this.path}/:id`, this.getById.bind(this));
        this.router.get(`${this.path}/:id/history`, this.history.bind(this));
        this.router.patch(
            `${this.path}/:id`,
            validate(MovieUpdate),
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

        return this.moviesService
            .save(body)
            .then((data) => response.status(201).json(data))
            .catch(next);
    };

    private list = (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        let { limit, page } = request.query;

        if (limit || page) {
            if (Number.isNaN(Number(limit)) || Number(limit) < 1) {
                return response.status(400).json({
                    message:
                        'Limit query param invalid. Must be a number greater than zero.',
                });
            }

            if (Number.isNaN(Number(page)) || Number(page) < 1) {
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

        return this.moviesService
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

        return this.moviesService
            .findById(Number(id))
            .then((data) => response.status(200).json(data))
            .catch(next);
    };

    private history = (
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

        let { limit, page } = request.query;

        if (limit || page) {
            if (Number.isNaN(Number(limit)) || Number(limit) < 1) {
                return response.status(400).json({
                    message:
                        'Limit query param invalid. Must be a number greater than zero.',
                });
            }

            if (Number.isNaN(Number(page)) || Number(page) < 1) {
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

        return this.moviesService
            .getHistoryByMovie(
                Number(id),
                Number(limit ?? 10),
                Number(page ?? 1)
            )
            .then((data) => response.status(200).json(data))
            .catch(next);
    };

    private historyList = (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        let { limit, page } = request.query;

        if (limit || page) {
            if (Number.isNaN(Number(limit)) || Number(limit) < 1) {
                return response.status(400).json({
                    message:
                        'Limit query param invalid. Must be a number greater than zero.',
                });
            }

            if (Number.isNaN(Number(page)) || Number(page) < 1) {
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

        return this.moviesService
            .getHistory(Number(limit ?? 10), Number(page ?? 1))
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

        return this.moviesService
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

        return this.moviesService
            .deleteById(Number(id))
            .then(() => response.status(204).end())
            .catch(next);
    };
}
