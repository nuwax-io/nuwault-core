/**
 * @fileoverview Deterministic password generation from cryptographic hashes
 * Converts secure hashes into passwords with configurable character distribution and minimal repetition
 */

import { HashGenerator } from '../crypto/hash-generator.js';
import { InputValidator } from '../utils/input-validator.js';
import { 
  CHARACTER_SETS, 
  PASSWORD_DISTRIBUTION_CONFIG, 
  DEFAULT_PASSWORD_OPTIONS, 
  SECURITY_CONFIG,
  ALGORITHM_VERSION,
  ALGORITHM_TEST_VECTORS
} from '../config.js';
import type { HashOptions } from '../crypto/hash-generator.js';
import type { PasswordOptions, ValidationResult } from '../utils/input-validator.js';
import type { TestVector } from '../config.js';

/**
 * Password generation options interface
 * Configuration for deterministic password generation
 */
export interface PasswordGenerationOptions {
  keywords: string[];
  length?: number;
  options?: PasswordOptions;
  masterSalt?: string | null;
  iterations?: number;
}

/**
 * Password generation result interface
 * Contains generated password and metadata
 */
export interface PasswordGenerationResult {
  password: string;
  length: number;
  options: PasswordOptions;
  metadata: {
    hashIterations: number;
    generationTime: number;
    characterDistribution: {
      uppercase: number;
      lowercase: number;
      numbers: number;
      symbols: number;
    };
    characterDiversity: {
      totalUniqueCharacters: number;
      maxRepetitions: number;
      averageRepetitions: number;
      diversityRatio: number;
    };
  };
}

/**
 * Password generation validation result interface
 * Contains validation results for password generation algorithm
 */
export interface PasswordValidationResult {
  isCompatible: boolean;
  algorithmVersion: string;
  testedVectors: number;
  passedVectors: number;
  failedVectors: PasswordTestResult[];
  environment: {
    userAgent?: string;
    nodeVersion?: string;
    timestamp: number;
  };
}

/**
 * Individual password test result interface
 * Contains specific password generation test results
 */
export interface PasswordTestResult {
  vectorIndex: number;
  input: TestVector['input'];
  expected: TestVector['expectedOutput'];
  actual: {
    password: string;
    characterDiversity: {
      totalUniqueCharacters: number;
      maxRepetitions: number;
      diversityRatio: number;
    };
  };
  passed: boolean;
  differences: string[];
  error?: string;
}

/**
 * Character set interface for password generation
 */
interface CharacterSet {
  chars: string;
  type: 'uppercase' | 'lowercase' | 'numbers' | 'symbols';
}

/**
 * Target character distribution interface
 */
interface TargetDistribution {
  uppercase: number;
  lowercase: number;
  numbers: number;
  symbols: number;
}

/**
 * Deterministic password generator utility class
 * Converts cryptographic hashes into secure passwords with balanced character distribution and minimal repetition
 */
export class PasswordGenerator {

  /**
   * Generate deterministic password from user keywords
   * @param options - Password generation configuration
   * @returns Promise resolving to password generation result with metadata
   * @throws {Error} When generation options are invalid
   */
  static async generatePassword(options: PasswordGenerationOptions): Promise<PasswordGenerationResult> {
    const startTime = Date.now();
    
    const normalizedOptions = this.normalizeOptions(options);
    const validation = this.validateGenerationOptions(normalizedOptions);
    
    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid password generation options');
    }

    const hashOptions: HashOptions = {
      keywords: normalizedOptions.keywords,
      masterSalt: normalizedOptions.masterSalt,
      iterations: normalizedOptions.iterations
    };

    const hashResult = await HashGenerator.generateHash(hashOptions);

    const password = this.hashToPassword(
      hashResult.hash,
      normalizedOptions.length,
      normalizedOptions.options
    );

    const characterDistribution = this.calculateActualDistribution(password);
    const characterDiversity = this.calculateCharacterDiversity(password);

    return {
      password,
      length: password.length,
      options: normalizedOptions.options,
      metadata: {
        hashIterations: hashResult.iterations,
        generationTime: Date.now() - startTime,
        characterDistribution,
        characterDiversity
      }
    };
  }

  /**
   * Validate full password generation algorithm compatibility
   * Tests complete password generation against known test vectors
   * @returns Promise resolving to comprehensive validation results
   */
  static async validatePasswordGenerationCompatibility(): Promise<PasswordValidationResult> {
    const results: PasswordTestResult[] = [];
    let passedCount = 0;

    // Get environment info
    const environment = {
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      nodeVersion: typeof process !== 'undefined' ? process.version : undefined,
      timestamp: Date.now()
    };

    for (let i = 0; i < ALGORITHM_TEST_VECTORS.length; i++) {
      const vector = ALGORITHM_TEST_VECTORS[i];
      
      try {
        // Generate password for test vector
        const result = await this.generatePassword({
          keywords: vector.input.keywords,
          length: vector.input.length,
          options: vector.input.options,
          masterSalt: vector.input.masterSalt
        });

        const differences: string[] = [];
        let passed = true;

        // Check password match
        if (result.password !== vector.expectedOutput.password) {
          differences.push(`password: expected "${vector.expectedOutput.password}", got "${result.password}"`);
          passed = false;
        }

        // Check character diversity metrics
        const actualDiversity = result.metadata.characterDiversity;
        const expectedDiversity = vector.expectedOutput.characterDiversity;

        if (actualDiversity.totalUniqueCharacters !== expectedDiversity.totalUniqueCharacters) {
          differences.push(`totalUniqueCharacters: expected ${expectedDiversity.totalUniqueCharacters}, got ${actualDiversity.totalUniqueCharacters}`);
          passed = false;
        }

        if (actualDiversity.maxRepetitions !== expectedDiversity.maxRepetitions) {
          differences.push(`maxRepetitions: expected ${expectedDiversity.maxRepetitions}, got ${actualDiversity.maxRepetitions}`);
          passed = false;
        }

        if (Math.abs(actualDiversity.diversityRatio - expectedDiversity.diversityRatio) > 0.001) {
          differences.push(`diversityRatio: expected ${expectedDiversity.diversityRatio}, got ${actualDiversity.diversityRatio}`);
          passed = false;
        }

        results.push({
          vectorIndex: i,
          input: vector.input,
          expected: vector.expectedOutput,
          actual: {
            password: result.password,
            characterDiversity: actualDiversity
          },
          passed,
          differences
        });

        if (passed) passedCount++;

      } catch (error) {
        results.push({
          vectorIndex: i,
          input: vector.input,
          expected: vector.expectedOutput,
          actual: {
            password: '',
            characterDiversity: {
              totalUniqueCharacters: 0,
              maxRepetitions: 0,
              diversityRatio: 0
            }
          },
          passed: false,
          differences: [],
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const failedVectors = results.filter(r => !r.passed);

    return {
      isCompatible: failedVectors.length === 0,
      algorithmVersion: ALGORITHM_VERSION.version,
      testedVectors: ALGORITHM_TEST_VECTORS.length,
      passedVectors: passedCount,
      failedVectors,
      environment
    };
  }

  /**
   * Quick password generation compatibility check
   * Fast validation using single test vector for production use
   * @returns Promise resolving to boolean compatibility result
   */
  static async quickPasswordCompatibilityCheck(): Promise<boolean> {
    try {
      // Use first test vector for quick check
      const testVector = ALGORITHM_TEST_VECTORS[0];
      const result = await this.generatePassword({
        keywords: testVector.input.keywords,
        length: testVector.input.length,
        options: testVector.input.options,
        masterSalt: testVector.input.masterSalt
      });

      return result.password === testVector.expectedOutput.password;
    } catch {
      return false;
    }
  }

  /**
   * Comprehensive algorithm validation
   * Validates both hash generation and password generation
   * @returns Promise resolving to overall compatibility status
   */
  static async validateFullAlgorithm(): Promise<{
    isFullyCompatible: boolean;
    hashCompatibility: boolean;
    passwordCompatibility: boolean;
    algorithmVersion: string;
    timestamp: number;
  }> {
    try {
      const [hashCheck, passwordCheck] = await Promise.all([
        HashGenerator.quickCompatibilityCheck(),
        this.quickPasswordCompatibilityCheck()
      ]);

      return {
        isFullyCompatible: hashCheck && passwordCheck,
        hashCompatibility: hashCheck,
        passwordCompatibility: passwordCheck,
        algorithmVersion: ALGORITHM_VERSION.version,
        timestamp: Date.now()
      };
    } catch {
      return {
        isFullyCompatible: false,
        hashCompatibility: false,
        passwordCompatibility: false,
        algorithmVersion: ALGORITHM_VERSION.version,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Convert cryptographic hash to password with balanced character distribution and minimal repetition
   * @param hash - Hash string to convert
   * @param length - Desired password length
   * @param options - Character type inclusion options
   * @returns Generated password with specified length and optimized distribution
   */
  private static hashToPassword(hash: string, length: number, options: PasswordOptions): string {
    const { includeUppercase, includeLowercase, includeNumbers, includeSymbols } = options;
    
    const activeSets: CharacterSet[] = [];
    if (includeUppercase) activeSets.push({ chars: CHARACTER_SETS.UPPERCASE, type: 'uppercase' });
    if (includeLowercase) activeSets.push({ chars: CHARACTER_SETS.LOWERCASE, type: 'lowercase' });
    if (includeNumbers) activeSets.push({ chars: CHARACTER_SETS.NUMBERS, type: 'numbers' });
    if (includeSymbols) activeSets.push({ chars: CHARACTER_SETS.SYMBOLS, type: 'symbols' });
    
    if (activeSets.length === 0) {
      activeSets.push(
        { chars: CHARACTER_SETS.UPPERCASE, type: 'uppercase' },
        { chars: CHARACTER_SETS.LOWERCASE, type: 'lowercase' },
        { chars: CHARACTER_SETS.NUMBERS, type: 'numbers' },
        { chars: CHARACTER_SETS.SYMBOLS, type: 'symbols' }
      );
    }
    
    const hashLength = hash.length;
    const password = new Array<string>(length);
    const targetDistribution = this.calculateTargetDistribution(activeSets, length);
    
    // Calculate maximum allowed repetitions based on password length
    const maxRepetitions = this.calculateMaxRepetitions(length);
    const characterUsage = new Map<string, number>();
    
    let hashOffset = 0;
    
    const getHashValue = (seed = 0): number => {
      const index1 = (hashOffset + seed) % hashLength;
      const index2 = (hashOffset + seed + 1) % hashLength;
      const index3 = (hashOffset + seed + 2) % hashLength;
      hashOffset = (hashOffset + 3) % hashLength;
      
      return parseInt(hash[index1] + hash[index2] + hash[index3], 16) || 1;
    };
    
    const usedPositions = this.fillPasswordWithDistribution(
      password, 
      activeSets, 
      targetDistribution, 
      length, 
      getHashValue,
      characterUsage,
      maxRepetitions
    );
    
    this.fillRemainingPositions(
      password, 
      activeSets, 
      usedPositions, 
      length, 
      getHashValue,
      characterUsage,
      maxRepetitions
    );
    
    this.shufflePassword(password, length, getHashValue);
    
    return password.join('');
  }

  /**
   * Calculate maximum allowed repetitions for a character based on password length
   * @param length - Password length
   * @returns Maximum number of times a character can repeat
   */
  private static calculateMaxRepetitions(length: number): number {
    if (length <= 8) return 2;
    if (length <= 16) return Math.max(2, Math.floor(length / 6));
    if (length <= 32) return Math.max(2, Math.floor(length / 8));
    return Math.max(3, Math.floor(length / 10));
  }

  /**
   * Calculate target character distribution based on password length and active character sets
   * @param activeSets - Array of active character sets
   * @param length - Password length
   * @returns Target distribution for each character type
   */
  private static calculateTargetDistribution(activeSets: CharacterSet[], length: number): TargetDistribution {
    let targetDistribution: TargetDistribution = {
      uppercase: 0,
      lowercase: 0,
      numbers: 0,
      symbols: 0
    };
    
    if (activeSets.length === 4) {
      if (length >= PASSWORD_DISTRIBUTION_CONFIG.long.threshold) {
        const config = PASSWORD_DISTRIBUTION_CONFIG.long.distribution;
        targetDistribution = {
          uppercase: Math.floor(length * config.uppercase),
          lowercase: Math.floor(length * config.lowercase),
          numbers: Math.floor(length * config.numbers),
          symbols: Math.floor(length * config.symbols)
        };
      } else if (length >= PASSWORD_DISTRIBUTION_CONFIG.medium.threshold) {
        const config = PASSWORD_DISTRIBUTION_CONFIG.medium.distribution;
        targetDistribution = {
          uppercase: Math.floor(length * config.uppercase),
          lowercase: Math.floor(length * config.lowercase),
          numbers: Math.floor(length * config.numbers),
          symbols: Math.floor(length * config.symbols)
        };
      } else {
        const equalShare = Math.floor(length / 4);
        targetDistribution = {
          uppercase: equalShare,
          lowercase: equalShare,
          numbers: equalShare,
          symbols: equalShare
        };
      }
    } else {
      const equalShare = Math.floor(length / activeSets.length);
      for (const set of activeSets) {
        targetDistribution[set.type] = equalShare;
      }
    }
    
    const totalAllocated = Object.values(targetDistribution).reduce((a, b) => a + b, 0);
    const remainder = length - totalAllocated;
    
    if (remainder > 0) {
      const largestType = Object.keys(targetDistribution).reduce((a, b) => 
        targetDistribution[a as keyof TargetDistribution] > targetDistribution[b as keyof TargetDistribution] ? a : b
      ) as keyof TargetDistribution;
      targetDistribution[largestType] += remainder;
    }
    
    return targetDistribution;
  }

  /**
   * Fill password positions with characters according to target distribution and repetition limits
   * @param password - Password array to fill
   * @param activeSets - Active character sets
   * @param targetDistribution - Target character distribution
   * @param length - Password length
   * @param getHashValue - Deterministic random value generator
   * @param characterUsage - Character usage tracking map
   * @param maxRepetitions - Maximum allowed repetitions per character
   * @returns Set of filled positions
   */
  private static fillPasswordWithDistribution(
    password: string[], 
    activeSets: CharacterSet[], 
    targetDistribution: TargetDistribution, 
    length: number, 
    getHashValue: (seed?: number) => number,
    characterUsage: Map<string, number>,
    maxRepetitions: number
  ): Set<number> {
    const usedPositions = new Set<number>();
    
    for (const set of activeSets) {
      const targetCount = targetDistribution[set.type] || 0;
      const availableChars = set.chars.split('');
      
      for (let i = 0; i < targetCount; i++) {
        let position: number | undefined;
        let attempts = 0;
        do {
          const hashVal = getHashValue(set.type.charCodeAt(0) * 1000 + i * 100 + attempts);
          position = hashVal % length;
          attempts++;
        } while (usedPositions.has(position) && attempts < length * 2);
        
        if (attempts >= length * 2) {
          for (let j = 0; j < length; j++) {
            if (!usedPositions.has(j)) {
              position = j;
              break;
            }
          }
        }
        
        if (position !== undefined && !usedPositions.has(position)) {
          usedPositions.add(position);
          
          // Select character with repetition control
          const selectedChar = this.selectCharacterWithRepetitionControl(
            availableChars,
            characterUsage,
            maxRepetitions,
            getHashValue,
            set.type.charCodeAt(0) * 2000 + i * 300
          );
          
          password[position] = selectedChar;
          characterUsage.set(selectedChar, (characterUsage.get(selectedChar) || 0) + 1);
        }
      }
    }
    
    return usedPositions;
  }

  /**
   * Select a character from available chars while respecting repetition limits
   * @param availableChars - Array of available characters
   * @param characterUsage - Character usage tracking map
   * @param maxRepetitions - Maximum allowed repetitions
   * @param getHashValue - Deterministic random value generator
   * @param seed - Seed for randomization
   * @returns Selected character
   */
  private static selectCharacterWithRepetitionControl(
    availableChars: string[],
    characterUsage: Map<string, number>,
    maxRepetitions: number,
    getHashValue: (seed?: number) => number,
    seed: number
  ): string {
    // Filter characters that haven't reached max repetitions
    const availableUnderLimit = availableChars.filter(char => 
      (characterUsage.get(char) || 0) < maxRepetitions
    );
    
    // If we have characters under the limit, use them
    if (availableUnderLimit.length > 0) {
      const hashVal = getHashValue(seed);
      const charIndex = hashVal % availableUnderLimit.length;
      return availableUnderLimit[charIndex];
    }
    
    // If all characters are at max repetitions, select the least used one
    const leastUsedCount = Math.min(...availableChars.map(char => characterUsage.get(char) || 0));
    const leastUsedChars = availableChars.filter(char => 
      (characterUsage.get(char) || 0) === leastUsedCount
    );
    
    const hashVal = getHashValue(seed + 1000);
    const charIndex = hashVal % leastUsedChars.length;
    return leastUsedChars[charIndex];
  }

  /**
   * Fill remaining empty positions in password array with repetition control
   * @param password - Password array
   * @param activeSets - Active character sets
   * @param usedPositions - Set of already used positions
   * @param length - Password length
   * @param getHashValue - Deterministic random value generator
   * @param characterUsage - Character usage tracking map
   * @param maxRepetitions - Maximum allowed repetitions per character
   */
  private static fillRemainingPositions(
    password: string[], 
    activeSets: CharacterSet[], 
    usedPositions: Set<number>, 
    length: number, 
    getHashValue: (seed?: number) => number,
    characterUsage: Map<string, number>,
    maxRepetitions: number
  ): void {
    for (let i = 0; i < length; i++) {
      if (!usedPositions.has(i)) {
        const setWeights = activeSets.map(set => {
          if (set.type === 'symbols' && length >= 32) return 3;
          if (set.type === 'numbers' && length >= 32) return 2;
          return 1;
        });
        
        const totalWeight = setWeights.reduce((a, b) => a + b, 0);
        const hashVal = getHashValue(i * 500);
        let selectedWeight = hashVal % totalWeight;
        
        let selectedSet = activeSets[0];
        for (let j = 0; j < activeSets.length; j++) {
          selectedWeight -= setWeights[j];
          if (selectedWeight <= 0) {
            selectedSet = activeSets[j];
            break;
          }
        }
        
        // Select character with repetition control
        const availableChars = selectedSet.chars.split('');
        const selectedChar = this.selectCharacterWithRepetitionControl(
          availableChars,
          characterUsage,
          maxRepetitions,
          getHashValue,
          i * 600
        );
        
        password[i] = selectedChar;
        characterUsage.set(selectedChar, (characterUsage.get(selectedChar) || 0) + 1);
      }
    }
  }

  /**
   * Apply deterministic shuffle to password array using Fisher-Yates algorithm
   * @param password - Password array to shuffle
   * @param length - Password length
   * @param getHashValue - Deterministic random value generator
   */
  private static shufflePassword(
    password: string[], 
    length: number, 
    getHashValue: (seed?: number) => number
  ): void {
    for (let i = length - 1; i > 0; i--) {
      const hashVal = getHashValue(i * 400);
      const j = hashVal % (i + 1);
      
      const temp = password[i];
      password[i] = password[j];
      password[j] = temp;
    }
  }

  /**
   * Calculate character diversity metrics for generated password
   * @param password - Generated password to analyze
   * @returns Character diversity analysis
   */
  private static calculateCharacterDiversity(password: string): {
    totalUniqueCharacters: number;
    maxRepetitions: number;
    averageRepetitions: number;
    diversityRatio: number;
  } {
    const charCount = new Map<string, number>();
    
    for (const char of password) {
      charCount.set(char, (charCount.get(char) || 0) + 1);
    }
    
    const repetitionCounts = Array.from(charCount.values());
    const totalUniqueCharacters = charCount.size;
    const maxRepetitions = Math.max(...repetitionCounts);
    const averageRepetitions = repetitionCounts.reduce((a, b) => a + b, 0) / repetitionCounts.length;
    const diversityRatio = totalUniqueCharacters / password.length;
    
    return {
      totalUniqueCharacters,
      maxRepetitions,
      averageRepetitions: Math.round(averageRepetitions * 100) / 100,
      diversityRatio: Math.round(diversityRatio * 1000) / 1000
    };
  }

  /**
   * Normalize password generation options with defaults
   * @param options - Raw password generation options
   * @returns Normalized options with all required fields
   */
  private static normalizeOptions(options: PasswordGenerationOptions): Required<PasswordGenerationOptions> {
    return {
      keywords: options.keywords || [],
      length: options.length || SECURITY_CONFIG.defaultPasswordLength,
      options: { ...DEFAULT_PASSWORD_OPTIONS, ...options.options },
      masterSalt: options.masterSalt || SECURITY_CONFIG.masterSalt,
      iterations: options.iterations || SECURITY_CONFIG.hashIterations
    };
  }

  /**
   * Validate password generation options
   * @param options - Normalized options to validate
   * @returns Validation result with error details if invalid
   */
  private static validateGenerationOptions(options: Required<PasswordGenerationOptions>): ValidationResult {
    return InputValidator.validateAllInputs(
      options.keywords,
      options.length,
      options.options,
      options.masterSalt
    );
  }

  /**
   * Calculate actual character distribution in generated password
   * @param password - Generated password to analyze
   * @returns Character type counts for each category
   */
  private static calculateActualDistribution(password: string): {
    uppercase: number;
    lowercase: number;
    numbers: number;
    symbols: number;
  } {
    const distribution = {
      uppercase: 0,
      lowercase: 0,
      numbers: 0,
      symbols: 0
    };

    for (const char of password) {
      if (/[A-Z]/.test(char)) {
        distribution.uppercase++;
      } else if (/[a-z]/.test(char)) {
        distribution.lowercase++;
      } else if (/[0-9]/.test(char)) {
        distribution.numbers++;
      } else {
        distribution.symbols++;
      }
    }

    return distribution;
  }

  /**
   * Validate password generation options (public validation method)
   * @param options - Password generation options to validate
   * @returns Validation result with error details if invalid
   */
  static validateOptions(options: PasswordGenerationOptions): ValidationResult {
    try {
      const normalizedOptions = this.normalizeOptions(options);
      return this.validateGenerationOptions(normalizedOptions);
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown validation error'
      };
    }
  }
} 