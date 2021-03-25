import BaseService from '../../base/base.service';
import {
    FindByUserParams,
    FindByMovieParams,
    FindByMovieAndUserParams,
    MovieHistory,
} from './type';

export default class HistoryService extends BaseService {
    constructor() {
        super();
    }

    findByUser(params: FindByUserParams): Promise<MovieHistory[]> {
        const { user_id, shouldFilterActives } = params;

        return this.db('rent as r')
            .join('rent_history as rh', 'r.id', '=', 'rh.rent_id')
            .select<MovieHistory[]>([
                'r.id',
                'r.movie_id',
                'r.user_id',
                'r.return_date',
                'r.returned',
                'rh.action',
                'rh.created_at',
            ])
            .where({
                'r.user_id': user_id,
                'r.deleted_at': null,
            })
            .where((knex) => {
                if (shouldFilterActives) {
                    knex.where('r.return_date', '>', new Date());
                    knex.orWhere('r.returned', '=', 0);
                }
                return knex;
            });
    }

    findByMovie(params: FindByMovieParams): Promise<MovieHistory[]> {
        const { movie_id, shouldFilterActives } = params;

        return this.db('rent as r')
            .join('rent_history as rh', 'r.id', '=', 'rh.rent_id')
            .select<MovieHistory[]>([
                'r.id',
                'r.movie_id',
                'r.user_id',
                'r.return_date',
                'r.returned',
                'rh.action',
                'rh.created_at',
            ])
            .where({
                'r.movie_id': movie_id,
                'r.deleted_at': null,
            })
            .where((knex) => {
                if (shouldFilterActives) {
                    knex.where('r.return_date', '>', new Date());
                    knex.orWhere('r.returned', '=', 0);
                }
                return knex;
            });
    }

    findByMovieAndUser(
        params: FindByMovieAndUserParams
    ): Promise<MovieHistory[]> {
        const { movie_id, user_id, shouldFilterActives = false } = params;

        return this.db('rent as r')
            .join('rent_history as rh', 'r.id', '=', 'rh.rent_id')
            .select<MovieHistory[]>([
                'r.id',
                'r.movie_id',
                'r.user_id',
                'r.return_date',
                'r.returned',
                'rh.action',
                'rh.created_at',
            ])
            .where({
                'r.movie_id': movie_id,
                'r.user_id': user_id,
                'r.deleted_at': null,
            })
            .where((knex) => {
                if (shouldFilterActives) {
                    knex.where('r.return_date', '>', new Date());
                    knex.orWhere('r.returned', '=', 0);
                }
                return knex;
            });
    }
}
