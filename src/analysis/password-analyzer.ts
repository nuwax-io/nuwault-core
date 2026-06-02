/**
 * @fileoverview Password analysis and strength evaluation utilities
 * Provides comprehensive password security analysis including entropy calculation, pattern detection, and character diversity assessment
 */

import { calculateMaxRepetitions, STRENGTH_SCORE_CONFIG } from '../config.js';
import type { CharacterDiversityBase } from '../config.js';

/**
 * Character type counts interface
 * Represents the count of each character type in a password
 */
export interface CharacterTypeCounts {
  uppercase: number;
  lowercase: number;
  numbers: number;
  symbols: number;
  total: number;
}

/**
 * Character distribution interface
 * Represents the percentage distribution of character types
 */
export interface CharacterDistribution {
  uppercase: number;
  lowercase: number;
  numbers: number;
  symbols: number;
}

/**
 * Character diversity metrics interface
 * Extends CharacterDiversityBase with analysis-specific scoring fields
 */
export interface CharacterDiversityMetrics extends CharacterDiversityBase {
  repetitionScore: number;
  varietyScore: number;
}

/**
 * Character repetition analysis interface
 * Detailed breakdown of character repetition patterns
 */
export interface RepetitionAnalysis {
  hasExcessiveRepetition: boolean;
  maxAllowedRepetitions: number;
  repetitionViolations: Array<{
    character: string;
    count: number;
    maxAllowed: number;
  }>;
  repetitionQuality: 'Excellent' | 'Good' | 'Fair' | 'Poor';
}

/**
 * Password analysis result interface
 * Comprehensive analysis results including strength metrics, diversity assessment, and suggestions
 */
export interface PasswordAnalysisResult {
  length: number;
  characterCounts: CharacterTypeCounts;
  characterDistribution: CharacterDistribution;
  characterDiversity: CharacterDiversityMetrics;
  repetitionAnalysis: RepetitionAnalysis;
  strengthScore: number;
  strengthLevel: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong' | 'Very Strong';
  entropy: number;
  hasSequentialChars: boolean;
  hasRepeatedChars: boolean;
  suggestions: string[];
}

/**
 * Password analyzer utility class
 * Provides static methods for comprehensive password security analysis including advanced character diversity assessment
 */
export class PasswordAnalyzer {
  /**
   * Analyze password and return comprehensive security assessment
   * @param password - Password to analyze
   * @returns Complete password analysis including strength metrics, diversity assessment, and suggestions
   * @throws {Error} When password is not a string
   */
  static analyzePassword(password: string): PasswordAnalysisResult {
    if (typeof password !== 'string') {
      throw new Error('Password must be a string');
    }

    const characterCounts = this.countCharacterTypes(password);
    const characterDistribution = this.calculateCharacterDistribution(characterCounts);
    const characterDiversity = this.analyzeCharacterDiversity(password);
    const repetitionAnalysis = this.analyzeRepetitionPattern(password);
    const entropy = this.calculateEntropy(password);
    const strengthScore = this.calculateStrengthScore(
      password,
      characterCounts,
      entropy,
      characterDiversity
    );
    const strengthLevel = this.getStrengthLevel(strengthScore);
    const hasSequentialChars = this.hasSequentialCharacters(password);
    const hasRepeatedChars = this.hasRepeatedCharacters(password);
    const suggestions = this.generateSuggestions(
      password,
      characterCounts,
      strengthScore,
      characterDiversity,
      repetitionAnalysis
    );

    return {
      length: password.length,
      characterCounts,
      characterDistribution,
      characterDiversity,
      repetitionAnalysis,
      strengthScore,
      strengthLevel,
      entropy,
      hasSequentialChars,
      hasRepeatedChars,
      suggestions,
    };
  }

  /**
   * Analyze character diversity and repetition patterns in password
   * @param password - Password to analyze
   * @returns Detailed character diversity metrics
   */
  static analyzeCharacterDiversity(password: string): CharacterDiversityMetrics {
    if (password.length === 0) {
      return {
        totalUniqueCharacters: 0,
        maxRepetitions: 0,
        averageRepetitions: 0,
        diversityRatio: 0,
        repetitionScore: 0,
        varietyScore: 0,
      };
    }

    const charCount = new Map<string, number>();

    // Count character occurrences
    for (const char of password) {
      charCount.set(char, (charCount.get(char) || 0) + 1);
    }

    const repetitionCounts = Array.from(charCount.values());
    const totalUniqueCharacters = charCount.size;
    const maxRepetitions = Math.max(...repetitionCounts);
    const averageRepetitions =
      repetitionCounts.reduce((a, b) => a + b, 0) / repetitionCounts.length;
    const diversityRatio = totalUniqueCharacters / password.length;

    // Calculate repetition score (lower repetition = higher score)
    const maxAllowedRepetitions = calculateMaxRepetitions(password.length);
    const repetitionScore =
      maxRepetitions <= maxAllowedRepetitions
        ? 100
        : Math.max(0, 100 - (maxRepetitions - maxAllowedRepetitions) * 20);

    // Calculate variety score (higher diversity = higher score)
    const varietyScore = Math.round(diversityRatio * 100);

    return {
      totalUniqueCharacters,
      maxRepetitions,
      averageRepetitions: Math.round(averageRepetitions * 100) / 100,
      diversityRatio: Math.round(diversityRatio * 1000) / 1000,
      repetitionScore,
      varietyScore,
    };
  }

  /**
   * Analyze repetition patterns and compliance with optimal standards
   * @param password - Password to analyze
   * @returns Detailed repetition analysis with quality assessment
   */
  static analyzeRepetitionPattern(password: string): RepetitionAnalysis {
    const charCount = new Map<string, number>();

    // Count character occurrences
    for (const char of password) {
      charCount.set(char, (charCount.get(char) || 0) + 1);
    }

    const maxAllowedRepetitions = calculateMaxRepetitions(password.length);
    const repetitionViolations: Array<{ character: string; count: number; maxAllowed: number }> =
      [];
    let maxActualRepetitions = 0;

    // Check for repetition violations
    for (const [char, count] of charCount.entries()) {
      if (count > maxActualRepetitions) {
        maxActualRepetitions = count;
      }

      if (count > maxAllowedRepetitions) {
        repetitionViolations.push({
          character: char,
          count,
          maxAllowed: maxAllowedRepetitions,
        });
      }
    }

    const hasExcessiveRepetition = repetitionViolations.length > 0;

    // Determine repetition quality
    let repetitionQuality: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    if (maxActualRepetitions <= Math.max(1, maxAllowedRepetitions - 1)) {
      repetitionQuality = 'Excellent';
    } else if (maxActualRepetitions <= maxAllowedRepetitions) {
      repetitionQuality = 'Good';
    } else if (maxActualRepetitions <= maxAllowedRepetitions + 1) {
      repetitionQuality = 'Fair';
    } else {
      repetitionQuality = 'Poor';
    }

    return {
      hasExcessiveRepetition,
      maxAllowedRepetitions,
      repetitionViolations,
      repetitionQuality,
    };
  }

  /**
   * Count occurrences of each character type in password
   * @param password - Password to analyze
   * @returns Character type counts with totals
   */
  static countCharacterTypes(password: string): CharacterTypeCounts {
    let uppercase = 0;
    let lowercase = 0;
    let numbers = 0;
    let symbols = 0;

    for (const char of password) {
      if (/[A-Z]/.test(char)) {
        uppercase++;
      } else if (/[a-z]/.test(char)) {
        lowercase++;
      } else if (/[0-9]/.test(char)) {
        numbers++;
      } else {
        symbols++;
      }
    }

    return {
      uppercase,
      lowercase,
      numbers,
      symbols,
      total: password.length,
    };
  }

  /**
   * Calculate percentage distribution of character types
   * @param counts - Character type counts
   * @returns Character distribution as percentages (rounded to 2 decimal places)
   */
  static calculateCharacterDistribution(counts: CharacterTypeCounts): CharacterDistribution {
    const { total, uppercase, lowercase, numbers, symbols } = counts;

    if (total === 0) {
      return { uppercase: 0, lowercase: 0, numbers: 0, symbols: 0 };
    }

    return {
      uppercase: Number(((uppercase / total) * 100).toFixed(2)),
      lowercase: Number(((lowercase / total) * 100).toFixed(2)),
      numbers: Number(((numbers / total) * 100).toFixed(2)),
      symbols: Number(((symbols / total) * 100).toFixed(2)),
    };
  }

  /**
   * Calculate Shannon entropy of password
   * @param password - Password to analyze
   * @returns Entropy value in bits per character
   */
  static calculateEntropy(password: string): number {
    if (password.length === 0) return 0;

    const charFrequency = new Map<string, number>();
    for (const char of password) {
      charFrequency.set(char, (charFrequency.get(char) || 0) + 1);
    }

    let entropy = 0;
    const length = password.length;

    for (const frequency of charFrequency.values()) {
      const probability = frequency / length;
      entropy -= probability * Math.log2(probability);
    }

    return Number(entropy.toFixed(2));
  }

  /**
   * Calculate comprehensive password strength score including character diversity assessment
   * @param password - Password to analyze
   * @param counts - Character type counts
   * @param entropy - Password entropy value
   * @param diversity - Character diversity metrics
   * @returns Strength score from 0-100
   */
  static calculateStrengthScore(
    password: string,
    counts: CharacterTypeCounts,
    entropy: number,
    diversity: CharacterDiversityMetrics
  ): number {
    let score = 0;

    const S = STRENGTH_SCORE_CONFIG;

    const lengthScore = Math.min(password.length * S.lengthMultiplier, S.maxComponentScore);
    score += lengthScore;

    const typesUsed = [
      counts.uppercase > 0,
      counts.lowercase > 0,
      counts.numbers > 0,
      counts.symbols > 0,
    ].filter(Boolean).length;

    const varietyScore = (typesUsed / 4) * S.maxComponentScore;
    score += varietyScore;

    const entropyScore = Math.min(entropy * S.entropyMultiplier, S.maxComponentScore);
    score += entropyScore;

    const diversityScore =
      (diversity.varietyScore * S.diversityVarietyWeight +
        diversity.repetitionScore * S.diversityRepetitionWeight) *
      S.diversityScoreNormalizer;
    score += diversityScore;

    const balanceScore = this.calculateBalanceScore(counts);
    score += balanceScore;

    let penalties = 0;

    if (this.hasSequentialCharacters(password)) penalties += S.sequentialCharPenalty;
    if (this.hasRepeatedCharacters(password)) penalties += S.repeatedCharPenalty;
    if (this.hasCommonPatterns(password)) penalties += S.commonPatternPenalty;

    if (diversity.repetitionScore < S.minRepetitionScoreForPenalty) {
      penalties +=
        (S.minRepetitionScoreForPenalty - diversity.repetitionScore) * S.repetitionPenaltyFactor;
    }

    if (diversity.diversityRatio < S.minDiversityRatio) {
      penalties += (S.minDiversityRatio - diversity.diversityRatio) * S.maxComponentScore;
    }

    score = Math.max(0, score - penalties);

    return Math.min(100, Math.round(score));
  }

  /**
   * Calculate character distribution balance score
   * @param counts - Character type counts
   * @returns Balance score from 0-20 points
   */
  private static calculateBalanceScore(counts: CharacterTypeCounts): number {
    const { total, uppercase, lowercase, numbers, symbols } = counts;
    const max = STRENGTH_SCORE_CONFIG.maxComponentScore;

    if (total === 0) return max;

    const ideal = total / 4;
    const deviations = [
      Math.abs(uppercase - ideal),
      Math.abs(lowercase - ideal),
      Math.abs(numbers - ideal),
      Math.abs(symbols - ideal),
    ];

    const avgDeviation = deviations.reduce((sum, dev) => sum + dev, 0) / 4;
    const maxPossibleDeviation = ideal;

    if (maxPossibleDeviation === 0) return max;

    const balanceRatio = 1 - avgDeviation / maxPossibleDeviation;
    return Math.round(balanceRatio * max);
  }

  /**
   * Determine strength level based on numerical score
   * @param score - Strength score (0-100)
   * @returns Human-readable strength level
   */
  static getStrengthLevel(
    score: number
  ): 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong' | 'Very Strong' {
    if (score >= 90) return 'Very Strong';
    if (score >= 75) return 'Strong';
    if (score >= 60) return 'Good';
    if (score >= 45) return 'Fair';
    if (score >= 25) return 'Weak';
    return 'Very Weak';
  }

  /**
   * Detect sequential character patterns in password
   * @param password - Password to check
   * @returns True if 3+ sequential characters found (e.g., "abc", "123")
   */
  static hasSequentialCharacters(password: string): boolean {
    for (let i = 0; i < password.length - 2; i++) {
      const char1 = password.charCodeAt(i);
      const char2 = password.charCodeAt(i + 1);
      const char3 = password.charCodeAt(i + 2);

      if (char2 === char1 + 1 && char3 === char2 + 1) {
        return true;
      }
    }
    return false;
  }

  /**
   * Detect consecutive repeated characters in password
   * @param password - Password to check
   * @returns True if adjacent identical characters found (e.g., "aa", "11")
   */
  static hasRepeatedCharacters(password: string): boolean {
    for (let i = 0; i < password.length - 1; i++) {
      if (password[i] === password[i + 1]) {
        return true;
      }
    }
    return false;
  }

  /**
   * Detect common weak patterns in password
   * @param password - Password to check
   * @returns True if common weak patterns found
   */
  private static hasCommonPatterns(password: string): boolean {
    const commonPatterns = [
      /(.)\1{2,}/,
      /123|234|345|456|567|678|789|890/,
      /abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i,
      /qwerty|asdf|zxcv/i,
    ];

    return commonPatterns.some(pattern => pattern.test(password));
  }

  /**
   * Generate actionable password improvement suggestions including character diversity recommendations
   * @param password - Password to analyze
   * @param counts - Character type counts
   * @param score - Current strength score
   * @param diversity - Character diversity metrics
   * @param repetitionAnalysis - Repetition pattern analysis
   * @returns Array of specific improvement recommendations
   */
  private static generateSuggestions(
    password: string,
    counts: CharacterTypeCounts,
    score: number,
    diversity: CharacterDiversityMetrics,
    repetitionAnalysis: RepetitionAnalysis
  ): string[] {
    const suggestions: string[] = [];

    if (score >= 90) {
      suggestions.push('Excellent! Your password is very strong with good character diversity.');
      return suggestions;
    }

    const S = STRENGTH_SCORE_CONFIG;

    if (password.length < S.minRecommendedLength) {
      suggestions.push(
        `Consider using a longer password (${S.minRecommendedLength}+ characters) for better security`
      );
    }

    if (counts.uppercase === 0) suggestions.push('Add uppercase letters for better security');
    if (counts.lowercase === 0) suggestions.push('Add lowercase letters for better security');
    if (counts.numbers === 0) suggestions.push('Add numbers for better security');
    if (counts.symbols === 0) suggestions.push('Add symbols for better security');

    if (diversity.diversityRatio < S.minDiversityRatio) {
      suggestions.push(
        `Increase character variety - only ${diversity.totalUniqueCharacters} unique characters out of ${password.length} total`
      );
    }

    if (diversity.varietyScore < S.minVarietyScore) {
      suggestions.push('Use more diverse characters to avoid predictable patterns');
    }

    // Repetition suggestions
    if (repetitionAnalysis.hasExcessiveRepetition) {
      const violationCount = repetitionAnalysis.repetitionViolations.length;
      suggestions.push(
        `Reduce character repetition - ${violationCount} character${violationCount > 1 ? 's' : ''} exceed${violationCount === 1 ? 's' : ''} recommended limits`
      );
    }

    if (repetitionAnalysis.repetitionQuality === 'Poor') {
      suggestions.push('Consider spreading repeated characters throughout the password');
    }

    // Pattern suggestions
    if (this.hasSequentialCharacters(password)) {
      suggestions.push('Avoid sequential characters (e.g., abc, 123) for better security');
    }

    if (this.hasRepeatedCharacters(password)) {
      suggestions.push('Avoid adjacent identical characters (e.g., aa, 11)');
    }

    if (this.hasCommonPatterns(password)) {
      suggestions.push('Avoid common patterns and keyboard sequences');
    }

    // Balance suggestions
    const balanceScore = this.calculateBalanceScore(counts);
    if (balanceScore < 15) {
      suggestions.push('Balance the distribution of character types for optimal security');
    }

    if (suggestions.length === 0) {
      suggestions.push(
        'Your password could be stronger with more character variety and better distribution'
      );
    }

    return suggestions;
  }
}
