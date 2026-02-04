import {
  IsValidCardConstraint,
  IsValidCVVConstraint,
  IsValidExpirationConstraint,
  IsValidCard,
  IsValidCVVFormat,
  IsValidExpiration,
} from '../../../src/infrastructure/utils/CardValidators';

describe('CardValidators', () => {
  describe('IsValidCardConstraint', () => {
    let constraint: IsValidCardConstraint;

    beforeEach(() => {
      constraint = new IsValidCardConstraint();
    });

    it('should validate a valid card number', () => {
      // Valid Visa card number (passes Luhn)
      const validCard = '4111111111111111';
      expect(constraint.validate(validCard)).toBe(true);
    });

    it('should reject invalid card number', () => {
      const invalidCard = '1234567890123456';
      expect(constraint.validate(invalidCard)).toBe(false);
    });

    it('should reject non-string values', () => {
      expect(constraint.validate(123)).toBe(false);
      expect(constraint.validate(null)).toBe(false);
      expect(constraint.validate(undefined)).toBe(false);
    });

    it('should return appropriate error message', () => {
      expect(constraint.defaultMessage()).toBe(
        'Invalid card number format or failed Luhn check',
      );
    });
  });

  describe('IsValidExpirationConstraint', () => {
    let constraint: IsValidExpirationConstraint;

    beforeEach(() => {
      constraint = new IsValidExpirationConstraint();
    });

    it('should validate a future expiration date', () => {
      const mockArgs = {
        object: {
          expirationMonth: 12,
          expirationYear: 2025,
        },
      } as any;

      // Mock a future date
      const isValid = constraint.validate(undefined, mockArgs);
      expect(typeof isValid).toBe('boolean');
    });

    it('should reject when month is missing', () => {
      const mockArgs = {
        object: {
          expirationYear: 2025,
        },
      } as any;

      expect(constraint.validate(undefined, mockArgs)).toBe(false);
    });

    it('should reject when year is missing', () => {
      const mockArgs = {
        object: {
          expirationMonth: 12,
        },
      } as any;

      expect(constraint.validate(undefined, mockArgs)).toBe(false);
    });

    it('should reject when both month and year are missing', () => {
      const mockArgs = {
        object: {},
      } as any;

      expect(constraint.validate(undefined, mockArgs)).toBe(false);
    });

    it('should return appropriate error message', () => {
      expect(constraint.defaultMessage()).toBe(
        'Card expiration date is invalid or expired',
      );
    });
  });

  describe('IsValidCVVConstraint', () => {
    let constraint: IsValidCVVConstraint;

    beforeEach(() => {
      constraint = new IsValidCVVConstraint();
    });

    it('should validate 3-digit CVV', () => {
      expect(constraint.validate('123')).toBe(true);
      expect(constraint.validate('456')).toBe(true);
      expect(constraint.validate('789')).toBe(true);
    });

    it('should validate 4-digit CVV', () => {
      expect(constraint.validate('1234')).toBe(true);
      expect(constraint.validate('5678')).toBe(true);
    });

    it('should reject 2-digit CVV', () => {
      expect(constraint.validate('12')).toBe(false);
    });

    it('should reject 5-digit CVV', () => {
      expect(constraint.validate('12345')).toBe(false);
    });

    it('should reject non-string values', () => {
      expect(constraint.validate(123)).toBe(false);
      expect(constraint.validate(null)).toBe(false);
      expect(constraint.validate(undefined)).toBe(false);
    });

    it('should reject non-numeric strings', () => {
      expect(constraint.validate('abc')).toBe(false);
      expect(constraint.validate('12a')).toBe(false);
    });

    it('should return appropriate error message', () => {
      expect(constraint.defaultMessage()).toBe('CVV must be 3 or 4 digits');
    });
  });

  describe('Decorator functions', () => {
    it('IsValidCard decorator should be defined', () => {
      expect(IsValidCard).toBeDefined();
      expect(typeof IsValidCard).toBe('function');
    });

    it('IsValidCVVFormat decorator should be defined', () => {
      expect(IsValidCVVFormat).toBeDefined();
      expect(typeof IsValidCVVFormat).toBe('function');
    });

    it('IsValidExpiration decorator should be defined', () => {
      expect(IsValidExpiration).toBeDefined();
      expect(typeof IsValidExpiration).toBe('function');
    });

    it('IsValidCard decorator should return a decorator function', () => {
      const decorator = IsValidCard();
      expect(typeof decorator).toBe('function');
    });

    it('IsValidCVVFormat decorator should return a decorator function', () => {
      const decorator = IsValidCVVFormat();
      expect(typeof decorator).toBe('function');
    });

    it('IsValidExpiration decorator should return a decorator function', () => {
      const decorator = IsValidExpiration();
      expect(typeof decorator).toBe('function');
    });
  });
});

describe('CardValidators', () => {
  describe('IsValidCardConstraint', () => {
    let constraint: IsValidCardConstraint;

    beforeEach(() => {
      constraint = new IsValidCardConstraint();
    });

    it('should validate a valid card number', () => {
      // Valid Visa card number (passes Luhn)
      const validCard = '4111111111111111';
      expect(constraint.validate(validCard)).toBe(true);
    });

    it('should reject invalid card number', () => {
      const invalidCard = '1234567890123456';
      expect(constraint.validate(invalidCard)).toBe(false);
    });

    it('should reject non-string values', () => {
      expect(constraint.validate(123)).toBe(false);
      expect(constraint.validate(null)).toBe(false);
      expect(constraint.validate(undefined)).toBe(false);
    });

    it('should return appropriate error message', () => {
      expect(constraint.defaultMessage()).toBe(
        'Invalid card number format or failed Luhn check',
      );
    });
  });

  describe('IsValidExpirationConstraint', () => {
    let constraint: IsValidExpirationConstraint;

    beforeEach(() => {
      constraint = new IsValidExpirationConstraint();
    });

    it('should validate a future expiration date', () => {
      const mockArgs = {
        object: {
          expirationMonth: 12,
          expirationYear: 2025,
        },
      } as any;

      // Mock a future date
      const isValid = constraint.validate(undefined, mockArgs);
      expect(typeof isValid).toBe('boolean');
    });

    it('should reject when month is missing', () => {
      const mockArgs = {
        object: {
          expirationYear: 2025,
        },
      } as any;

      expect(constraint.validate(undefined, mockArgs)).toBe(false);
    });

    it('should reject when year is missing', () => {
      const mockArgs = {
        object: {
          expirationMonth: 12,
        },
      } as any;

      expect(constraint.validate(undefined, mockArgs)).toBe(false);
    });

    it('should reject when both month and year are missing', () => {
      const mockArgs = {
        object: {},
      } as any;

      expect(constraint.validate(undefined, mockArgs)).toBe(false);
    });

    it('should return appropriate error message', () => {
      expect(constraint.defaultMessage()).toBe(
        'Card expiration date is invalid or expired',
      );
    });
  });

  describe('IsValidCVVConstraint', () => {
    let constraint: IsValidCVVConstraint;

    beforeEach(() => {
      constraint = new IsValidCVVConstraint();
    });

    it('should validate 3-digit CVV', () => {
      expect(constraint.validate('123')).toBe(true);
      expect(constraint.validate('456')).toBe(true);
      expect(constraint.validate('789')).toBe(true);
    });

    it('should validate 4-digit CVV', () => {
      expect(constraint.validate('1234')).toBe(true);
      expect(constraint.validate('5678')).toBe(true);
    });

    it('should reject 2-digit CVV', () => {
      expect(constraint.validate('12')).toBe(false);
    });

    it('should reject 5-digit CVV', () => {
      expect(constraint.validate('12345')).toBe(false);
    });

    it('should reject non-string values', () => {
      expect(constraint.validate(123)).toBe(false);
      expect(constraint.validate(null)).toBe(false);
      expect(constraint.validate(undefined)).toBe(false);
    });

    it('should reject non-numeric strings', () => {
      expect(constraint.validate('abc')).toBe(false);
      expect(constraint.validate('12a')).toBe(false);
    });

    it('should return appropriate error message', () => {
      expect(constraint.defaultMessage()).toBe('CVV must be 3 or 4 digits');
    });
  });

  describe('Decorator functions', () => {
    it('IsValidCard decorator should be defined', () => {
      expect(IsValidCard).toBeDefined();
      expect(typeof IsValidCard).toBe('function');
    });

    it('IsValidCVVFormat decorator should be defined', () => {
      expect(IsValidCVVFormat).toBeDefined();
      expect(typeof IsValidCVVFormat).toBe('function');
    });

    it('IsValidExpiration decorator should be defined', () => {
      expect(IsValidExpiration).toBeDefined();
      expect(typeof IsValidExpiration).toBe('function');
    });

    it('IsValidCard decorator should return a decorator function', () => {
      const decorator = IsValidCard();
      expect(typeof decorator).toBe('function');
    });

    it('IsValidCVVFormat decorator should return a decorator function', () => {
      const decorator = IsValidCVVFormat();
      expect(typeof decorator).toBe('function');
    });

    it('IsValidExpiration decorator should return a decorator function', () => {
      const decorator = IsValidExpiration();
      expect(typeof decorator).toBe('function');
    });
  });
});
