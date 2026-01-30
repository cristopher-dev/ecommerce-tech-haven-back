import {
  registerDecorator,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import {
  validateLuhn,
  validateCVV,
  validateExpirationDate,
} from './CardValidation';

@ValidatorConstraint({ name: 'isValidCard', async: false })
export class IsValidCardConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string') return false;
    return validateLuhn(value);
  }

  defaultMessage(): string {
    return 'Invalid card number format or failed Luhn check';
  }
}

@ValidatorConstraint({ name: 'isValidExpiration', async: false })
export class IsValidExpirationConstraint implements ValidatorConstraintInterface {
  validate(_value: unknown, args: ValidationArguments): boolean {
    const object = args.object as Record<string, unknown>;
    const month = object['expirationMonth'] as number | undefined;
    const year = object['expirationYear'] as number | undefined;

    if (!month || !year) return false;
    return validateExpirationDate(month, year);
  }

  defaultMessage(): string {
    return 'Card expiration date is invalid or expired';
  }
}

@ValidatorConstraint({ name: 'isValidCVV', async: false })
export class IsValidCVVConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string') return false;
    return validateCVV(value);
  }

  defaultMessage(): string {
    return 'CVV must be 3 or 4 digits';
  }
}

export function IsValidCard() {
  return function (target: unknown, propertyName: string) {
    registerDecorator({
      target: (target as Record<string, unknown>).constructor,
      propertyName,
      constraints: [],
      options: {
        message: 'Invalid card number',
      },
      validator: IsValidCardConstraint,
    });
  };
}

export function IsValidExpiration() {
  return function (target: unknown, propertyName: string) {
    registerDecorator({
      target: (target as Record<string, unknown>).constructor,
      propertyName,
      constraints: [],
      options: {
        message: 'Card expiration date is invalid or expired',
      },
      validator: IsValidExpirationConstraint,
    });
  };
}

export function IsValidCVVFormat() {
  return function (target: unknown, propertyName: string) {
    registerDecorator({
      target: (target as Record<string, unknown>).constructor,
      propertyName,
      constraints: [],
      options: {
        message: 'CVV must be 3 or 4 digits',
      },
      validator: IsValidCVVConstraint,
    });
  };
}
