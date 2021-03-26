import { Application } from 'express';
import faker from 'faker';
import request from 'supertest';
import App from '../../../app';
import MoviesController from '../movies.controller';
import UsersController from '../../users/users.controller';
import RentsController from '../../rents/rents.controller';
import { getDbInstance } from '../../../utils/database';
import { Movie } from '../movies.dto';
import MoviesService from '../movies.service';

let app: Application;
const moviesService = new MoviesService();

beforeAll(async (done) => {
    const application = new App(
        [new MoviesController(), new UsersController(), new RentsController()],
        Number(process.env.SERVER_PORT ?? 3001)
    );
    await application.listen();
    app = application.app;
    done();
});

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

describe('POST /movies', () => {
    it('Should return 201 and return created movie', async (done) => {
        request(app)
            .post('/movies')
            .send({
                name: 'Star Wars',
                genre: 'Sci-Fi',
                director: 'George Lucas',
                quantity: 5,
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(201)
            .then((response) => {
                expect(response.body.id).not.toBe(undefined);
                done();
            })
            .catch((err) => done(err));
    });

    it('Should return 400 if validation failed', async (done) => {
        request(app)
            .post('/movies')
            .send({
                // name: 'Star Wars', Name missing
                genre: 'Sci-Fi',
                director: 'George Lucas',
                quantity: 5,
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400)
            .then((response) => {
                expect(response.body.message).not.toBe(undefined);
                done();
            })
            .catch((err) => done(err));
    });
});

describe('GET /movies', () => {
    it('Should return 200 and return list with pagination', async (done) => {
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

        request(app)
            .get('/movies?limit=8&page=2')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .then((response) => {
                expect(response.body.movies.length).toBe(7);
                expect(response.body.total).toBe(15);
                expect(response.body.perPage).toBe(8);
                done();
            })
            .catch((err) => done(err));
    });

    it('Should return 400 if validation failed for pagination params', async (done) => {
        request(app)
            .get('/movies?limit=Wow')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400)
            .then((response) => {
                expect(response.body.message).not.toBe(undefined);
                done();
            })
            .catch((err) => done(err));
    });
});

describe('GET /movies/:id', () => {
    it('Should return 200 and movie by id', async (done) => {
        const movie = new Movie();

        movie.name = 'Star Wars Test 7';
        movie.genre = 'Sci-Fi';
        movie.director = 'George Lucas';
        movie.quantity = 5;

        const inserted = await moviesService.save(movie);

        request(app)
            .get(`/movies/${inserted.id}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .then((response) => {
                expect(response.body.movie.id).toBe(inserted.id);
                done();
            })
            .catch((err) => done(err));
    });

    it('Should return 404 if resource not found', async (done) => {
        request(app)
            .get(`/movies/85854035804`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(404)
            .then((response) => {
                expect(response.body.message).not.toBe(undefined);
                done();
            })
            .catch((err) => done(err));
    });
});

describe('PATCH /movies/:id', () => {
    it('Should return 200 if updated successfully', async (done) => {
        const movie = new Movie();

        movie.name = 'Star Wars Test 8';
        movie.genre = 'Sci-Fi';
        movie.director = 'George Lucas';
        movie.quantity = 5;

        const inserted = await moviesService.save(movie);

        request(app)
            .patch(`/movies/${inserted.id}`)
            .send({ name: 'New Name Wow' })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .then((response) => {
                expect(response.body.movie.name).toBe('New Name Wow');
                done();
            })
            .catch((err) => done(err));
    });

    it('Should return 400 if validation failed', async (done) => {
        const movie = new Movie();

        movie.name = 'Star Wars Test 9';
        movie.genre = 'Sci-Fi';
        movie.director = 'George Lucas';
        movie.quantity = 5;

        const inserted = await moviesService.save(movie);

        request(app)
            .patch(`/movies/${inserted.id}`)
            .send({ quantity: 'Wow' })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400)
            .then((response) => {
                expect(response.body.message).not.toBe(undefined);
                done();
            })
            .catch((err) => done(err));
    });
});

describe('DELETE /movies/:id', () => {
    it('Should return 204 if deleted successfully', async (done) => {
        const movie = new Movie();

        movie.name = 'Star Wars 10';
        movie.genre = 'Sci-Fi';
        movie.director = 'George Lucas';
        movie.quantity = 5;

        const inserted = await moviesService.save(movie);

        request(app)
            .delete(`/movies/${inserted.id}`)
            .set('Accept', 'application/json')
            .expect(204)
            .then(() => {
                done();
            })
            .catch((err) => done(err));
    });
});
