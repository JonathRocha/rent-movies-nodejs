import { IsInt, IsISO8601, IsOptional, Max, Min, Validate } from 'class-validator';
import { IsNotPastDate } from '../../utils/customValidations';

export class Rent {
    @IsInt()
    movie_id!: number;

    @IsInt()
    user_id!: number;

    @IsISO8601()
    @Validate(IsNotPastDate)
    return_date!: Date;

    @IsInt()
    @Min(0)
    @Max(1)
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

    @IsISO8601()
    @Validate(IsNotPastDate)
    @IsOptional()
    return_date!: Date;

    @IsInt()
    @Min(0)
    @Max(1)
    @IsOptional()
    returned!: number;
}

export class RentRenew {
    @IsInt()
    @Min(1, { message: 'The minimum for renewal is one day.' })
    days!: number;
}
