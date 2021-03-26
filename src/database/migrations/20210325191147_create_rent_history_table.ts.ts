import { Knex } from 'knex';
import { createUpdateTimestampTrigger } from '../../utils/database';

const tableName = 'rent_history';

export async function up(knex: Knex): Promise<void> {
    const exists = await knex.schema.hasTable(tableName);

    if (!exists) {
        await knex.schema.createTable(tableName, (table) => {
            table.bigIncrements('id').primary();
            table.bigInteger('rent_id').notNullable();
            table.foreign('rent_id').references('rent.id');
            table.string('action', 5).notNullable();
            table.timestamp('created_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
        });

        await createUpdateTimestampTrigger(knex, tableName, 'updated_at');
    }
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable(tableName);
}
