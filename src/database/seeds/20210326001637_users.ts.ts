import faker from 'faker';
import { Knex } from 'knex';
import { DateTime } from 'luxon';

const tableName = 'user';

export async function seed(knex: Knex): Promise<void> {
    await knex(tableName).del();

    return knex(tableName).insert(
        Array(12)
            .fill(null)
            .map(() => {
                const firstName = faker.name.firstName(1);
                const lastName = faker.name.lastName(1);

                return {
                    name: `${firstName} ${lastName}`,
                    email: faker.internet.email(firstName, lastName),
                    document: Array(11)
                        .fill(null)
                        .map(() => faker.random.number({ min: 0, max: 9 }))
                        .join(''),
                    gender: faker.name.gender(),
                    birthday: DateTime.local()
                        .startOf('day')
                        .minus({
                            years: faker.random.number({ min: 18, max: 25 }),
                        })
                        .toJSDate(),
                };
            })
    );
}
