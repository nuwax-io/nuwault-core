/**
 * @fileoverview Input validation utilities for password generation
 * Provides comprehensive validation for all password generation parameters
 */

import { SECURITY_CONFIG, DEFAULT_PASSWORD_OPTIONS } from '../config.js';
import type { DefaultPasswordOptions } from '../config.js';

/**
 * Validation result interface
 * Contains validation status and optional error message
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Password options interface for validation
 * Specifies which character types to include in password generation
 */
export interface PasswordOptions {
  includeUppercase?: boolean;
  includeLowercase?: boolean;
  includeNumbers?: boolean;
  includeSymbols?: boolean;
}

/**
 * Input validation utility class
 * Provides static methods for validating password generation parameters
 */
export class InputValidator {
  
  /**
   * Validate password length against security constraints
   * @param length - Password length to validate
   * @returns Validation result with error details if invalid
   */
  static validatePasswordLength(length: number): ValidationResult {
    if (typeof length !== 'number' || !Number.isInteger(length)) {
      return {
        isValid: false,
        error: 'Password length must be a valid integer'
      };
    }

    if (length < SECURITY_CONFIG.minPasswordLength) {
      return {
        isValid: false,
        error: `Password length must be at least ${SECURITY_CONFIG.minPasswordLength} characters`
      };
    }

    if (length > SECURITY_CONFIG.maxPasswordLength) {
      return {
        isValid: false,
        error: `Password length cannot exceed ${SECURITY_CONFIG.maxPasswordLength} characters`
      };
    }

    return { isValid: true };
  }

  /**
   * Validate password character type options
   * @param options - Password options to validate
   * @returns Validation result with error details if invalid
   */
  static validatePasswordOptions(options: PasswordOptions): ValidationResult {
    if (!options || typeof options !== 'object') {
      return {
        isValid: false,
        error: 'Password options must be a valid object'
      };
    }

    const mergedOptions: DefaultPasswordOptions = {
      ...DEFAULT_PASSWORD_OPTIONS,
      ...options
    };

    const hasAtLeastOneType = Object.values(mergedOptions).some(value => value === true);

    if (!hasAtLeastOneType) {
      return {
        isValid: false,
        error: 'At least one character type must be enabled'
      };
    }

    return { isValid: true };
  }

  /**
   * Validate user keywords array for password generation
   * @param keywords - Keywords array to validate
   * @returns Validation result with error details if invalid
   */
  static validateKeywords(keywords: string[]): ValidationResult {
    if (!Array.isArray(keywords)) {
      return {
        isValid: false,
        error: 'Keywords must be an array'
      };
    }

    if (keywords.length === 0) {
      return {
        isValid: false,
        error: 'At least one keyword is required'
      };
    }

    for (let i = 0; i < keywords.length; i++) {
      const keyword = keywords[i];
      
      if (typeof keyword !== 'string') {
        return {
          isValid: false,
          error: `Keyword at index ${i} must be a string`
        };
      }

      if (keyword.trim().length === 0) {
        return {
          isValid: false,
          error: `Keyword at index ${i} cannot be empty or contain only whitespace`
        };
      }
    }

    return { isValid: true };
  }

  /**
   * Validate master salt parameter
   * @param masterSalt - Master salt to validate (null allowed)
   * @returns Validation result with error details if invalid
   */
  static validateMasterSalt(masterSalt: string | null): ValidationResult {
    if (masterSalt === null || masterSalt === undefined) {
      return { isValid: true };
    }

    if (typeof masterSalt !== 'string') {
      return {
        isValid: false,
        error: 'Master salt must be a string or null'
      };
    }

    if (masterSalt.length === 0) {
      return {
        isValid: false,
        error: 'Master salt cannot be empty string (use null instead)'
      };
    }

    return { isValid: true };
  }

  /**
   * Validate all password generation inputs comprehensively
   * @param keywords - User keywords for password generation
   * @param length - Desired password length
   * @param options - Character type inclusion options
   * @param masterSalt - Optional master salt for additional security
   * @returns Validation result with error details if any input is invalid
   */
  static validateAllInputs(
    keywords: string[],
    length: number,
    options: PasswordOptions,
    masterSalt: string | null = null
  ): ValidationResult {
    const keywordsValidation = this.validateKeywords(keywords);
    if (!keywordsValidation.isValid) {
      return keywordsValidation;
    }

    const lengthValidation = this.validatePasswordLength(length);
    if (!lengthValidation.isValid) {
      return lengthValidation;
    }

    const optionsValidation = this.validatePasswordOptions(options);
    if (!optionsValidation.isValid) {
      return optionsValidation;
    }

    const saltValidation = this.validateMasterSalt(masterSalt);
    if (!saltValidation.isValid) {
      return saltValidation;
    }

    return { isValid: true };
  }
} 