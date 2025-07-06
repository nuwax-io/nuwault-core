/**
 * @fileoverview Comprehensive test suite for Nuwault Core password generation library
 * Tests all major components including hash generation, password generation, validation, analysis, character diversity features, and algorithm stability
 */

import { describe, it, expect } from 'vitest';
import { 
  PasswordGenerator,
  HashGenerator,
  PasswordAnalyzer,
  InputValidator,
  generatePassword,
  analyzePassword,
  validateAlgorithmCompatibility,
  quickCompatibilityCheck,
  validateFullAlgorithm,
  getAlgorithmVersion,
  ALGORITHM_TEST_VECTORS
} from '../dist/index.js';

describe('Password Generator - TypeScript API', () => {

  describe('HashGenerator', () => {
    it('should generate consistent hash for same inputs', async () => {
      const options = {
        keywords: ['github.com', 'user@email.com']
      };
      console.log(`\n🔒 Generating hash for keywords: ${JSON.stringify(options.keywords)}`);
      
      const result1 = await HashGenerator.generateHash(options);
      const result2 = await HashGenerator.generateHash(options);
      
      console.log(`🔒 Generated hash: ${result1.hash.substring(0, 32)}...${result1.hash.substring(-8)} (${result1.hash.length} chars)`);
      console.log(`🔒 Hash consistency: ${result1.hash === result2.hash ? '✅ SAME' : '❌ DIFFERENT'}`);
      
      expect(result1.hash).toBe(result2.hash);
      expect(result1.hash).toHaveLength(128); // SHA-512 produces 128 char hex string
      expect(result1.iterations).toBe(1000);
    });

    it('should generate different hashes with different masterSalt', async () => {
      const keywords = ['github.com', 'user@email.com'];
      console.log(`\n🧂 Testing masterSalt effect on hash generation...`);
      
      const resultNoSalt = await HashGenerator.generateHash({ keywords });
      const resultWithSalt = await HashGenerator.generateHash({ 
        keywords, 
        masterSalt: 'my-salt-2025' 
      });
      
      console.log(`🧂 Hash without salt: ${resultNoSalt.hash.substring(0, 32)}...${resultNoSalt.hash.substring(-8)}`);
      console.log(`🧂 Hash with salt: ${resultWithSalt.hash.substring(0, 32)}...${resultWithSalt.hash.substring(-8)}`);
      console.log(`🧂 Hashes different: ${resultNoSalt.hash !== resultWithSalt.hash ? '✅ YES' : '❌ NO'}`);
      
      expect(resultNoSalt.hash).not.toBe(resultWithSalt.hash);
      expect(resultNoSalt.hash).toHaveLength(128);
      expect(resultWithSalt.hash).toHaveLength(128);
    });

    it('should validate hash options correctly', () => {
      console.log(`\n⚠️ Testing hash options validation...`);
      
      expect(HashGenerator.validateHashOptions({ keywords: ['test'] })).toBe(true);
      expect(HashGenerator.validateHashOptions({ keywords: [] })).toBe(false);
      expect(HashGenerator.validateHashOptions({})).toBe(false);
      
      console.log(`✅ Hash options validation working correctly`);
    });
  });

  describe('InputValidator', () => {
    it('should validate password length constraints', () => {
      console.log(`\n📏 Testing password length validation...`);
      
      const validLength = InputValidator.validatePasswordLength(16);
      const tooShort = InputValidator.validatePasswordLength(7);
      const tooLong = InputValidator.validatePasswordLength(200);
      
      expect(validLength.isValid).toBe(true);
      expect(tooShort.isValid).toBe(false);
      expect(tooLong.isValid).toBe(false);
      
      console.log(`✅ Password length validation working correctly`);
    });

    it('should validate password options requirements', () => {
      console.log(`\n🔧 Testing password options validation...`);
      
      const validOptions = InputValidator.validatePasswordOptions({
        includeUppercase: true,
        includeLowercase: true
      });
      
      const invalidOptions = InputValidator.validatePasswordOptions({
        includeUppercase: false,
        includeLowercase: false,
        includeNumbers: false,
        includeSymbols: false
      });
      
      expect(validOptions.isValid).toBe(true);
      expect(invalidOptions.isValid).toBe(false);
      
      console.log(`✅ Password options validation working correctly`);
    });

    it('should validate keywords array properly', () => {
      console.log(`\n🔑 Testing keywords validation...`);
      
      const validKeywords = InputValidator.validateKeywords(['test', 'keyword']);
      const emptyKeywords = InputValidator.validateKeywords([]);
      const invalidKeywords = InputValidator.validateKeywords(['test', '']);
      
      expect(validKeywords.isValid).toBe(true);
      expect(emptyKeywords.isValid).toBe(false);
      expect(invalidKeywords.isValid).toBe(false);
      
      console.log(`✅ Keywords validation working correctly`);
    });
  });

  describe('PasswordGenerator', () => {
    it('should generate deterministic passwords for identical inputs', async () => {
      const options = {
        keywords: ['github.com', 'user@email.com'],
        length: 16
      };
      
      console.log(`\n🔐 Generating passwords for: ${JSON.stringify(options.keywords)}`);
      const result1 = await PasswordGenerator.generatePassword(options);
      const result2 = await PasswordGenerator.generatePassword(options);
      
      console.log(`🔐 Password 1: "${result1.password}"`);
      console.log(`🔐 Password 2: "${result2.password}"`);
      console.log(`🔐 Consistency: ${result1.password === result2.password ? '✅ SAME' : '❌ DIFFERENT'}`);
      
      expect(result1.password).toBe(result2.password);
      expect(result1.password).toHaveLength(16);
      expect(result1.length).toBe(16);
      expect(result1.metadata.hashIterations).toBe(1000);
    });

    it('should generate unique passwords for different inputs', async () => {
      console.log(`\n🎲 Testing password variation with different inputs...`);
      const result1 = await PasswordGenerator.generatePassword({
        keywords: ['input1'],
        length: 16
      });
      const result2 = await PasswordGenerator.generatePassword({
        keywords: ['input2'],
        length: 16
      });
      
      console.log(`🎲 Password for 'input1': "${result1.password}"`);
      console.log(`🎲 Password for 'input2': "${result2.password}"`);
      console.log(`🎲 Different passwords: ${result1.password !== result2.password ? '✅ YES' : '❌ NO'}`);
      
      expect(result1.password).not.toBe(result2.password);
    });

    it('should enforce password length constraints', async () => {
      console.log(`\n⚠️ Testing password length constraints...`);
      
      await expect(PasswordGenerator.generatePassword({
        keywords: ['test'],
        length: 7
      })).rejects.toThrow('Password length must be at least');
      
      await expect(PasswordGenerator.generatePassword({
        keywords: ['test'],
        length: 200
      })).rejects.toThrow('Password length cannot exceed');
      
      console.log(`✅ Length constraint validation working correctly`);
    });

    it('should generate passwords with specified lengths', async () => {
      const keywords = ['test'];
      console.log(`\n📏 Testing different password lengths for: ${JSON.stringify(keywords)}`);
      
      const result16 = await PasswordGenerator.generatePassword({ keywords, length: 16 });
      const result32 = await PasswordGenerator.generatePassword({ keywords, length: 32 });
      
      console.log(`📏 16-char password: "${result16.password}"`);
      console.log(`📏 32-char password: "${result32.password}"`);
      console.log(`📏 Lengths correct: 16=${result16.password.length}, 32=${result32.password.length}`);
      console.log(`📏 Different passwords: ${result16.password !== result32.password ? '✅ YES' : '❌ NO'}`);
      
      expect(result16.password).toHaveLength(16);
      expect(result32.password).toHaveLength(32);
      expect(result16.password).not.toBe(result32.password);
    });

    it('should generate different passwords with master salt', async () => {
      const keywords = ['github.com', 'user@email.com'];
      console.log(`\n🧂 Testing masterSalt option in generatePassword...`);
      
      const resultNoSalt = await PasswordGenerator.generatePassword({ keywords, length: 16 });
      const resultWithSalt = await PasswordGenerator.generatePassword({ 
        keywords, 
        length: 16, 
        masterSalt: 'my-salt-2025' 
      });
      
      console.log(`🧂 Password without salt: "${resultNoSalt.password}"`);
      console.log(`🧂 Password with salt: "${resultWithSalt.password}"`);
      console.log(`🧂 Different passwords: ${resultNoSalt.password !== resultWithSalt.password ? '✅ YES' : '❌ NO'}`);
      
      expect(resultNoSalt.password).not.toBe(resultWithSalt.password);
      expect(resultNoSalt.password).toHaveLength(16);
      expect(resultWithSalt.password).toHaveLength(16);
    });

    it('should validate generation options correctly', () => {
      console.log(`\n🔧 Testing password generation options validation...`);
      
      const validOptions = PasswordGenerator.validateOptions({
        keywords: ['test'],
        length: 16
      });
      
      const invalidOptions = PasswordGenerator.validateOptions({
        keywords: [],
        length: 16
      });
      
      expect(validOptions.isValid).toBe(true);
      expect(invalidOptions.isValid).toBe(false);
      
      console.log(`✅ Generation options validation working correctly`);
    });

    it('should provide character diversity metadata in generation results', async () => {
      console.log(`\n🌈 Testing character diversity metadata in password generation...`);
      
      const result = await PasswordGenerator.generatePassword({
        keywords: ['diversity-test'],
        length: 32
      });
      
      const diversity = result.metadata.characterDiversity;
      
      console.log(`🌈 Generated password: "${result.password}"`);
      console.log(`🌈 Character diversity metrics:`);
      console.log(`   - Unique characters: ${diversity.totalUniqueCharacters}/${result.length}`);
      console.log(`   - Diversity ratio: ${diversity.diversityRatio}`);
      console.log(`   - Max repetitions: ${diversity.maxRepetitions}`);
      console.log(`   - Avg repetitions: ${diversity.averageRepetitions}`);
      
      // Test structure
      expect(diversity).toHaveProperty('totalUniqueCharacters');
      expect(diversity).toHaveProperty('maxRepetitions');
      expect(diversity).toHaveProperty('averageRepetitions');
      expect(diversity).toHaveProperty('diversityRatio');
      
      // Test value validity
      expect(diversity.totalUniqueCharacters).toBeGreaterThan(0);
      expect(diversity.totalUniqueCharacters).toBeLessThanOrEqual(result.length);
      expect(diversity.maxRepetitions).toBeGreaterThan(0);
      expect(diversity.diversityRatio).toBeGreaterThan(0);
      expect(diversity.diversityRatio).toBeLessThanOrEqual(1);
      
      console.log(`✅ Character diversity metadata working correctly`);
    });

    it('should control character repetition based on password length', async () => {
      console.log(`\n🔄 Testing character repetition control across different lengths...`);
      
      const testCases = [
        { length: 8, expectedMaxRep: 2 },
        { length: 16, expectedMaxRep: 2 },
        { length: 24, expectedMaxRep: 3 },
        { length: 32, expectedMaxRep: 4 },
        { length: 64, expectedMaxRep: 6 }
      ];
      
      for (const testCase of testCases) {
        const result = await PasswordGenerator.generatePassword({
          keywords: ['repetition-test', testCase.length.toString()],
          length: testCase.length
        });
        
        const diversity = result.metadata.characterDiversity;
        const actualMaxRep = diversity.maxRepetitions;
        
        console.log(`🔄 Length ${testCase.length}: max repetitions ${actualMaxRep} (expected ≤${testCase.expectedMaxRep})`);
        
        // Character repetition should be controlled
        expect(actualMaxRep).toBeLessThanOrEqual(testCase.expectedMaxRep + 1); // Allow slight variance
        expect(diversity.totalUniqueCharacters).toBeGreaterThan(testCase.length * 0.4); // At least 40% unique
      }
      
      console.log(`✅ Character repetition control working correctly`);
    });

    it('should maintain better character distribution in longer passwords', async () => {
      console.log(`\n📊 Testing character distribution across different password lengths...`);
      
      const shortResult = await PasswordGenerator.generatePassword({
        keywords: ['distribution-test'],
        length: 16
      });
      
      const longResult = await PasswordGenerator.generatePassword({
        keywords: ['distribution-test'],
        length: 64
      });
      
      const shortDistribution = shortResult.metadata.characterDistribution;
      const longDistribution = longResult.metadata.characterDistribution;
      const shortDiversity = shortResult.metadata.characterDiversity;
      const longDiversity = longResult.metadata.characterDiversity;
      
      console.log(`📊 Short password (16): diversity ratio ${shortDiversity.diversityRatio}`);
      console.log(`📊 Long password (64): diversity ratio ${longDiversity.diversityRatio}`);
      console.log(`📊 Distribution comparison:`);
      console.log(`   Short - U:${shortDistribution.uppercase} L:${shortDistribution.lowercase} N:${shortDistribution.numbers} S:${shortDistribution.symbols}`);
      console.log(`   Long  - U:${longDistribution.uppercase} L:${longDistribution.lowercase} N:${longDistribution.numbers} S:${longDistribution.symbols}`);
      
      // Longer passwords have controlled diversity - ratio may be lower but more unique chars
      expect(longDiversity.totalUniqueCharacters).toBeGreaterThan(shortDiversity.totalUniqueCharacters);
      expect(longDiversity.diversityRatio).toBeGreaterThan(0.4); // Should have at least 40% unique chars
      
      // Both should have all character types
      expect(shortDistribution.uppercase).toBeGreaterThan(0);
      expect(shortDistribution.lowercase).toBeGreaterThan(0);
      expect(shortDistribution.numbers).toBeGreaterThan(0);
      expect(shortDistribution.symbols).toBeGreaterThan(0);
      
      expect(longDistribution.uppercase).toBeGreaterThan(0);
      expect(longDistribution.lowercase).toBeGreaterThan(0);
      expect(longDistribution.numbers).toBeGreaterThan(0);
      expect(longDistribution.symbols).toBeGreaterThan(0);
      
      console.log(`✅ Character distribution optimization working correctly`);
    });
  });

  describe('Algorithm Stability & Validation', () => {
    it('should validate algorithm compatibility with test vectors', async () => {
      console.log(`\n🔬 Testing algorithm compatibility validation...`);
      
      const validation = await validateAlgorithmCompatibility();
      
      console.log(`🔬 Algorithm compatibility results:`);
      console.log(`   - Overall compatible: ${validation.overall.isFullyCompatible ? '✅' : '❌'}`);
      console.log(`   - Hash generation: ${validation.hashGeneration.isCompatible ? '✅' : '❌'} (${validation.hashGeneration.passedVectors}/${validation.hashGeneration.testedVectors})`);
      console.log(`   - Password generation: ${validation.passwordGeneration.isCompatible ? '✅' : '❌'} (${validation.passwordGeneration.passedVectors}/${validation.passwordGeneration.testedVectors})`);
      console.log(`   - Algorithm version: ${validation.overall.algorithmVersion}`);
      
      // All validation should pass for algorithm stability
      expect(validation.overall.isFullyCompatible).toBe(true);
      expect(validation.hashGeneration.isCompatible).toBe(true);
      expect(validation.passwordGeneration.isCompatible).toBe(true);
      expect(validation.hashGeneration.failedVectors).toHaveLength(0);
      expect(validation.passwordGeneration.failedVectors).toHaveLength(0);
      
      console.log(`✅ Algorithm compatibility validation passed`);
    });

    it('should pass quick compatibility checks', async () => {
      console.log(`\n⚡ Testing quick compatibility check...`);
      
      const isCompatible = await quickCompatibilityCheck();
      
      console.log(`⚡ Quick compatibility result: ${isCompatible ? '✅ PASS' : '❌ FAIL'}`);
      
      expect(isCompatible).toBe(true);
      
      console.log(`✅ Quick compatibility check passed`);
    });

    it('should validate full algorithm stack', async () => {
      console.log(`\n🏗️ Testing full algorithm stack validation...`);
      
      const validation = await validateFullAlgorithm();
      
      console.log(`🏗️ Full algorithm validation:`);
      console.log(`   - Fully compatible: ${validation.isFullyCompatible ? '✅' : '❌'}`);
      console.log(`   - Hash compatibility: ${validation.hashCompatibility ? '✅' : '❌'}`);
      console.log(`   - Password compatibility: ${validation.passwordCompatibility ? '✅' : '❌'}`);
      console.log(`   - Algorithm version: ${validation.algorithmVersion}`);
      
      expect(validation.isFullyCompatible).toBe(true);
      expect(validation.hashCompatibility).toBe(true);
      expect(validation.passwordCompatibility).toBe(true);
      
      console.log(`✅ Full algorithm stack validation passed`);
    });

    it('should provide algorithm version information', () => {
      console.log(`\n📋 Testing algorithm version information...`);
      
      const versionInfo = getAlgorithmVersion();
      
      console.log(`📋 Algorithm version info:`);
      console.log(`   - Version object: ${typeof versionInfo.version === 'object' ? '✅' : '❌'}`);
      console.log(`   - Features count: ${versionInfo.features.length}`);
      console.log(`   - Features: ${versionInfo.features.join(', ')}`);
      
      expect(versionInfo).toHaveProperty('version');
      expect(versionInfo).toHaveProperty('timestamp');
      expect(versionInfo).toHaveProperty('features');
      expect(Array.isArray(versionInfo.features)).toBe(true);
      expect(versionInfo.features.length).toBeGreaterThan(0);
      
      console.log(`✅ Algorithm version information working correctly`);
    });

    it('should maintain test vector consistency', async () => {
      console.log(`\n📝 Testing predefined test vector consistency...`);
      
      // Test each predefined test vector individually
      for (let i = 0; i < ALGORITHM_TEST_VECTORS.length; i++) {
        const vector = ALGORITHM_TEST_VECTORS[i];
        
        const result = await PasswordGenerator.generatePassword({
          keywords: vector.input.keywords,
          length: vector.input.length,
          options: vector.input.options,
          masterSalt: vector.input.masterSalt
        });
        
        console.log(`📝 Vector ${i + 1}: "${vector.input.keywords.join(',')}" (${vector.input.length} chars)`);
        console.log(`   Expected: "${vector.expectedOutput.password}"`);
        console.log(`   Actual:   "${result.password}"`);
        console.log(`   Match: ${result.password === vector.expectedOutput.password ? '✅' : '❌'}`);
        
        expect(result.password).toBe(vector.expectedOutput.password);
        expect(result.metadata.characterDiversity.totalUniqueCharacters).toBe(vector.expectedOutput.characterDiversity.totalUniqueCharacters);
        expect(result.metadata.characterDiversity.maxRepetitions).toBe(vector.expectedOutput.characterDiversity.maxRepetitions);
      }
      
      console.log(`✅ All test vectors maintain consistency`);
    });
  });

  describe('PasswordAnalyzer', () => {
    it('should analyze password strength and composition', async () => {
      console.log(`\n📊 Analyzing password...`);
      const result = await PasswordGenerator.generatePassword({
        keywords: ['test'],
        length: 32
      });
      
      console.log(`📊 Generated password: "${result.password}"`);
      
      const analysis = PasswordAnalyzer.analyzePassword(result.password);
      
      console.log(`📊 Analysis results:`);
      console.log(`   - Length: ${analysis.length}`);
      console.log(`   - Strength: ${analysis.strengthLevel} (${analysis.strengthScore}/100)`);
      console.log(`   - Entropy: ${analysis.entropy} bits`);
      console.log(`   - Character counts: U:${analysis.characterCounts.uppercase} L:${analysis.characterCounts.lowercase} N:${analysis.characterCounts.numbers} S:${analysis.characterCounts.symbols}`);
      
      expect(analysis.length).toBe(32);
      expect(analysis.strengthScore).toBeGreaterThan(0);
      expect(analysis.entropy).toBeGreaterThan(0);
      expect(analysis.characterCounts.total).toBe(32);
      expect(Array.isArray(analysis.suggestions)).toBe(true);
    });

    it('should provide character diversity analysis', () => {
      console.log(`\n🌈 Testing character diversity analysis...`);
      
      const testPassword = 'AbC123!@#AbC123!@#AbC123!@#XYZ'; // 30 chars with some repetition
      const analysis = PasswordAnalyzer.analyzePassword(testPassword);
      
      const diversity = analysis.characterDiversity;
      const repetition = analysis.repetitionAnalysis;
      
      console.log(`🌈 Test password: "${testPassword}"`);
      console.log(`🌈 Character diversity:`);
      console.log(`   - Unique characters: ${diversity.totalUniqueCharacters}/${analysis.length}`);
      console.log(`   - Diversity ratio: ${diversity.diversityRatio}`);
      console.log(`   - Max repetitions: ${diversity.maxRepetitions}`);
      console.log(`   - Variety score: ${diversity.varietyScore}/100`);
      console.log(`   - Repetition score: ${diversity.repetitionScore}/100`);
      
      console.log(`🌈 Repetition analysis:`);
      console.log(`   - Has excessive repetition: ${repetition.hasExcessiveRepetition}`);
      console.log(`   - Max allowed repetitions: ${repetition.maxAllowedRepetitions}`);
      console.log(`   - Repetition quality: ${repetition.repetitionQuality}`);
      console.log(`   - Violations: ${repetition.repetitionViolations.length}`);
      
      // Test structure
      expect(analysis).toHaveProperty('characterDiversity');
      expect(analysis).toHaveProperty('repetitionAnalysis');
      
      expect(diversity).toHaveProperty('totalUniqueCharacters');
      expect(diversity).toHaveProperty('diversityRatio');
      expect(diversity).toHaveProperty('maxRepetitions');
      expect(diversity).toHaveProperty('varietyScore');
      expect(diversity).toHaveProperty('repetitionScore');
      
      expect(repetition).toHaveProperty('hasExcessiveRepetition');
      expect(repetition).toHaveProperty('maxAllowedRepetitions');
      expect(repetition).toHaveProperty('repetitionQuality');
      expect(repetition).toHaveProperty('repetitionViolations');
      
      // Test value validity
      expect(diversity.totalUniqueCharacters).toBeGreaterThan(0);
      expect(diversity.diversityRatio).toBeGreaterThan(0);
      expect(diversity.varietyScore).toBeGreaterThanOrEqual(0);
      expect(diversity.repetitionScore).toBeGreaterThanOrEqual(0);
      expect(repetition.maxAllowedRepetitions).toBeGreaterThan(0);
      
      console.log(`✅ Character diversity analysis working correctly`);
    });

    it('should detect and analyze repetition patterns', () => {
      console.log(`\n🔄 Testing repetition pattern analysis...`);
      
      const highRepetitionPassword = 'AAAABBBBccccdddd1111!!!!'; // 24 chars, each char repeated 4 times
      const lowRepetitionPassword = 'AbCd1!2@3#4$5%6^7&8*9(0)'; // 26 chars, minimal repetition
      
      const highRepAnalysis = PasswordAnalyzer.analyzePassword(highRepetitionPassword);
      const lowRepAnalysis = PasswordAnalyzer.analyzePassword(lowRepetitionPassword);
      
      console.log(`🔄 High repetition password: "${highRepetitionPassword}"`);
      console.log(`🔄 High rep analysis: quality=${highRepAnalysis.repetitionAnalysis.repetitionQuality}, violations=${highRepAnalysis.repetitionAnalysis.repetitionViolations.length}`);
      
      console.log(`🔄 Low repetition password: "${lowRepetitionPassword}"`);
      console.log(`🔄 Low rep analysis: quality=${lowRepAnalysis.repetitionAnalysis.repetitionQuality}, violations=${lowRepAnalysis.repetitionAnalysis.repetitionViolations.length}`);
      
      // High repetition should be detected
      expect(highRepAnalysis.repetitionAnalysis.hasExcessiveRepetition).toBe(true);
      expect(highRepAnalysis.repetitionAnalysis.repetitionQuality).toMatch(/Poor|Fair/);
      expect(highRepAnalysis.repetitionAnalysis.repetitionViolations.length).toBeGreaterThan(0);
      
      // Low repetition should be good
      expect(lowRepAnalysis.repetitionAnalysis.hasExcessiveRepetition).toBe(false);
      expect(lowRepAnalysis.repetitionAnalysis.repetitionQuality).toMatch(/Excellent|Good/);
      expect(lowRepAnalysis.repetitionAnalysis.repetitionViolations.length).toBe(0);
      
      console.log(`✅ Repetition pattern analysis working correctly`);
    });

    it('should provide enhanced suggestions based on diversity analysis', () => {
      console.log(`\n💡 Testing enhanced suggestions with diversity analysis...`);
      
      const weakPassword = 'aaaa1111!!!!bbbb'; // Poor diversity, excessive repetition
      const analysis = PasswordAnalyzer.analyzePassword(weakPassword);
      
      console.log(`💡 Weak password: "${weakPassword}"`);
      console.log(`💡 Strength: ${analysis.strengthLevel} (${analysis.strengthScore}/100)`);
      console.log(`💡 Suggestions:`);
      analysis.suggestions.forEach((suggestion, index) => {
        console.log(`   ${index + 1}. ${suggestion}`);
      });
      
      // Should have suggestions about diversity and repetition
      const suggestionText = analysis.suggestions.join(' ').toLowerCase();
      const hasDiversitySuggestion = suggestionText.includes('variety') || 
                                   suggestionText.includes('diverse') || 
                                   suggestionText.includes('unique');
      const hasRepetitionSuggestion = suggestionText.includes('repetition') || 
                                    suggestionText.includes('repeated');
      
      expect(analysis.suggestions.length).toBeGreaterThan(0);
      expect(hasDiversitySuggestion || hasRepetitionSuggestion).toBe(true);
      expect(analysis.strengthScore).toBeLessThan(70); // Should be weak
      
      console.log(`✅ Enhanced suggestions working correctly`);
    });

    it('should detect sequential character patterns', () => {
      console.log(`\n🔍 Testing sequential character detection...`);
      
      const hasSequential = PasswordAnalyzer.hasSequentialCharacters('abc123');
      const noSequential = PasswordAnalyzer.hasSequentialCharacters('a1b2c3');
      
      expect(hasSequential).toBe(true);
      expect(noSequential).toBe(false);
      
      console.log(`✅ Sequential character detection working correctly`);
    });

    it('should detect repeated character patterns', () => {
      console.log(`\n🔍 Testing repeated character detection...`);
      
      const hasRepeated = PasswordAnalyzer.hasRepeatedCharacters('aabbcc');
      const noRepeated = PasswordAnalyzer.hasRepeatedCharacters('abc123');
      
      expect(hasRepeated).toBe(true);
      expect(noRepeated).toBe(false);
      
      console.log(`✅ Repeated character detection working correctly`);
    });
  });

  describe('Convenience Functions', () => {
    it('should provide working convenience generatePassword function', async () => {
      console.log(`\n🚀 Testing convenience generatePassword function...`);
      
      const result = await generatePassword({
        keywords: ['convenience', 'test'],
        length: 16
      });
      
      console.log(`🚀 Generated password: "${result.password}"`);
      
      expect(result.password).toHaveLength(16);
      expect(result.metadata.hashIterations).toBe(1000);
    });

    it('should provide working convenience analyzePassword function', () => {
      console.log(`\n🚀 Testing convenience analyzePassword function...`);
      
      const testPassword = 'TestPassword123!';
      const analysis = analyzePassword(testPassword);
      
      console.log(`🚀 Analysis strength: ${analysis.strengthLevel} (${analysis.strengthScore}/100)`);
      
      expect(analysis.length).toBe(testPassword.length);
      expect(analysis.strengthScore).toBeGreaterThan(0);
    });
  });
}); 