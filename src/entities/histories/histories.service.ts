import { Knex } from 'knex';
import { DateTime } from 'luxon';
import BaseService from '../../base/base.service';
import {
    FindByUserParams,
    FindByMovieParams,
    FindByMovieAndUserParams,
    MovieHistory,
    HistoryCreation,
    ListByMovieParams,
    MovieHistoryToList,
} from './type';

export default class HistoriesService extends BaseService {
    constructor() {
        super();
    }

    create(history: HistoryCreation, transaction?: Knex.Transaction) {
        return (transaction
            ? transaction('rent_history')
            : this.db('rent_history')
        )
            .insert(history)
            .returning<MovieHistory>('*');
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
                    knex.where('r.returned', '=', 0);
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
                    knex.where('r.returned', '=', 0);
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
                    knex.orWhere('r.returned', '=', 0);
                }
                return knex;
            });
    }

    async listByMovie(params: ListByMovieParams) {
        const {
            movie_id,
            limit = 10,
            page = 1,
            shouldFilterActives = false,
        } = params;

        const builder = this.db('rent_history as rh')
            .join('rent as r', 'r.id', '=', 'rh.rent_id')
            .join('user as u', 'r.user_id', '=', 'u.id')
            .join('movie as m', 'r.movie_id', '=', 'm.id')
            .where({
                'r.movie_id': movie_id,
                'r.deleted_at': null,
            })
            .where((knex) => {
                if (shouldFilterActives) {
                    knex.orWhere('r.returned', '=', 0);
                }
                return knex;
            })
            .orderBy('rh.created_at', 'desc');

        const [histories, count] = await Promise.all([
            builder
                .select<MovieHistoryToList[]>([
                    'u.name as username',
                    'm.name as movieName',
                    'rh.action',
                    'rh.created_at',
                ])
                .offset(page * limit - limit)
                .limit(limit ?? 10),

            builder
                .clone()
                .clearSelect()
                .clearOrder()
                .count<{ total: number }>('r.id', { as: 'total' })
                .first(),
        ]);

        return {
            histories: histories.map(
                (history) =>
                    `The movie "${history.movieName}" was ${
                        history.action === 'rent' ? 'rented' : 'renewed'
                    } by "${history.username}" on ${DateTime.fromJSDate(
                        history.created_at
                    ).toFormat('MM/dd/yyyy')}.`
            ),
            total: Number(count?.total ?? 0),
            perPage: limit,
        };
    }

    async listAll(params: Omit<ListByMovieParams, 'movie_id'>) {
        const { limit = 10, page = 1, shouldFilterActives = false } = params;

        const builder = this.db('rent as r')
            .join('rent_history as rh', 'r.id', '=', 'rh.rent_id')
            .join('user as u', 'r.user_id', '=', 'u.id')
            .join('movie as m', 'r.movie_id', '=', 'm.id')
            .where({
                'r.deleted_at': null,
            })
            .where((knex) => {
                if (shouldFilterActives) {
                    knex.orWhere('r.returned', '=', 0);
                }
                return knex;
            })
            .orderBy('rh.created_at', 'desc');

        const [histories, count] = await Promise.all([
            builder
                .select<MovieHistoryToList[]>([
                    'u.name as username',
                    'm.name as movieName',
                    'rh.action',
                    'rh.created_at',
                ])
                .offset(page * limit - limit)
                .limit(limit ?? 10),

            builder
                .clone()
                .clearSelect()
                .clearOrder()
                .count<{ total: number }>('r.id', { as: 'total' })
                .first(),
        ]);

        return {
            histories: histories.map(
                (history) =>
                    `The movie "${history.movieName}" was ${
                        history.action === 'rent' ? 'rented' : 'renewed'
                    } by "${history.username}" on ${DateTime.fromJSDate(
                        history.created_at
                    ).toFormat('MM/dd/yyyy')}.`
            ),
            total: Number(count?.total ?? 0),
            perPage: limit,
        };
    }
}
