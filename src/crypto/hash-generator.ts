/**
 * @fileoverview Cryptographic hash generation for deterministic password creation
 * Provides secure hash generation using SHA-512 with configurable iterations and salt
 */

import { SECURITY_CONFIG, ALGORITHM_VERSION, ALGORITHM_TEST_VECTORS } from '../config.js';
import type { TestVector } from '../config.js';

/**
 * Hash generation options interface
 * Configuration for cryptographic hash generation
 */
export interface HashOptions {
  keywords: string[];
  masterSalt?: string | null;
  iterations?: number;
}

/**
 * Hash generation result interface
 * Contains the generated hash and metadata
 */
export interface HashResult {
  hash: string;
  iterations: number;
  timestamp: number;
}

/**
 * Algorithm compatibility result interface
 * Contains validation results for cross-platform compatibility
 */
export interface CompatibilityResult {
  isCompatible: boolean;
  algorithmVersion: string;
  testedVectors: number;
  passedVectors: number;
  failedVectors: TestVectorResult[];
  environment: {
    userAgent?: string;
    nodeVersion?: string;
    timestamp: number;
  };
}

/**
 * Test vector validation result interface
 * Contains individual test vector validation results
 */
export interface TestVectorResult {
  vectorIndex: number;
  input: TestVector['input'];
  expected: string;
  actual: string;
  hashPrefix: {
    expected: string;
    actual: string;
  };
  passed: boolean;
  error?: string;
}

/**
 * Cryptographic hash generator utility class
 * Provides deterministic hash generation with security features
 */
export class HashGenerator {
  
  /**
   * Generate deterministic hash from user keywords with security features
   * @param options - Hash generation configuration
   * @returns Promise resolving to hash result with metadata
   * @throws {Error} When inputs are invalid or empty
   */
  static async generateHash(options: HashOptions): Promise<HashResult> {
    const { keywords, masterSalt = null, iterations = SECURITY_CONFIG.hashIterations } = options;
    
    const validatedInputs = this.validateInputs(keywords);
    const normalizedInputs = validatedInputs.map(input => this.normalizeInput(input)).join('|');
    let currentHash = normalizedInputs;
    
    const encoder = new TextEncoder();
    const effectiveMasterSalt = masterSalt !== null ? masterSalt : SECURITY_CONFIG.masterSalt;
    
    for (let i = 0; i < iterations; i++) {
      const saltComponents: string[] = [];
      
      if (effectiveMasterSalt) {
        saltComponents.push(effectiveMasterSalt);
      }
      
      saltComponents.push(`iter-${i}`, normalizedInputs, currentHash);
      const iterationSalt = saltComponents.join('|');
      
      const data = encoder.encode(iterationSalt);
      const hashBuffer = await crypto.subtle.digest(SECURITY_CONFIG.hashAlgorithm, data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      currentHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      if (i === 0) {
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    }
    
    return {
      hash: currentHash,
      iterations,
      timestamp: Date.now()
    };
  }

  /**
   * Validate algorithm compatibility across environments
   * Tests predefined vectors to ensure consistent behavior
   * @returns Promise resolving to compatibility validation results
   */
  static async validateAlgorithmCompatibility(): Promise<CompatibilityResult> {
    const results: TestVectorResult[] = [];
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
        // Generate hash for test vector
        const hashResult = await this.generateHash({
          keywords: vector.input.keywords,
          masterSalt: vector.input.masterSalt,
          iterations: SECURITY_CONFIG.hashIterations
        });

        const actualHashPrefix = hashResult.hash.substring(0, 16);
        const passed = actualHashPrefix === vector.expectedOutput.hashPrefix;

        results.push({
          vectorIndex: i,
          input: vector.input,
          expected: vector.expectedOutput.hashPrefix,
          actual: actualHashPrefix,
          hashPrefix: {
            expected: vector.expectedOutput.hashPrefix,
            actual: actualHashPrefix
          },
          passed
        });

        if (passed) passedCount++;

      } catch (error) {
        results.push({
          vectorIndex: i,
          input: vector.input,
          expected: vector.expectedOutput.hashPrefix,
          actual: '',
          hashPrefix: {
            expected: vector.expectedOutput.hashPrefix,
            actual: ''
          },
          passed: false,
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
   * Quick compatibility check using single test vector
   * Fast validation for production environments
   * @returns Promise resolving to boolean compatibility result
   */
  static async quickCompatibilityCheck(): Promise<boolean> {
    try {
      // Use first test vector for quick check
      const testVector = ALGORITHM_TEST_VECTORS[0];
      const hashResult = await this.generateHash({
        keywords: testVector.input.keywords,
        masterSalt: testVector.input.masterSalt
      });

      const actualPrefix = hashResult.hash.substring(0, 16);
      return actualPrefix === testVector.expectedOutput.hashPrefix;
    } catch {
      return false;
    }
  }
  
  /**
   * Validate and filter input keywords array
   * @param inputs - Raw input keywords array
   * @returns Validated non-empty string inputs
   * @throws {Error} When inputs array is empty or invalid
   */
  private static validateInputs(inputs: string[]): string[] {
    if (!Array.isArray(inputs) || inputs.length === 0) {
      throw new Error('Inputs must be a non-empty array');
    }
    
    return inputs.filter(input => {
      if (typeof input !== 'string') {
        return false;
      }
      return input.trim().length > 0;
    });
  }
  
  /**
   * Normalize input string for consistent processing
   * @param input - Raw input string
   * @returns Normalized string (trimmed and lowercased)
   */
  private static normalizeInput(input: string): string {
    return input.trim().toLowerCase();
  }
  
  /**
   * Validate hash generation options structure
   * @param options - Hash generation options to validate
   * @returns True if options are valid, false otherwise
   */
  static validateHashOptions(options: HashOptions): boolean {
    if (!options || typeof options !== 'object') {
      return false;
    }
    
    if (!Array.isArray(options.keywords) || options.keywords.length === 0) {
      return false;
    }
    
    if (options.iterations !== undefined && (typeof options.iterations !== 'number' || options.iterations < 1)) {
      return false;
    }
    
    if (options.masterSalt !== undefined && options.masterSalt !== null && typeof options.masterSalt !== 'string') {
      return false;
    }
    
    return true;
  }
} 