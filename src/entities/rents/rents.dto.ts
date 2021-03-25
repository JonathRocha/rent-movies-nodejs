import { IsDate, IsInt, IsOptional } from 'class-validator';

export class Rent {
    @IsInt()
    movie_id!: number;

    @IsInt()
    user_id!: number;

    @IsDate()
    return_date!: Date;

    @IsInt()
    @IsOptional()
    returned!: number;
}

export class RentUpdate {
    @IsInt()
    @IsOptional()
    movie_id!: number;

    @IsInt()
    @IsOptional()
    user_id!: number;

    @IsDate()
    @IsOptional()
    return_date!: Date;

    @IsInt()
    @IsOptional()
    @IsOptional()
    returned!: number;
}
