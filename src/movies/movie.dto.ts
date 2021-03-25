import { IsInt, IsString } from 'class-validator';

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
