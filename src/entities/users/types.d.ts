import { User } from './users.dto';

export interface UserEntity extends User {
    id: number;
    create_at: Date;
    updated_at?: Date;
    deleted_at?: Date;
}
