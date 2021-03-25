import { Rent } from './rents.dto';

export interface RentEntity extends Rent {
    id: number;
    create_at: Date;
    updated_at?: Date;
    deleted_at?: Date;
}
