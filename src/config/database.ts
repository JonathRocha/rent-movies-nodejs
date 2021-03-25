import { Knex } from 'knex';

interface DbConfig {
    client: string;
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
}

const config: DbConfig = {
    client: process.env.DB_TYPE ?? 'postgresql',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PWD ?? '',
    database: process.env.DB_NAME ?? 'postgres',
};

export default config;
