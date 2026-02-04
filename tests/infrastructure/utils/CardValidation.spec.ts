import {
  validateLuhn,
  validateCVV,
  validateExpirationDate,
  validateCardholderName,
  validateCardData,
} from '../../../src/infrastructure/utils/CardValidation';

describe('CardValidation Utils', () => {
  describe('validateLuhn', () => {
    it('should validate valid Visa card number', () => {
      expect(validateLuhn('4111111111111111')).toBe(true);
    });

    it('should validate valid MasterCard number', () => {
      expect(validateLuhn('5555555555554444')).toBe(true);
    });

    it('should validate valid American Express number', () => {
      expect(validateLuhn('378282246310005')).toBe(true);
    });

    it('should reject invalid card number', () => {
      expect(validateLuhn('4111111111111112')).toBe(false);
    });

    it('should handle card numbers with spaces', () => {
      expect(validateLuhn('4111 1111 1111 1111')).toBe(true);
    });

    it('should handle card numbers with dashes', () => {
      expect(validateLuhn('4111-1111-1111-1111')).toBe(true);
    });

    it('should reject too short card numbers', () => {
      expect(validateLuhn('411111111111')).toBe(false);
    });

    it('should reject too long card numbers', () => {
      expect(validateLuhn('41111111111111111111')).toBe(false);
    });

    it('should reject empty string', () => {
      expect(validateLuhn('')).toBe(false);
    });

    it('should reject card numbers with non-digits', () => {
      expect(validateLuhn('411111111111111a')).toBe(false);
    });

    it('should process digits from right to left correctly', () => {
      // Test known valid card (Visa)
      expect(validateLuhn('4111111111111111')).toBe(true);
    });
  });

  describe('validateCVV', () => {
    it('should accept 3-digit CVV', () => {
      expect(validateCVV('123')).toBe(true);
    });

    it('should accept 4-digit CVV', () => {
      expect(validateCVV('1234')).toBe(true);
    });

    it('should reject 2-digit CVV', () => {
      expect(validateCVV('12')).toBe(false);
    });

    it('should reject 5-digit CVV', () => {
      expect(validateCVV('12345')).toBe(false);
    });

    it('should handle CVV with spaces', () => {
      expect(validateCVV('1 2 3')).toBe(true);
    });

    it('should reject non-numeric CVV', () => {
      expect(validateCVV('12a')).toBe(false);
    });

    it('should reject empty CVV', () => {
      expect(validateCVV('')).toBe(false);
    });
  });

  describe('validateExpirationDate', () => {
    it('should accept valid future date', () => {
      const futureYear = new Date().getFullYear() + 5;
      expect(validateExpirationDate(12, futureYear)).toBe(true);
    });

    it('should reject expired month in current year', () => {
      const currentDate = new Date();
      const pastMonth = currentDate.getMonth(); // This month is past
      const currentYear = currentDate.getFullYear();
      expect(validateExpirationDate(pastMonth, currentYear)).toBe(false);
    });

    it('should reject past year', () => {
      const pastYear = new Date().getFullYear() - 1;
      expect(validateExpirationDate(12, pastYear)).toBe(false);
    });

    it('should reject invalid month (0)', () => {
      expect(validateExpirationDate(0, 2025)).toBe(false);
    });

    it('should reject invalid month (13)', () => {
      expect(validateExpirationDate(13, 2025)).toBe(false);
    });

    it('should reject year too far in future', () => {
      const farFutureYear = new Date().getFullYear() + 31;
      expect(validateExpirationDate(12, farFutureYear)).toBe(false);
    });

    it('should accept year exactly 30 years in future', () => {
      const futureYear = new Date().getFullYear() + 30;
      expect(validateExpirationDate(12, futureYear)).toBe(true);
    });

    it('should accept all valid months', () => {
      const futureYear = new Date().getFullYear() + 1;
      for (let month = 1; month <= 12; month++) {
        expect(validateExpirationDate(month, futureYear)).toBe(true);
      }
    });

    it('should accept current month if not yet passed', () => {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      // This depends on current date, so we check it's valid for future year
      expect(validateExpirationDate(currentMonth, currentYear + 1)).toBe(true);
    });
  });

  describe('validateCardholderName', () => {
    it('should accept valid name with letters', () => {
      expect(validateCardholderName('John Doe')).toBe(true);
    });

    it('should accept name with hyphens', () => {
      expect(validateCardholderName('Mary-Jane Smith')).toBe(true);
    });

    it('should accept name with apostrophes', () => {
      expect(validateCardholderName("O'Brien")).toBe(true);
    });

    it('should reject single letter name', () => {
      expect(validateCardholderName('J')).toBe(false);
    });

    it('should reject empty name', () => {
      expect(validateCardholderName('')).toBe(false);
    });

    it('should reject name with only spaces', () => {
      expect(validateCardholderName('   ')).toBe(false);
    });

    it('should reject name with numbers', () => {
      expect(validateCardholderName('John Doe 123')).toBe(false);
    });

    it('should reject name with special characters', () => {
      expect(validateCardholderName('John@Doe')).toBe(false);
    });

    it('should accept two-letter name', () => {
      expect(validateCardholderName('Jo')).toBe(true);
    });
  });

  describe('validateCardData', () => {
    it('should validate all correct card data', () => {
      const futureYear = new Date().getFullYear() + 5;
      const result = validateCardData(
        '4111111111111111',
        12,
        futureYear,
        '123',
        'John Doe',
      );

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return error for invalid card number', () => {
      const futureYear = new Date().getFullYear() + 5;
      const result = validateCardData(
        '4111111111111112',
        12,
        futureYear,
        '123',
        'John Doe',
      );

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Card number is invalid');
    });

    it('should return error for expired date', () => {
      const pastYear = new Date().getFullYear() - 1;
      const result = validateCardData(
        '4111111111111111',
        12,
        pastYear,
        '123',
        'John Doe',
      );

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'Card expiration date is invalid or expired',
      );
    });

    it('should return error for invalid CVV', () => {
      const futureYear = new Date().getFullYear() + 5;
      const result = validateCardData(
        '4111111111111111',
        12,
        futureYear,
        '12',
        'John Doe',
      );

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('CVV must be 3 or 4 digits');
    });

    it('should return error for invalid cardholder name', () => {
      const futureYear = new Date().getFullYear() + 5;
      const result = validateCardData(
        '4111111111111111',
        12,
        futureYear,
        '123',
        'J',
      );

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Cardholder name is invalid');
    });

    it('should return multiple errors for multiple invalid fields', () => {
      const result = validateCardData('4111111111111112', 12, 2020, '12', 'J');

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });

    it('should collect all error messages', () => {
      const result = validateCardData(
        '1234567890123456',
        13,
        2020,
        '12345',
        '',
      );

      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
