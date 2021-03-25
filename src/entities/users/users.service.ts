import HttpException from 'exceptions/HttpException';
import { UserEntity } from './types';
import { User, UserUpdate } from './users.dto';
import BaseService from '../../base/base.service';

export default class UsersService extends BaseService {
    constructor() {
        super();
    }

    save(user: User): Promise<UserEntity> {
        return this.db('user').insert(user).returning<UserEntity>('*');
    }

    async findAll(limit: number, page: number = 1) {
        const [users, count] = await Promise.all([
            this.db('user')
                .select<UserEntity>('*')
                .whereNull('deleted_at')
                .offset(page * limit - limit)
                .limit(limit ?? 10),
            this.db('user')
                .count<{ total: number }>('id', { as: 'total' })
                .whereNull('deleted_at')
                .first(),
        ]);
        return { users, total: Number(count?.total ?? 0), perPage: limit };
    }

    async findById(id: number) {
        const user = await this.checkIfResourceExists(id);
        return { user };
    }

    async updateById(id: number, update: UserUpdate) {
        await this.checkIfResourceExists(id);

        await this.db('user')
            .update({ ...update })
            .where({ id });

        const user = await this.db('user')
            .select<UserEntity>('*')
            .where({ id })
            .whereNull('deleted_at')
            .first();

        return { user };
    }

    async deleteById(id: number) {
        await this.checkIfResourceExists(id);
        return this.db('user').update({ deleted_at: new Date() }).where({ id });
    }

    private async checkIfResourceExists(id: number) {
        const user = await this.db('user')
            .select<UserEntity>('*')
            .where({ id })
            .whereNull('deleted_at')
            .first();

        if (!user) {
            throw new HttpException(404, 'Resource not found.');
        }

        return user;
    }
}
