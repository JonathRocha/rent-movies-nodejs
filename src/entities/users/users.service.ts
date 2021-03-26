import { UserEntity } from './types';
import { User, UserUpdate } from './users.dto';
import HttpException from '../../exceptions/HttpException';
import BaseService from '../../base/base.service';

export default class UsersService extends BaseService {
    constructor() {
        super();
    }

    async save(user: User): Promise<UserEntity> {
        try {
            const [insertedUser] = await this.db('user')
                .insert(user)
                .returning<UserEntity[]>('*');
            return insertedUser;
        } catch (error) {
            if ('detail' in error && /already exists/.test(error.detail)) {
                throw new HttpException(400, `User already registered.`);
            }
            throw error;
        }
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

    async findById(id: number): Promise<{ user: UserEntity }> {
        return { user: await this.checkIfResourceExists(id) };
    }

    async updateById(id: number, update: UserUpdate) {
        await this.checkIfResourceExists(id);

        await this.db('user')
            .update({ ...update })
            .where({ id });

        return this.findById(id);
    }

    async deleteById(id: number) {
        await this.checkIfResourceExists(id);
        return this.db('user').update({ deleted_at: new Date() }).where({ id });
    }

    private async checkIfResourceExists(id: number): Promise<UserEntity> {
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
