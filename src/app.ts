import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import BaseController from './base/base.controller';
import { errorHandler } from './middlewares/errorHandler';

class App {
    public app: Application;
    public port: number;

    constructor(controllers: BaseController[], port: number) {
        this.app = express();
        this.port = port;

        this.initializeMiddlewares();
        this.initializeControllers(controllers);
        this.postMiddlewares();
    }

    private initializeMiddlewares() {
        this.app.use(helmet());
        this.app.use(cors());
        this.app.use(express.json());
    }

    private postMiddlewares() {
        this.app.use(errorHandler);
    }

    private initializeControllers(controllers: BaseController[]) {
        controllers.forEach((controller) => {
            this.app.use('/', controller.router);
        });
    }

    public listen() {
        this.app.listen(this.port, () => {
            console.info(`Server is running on port ${this.port}`);
        });
    }
}

export default App;
