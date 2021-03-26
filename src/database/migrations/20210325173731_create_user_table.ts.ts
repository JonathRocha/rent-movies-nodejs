import { Knex } from 'knex';
import { createUpdateTimestampTrigger } from '../../utils/database';

const tableName = 'user';

export async function up(knex: Knex): Promise<void> {
    const exists = await knex.schema.hasTable(tableName);

    if (!exists) {
        await knex.schema.createTable(tableName, (table) => {
            table.bigIncrements('id').primary();
            table.string('name', 100).notNullable();
            table.string('email', 100).notNullable().unique();
            table.string('document', 11).notNullable().unique();
            table.string('gender', 45).notNullable();
            table.timestamp('birthday').notNullable();
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
