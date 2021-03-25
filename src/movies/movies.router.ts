import express from 'express';
import { validateBody } from '../middlewares/validate';
import { Movie } from './movie.dto';

const moviesRouter = express.Router();

moviesRouter.post('/', validateBody(Movie), (request, response) => {
    console.log(request.body);
    response.status(200).json({ message: 'Ok' });
});

export default moviesRouter;
