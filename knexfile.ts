import dotenv from 'dotenv';
import { Knex } from 'knex';
import path from 'path';

dotenv.config();

const config: Knex.Config = {
    client: 'pg',
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PWD,
        database: process.env.DB_NAME,
    },
    pool: { max: 2 },
    migrations: {
        directory: path.join(__dirname, './src/database/migrations'),
        extension: 'ts',
        stub: path.join(__dirname, './src/database/migration.stub.ts'),
        tableName: 'migrations',
    },
    seeds: {
        directory: path.join(__dirname, './src/database/seeds'),
        extension: 'ts',
        stub: path.join(__dirname, './src/database/seed.stub.ts'),
        timestampFilenamePrefix: true,
    },
};

export default config;
