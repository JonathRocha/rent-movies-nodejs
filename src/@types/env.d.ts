declare namespace NodeJS {
    export interface ProcessEnv {
        NODE_ENV: string;
        SERVER_PORT: string;
        DB_HOST: string;
        DB_USER: string;
        DB_PWD: string;
        DB_NAME: string;
    }
}
