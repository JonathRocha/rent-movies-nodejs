import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';
import { DateTime } from 'luxon';

@ValidatorConstraint({ name: 'IsValidDocument', async: false })
export class IsValidDocument implements ValidatorConstraintInterface {
    validate(text: string, _args: ValidationArguments) {
        text = text.replace(/[^\d]+/g, '');

        if (text.length !== 11 || /^(\d)\1+$/.test(text)) return false;
        let sum = 0,
            rest;

        for (let i = 1; i <= 9; i++) sum = sum + Number(text.substring(i - 1, i)) * (11 - i);
        rest = (sum * 10) % 11;

        if (rest == 10 || rest == 11) rest = 0;
        if (rest != Number(text.substring(9, 10))) return false;

        sum = 0;
        for (var i = 1; i <= 10; i++) sum = sum + Number(text.substring(i - 1, i)) * (12 - i);

        rest = (sum * 10) % 11;

        if (rest == 10 || rest == 11) rest = 0;
        if (rest != Number(text.substring(10, 11))) return false;

        return true;
    }

    defaultMessage(_args: ValidationArguments) {
        return 'Document ($value) is not valid!';
    }
}

@ValidatorConstraint({ name: 'IsOverage', async: false })
export class IsOverage implements ValidatorConstraintInterface {
    validate(text: string, _args: ValidationArguments) {
        const birthday = DateTime.fromSQL(text);
        const minAge = DateTime.local().minus({ years: 18 });

        if (birthday > minAge) {
            return false;
        }

        return true;
    }

    defaultMessage(_args: ValidationArguments) {
        return 'Only people over 18 are allowed.';
    }
}

@ValidatorConstraint({ name: 'IsNotPastDate', async: false })
export class IsNotPastDate implements ValidatorConstraintInterface {
    validate(text: string, _args: ValidationArguments) {
        const date = DateTime.fromSQL(text);

        if (date <= DateTime.local()) {
            return false;
        }

        return true;
    }

    defaultMessage(_args: ValidationArguments) {
        return 'Past date is not allowed.';
    }
}
