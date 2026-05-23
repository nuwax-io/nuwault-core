/**
 * @fileoverview Nuwault Core - Deterministic Password Generator
 * Main entry point providing both modern TypeScript API and legacy JavaScript compatibility
 */

// Configuration exports
export {
  SECURITY_CONFIG,
  DEFAULT_PASSWORD_OPTIONS,
  CHARACTER_SETS,
  PASSWORD_DISTRIBUTION_CONFIG,
  ALGORITHM_VERSION,
  ALGORITHM_TEST_VECTORS,
  mergeConfig
} from './config.js';

export type {
  SecurityConfig,
  DefaultPasswordOptions,
  CharacterSets,
  PasswordDistributionSettings,
  PasswordDistributionConfig,
  CustomConfig,
  MergedConfig,
  AlgorithmVersion,
  TestVector
} from './config.js';

// Core functionality exports
export { PasswordGenerator } from './password/password-generator.js';
export type {
  PasswordGenerationOptions,
  PasswordGenerationResult,
  PasswordValidationResult,
  PasswordTestResult
} from './password/password-generator.js';

export { HashGenerator } from './crypto/hash-generator.js';
export type {
  HashOptions,
  HashResult,
  CompatibilityResult,
  TestVectorResult
} from './crypto/hash-generator.js';

export { InputValidator } from './utils/input-validator.js';
export type {
  ValidationResult,
  PasswordOptions
} from './utils/input-validator.js';

export { PasswordAnalyzer } from './analysis/password-analyzer.js';
export type {
  CharacterTypeCounts,
  CharacterDistribution,
  PasswordAnalysisResult
} from './analysis/password-analyzer.js';

// Internal imports
import { PasswordGenerator } from './password/password-generator.js';
import { PasswordAnalyzer } from './analysis/password-analyzer.js';
import { HashGenerator } from './crypto/hash-generator.js';
import { InputValidator } from './utils/input-validator.js';
import { SECURITY_CONFIG, DEFAULT_PASSWORD_OPTIONS, ALGORITHM_VERSION, mergeConfig } from './config.js';
import type { PasswordGenerationOptions, PasswordGenerationResult } from './password/password-generator.js';
import type { PasswordAnalysisResult, CharacterDistribution } from './analysis/password-analyzer.js';
import type { CustomConfig, MergedConfig } from './config.js';

/**
 * Generate a secure, deterministic password
 * Supports both modern TypeScript API and legacy JavaScript API for backward compatibility
 * 
 * @param optionsOrInputs - Modern API: PasswordGenerationOptions object, Legacy API: string array
 * @param legacyOptions - Legacy API options (used only when first param is string array)
 * @returns Promise resolving to password generation result or password string
 */
export function generatePassword(options: PasswordGenerationOptions): Promise<PasswordGenerationResult>;
export function generatePassword(
  inputs: string[], 
  options?: {
    length?: number;
    includeUppercase?: boolean;
    includeLowercase?: boolean;
    includeNumbers?: boolean;
    includeSymbols?: boolean;
    masterSalt?: string | null;
  }
): Promise<string>;
export function generatePassword(
  optionsOrInputs: PasswordGenerationOptions | string[],
  legacyOptions?: {
    length?: number;
    includeUppercase?: boolean;
    includeLowercase?: boolean;
    includeNumbers?: boolean;
    includeSymbols?: boolean;
    masterSalt?: string | null;
  }
): Promise<PasswordGenerationResult | string> {
  if (Array.isArray(optionsOrInputs)) {
    return generatePasswordLegacy(optionsOrInputs, legacyOptions);
  } else {
    return PasswordGenerator.generatePassword(optionsOrInputs);
  }
}

/**
 * Analyze password strength and composition
 * @param password - Password to analyze
 * @returns Complete password analysis including strength metrics
 */
export const analyzePassword = (password: string): PasswordAnalysisResult => 
  PasswordAnalyzer.analyzePassword(password);

/**
 * Analyze character distribution in password
 * @param password - Password to analyze
 * @returns Character type distribution percentages
 */
export const analyzeCharacterDistribution = (password: string): CharacterDistribution => {
  const counts = PasswordAnalyzer.countCharacterTypes(password);
  return PasswordAnalyzer.calculateCharacterDistribution(counts);
};

// ==================== Algorithm Validation API ====================

/**
 * Validate algorithm compatibility across environments
 * Comprehensive check of hash generation and password generation algorithms
 * @returns Promise resolving to detailed compatibility validation results
 */
export const validateAlgorithmCompatibility = async () => {
  const [hashValidation, passwordValidation] = await Promise.all([
    HashGenerator.validateAlgorithmCompatibility(),
    PasswordGenerator.validatePasswordGenerationCompatibility()
  ]);

  return {
    overall: {
      isFullyCompatible: hashValidation.isCompatible && passwordValidation.isCompatible,
      algorithmVersion: hashValidation.algorithmVersion,
      timestamp: Date.now()
    },
    hashGeneration: hashValidation,
    passwordGeneration: passwordValidation
  };
};

/**
 * Quick algorithm compatibility check for production use
 * Fast validation using single test vector from each component
 * @returns Promise resolving to boolean compatibility status
 */
export const quickCompatibilityCheck = async (): Promise<boolean> => {
  try {
    const [hashCheck, passwordCheck] = await Promise.all([
      HashGenerator.quickCompatibilityCheck(),
      PasswordGenerator.quickPasswordCompatibilityCheck()
    ]);
    return hashCheck && passwordCheck;
  } catch {
    return false;
  }
};

/**
 * Validate full algorithm stack
 * Validates hash generation, password generation, and character diversity
 * @returns Promise resolving to comprehensive algorithm validation
 */
export const validateFullAlgorithm = (): Promise<{
  isFullyCompatible: boolean;
  hashCompatibility: boolean;
  passwordCompatibility: boolean;
  algorithmVersion: string;
  timestamp: number;
}> => PasswordGenerator.validateFullAlgorithm();

/**
 * Get algorithm version information
 * @returns Current algorithm version and configuration details
 */
export const getAlgorithmVersion = () => {
  return {
    ...ALGORITHM_VERSION,
    timestamp: Date.now(),
    features: [
      'SHA-512 Hash Generation',
      'Character Diversity Optimization',
      'Repetition Control',
      'Balanced Distribution',
      'Cross-Platform Validation'
    ]
  };
};

// ==================== Legacy JavaScript API ====================

/**
 * Legacy password generation function for backward compatibility
 * @param inputs - Array of input keywords
 * @param options - Password generation options
 * @returns Promise resolving to generated password string
 */
export const generatePasswordLegacy = async (
  inputs: string[], 
  options: {
    length?: number;
    includeUppercase?: boolean;
    includeLowercase?: boolean;
    includeNumbers?: boolean;
    includeSymbols?: boolean;
    masterSalt?: string | null;
  } = {}
): Promise<string> => {
  const result = await PasswordGenerator.generatePassword({
    keywords: inputs,
    length: options.length ?? SECURITY_CONFIG.defaultPasswordLength,
    options: {
      includeUppercase: options.includeUppercase ?? DEFAULT_PASSWORD_OPTIONS.includeUppercase,
      includeLowercase: options.includeLowercase ?? DEFAULT_PASSWORD_OPTIONS.includeLowercase,
      includeNumbers: options.includeNumbers ?? DEFAULT_PASSWORD_OPTIONS.includeNumbers,
      includeSymbols: options.includeSymbols ?? DEFAULT_PASSWORD_OPTIONS.includeSymbols
    },
    masterSalt: options.masterSalt ?? null
  });
  return result.password;
};

/**
 * Generate cryptographic hash from input keywords
 * @param inputs - Array of input keywords
 * @param masterSalt - Optional master salt for additional security
 * @returns Promise resolving to generated hash string
 */
export const generateHash = async (inputs: string[], masterSalt?: string | null): Promise<string> => {
  const result = await HashGenerator.generateHash({
    keywords: inputs,
    masterSalt: masterSalt ?? null
  });
  return result.hash;
};

/**
 * Convert hash to password using specified options
 * @param hash - Input hash string (128-character SHA-512 hex string)
 * @param options - Password generation options
 * @returns Generated password string
 * @throws {Error} When hash is not a valid 128-character hex string or options are invalid
 */
export const hashToPassword = (
  hash: string,
  options: {
    length?: number;
    includeUppercase?: boolean;
    includeLowercase?: boolean;
    includeNumbers?: boolean;
    includeSymbols?: boolean;
  } = {}
): string => {
  if (typeof hash !== 'string' || !/^[0-9a-fA-F]{128}$/.test(hash)) {
    throw new Error('Hash must be a valid 128-character SHA-512 hex string');
  }

  const length = options.length ?? SECURITY_CONFIG.defaultPasswordLength;
  const lengthValidation = InputValidator.validatePasswordLength(length);
  if (!lengthValidation.isValid) {
    throw new Error(lengthValidation.error);
  }

  const passwordOptions = {
    includeUppercase: options.includeUppercase ?? DEFAULT_PASSWORD_OPTIONS.includeUppercase,
    includeLowercase: options.includeLowercase ?? DEFAULT_PASSWORD_OPTIONS.includeLowercase,
    includeNumbers: options.includeNumbers ?? DEFAULT_PASSWORD_OPTIONS.includeNumbers,
    includeSymbols: options.includeSymbols ?? DEFAULT_PASSWORD_OPTIONS.includeSymbols
  };

  const optionsValidation = InputValidator.validatePasswordOptions(passwordOptions);
  if (!optionsValidation.isValid) {
    throw new Error(optionsValidation.error);
  }

  return PasswordGenerator.hashToPassword(hash.toLowerCase(), length, passwordOptions);
};

/**
 * Normalize input string for consistent processing
 * @param input - Input string to normalize
 * @returns Normalized string (trimmed and lowercased)
 */
export const normalizeInput = (input: string): string => {
  return input.trim().toLowerCase();
};

/**
 * Legacy wrapper class for vanilla JavaScript compatibility
 * Provides object-oriented interface for password generation and analysis
 */
export class NuwaultCore {
  private readonly config: MergedConfig;

  /**
   * Create new NuwaultCore instance
   * @param customConfig - Custom configuration to override defaults
   */
  constructor(customConfig: CustomConfig = {}) {
    this.config = mergeConfig(customConfig);
  }

  /**
   * Generate secure password from input keywords
   * @param inputs - Array of input strings (keywords, URLs, etc.)
   * @param options - Password generation options (override instance config)
   * @returns Promise resolving to generated password
   */
  async generatePassword(
    inputs: string[],
    options: {
      length?: number;
      includeUppercase?: boolean;
      includeLowercase?: boolean;
      includeNumbers?: boolean;
      includeSymbols?: boolean;
      masterSalt?: string | null;
    } = {}
  ): Promise<string> {
    const result = await PasswordGenerator.generatePassword({
      keywords: inputs,
      length: options.length ?? this.config.SECURITY_CONFIG.defaultPasswordLength,
      options: {
        includeUppercase: options.includeUppercase ?? this.config.DEFAULT_PASSWORD_OPTIONS.includeUppercase,
        includeLowercase: options.includeLowercase ?? this.config.DEFAULT_PASSWORD_OPTIONS.includeLowercase,
        includeNumbers: options.includeNumbers ?? this.config.DEFAULT_PASSWORD_OPTIONS.includeNumbers,
        includeSymbols: options.includeSymbols ?? this.config.DEFAULT_PASSWORD_OPTIONS.includeSymbols
      },
      masterSalt: options.masterSalt ?? this.config.SECURITY_CONFIG.masterSalt
    });
    return result.password;
  }

  /**
   * Analyze character distribution in password
   * @param password - Password to analyze
   * @param _options - Analysis options (reserved for future use)
   * @returns Character distribution analysis
   */
  analyzePassword(password: string, _options: any = {}): CharacterDistribution {
    return analyzeCharacterDistribution(password);
  }
}

export default NuwaultCore; 