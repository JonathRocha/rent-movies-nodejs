import faker from 'faker';
import { DateTime } from 'luxon';
import { Movie, MovieUpdate } from '../movies.dto';
import MoviesService from '../movies.service';
import RentsService from '../../rents/rents.service';
import UsersService from '../../users/users.service';
import { getDbInstance } from '../../../utils/database';
import { User } from '../../../entities/users/users.dto';
import { Rent } from '../../../entities/rents/rents.dto';

const moviesService = new MoviesService();
const rentsService = new RentsService();
const usersService = new UsersService();

beforeEach((done) => {
    getDbInstance()
        .raw('start transaction')
        .then(() => {
            done();
        });
});

afterEach((done) => {
    getDbInstance()
        .raw('rollback')
        .then(() => {
            done();
        });
});

describe('MoviesService', () => {
    it('Should save movie to database', async (done) => {
        const movie = new Movie();

        movie.name = 'Star Wars Test 1';
        movie.genre = 'Sci-Fi';
        movie.director = 'George Lucas';
        movie.quantity = 5;

        const data = await moviesService.save(movie);

        expect(data).not.toBe(null);
        expect(data).not.toBe(undefined);
        expect(data.id !== undefined).toBe(true);

        done();
    });

    it('Should not allow duplicate movie', async (done) => {
        const movie = new Movie();

        movie.name = 'Star Wars Test 2';
        movie.genre = 'Sci-Fi';
        movie.director = 'George Lucas';
        movie.quantity = 5;

        try {
            await moviesService.save(movie);
        } catch (error) {
            expect(error.message).toBe('Movie already registered.');
        }

        done();
    });

    it('Should list all movies with pagination', async (done) => {
        const knex = getDbInstance();

        await knex('movie').del();
        await knex('movie').insert(
            Array(15)
                .fill(null)
                .map(() => ({
                    name: faker.random.words(Math.random() * (3 - 1) + 1),
                    genre: faker.random.word(),
                    director: `${faker.name.firstName(1)} ${faker.name.lastName(
                        1
                    )}`,
                    quantity: Math.ceil(Math.random() * (3 - 1) + 1),
                }))
        );

        const data = await moviesService.findAll(10, 2);

        expect(data).not.toBe(null);
        expect(data).not.toBe(undefined);
        expect(Array.isArray(data.movies)).toBe(true);
        expect(data.movies.length).toBe(5);
        expect(data.perPage).toBe(10);
        expect(data.total).toBe(15);

        done();
    });

    it('Should find movie by id', async (done) => {
        const movie = new Movie();

        movie.name = 'Star Wars Test 3';
        movie.genre = 'Sci-Fi';
        movie.director = 'George Lucas';
        movie.quantity = 5;

        const data = await moviesService.save(movie);

        const { movie: found } = await moviesService.findById(Number(data.id));

        expect(found).not.toBe(null);
        expect(found).not.toBe(undefined);
        expect(found?.id).not.toBe(undefined);

        done();
    });

    it('Should return resource not found if not found movie by id', async (done) => {
        const knex = getDbInstance();
        await knex('movie').del();

        try {
            await moviesService.findById(1);
        } catch (error) {
            expect(error.message).toBe('Resource not found.');
        }

        done();
    });

    it('Should be possible to update movie by id', async (done) => {
        const movie = new Movie();

        movie.name = 'Star Wars Test 4';
        movie.genre = 'Sci-Fi';
        movie.director = 'George Lucas';
        movie.quantity = 5;

        const data = await moviesService.save(movie);

        expect(data?.name).toBe('Star Wars Test 4');

        const update = new MovieUpdate();
        update.name = 'New Name Wow';

        const { movie: updated } = await moviesService.updateById(
            Number(data.id),
            update
        );

        expect(updated).not.toBe(null);
        expect(updated).not.toBe(undefined);
        expect(updated?.id).not.toBe(undefined);
        expect(updated?.name).toBe('New Name Wow');

        done();
    });

    it('Should delete movie by id', async (done) => {
        const movie = new Movie();

        movie.name = 'Star Wars Test 5';
        movie.genre = 'Sci-Fi';
        movie.director = 'George Lucas';
        movie.quantity = 5;

        const data = await moviesService.save(movie);

        expect(data?.name).toBe('Star Wars Test 5');

        await moviesService.deleteById(Number(data.id));

        try {
            await moviesService.findById(Number(data.id));
        } catch (error) {
            expect(error.message).toBe('Resource not found.');
        }

        done();
    });

    it('Should be able to get rent history by movie id', async (done) => {
        const movie = new Movie();

        movie.name = 'Star Wars Test 6';
        movie.genre = 'Sci-Fi';
        movie.director = 'George Lucas';
        movie.quantity = 5;

        const insertedMovie = await moviesService.save(movie);

        expect(insertedMovie?.name).toBe('Star Wars Test 6');

        const user = new User();

        user.name = 'John';
        user.email = 'johnferreirar@gmail.com';
        user.document = '09762154622';
        user.gender = 'Male';
        user.birthday = new Date(1991, 2, 20);

        const insertedUser = await usersService.save(user);
        expect(insertedUser?.name).toBe('John');

        const rent = new Rent();

        rent.movie_id = Number(insertedMovie.id);
        rent.user_id = Number(insertedUser.id);
        rent.return_date = DateTime.local().plus({ days: 3 }).toJSDate();

        const insertedRent = await rentsService.save(rent);
        expect(insertedRent?.id).not.toBe(undefined);

        const {
            histories,
            perPage,
            total,
        } = await moviesService.getHistoryByMovie(
            Number(insertedRent.movie_id),
            5,
            1
        );

        expect(Array.isArray(histories) && histories.length === 1).toBe(true);
        expect(
            /John/.test(histories[0]) && /Star Wars/.test(histories[0])
        ).toBe(true);
        expect(perPage).toBe(5);
        expect(total).toBe(1);

        done();
    });
});
