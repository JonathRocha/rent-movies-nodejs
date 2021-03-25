import { IsInt, IsOptional, IsString } from 'class-validator';

export class Movie {
    @IsString()
    name!: string;

    @IsString()
    genre!: string;

    @IsString()
    director!: string;

    @IsInt()
    quantity!: number;
}

export class MovieUpdate {
    @IsString()
    @IsOptional()
    name!: string;

    @IsString()
    @IsOptional()
    genre!: string;

    @IsString()
    @IsOptional()
    director!: string;

    @IsInt()
    @IsOptional()
    quantity!: number;
}
