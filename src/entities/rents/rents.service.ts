import { DateTime } from 'luxon';
import { Rent, RentUpdate } from './rents.dto';
import { RentEntity } from './types';
import HttpException from '../../exceptions/HttpException';
import BaseService from '../../base/base.service';
import HistoriesService from '../histories/histories.service';
import MoviesService from '../movies/movies.service';

export default class RentsService extends BaseService {
    private readonly historiesService: HistoriesService;
    private readonly movieService: MoviesService;

    constructor() {
        super();

        this.historiesService = new HistoriesService();
        this.movieService = new MoviesService();
    }

    async save(rent: Rent): Promise<RentEntity> {
        const { movie_id, user_id } = rent;

        const alreadyRented = await this.db('rent')
            .select<RentEntity>('*')
            .where({ movie_id, user_id, deleted_at: null, returned: 0 })
            .first();

        if (alreadyRented) {
            throw new HttpException(400, 'You already have rented this movie.');
        }

        const [
            activeRentHistoriesByUser,
            activeRentHistoriesByMovie,
            { movie },
        ] = await Promise.all([
            this.historiesService.findByUser({
                user_id,
                shouldFilterActives: true,
            }),
            this.historiesService.findByMovie({
                movie_id,
                shouldFilterActives: true,
            }),
            this.movieService.findById(movie_id),
        ]);

        if (
            activeRentHistoriesByUser.length &&
            activeRentHistoriesByUser.filter(
                (history) => history.action === 'rent'
            ).length === 5
        ) {
            throw new HttpException(400, 'User already have rented 5 movies');
        }

        if (
            movie.quantity ===
            activeRentHistoriesByMovie.filter(
                (history) => history.action === 'rent'
            ).length
        ) {
            throw new HttpException(400, 'Movie out of stock.');
        }

        if (process.env.NODE_ENV !== 'test') {
            const transaction = await this.db.transaction();
            try {
                const [insertedRent] = await transaction('rent')
                    .insert(rent)
                    .returning<RentEntity[]>('*');

                await this.historiesService.create(
                    {
                        rent_id: insertedRent.id,
                        action: 'rent',
                    },
                    transaction
                );

                transaction.commit();
                return insertedRent;
            } catch (error) {
                transaction?.rollback();
                throw error;
            }
        } else {
            const [insertedRent] = await this.db('rent')
                .insert(rent)
                .returning<RentEntity[]>('*');

            await this.historiesService.create({
                rent_id: insertedRent.id,
                action: 'rent',
            });

            return insertedRent;
        }
    }

    async renewById(id: number, days: number): Promise<{ rent: RentEntity }> {
        const rent = await this.checkIfResourceExists(id);

        const activeRentHistories = await this.historiesService.findByMovieAndUser(
            {
                movie_id: rent.movie_id,
                user_id: rent.user_id,
                shouldFilterActives: true,
            }
        );

        if (
            activeRentHistories.filter((history) => history.action === 'renew')
                .length === 2
        ) {
            throw new HttpException(
                400,
                'You have already renewed this movie twice.'
            );
        }

        if (process.env.NODE_ENV !== 'test') {
            const transaction = await this.db.transaction();
            try {
                await Promise.all([
                    transaction('rent')
                        .update({
                            return_date: DateTime.fromJSDate(rent.return_date)
                                .plus({ days })
                                .toJSDate(),
                        })
                        .where({ id }),
                    this.historiesService.create(
                        {
                            rent_id: rent.id,
                            action: 'renew',
                        },
                        transaction
                    ),
                ]);

                transaction.commit();
                return this.findById(id);
            } catch (error) {
                transaction?.rollback();
                throw error;
            }
        } else {
            await Promise.all([
                this.db('rent')
                    .update({
                        return_date: DateTime.fromJSDate(rent.return_date)
                            .plus({ days })
                            .toJSDate(),
                    })
                    .where({ id }),
                this.historiesService.create({
                    rent_id: rent.id,
                    action: 'renew',
                }),
            ]);
            return this.findById(id);
        }
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

    async findById(id: number): Promise<{ rent: RentEntity }> {
        return {
            rent: await this.checkIfResourceExists(id),
        };
    }

    async updateById(
        id: number,
        update: RentUpdate
    ): Promise<{ rent: RentEntity }> {
        await this.checkIfResourceExists(id);

        await this.db('rent')
            .update({ ...update })
            .where({ id });

        return this.findById(id);
    }

    async deleteById(id: number): Promise<number> {
        await this.checkIfResourceExists(id);
        return this.db('rent').update({ deleted_at: new Date() }).where({ id });
    }

    private async checkIfResourceExists(id: number): Promise<RentEntity> {
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
