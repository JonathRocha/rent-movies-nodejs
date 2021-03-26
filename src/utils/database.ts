import knex, { Knex } from 'knex';
import dbConfig from '../config/database';

let _connection: Knex;

export function createUpdateTimestampTrigger(
    knexInstance: Knex,
    tableName: string,
    field: string
): Knex.Raw<any> {
    return knexInstance.raw(`
        CREATE TRIGGER auto_update_${field}
        BEFORE UPDATE
        ON "${tableName}"
        FOR EACH ROW
        EXECUTE PROCEDURE update_timestamp('${field}');
    `);
}

export function getDbInstance() {
    if (!_connection) {
        _connection = knex({
            client: dbConfig.client,
            connection: {
                host: dbConfig.host,
                user: dbConfig.user,
                password: dbConfig.password,
                database: dbConfig.database,
            },
            pool: { min: process.env.NODE_ENV !== 'test' ? 1 : 5 },
        });
    }
    return _connection;
}
