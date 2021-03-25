import { Movie } from './movies.dto';

export interface MovieEntity extends Movie {
    id: number;
    create_at: Date;
    updated_at?: Date;
    deleted_at?: Date;
}
