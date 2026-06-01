/**
 * @fileoverview Comprehensive test suite for Nuwault Core password generation library
 */

import { describe, it, expect } from 'vitest';
import {
  PasswordGenerator,
  HashGenerator,
  PasswordAnalyzer,
  InputValidator,
  generatePassword,
  generatePasswordLegacy,
  generateHash,
  analyzePassword,
  analyzeCharacterDistribution,
  hashToPassword,
  validateAlgorithmCompatibility,
  quickCompatibilityCheck,
  validateFullAlgorithm,
  getAlgorithmVersion,
  mergeConfig,
  NuwaultCore,
  SECURITY_CONFIG,
  ALGORITHM_TEST_VECTORS,
} from '../dist/index.js';

describe('Password Generator - TypeScript API', () => {
  describe('HashGenerator', () => {
    it('should generate consistent hash for same inputs', async () => {
      const options = { keywords: ['github.com', 'user@email.com'] };
      const result1 = await HashGenerator.generateHash(options);
      const result2 = await HashGenerator.generateHash(options);

      expect(result1.hash).toBe(result2.hash);
      expect(result1.hash).toHaveLength(128);
      expect(result1.iterations).toBe(1000);
    });

    it('should generate different hashes with different masterSalt', async () => {
      const keywords = ['github.com', 'user@email.com'];
      const resultNoSalt = await HashGenerator.generateHash({ keywords });
      const resultWithSalt = await HashGenerator.generateHash({
        keywords,
        masterSalt: 'my-salt-2025',
      });

      expect(resultNoSalt.hash).not.toBe(resultWithSalt.hash);
      expect(resultNoSalt.hash).toHaveLength(128);
      expect(resultWithSalt.hash).toHaveLength(128);
    });

    it('should validate hash options correctly', () => {
      expect(HashGenerator.validateHashOptions({ keywords: ['test'] })).toBe(true);
      expect(HashGenerator.validateHashOptions({ keywords: [] })).toBe(false);
      expect(HashGenerator.validateHashOptions({})).toBe(false);
    });

    it('should throw when all keywords are whitespace-only', async () => {
      await expect(HashGenerator.generateHash({ keywords: ['', '   '] })).rejects.toThrow(
        'at least one non-empty string'
      );
    });

    it('should throw when keywords array is empty', async () => {
      await expect(HashGenerator.generateHash({ keywords: [] })).rejects.toThrow('non-empty array');
    });
  });

  describe('InputValidator', () => {
    it('should validate password length constraints', () => {
      expect(InputValidator.validatePasswordLength(16).isValid).toBe(true);
      expect(InputValidator.validatePasswordLength(7).isValid).toBe(false);
      expect(InputValidator.validatePasswordLength(200).isValid).toBe(false);
    });

    it('should validate password options requirements', () => {
      expect(
        InputValidator.validatePasswordOptions({ includeUppercase: true, includeLowercase: true })
          .isValid
      ).toBe(true);
      expect(
        InputValidator.validatePasswordOptions({
          includeUppercase: false,
          includeLowercase: false,
          includeNumbers: false,
          includeSymbols: false,
        }).isValid
      ).toBe(false);
    });

    it('should validate keywords array properly', () => {
      expect(InputValidator.validateKeywords(['test', 'keyword']).isValid).toBe(true);
      expect(InputValidator.validateKeywords([]).isValid).toBe(false);
      expect(InputValidator.validateKeywords(['test', '']).isValid).toBe(false);
    });

    it('should validate master salt', () => {
      expect(InputValidator.validateMasterSalt(null).isValid).toBe(true);
      expect(InputValidator.validateMasterSalt('valid-salt').isValid).toBe(true);
      expect(InputValidator.validateMasterSalt('').isValid).toBe(false);
    });
  });

  describe('PasswordGenerator', () => {
    it('should generate deterministic passwords for identical inputs', async () => {
      const options = { keywords: ['github.com', 'user@email.com'], length: 16 };
      const result1 = await PasswordGenerator.generatePassword(options);
      const result2 = await PasswordGenerator.generatePassword(options);

      expect(result1.password).toBe(result2.password);
      expect(result1.password).toHaveLength(16);
      expect(result1.metadata.hashIterations).toBe(1000);
    });

    it('should generate unique passwords for different inputs', async () => {
      const result1 = await PasswordGenerator.generatePassword({
        keywords: ['input1'],
        length: 16,
      });
      const result2 = await PasswordGenerator.generatePassword({
        keywords: ['input2'],
        length: 16,
      });

      expect(result1.password).not.toBe(result2.password);
    });

    it('should enforce password length constraints', async () => {
      await expect(
        PasswordGenerator.generatePassword({ keywords: ['test'], length: 7 })
      ).rejects.toThrow('Password length must be at least');
      await expect(
        PasswordGenerator.generatePassword({ keywords: ['test'], length: 200 })
      ).rejects.toThrow('Password length cannot exceed');
    });

    it('should generate passwords at minimum and maximum allowed lengths', async () => {
      const minResult = await PasswordGenerator.generatePassword({ keywords: ['test'], length: 8 });
      const maxResult = await PasswordGenerator.generatePassword({
        keywords: ['test'],
        length: 128,
      });

      expect(minResult.password).toHaveLength(8);
      expect(maxResult.password).toHaveLength(128);
    });

    it('should generate passwords with specified lengths', async () => {
      const result16 = await PasswordGenerator.generatePassword({ keywords: ['test'], length: 16 });
      const result32 = await PasswordGenerator.generatePassword({ keywords: ['test'], length: 32 });

      expect(result16.password).toHaveLength(16);
      expect(result32.password).toHaveLength(32);
      expect(result16.password).not.toBe(result32.password);
    });

    it('should generate different passwords with master salt', async () => {
      const keywords = ['github.com', 'user@email.com'];
      const resultNoSalt = await PasswordGenerator.generatePassword({ keywords, length: 16 });
      const resultWithSalt = await PasswordGenerator.generatePassword({
        keywords,
        length: 16,
        masterSalt: 'my-salt-2025',
      });

      expect(resultNoSalt.password).not.toBe(resultWithSalt.password);
    });

    it('should validate generation options correctly', () => {
      expect(PasswordGenerator.validateOptions({ keywords: ['test'], length: 16 }).isValid).toBe(
        true
      );
      expect(PasswordGenerator.validateOptions({ keywords: [], length: 16 }).isValid).toBe(false);
    });

    it('should provide character diversity metadata in generation results', async () => {
      const result = await PasswordGenerator.generatePassword({
        keywords: ['diversity-test'],
        length: 32,
      });
      const diversity = result.metadata.characterDiversity;

      expect(diversity).toHaveProperty('totalUniqueCharacters');
      expect(diversity).toHaveProperty('maxRepetitions');
      expect(diversity).toHaveProperty('averageRepetitions');
      expect(diversity).toHaveProperty('diversityRatio');
      expect(diversity.totalUniqueCharacters).toBeGreaterThan(0);
      expect(diversity.totalUniqueCharacters).toBeLessThanOrEqual(result.length);
      expect(diversity.diversityRatio).toBeGreaterThan(0);
      expect(diversity.diversityRatio).toBeLessThanOrEqual(1);
    });

    it('should control character repetition based on password length', async () => {
      const testCases = [
        { length: 8, expectedMaxRep: 2 },
        { length: 16, expectedMaxRep: 2 },
        { length: 24, expectedMaxRep: 3 },
        { length: 32, expectedMaxRep: 4 },
        { length: 64, expectedMaxRep: 6 },
      ];

      for (const { length, expectedMaxRep } of testCases) {
        const result = await PasswordGenerator.generatePassword({
          keywords: ['repetition-test', length.toString()],
          length,
        });
        const diversity = result.metadata.characterDiversity;

        expect(diversity.maxRepetitions).toBeLessThanOrEqual(expectedMaxRep + 1);
        expect(diversity.totalUniqueCharacters).toBeGreaterThan(length * 0.4);
      }
    });

    it('should maintain character distribution across different password lengths', async () => {
      const shortResult = await PasswordGenerator.generatePassword({
        keywords: ['distribution-test'],
        length: 16,
      });
      const longResult = await PasswordGenerator.generatePassword({
        keywords: ['distribution-test'],
        length: 64,
      });

      const shortDist = shortResult.metadata.characterDistribution;
      const longDist = longResult.metadata.characterDistribution;

      expect(longResult.metadata.characterDiversity.totalUniqueCharacters).toBeGreaterThan(
        shortResult.metadata.characterDiversity.totalUniqueCharacters
      );

      for (const dist of [shortDist, longDist]) {
        expect(dist.uppercase).toBeGreaterThan(0);
        expect(dist.lowercase).toBeGreaterThan(0);
        expect(dist.numbers).toBeGreaterThan(0);
        expect(dist.symbols).toBeGreaterThan(0);
      }
    });
  });

  describe('Algorithm Stability & Validation', () => {
    it('should validate algorithm compatibility with test vectors', async () => {
      const validation = await validateAlgorithmCompatibility();

      expect(validation.overall.isFullyCompatible).toBe(true);
      expect(validation.hashGeneration.isCompatible).toBe(true);
      expect(validation.passwordGeneration.isCompatible).toBe(true);
      expect(validation.hashGeneration.failedVectors).toHaveLength(0);
      expect(validation.passwordGeneration.failedVectors).toHaveLength(0);
    });

    it('should pass quick compatibility checks', async () => {
      expect(await quickCompatibilityCheck()).toBe(true);
    });

    it('should validate full algorithm stack', async () => {
      const validation = await validateFullAlgorithm();

      expect(validation.isFullyCompatible).toBe(true);
      expect(validation.hashCompatibility).toBe(true);
      expect(validation.passwordCompatibility).toBe(true);
    });

    it('should provide algorithm version information', () => {
      const versionInfo = getAlgorithmVersion();

      expect(versionInfo).toHaveProperty('version');
      expect(versionInfo).toHaveProperty('timestamp');
      expect(versionInfo).toHaveProperty('features');
      expect(Array.isArray(versionInfo.features)).toBe(true);
      expect(versionInfo.features.length).toBeGreaterThan(0);
    });

    it('should maintain test vector consistency', async () => {
      for (let i = 0; i < ALGORITHM_TEST_VECTORS.length; i++) {
        const vector = ALGORITHM_TEST_VECTORS[i];
        const result = await PasswordGenerator.generatePassword({
          keywords: vector.input.keywords,
          length: vector.input.length,
          options: vector.input.options,
          masterSalt: vector.input.masterSalt,
        });

        expect(result.password).toBe(vector.expectedOutput.password);
        expect(result.metadata.characterDiversity.totalUniqueCharacters).toBe(
          vector.expectedOutput.characterDiversity.totalUniqueCharacters
        );
        expect(result.metadata.characterDiversity.maxRepetitions).toBe(
          vector.expectedOutput.characterDiversity.maxRepetitions
        );
      }
    });
  });

  describe('PasswordAnalyzer', () => {
    it('should analyze password strength and composition', async () => {
      const result = await PasswordGenerator.generatePassword({ keywords: ['test'], length: 32 });
      const analysis = PasswordAnalyzer.analyzePassword(result.password);

      expect(analysis.length).toBe(32);
      expect(analysis.strengthScore).toBeGreaterThan(0);
      expect(analysis.entropy).toBeGreaterThan(0);
      expect(analysis.characterCounts.total).toBe(32);
      expect(Array.isArray(analysis.suggestions)).toBe(true);
    });

    it('should provide character diversity analysis', () => {
      const testPassword = 'AbC123!@#AbC123!@#AbC123!@#XYZ';
      const analysis = PasswordAnalyzer.analyzePassword(testPassword);
      const { characterDiversity: diversity, repetitionAnalysis: repetition } = analysis;

      expect(analysis).toHaveProperty('characterDiversity');
      expect(analysis).toHaveProperty('repetitionAnalysis');
      expect(diversity.totalUniqueCharacters).toBeGreaterThan(0);
      expect(diversity.diversityRatio).toBeGreaterThan(0);
      expect(diversity.varietyScore).toBeGreaterThanOrEqual(0);
      expect(diversity.repetitionScore).toBeGreaterThanOrEqual(0);
      expect(repetition.maxAllowedRepetitions).toBeGreaterThan(0);
    });

    it('should detect and analyze repetition patterns', () => {
      const highRep = 'AAAABBBBccccdddd1111!!!!';
      const lowRep = 'AbCd1!2@3#4$5%6^7&8*9(0)';

      const highRepAnalysis = PasswordAnalyzer.analyzePassword(highRep);
      const lowRepAnalysis = PasswordAnalyzer.analyzePassword(lowRep);

      expect(highRepAnalysis.repetitionAnalysis.hasExcessiveRepetition).toBe(true);
      expect(highRepAnalysis.repetitionAnalysis.repetitionQuality).toMatch(/Poor|Fair/);
      expect(highRepAnalysis.repetitionAnalysis.repetitionViolations.length).toBeGreaterThan(0);

      expect(lowRepAnalysis.repetitionAnalysis.hasExcessiveRepetition).toBe(false);
      expect(lowRepAnalysis.repetitionAnalysis.repetitionQuality).toMatch(/Excellent|Good/);
      expect(lowRepAnalysis.repetitionAnalysis.repetitionViolations.length).toBe(0);
    });

    it('should provide suggestions based on diversity analysis', () => {
      const weakPassword = 'aaaa1111!!!!bbbb';
      const analysis = PasswordAnalyzer.analyzePassword(weakPassword);
      const suggestionText = analysis.suggestions.join(' ').toLowerCase();
      const hasDiversitySuggestion =
        suggestionText.includes('variety') ||
        suggestionText.includes('diverse') ||
        suggestionText.includes('unique');
      const hasRepetitionSuggestion =
        suggestionText.includes('repetition') || suggestionText.includes('repeated');

      expect(analysis.suggestions.length).toBeGreaterThan(0);
      expect(hasDiversitySuggestion || hasRepetitionSuggestion).toBe(true);
      expect(analysis.strengthScore).toBeLessThan(70);
    });

    it('should detect sequential character patterns', () => {
      expect(PasswordAnalyzer.hasSequentialCharacters('abc123')).toBe(true);
      expect(PasswordAnalyzer.hasSequentialCharacters('a1b2c3')).toBe(false);
    });

    it('should detect repeated character patterns', () => {
      expect(PasswordAnalyzer.hasRepeatedCharacters('aabbcc')).toBe(true);
      expect(PasswordAnalyzer.hasRepeatedCharacters('abc123')).toBe(false);
    });
  });

  describe('Convenience Functions', () => {
    it('should provide working generatePassword function', async () => {
      const result = await generatePassword({ keywords: ['convenience', 'test'], length: 16 });
      expect(result.password).toHaveLength(16);
      expect(result.metadata.hashIterations).toBe(1000);
    });

    it('should provide working analyzePassword function', () => {
      const analysis = analyzePassword('TestPassword123!');
      expect(analysis.length).toBe(16);
      expect(analysis.strengthScore).toBeGreaterThan(0);
    });

    it('should provide working analyzeCharacterDistribution function', async () => {
      const { password } = await PasswordGenerator.generatePassword({
        keywords: ['test'],
        length: 16,
      });
      const distribution = analyzeCharacterDistribution(password);

      expect(distribution).toHaveProperty('uppercase');
      expect(distribution).toHaveProperty('lowercase');
      expect(distribution).toHaveProperty('numbers');
      expect(distribution).toHaveProperty('symbols');
      const total =
        distribution.uppercase +
        distribution.lowercase +
        distribution.numbers +
        distribution.symbols;
      expect(Math.round(total)).toBe(100);
    });
  });

  describe('Legacy API', () => {
    it('generatePasswordLegacy should generate password with defaults', async () => {
      const password = await generatePasswordLegacy(['test', 'site.com']);
      expect(typeof password).toBe('string');
      expect(password).toHaveLength(SECURITY_CONFIG.defaultPasswordLength);
    });

    it('generatePasswordLegacy should apply custom length', async () => {
      const password = await generatePasswordLegacy(['test'], { length: 24 });
      expect(password).toHaveLength(24);
    });

    it('generatePasswordLegacy should be deterministic', async () => {
      const password1 = await generatePasswordLegacy(['test', 'site.com']);
      const password2 = await generatePasswordLegacy(['test', 'site.com']);
      expect(password1).toBe(password2);
    });

    it('generateHash should return 128-char hex string', async () => {
      const hash = await generateHash(['test', 'site.com']);
      expect(typeof hash).toBe('string');
      expect(hash).toHaveLength(128);
      expect(/^[0-9a-f]{128}$/.test(hash)).toBe(true);
    });

    it('generateHash with masterSalt should differ from without', async () => {
      const hash1 = await generateHash(['test']);
      const hash2 = await generateHash(['test'], 'my-salt');
      expect(hash1).not.toBe(hash2);
    });

    it('hashToPassword should convert a valid hash to password', async () => {
      const hash = await generateHash(['test-input']);
      const password = hashToPassword(hash, { length: 16 });
      expect(typeof password).toBe('string');
      expect(password).toHaveLength(16);
    });

    it('hashToPassword should be deterministic', async () => {
      const hash = await generateHash(['test-input']);
      const pass1 = hashToPassword(hash, { length: 16 });
      const pass2 = hashToPassword(hash, { length: 16 });
      expect(pass1).toBe(pass2);
    });

    it('hashToPassword should throw on invalid hash format', () => {
      expect(() => hashToPassword('invalid')).toThrow('128-character');
      expect(() => hashToPassword('x'.repeat(128))).toThrow('128-character');
      expect(() => hashToPassword('a'.repeat(127))).toThrow('128-character');
      expect(() => hashToPassword('')).toThrow('128-character');
    });

    it('hashToPassword should throw on invalid length option', async () => {
      const hash = await generateHash(['test']);
      expect(() => hashToPassword(hash, { length: 5 })).toThrow();
      expect(() => hashToPassword(hash, { length: 200 })).toThrow();
    });

    it('hashToPassword should accept uppercase hex', async () => {
      const hash = await generateHash(['test']);
      const upperHash = hash.toUpperCase();
      const password = hashToPassword(upperHash, { length: 16 });
      expect(password).toHaveLength(16);
    });
  });

  describe('NuwaultCore Class', () => {
    it('should instantiate with no arguments', () => {
      const core = new NuwaultCore();
      expect(core).toBeInstanceOf(NuwaultCore);
    });

    it('should generate password with default config', async () => {
      const core = new NuwaultCore();
      const password = await core.generatePassword(['test', 'site.com']);
      expect(typeof password).toBe('string');
      expect(password).toHaveLength(SECURITY_CONFIG.defaultPasswordLength);
    });

    it('should apply custom defaultPasswordLength from config', async () => {
      const core = new NuwaultCore({ SECURITY_CONFIG: { defaultPasswordLength: 24 } });
      const password = await core.generatePassword(['test']);
      expect(password).toHaveLength(24);
    });

    it('should apply custom character options from config', async () => {
      const core = new NuwaultCore({
        DEFAULT_PASSWORD_OPTIONS: {
          includeUppercase: true,
          includeLowercase: true,
          includeNumbers: false,
          includeSymbols: false,
        },
      });
      const password = await core.generatePassword(['test'], { length: 16 });
      expect(/^[a-zA-Z]+$/.test(password)).toBe(true);
    });

    it('should allow per-call option override of instance config', async () => {
      const core = new NuwaultCore({ SECURITY_CONFIG: { defaultPasswordLength: 24 } });
      const password = await core.generatePassword(['test'], { length: 32 });
      expect(password).toHaveLength(32);
    });

    it('should be deterministic across instances with same config', async () => {
      const core1 = new NuwaultCore();
      const core2 = new NuwaultCore();
      const pass1 = await core1.generatePassword(['test'], { length: 16 });
      const pass2 = await core2.generatePassword(['test'], { length: 16 });
      expect(pass1).toBe(pass2);
    });

    it('analyzePassword should return character distribution', () => {
      const core = new NuwaultCore();
      const distribution = core.analyzePassword('TestPassword123!');
      expect(distribution).toHaveProperty('uppercase');
      expect(distribution).toHaveProperty('lowercase');
      expect(distribution).toHaveProperty('numbers');
      expect(distribution).toHaveProperty('symbols');
    });
  });

  describe('mergeConfig', () => {
    it('should return defaults when called with no arguments', () => {
      const config = mergeConfig();
      expect(config.SECURITY_CONFIG.defaultPasswordLength).toBe(
        SECURITY_CONFIG.defaultPasswordLength
      );
      expect(config.DEFAULT_PASSWORD_OPTIONS.includeUppercase).toBe(true);
    });

    it('should merge custom SECURITY_CONFIG', () => {
      const config = mergeConfig({ SECURITY_CONFIG: { defaultPasswordLength: 32 } });
      expect(config.SECURITY_CONFIG.defaultPasswordLength).toBe(32);
      expect(config.SECURITY_CONFIG.minPasswordLength).toBe(SECURITY_CONFIG.minPasswordLength);
    });

    it('should merge custom DEFAULT_PASSWORD_OPTIONS', () => {
      const config = mergeConfig({ DEFAULT_PASSWORD_OPTIONS: { includeSymbols: false } });
      expect(config.DEFAULT_PASSWORD_OPTIONS.includeSymbols).toBe(false);
      expect(config.DEFAULT_PASSWORD_OPTIONS.includeUppercase).toBe(true);
    });

    it('should not mutate original SECURITY_CONFIG', () => {
      mergeConfig({ SECURITY_CONFIG: { defaultPasswordLength: 99 } });
      expect(SECURITY_CONFIG.defaultPasswordLength).toBe(16);
    });
  });
});
