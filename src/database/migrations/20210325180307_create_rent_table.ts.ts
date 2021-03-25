import { Knex } from 'knex';
import { createUpdateTimestampTrigger } from '../../utils/database';

const tableName = 'rent';

export async function up(knex: Knex): Promise<void> {
    const exists = await knex.schema.hasTable(tableName);

    if (!exists) {
        await knex.schema.createTable(tableName, (table) => {
            table.bigIncrements('id').primary();
            table.bigInteger('movie_id').notNullable();
            table.foreign('movie_id').references('movie.id');
            table.bigInteger('user_id').notNullable();
            table.foreign('user_id').references('user.id');
            table.timestamp('return_date').notNullable();
            table.integer('returned', 1).defaultTo(0);
            table
                .timestamp('created_at')
                .notNullable()
                .defaultTo(knex.raw('CURRENT_TIMESTAMP'));
            table.timestamp('updated_at').nullable().defaultTo(null);
            table.timestamp('deleted_at').nullable().defaultTo(null);
        });

        await createUpdateTimestampTrigger(knex, tableName, 'updated_at');
    }
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable(tableName);
}
