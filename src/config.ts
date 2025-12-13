/**
 * @fileoverview Configuration settings and interfaces for password generation
 * Provides security settings, character sets, and distribution configurations
 */

/**
 * Algorithm version and compatibility interface
 * Ensures deterministic behavior across different environments and versions
 */
export interface AlgorithmVersion {
  readonly version: string;
  readonly hashAlgorithm: 'SHA-512';
  readonly encoding: 'UTF-8';
  readonly jsNumberPrecision: 'IEEE-754';
  readonly shuffleAlgorithm: 'Fisher-Yates';
}

/**
 * Test vector interface for algorithm validation
 * Used to verify algorithm consistency across environments
 */
export interface TestVector {
  readonly input: {
    keywords: string[];
    length: number;
    options?: Partial<DefaultPasswordOptions>;
    masterSalt?: string | null;
  };
  readonly expectedOutput: {
    password: string;
    hashPrefix: string; // First 16 chars of hash
    characterDiversity: {
      totalUniqueCharacters: number;
      maxRepetitions: number;
      diversityRatio: number;
    };
  };
  readonly environment: {
    nodeVersion?: string;
    browserType?: string;
    timestamp: number;
  };
}

/**
 * Security configuration interface
 * Defines cryptographic and validation parameters
 */
export interface SecurityConfig {
  minPasswordLength: number;
  maxPasswordLength: number;
  defaultPasswordLength: number;
  hashAlgorithm: 'SHA-512';
  hashIterations: number;
  masterSalt: string | null;
}

/**
 * Default password generation options interface
 * Specifies which character types to include in generated passwords
 */
export interface DefaultPasswordOptions {
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
}

/**
 * Character sets interface for password generation
 * Defines available character pools for each type
 */
export interface CharacterSets {
  readonly UPPERCASE: string;
  readonly LOWERCASE: string;
  readonly NUMBERS: string;
  readonly SYMBOLS: string;
}

/**
 * Password distribution settings interface
 * Defines percentage allocation for each character type
 */
export interface PasswordDistributionSettings {
  uppercase: number;
  lowercase: number;
  numbers: number;
  symbols: number;
}

/**
 * Password distribution configuration interface
 * Defines character distribution rules based on password length
 */
export interface PasswordDistributionConfig {
  long: {
    threshold: number;
    distribution: PasswordDistributionSettings;
  };
  medium: {
    threshold: number;
    distribution: PasswordDistributionSettings;
  };
  short: {
    distribution: 'equal';
  };
}

/**
 * Custom configuration interface for merging user settings
 * Allows partial overrides of default configuration
 */
export interface CustomConfig {
  SECURITY_CONFIG?: Partial<SecurityConfig>;
  DEFAULT_PASSWORD_OPTIONS?: Partial<DefaultPasswordOptions>;
  CHARACTER_SETS?: Partial<CharacterSets>;
  PASSWORD_DISTRIBUTION_CONFIG?: Partial<PasswordDistributionConfig>;
}

/**
 * Merged configuration interface
 * Result of merging default and custom configurations
 */
export interface MergedConfig {
  SECURITY_CONFIG: SecurityConfig;
  DEFAULT_PASSWORD_OPTIONS: DefaultPasswordOptions;
  CHARACTER_SETS: CharacterSets;
  PASSWORD_DISTRIBUTION_CONFIG: PasswordDistributionConfig;
}

/**
 * Core security settings for password generation
 * Controls cryptographic parameters and validation rules
 */
export const SECURITY_CONFIG: SecurityConfig = {
  minPasswordLength: 8,
  maxPasswordLength: 128,
  defaultPasswordLength: 16,
  hashAlgorithm: 'SHA-512',
  hashIterations: 1000,
  masterSalt: null
};

/**
 * Default character type inclusion settings
 * Specifies which character types are enabled by default
 */
export const DEFAULT_PASSWORD_OPTIONS: DefaultPasswordOptions = {
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: true
};

/**
 * Character distribution configuration based on password length
 * Optimizes security and compatibility for different password lengths
 */
export const PASSWORD_DISTRIBUTION_CONFIG: PasswordDistributionConfig = {
  long: {
    threshold: 64,
    distribution: {
      uppercase: 0.20,
      lowercase: 0.35,
      numbers: 0.20,
      symbols: 0.25
    }
  },
  medium: {
    threshold: 32,
    distribution: {
      uppercase: 0.25,
      lowercase: 0.35,
      numbers: 0.20,
      symbols: 0.20
    }
  },
  short: {
    distribution: 'equal'
  }
};

/**
 * Available character sets for password generation
 * Defines the character pools used for each character type
 */
export const CHARACTER_SETS: CharacterSets = {
  UPPERCASE: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  LOWERCASE: 'abcdefghijklmnopqrstuvwxyz',
  NUMBERS: '0123456789',
  SYMBOLS: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

/**
 * Algorithm version lock configuration
 * Ensures deterministic behavior and prevents algorithm drift
 */
export const ALGORITHM_VERSION: AlgorithmVersion = {
  version: '1.0.2',
  hashAlgorithm: 'SHA-512',
  encoding: 'UTF-8',
  jsNumberPrecision: 'IEEE-754',
  shuffleAlgorithm: 'Fisher-Yates'
};

/**
 * Predefined test vectors for algorithm validation
 * These vectors must always produce the same output
 */
export const ALGORITHM_TEST_VECTORS: readonly TestVector[] = [
  {
    input: {
      keywords: ['test'],
      length: 16,
    },
    expectedOutput: {
      password: 'Bu9]T_0Yi&p09.Hg',
      hashPrefix: '465e349bf20ac009',
      characterDiversity: {
        totalUniqueCharacters: 14,
        maxRepetitions: 2,
        diversityRatio: 0.875
      }
    },
    environment: {
      timestamp: 1704067200000 // 2024-01-01
    }
  },
  {
    input: {
      keywords: ['github.com', 'user@email.com'],
      length: 16,
    },
    expectedOutput: {
      password: 'Vk!]XmK0G25<m3$p',
      hashPrefix: '0e593aaaaaac049e',
      characterDiversity: {
        totalUniqueCharacters: 15,
        maxRepetitions: 2,
        diversityRatio: 0.938
      }
    },
    environment: {
      timestamp: 1704067200000
    }
  },
  {
    input: {
      keywords: ['diversity-test'],
      length: 32,
    },
    expectedOutput: {
      password: '$Ueqo0MyJyMz6DyjMJd6;Gw62h]<9*h%',
      hashPrefix: '461f4d98bee7922b',
      characterDiversity: {
        totalUniqueCharacters: 24,
        maxRepetitions: 3,
        diversityRatio: 0.750
      }
    },
    environment: {
      timestamp: 1704067200000
    }
  }
] as const;

/**
 * Merge custom configuration with default settings
 * @param customConfig - Custom configuration to merge with defaults
 * @returns Merged configuration object with user overrides applied
 */
export const mergeConfig = (customConfig: CustomConfig = {}): MergedConfig => {
  return {
    SECURITY_CONFIG: { ...SECURITY_CONFIG, ...customConfig.SECURITY_CONFIG },
    DEFAULT_PASSWORD_OPTIONS: { ...DEFAULT_PASSWORD_OPTIONS, ...customConfig.DEFAULT_PASSWORD_OPTIONS },
    CHARACTER_SETS: { ...CHARACTER_SETS, ...customConfig.CHARACTER_SETS },
    PASSWORD_DISTRIBUTION_CONFIG: { ...PASSWORD_DISTRIBUTION_CONFIG, ...customConfig.PASSWORD_DISTRIBUTION_CONFIG }
  };
}; 