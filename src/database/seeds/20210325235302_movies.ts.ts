import faker from 'faker';
import { Knex } from 'knex';

const tableName = 'movie';

export async function seed(knex: Knex): Promise<void> {
    await knex(tableName).del();
    return knex(tableName).insert(
        Array(15)
            .fill(null)
            .map(() => ({
                name: faker.random.words(Math.random() * (3 - 1) + 1),
                genre: faker.random.word(),
                director: `${faker.name.firstName(1)} ${faker.name.lastName(
                    1
                )}`,
                quantity: Math.ceil(Math.random() * (3 - 1) + 1),
            }))
    );
}
