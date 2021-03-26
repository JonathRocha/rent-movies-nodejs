import { IsEmail, IsISO8601, IsOptional, IsString, Validate } from 'class-validator';
import { IsValidDocument, IsOverage } from '../../utils/customValidations';

export class User {
    @IsString()
    name!: string;

    @IsString()
    gender!: string;

    @IsString()
    @Validate(IsValidDocument)
    document!: string;

    @IsString()
    @IsEmail()
    email!: string;

    @IsISO8601()
    @Validate(IsOverage)
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
    @Validate(IsValidDocument)
    @IsOptional()
    document!: string;

    @IsString()
    @IsEmail()
    @IsOptional()
    email!: string;

    @IsISO8601()
    @Validate(IsOverage)
    @IsOptional()
    birthday!: Date;
}
