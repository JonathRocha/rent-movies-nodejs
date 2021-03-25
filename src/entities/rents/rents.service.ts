import BaseService from 'base/base.service';
import HttpException from 'exceptions/HttpException';
import { Rent, RentUpdate } from './rents.dto';
import { RentEntity } from './types';
import HistoryService from '../histories/history.service';
import MoviesService from 'entities/movies/movies.service';

export default class RentsService extends BaseService {
    private readonly historyService: HistoryService;
    private readonly movieService: MoviesService;

    constructor() {
        super();

        this.historyService = new HistoryService();
        this.movieService = new MoviesService();
    }

    async save(rent: Rent): Promise<RentEntity> {
        const { movie_id, user_id } = rent;

        const [
            historiesByUser,
            historiesByMovie,
            { movie },
        ] = await Promise.all([
            this.historyService.findByUser({
                user_id,
                shouldFilterActives: true,
            }),
            this.historyService.findByMovie({
                movie_id,
                shouldFilterActives: true,
            }),
            this.movieService.findById(movie_id),
        ]);

        if (
            historiesByUser.length &&
            historiesByUser.filter((history) => history.action === 'rent')
                .length === 5
        ) {
            throw new HttpException(400, 'User already have rented 5 movies');
        }

        if (
            movie.quantity ===
            historiesByMovie.filter((history) => history.action === 'rent')
                .length
        ) {
            throw new HttpException(400, 'Movie out of stock.');
        }

        return this.db('rent').insert(rent).returning<RentEntity>('*');
    }

    async findAll(limit: number, page: number = 1) {
        const [rents, count] = await Promise.all([
            this.db('rent')
                .select<RentEntity>('*')
                .whereNull('deleted_at')
                .offset(page * limit - limit)
                .limit(limit ?? 10),
            this.db('rent')
                .count<{ total: number }>('id', { as: 'total' })
                .whereNull('deleted_at')
                .first(),
        ]);
        return { rents, total: Number(count?.total ?? 0), perPage: limit };
    }

    async findById(id: number) {
        const rent = await this.checkIfResourceExists(id);
        return { rent };
    }

    async updateById(id: number, update: RentUpdate) {
        await this.checkIfResourceExists(id);

        await this.db('rent')
            .update({ ...update })
            .where({ id });

        const rent = await this.db('movie')
            .select<RentEntity>('*')
            .where({ id })
            .whereNull('deleted_at')
            .first();

        return { rent };
    }

    async deleteById(id: number) {
        await this.checkIfResourceExists(id);
        return this.db('rent').update({ deleted_at: new Date() }).where({ id });
    }

    private async checkIfResourceExists(id: number) {
        const rent = await this.db('rent')
            .select<RentEntity>('*')
            .where({ id })
            .whereNull('deleted_at')
            .first();

        if (!rent) {
            throw new HttpException(404, 'Resource not found.');
        }

        return rent;
    }
}
