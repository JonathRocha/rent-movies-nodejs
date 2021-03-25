import {
    IsDate,
    IsEmail,
    IsOptional,
    IsString,
    Validate,
} from 'class-validator';
import { CustomDocument } from 'utils/validateUserDocument';

export class User {
    @IsString()
    name!: string;

    @IsString()
    gender!: string;

    @IsString()
    @Validate(CustomDocument)
    document!: string;

    @IsString()
    @IsEmail()
    email!: string;

    @IsDate()
    birthday!: Date;
}

export class UserUpdate {
    @IsString()
    @IsOptional()
    name!: string;

    @IsString()
    @IsOptional()
    gender!: string;

    @IsString()
    @Validate(CustomDocument)
    @IsOptional()
    document!: string;

    @IsString()
    @IsEmail()
    @IsOptional()
    email!: string;

    @IsDate()
    @IsOptional()
    birthday!: Date;
}
