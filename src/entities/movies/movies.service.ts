import { Movie, MovieUpdate } from './movies.dto';
import { MovieEntity } from './types';
import HttpException from '../../exceptions/HttpException';
import BaseService from '../../base/base.service';

export default class MoviesService extends BaseService {
    constructor() {
        super();
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
        const movie = await this.checkIfResourceExists(id);
        return { movie };
    }

    async updateById(id: number, update: MovieUpdate) {
        await this.checkIfResourceExists(id);

        await this.db('movie')
            .update({ ...update })
            .where({ id });

        const movie = await this.db('movie')
            .select<MovieEntity>('*')
            .where({ id })
            .whereNull('deleted_at')
            .first();

        return { movie };
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
