/**
 * Input validation utilities for API endpoints
 */

// UUID v4 pattern
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Barcode patterns (UPC, EAN, etc.)
const BARCODE_PATTERN = /^[0-9]{8,14}$/;

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  return UUID_PATTERN.test(uuid);
}

/**
 * Validate barcode format
 */
export function isValidBarcode(barcode: string): boolean {
  return BARCODE_PATTERN.test(barcode);
}

/**
 * Validate that a number is positive
 */
export function isPositiveNumber(value: any): boolean {
  const num = Number(value);
  return !isNaN(num) && num > 0;
}

/**
 * Validate that a number is non-negative
 */
export function isNonNegativeNumber(value: any): boolean {
  const num = Number(value);
  return !isNaN(num) && num >= 0;
}

/**
 * Validate date format (YYYY-MM-DD)
 */
export function isValidDate(dateString: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return false;
  }

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Validate date is not in the past
 */
export function isNotPastDate(dateString: string): boolean {
  if (!isValidDate(dateString)) {
    return false;
  }

  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return date >= today;
}

/**
 * Validate string is not empty and within max length
 */
export function isValidString(value: string, minLength: number = 1, maxLength: number = 255): boolean {
  return (
    typeof value === 'string' &&
        value.trim().length >= minLength &&
        value.length <= maxLength
  );
}

/**
 * Sanitize string (remove extra whitespace)
 */
export function sanitizeString(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

/**
 * Validation error response
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Create validation error response
 */
export function validationError(field: string, message: string): ValidationError {
  return { field, message };
}

/**
 * Create multiple validation errors response
 */
export function validationErrors(errors: ValidationError[]): { errors: ValidationError[] } {
  return { errors };
}
