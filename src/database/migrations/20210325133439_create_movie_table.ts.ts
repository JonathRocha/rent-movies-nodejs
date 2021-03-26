import { Knex } from 'knex';
import { createUpdateTimestampTrigger } from '../../utils/database';

const tableName = 'movie';

export async function up(knex: Knex): Promise<void> {
    const exists = await knex.schema.hasTable(tableName);

    if (!exists) {
        await knex.schema.createTable(tableName, (table) => {
            table.bigIncrements('id').primary();
            table.string('name', 100).notNullable().unique();
            table.string('genre', 100).notNullable();
            table.string('director', 100).notNullable();
            table.integer('quantity').notNullable().defaultTo(1);
            table.timestamp('created_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
            table.timestamp('updated_at').nullable().defaultTo(null);
            table.timestamp('deleted_at').nullable().defaultTo(null);
        });

        await createUpdateTimestampTrigger(knex, tableName, 'updated_at');
    }
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable(tableName);
}
