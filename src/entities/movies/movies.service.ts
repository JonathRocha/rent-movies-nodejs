import { Movie, MovieUpdate } from './movies.dto';
import { MovieEntity } from './types';
import HttpException from '../../exceptions/HttpException';
import BaseService from '../../base/base.service';
import HistoriesService from '../histories/histories.service';

export default class MoviesService extends BaseService {
    private readonly historiesService: HistoriesService;

    constructor() {
        super();

        this.historiesService = new HistoriesService();
    }

    save(movie: Movie): Promise<MovieEntity> {
        return this.db('movie').insert(movie).returning<MovieEntity>('*');
    }

    async findAll(limit: number, page: number = 1) {
        const [movies, count] = await Promise.all([
            this.db('movie')
                .select<MovieEntity>('*')
                .whereNull('deleted_at')
                .offset(page * limit - limit)
                .limit(limit ?? 10),
            this.db('movie')
                .count<{ total: number }>('id', { as: 'total' })
                .whereNull('deleted_at')
                .first(),
        ]);
        return { movies, total: Number(count?.total ?? 0), perPage: limit };
    }

    async findById(id: number): Promise<{ movie: MovieEntity }> {
        return { movie: await this.checkIfResourceExists(id) };
    }

    async getHistoryByMovie(id: number, limit: number, page: number) {
        await this.checkIfResourceExists(id);
        return this.historiesService.listByMovie({
            movie_id: id,
            limit,
            page,
        });
    }

    async getHistory(limit: number, page: number) {
        return this.historiesService.listAll({
            limit,
            page,
        });
    }

    async updateById(id: number, update: MovieUpdate) {
        await this.checkIfResourceExists(id);

        await this.db('movie')
            .update({ ...update })
            .where({ id });

        return this.findById(id);
    }

    async deleteById(id: number) {
        await this.checkIfResourceExists(id);
        return this.db('movie')
            .update({ deleted_at: new Date() })
            .where({ id });
    }

    private async checkIfResourceExists(id: number): Promise<MovieEntity> {
        const movie = await this.db('movie')
            .select<MovieEntity>('*')
            .where({ id })
            .whereNull('deleted_at')
            .first();

        if (!movie) {
            throw new HttpException(404, 'Resource not found.');
        }

        return movie;
    }
}
