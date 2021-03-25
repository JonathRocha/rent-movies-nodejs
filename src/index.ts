import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import moviesRouter from './movies/movies.router';

const app = express();
const serverPort = Number(process.env.SERVER_PORT ?? 3000);

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/movies', moviesRouter);

app.listen(serverPort, () => {
    console.info(`Server is runnign at port ${serverPort}`);
});
