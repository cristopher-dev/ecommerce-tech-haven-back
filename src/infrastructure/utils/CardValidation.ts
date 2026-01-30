/**
 * Card validation utilities
 */

/**
 * Validates card number using Luhn algorithm
 * @param cardNumber - The card number to validate
 * @returns true if valid, false otherwise
 */
export function validateLuhn(cardNumber: string): boolean {
  // Remove spaces and non-digits
  const digits = cardNumber.replace(/\D/g, '');

  if (digits.length < 13 || digits.length > 19) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  // Process digits from right to left
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i] as string, 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Validates CVV format
 * @param cvv - The CVV to validate
 * @returns true if valid (3-4 digits), false otherwise
 */
export function validateCVV(cvv: string): boolean {
  const cvvDigits = cvv.replace(/\D/g, '');
  return cvvDigits.length >= 3 && cvvDigits.length <= 4;
}

/**
 * Validates expiration date
 * @param expirationMonth - Month (1-12)
 * @param expirationYear - Year (YYYY format)
 * @returns true if card hasn't expired, false otherwise
 */
export function validateExpirationDate(
  expirationMonth: number,
  expirationYear: number,
): boolean {
  if (expirationMonth < 1 || expirationMonth > 12) {
    return false;
  }

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11

  // Card expires at the end of the expiration month
  if (expirationYear < currentYear) {
    return false;
  }

  if (expirationYear === currentYear && expirationMonth < currentMonth) {
    return false;
  }

  // Check if year is reasonable (not too far in future)
  if (expirationYear > currentYear + 30) {
    return false;
  }

  return true;
}

/**
 * Validates card holder name
 * @param name - The cardholder name
 * @returns true if valid, false otherwise
 */
export function validateCardholderName(name: string): boolean {
  if (!name || name.trim().length < 2) {
    return false;
  }

  // Allow letters, spaces, and hyphens
  const validNamePattern = /^[a-zA-Z\s\-']+$/;
  return validNamePattern.test(name);
}

/**
 * Validates all card data
 * @param cardNumber - Credit card number
 * @param expirationMonth - Expiration month
 * @param expirationYear - Expiration year
 * @param cvv - CVV/CVC code
 * @param cardholderName - Cardholder name
 * @returns Object with validation result and error messages
 */
export function validateCardData(
  cardNumber: string,
  expirationMonth: number,
  expirationYear: number,
  cvv: string,
  cardholderName: string,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!validateLuhn(cardNumber)) {
    errors.push('Card number is invalid');
  }

  if (!validateExpirationDate(expirationMonth, expirationYear)) {
    errors.push('Card expiration date is invalid or expired');
  }

  if (!validateCVV(cvv)) {
    errors.push('CVV must be 3 or 4 digits');
  }

  if (!validateCardholderName(cardholderName)) {
    errors.push('Cardholder name is invalid');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
