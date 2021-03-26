import App from './app';
import MoviesController from './entities/movies/movies.controller';
import UsersController from './entities/users/users.controller';
import RentsController from './entities/rents/rents.controller';

const app = new App(
    [new MoviesController(), new UsersController(), new RentsController()],
    Number(process.env.SERVER_PORT ?? 3001),
);

app.listen();
