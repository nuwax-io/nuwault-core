# Developer Guide

## NuwaultCore Class

The main class provides a convenient wrapper around all password generation functions.

```javascript
import NuwaultCore from '@nuwax-io/nuwault-core';

const generator = new NuwaultCore(customConfig);
```

### Constructor

**`new NuwaultCore(customConfig?)`**

Creates a new password generator instance with optional custom configuration.

**Parameters:**
- `customConfig` (object, optional): Custom configuration object
  - `SECURITY_CONFIG` (object): Security settings override
    - `hashIterations` (number): Number of hash iterations (default: 1000)
    - `defaultPasswordLength` (number): Default password length (default: 16)
    - `minPasswordLength` (number): Minimum allowed password length (default: 8)
    - `maxPasswordLength` (number): Maximum allowed password length (default: 128)
    - `masterSalt` (string | null): Optional master salt for additional security
      - **Default:** `null` (no master salt)
      - **Effect:** When provided, adds an extra layer of security to hash generation
      - **Behavior:** Salt is included in every hash iteration for enhanced uniqueness
      - **Use Case:** Useful for creating organization-specific or user-specific password variants
  - `CHARACTER_SETS` (object): Custom character pools for password generation
    - `UPPERCASE` (string): Uppercase letters (default: `'ABCDEFGHIJKLMNOPQRSTUVWXYZ'`)
    - `LOWERCASE` (string): Lowercase letters (default: `'abcdefghijklmnopqrstuvwxyz'`)
    - `NUMBERS` (string): Numeric digits (default: `'0123456789'`)
    - `SYMBOLS` (string): Symbol characters (default: `'!@#$%^&*()_+-=[]{}|;:,.<>?'`)
  - `PASSWORD_DISTRIBUTION_CONFIG` (object): Character distribution ratios by password length
    - `long.threshold` (number): Minimum length for the long strategy (default: `64`)
    - `long.distribution`: Ratios for long passwords — `{ uppercase: 0.20, lowercase: 0.35, numbers: 0.20, symbols: 0.25 }`
    - `medium.threshold` (number): Minimum length for the medium strategy (default: `32`)
    - `medium.distribution`: Ratios for medium passwords — `{ uppercase: 0.25, lowercase: 0.35, numbers: 0.20, symbols: 0.20 }`
    - Passwords shorter than `medium.threshold` always use equal distribution
  - `DEFAULT_PASSWORD_OPTIONS` (object): Default password options

**Examples:**
```javascript
// Standard initialization with default security configuration
const generator = new NuwaultCore();

// Enterprise configuration with global master salt
const saltedGenerator = new NuwaultCore({
  SECURITY_CONFIG: {
    hashIterations: 2000,
    masterSalt: 'enterprise-application-salt'
  }
});

// Advanced enterprise configuration with custom parameters
const advancedGenerator = new NuwaultCore({
  SECURITY_CONFIG: {
    hashIterations: 5000,
    defaultPasswordLength: 32,
    masterSalt: 'organization-wide-cryptographic-salt'
  },
  CHARACTER_SETS: {
    SYMBOLS: '!@#$%^&*'  // Restrict symbol pool to 8 characters
  },
  PASSWORD_DISTRIBUTION_CONFIG: {
    long:   { threshold: 64, distribution: { uppercase: 0.15, lowercase: 0.40, numbers: 0.20, symbols: 0.25 } },
    medium: { threshold: 32, distribution: { uppercase: 0.20, lowercase: 0.40, numbers: 0.20, symbols: 0.20 } },
    short:  { distribution: 'equal' }
  }
});
```

### Methods

**`generatePassword(inputs, options?)`**

Generate a secure, deterministic password from input keywords.

**Parameters:**
- `inputs` (string[]): Array of input strings (keywords, URLs, etc.)
  - **Validation Rules:**
    - Must contain at least one non-empty string
    - Combined length must be at least 3 characters after normalization
    - Each input is automatically normalized (trimmed, lowercased, diacritics removed)
- `options` (object, optional): Password generation options
  - `length` (number, optional): Password length
    - **Range:** 8-128 characters
    - **Default:** 16 (from `SECURITY_CONFIG.defaultPasswordLength`)
    - **Behavior:** Determines character distribution strategy:
      - Short (8-31): Equal distribution across selected character types
      - Medium (32-63): Moderate symbol boost (25%/35%/20%/20%)
      - Long (64-128): Enhanced symbol/number distribution (20%/35%/20%/25%)
  - `includeUppercase` (boolean, optional): Include uppercase letters (A-Z)
    - **Default:** `true`
    - **Character Set:** 26 characters (A-Z)
    - **Fallback:** If all character types are disabled, defaults to true
  - `includeLowercase` (boolean, optional): Include lowercase letters (a-z)
    - **Default:** `true`
    - **Character Set:** 26 characters (a-z)
    - **Distribution:** Usually gets highest percentage in longer passwords
  - `includeNumbers` (boolean, optional): Include numeric digits (0-9)
    - **Default:** `true`
    - **Character Set:** 10 characters (0-9)
    - **Priority:** Higher weight in passwords ≥32 characters
  - `includeSymbols` (boolean, optional): Include special symbols
    - **Default:** `true`
    - **Character Set:** 26 characters (`!@#$%^&*()_+-=[]{}|;:,.<>?`)
    - **Priority:** Highest weight in passwords ≥32 characters
  - `masterSalt` (string | null, optional): Master salt for additional security
    - **Default:** `null` (uses constructor's masterSalt if set, otherwise no salt)
    - **Effect:** When provided, adds an extra layer of security to hash generation
    - **Behavior:** Salt is included in every hash iteration for enhanced uniqueness
    - **Priority:** This per-call salt **overrides** any constructor masterSalt setting
    - **Use Case:** Dynamic salts, user-specific variants, or overriding global salt

**Returns:** `Promise<string>` - Generated password

**Character Diversity & Quality Features:**
- **Repetition Control**: Dynamically calculated maximum repetitions per character based on password length
- **Character Variety**: Ensures balanced usage across all available characters within each type
- **Distribution Intelligence**: Selects least-used characters when approaching repetition limits
- **Diversity Metrics**: Tracks unique character count, maximum repetitions, and average usage

**Throws:**
- `Error` - If no keywords provided: `"At least one keyword is required"`
- `Error` - If a keyword is empty: `"Keyword at index N cannot be empty or contain only whitespace"`
- `Error` - If a keyword exceeds 1000 characters: `"Keyword at index N exceeds maximum length of 1000 characters"`
- `Error` - If length out of range: `"Password length must be at least 8 characters"` / `"Password length cannot exceed 128 characters"`
- `Error` - If all character types disabled: `"At least one character type must be enabled"`

**Character Distribution Logic:**
- **Adaptive Algorithm:** Distribution strategy changes based on password length
- **Deterministic Placement:** Same inputs always produce identical character placement
- **Balanced Distribution:** Algorithm ensures no character type dominates inappropriately
- **Fallback Handling:** If no character types selected, enables all types automatically

**Examples:**
```javascript
// Standard password generation with default settings
const password = await generator.generatePassword(['github.com', 'username']);
// Output: 16-character password with balanced character distribution

// Enterprise-grade password with custom character composition
const password = await generator.generatePassword(
  ['secure-site.com', 'user@email.com'],
  { 
    length: 32,
    includeSymbols: true,
    includeNumbers: true,
    includeUppercase: true,
    includeLowercase: true
  }
);

// Alphanumeric password generation (symbols excluded)
const alphanumeric = await generator.generatePassword(
  ['example.com', 'user123'],
  {
    length: 20,
    includeSymbols: false
  }
);

// Length-based distribution strategy demonstration
const short = await generator.generatePassword(['test'], { length: 12 });    // Equal character type distribution
const medium = await generator.generatePassword(['test'], { length: 40 });   // Enhanced symbol distribution (25%/35%/20%/20%)
const long = await generator.generatePassword(['test'], { length: 80 });     // Maximum symbol/number priority (20%/35%/20%/25%)

// Runtime salt override for per-call security enhancement
const saltedPassword = await generator.generatePassword(
  ['github.com', 'username'],
  { 
    length: 24,
    masterSalt: 'runtime-salt'  // Overrides constructor masterSalt for this operation
  }
);
```

**`analyzePassword(password, _options?)`**

Analyze character type distribution in a password.

**Parameters:**
- `password` (string): Password to analyze
- `_options` (**deprecated**, optional): Accepted for backward compatibility but has no effect. Use the standalone `analyzePassword()` export for full strength analysis.

**Returns:** `CharacterDistribution` — percentage share of each character type (rounded to 2 decimal places)
- `uppercase` (number): Percentage of uppercase letters (e.g., `25.0`)
- `lowercase` (number): Percentage of lowercase letters
- `numbers` (number): Percentage of numeric digits
- `symbols` (number): Percentage of symbol characters

> For comprehensive analysis including strength score, entropy, repetition patterns, and improvement suggestions, use the standalone `analyzePassword()` function.

**Examples:**
```javascript
const dist = generator.analyzePassword('MyP@ssw0rd123!');
console.log(`Uppercase: ${dist.uppercase}%`);
console.log(`Lowercase: ${dist.lowercase}%`);
console.log(`Numbers:   ${dist.numbers}%`);
console.log(`Symbols:   ${dist.symbols}%`);
```

## Core Functions

All functions are available as individual exports for advanced usage:

```javascript
import {
  // Core password generation functions
  generatePassword,
  generatePasswordLegacy,
  generateHash,
  hashToPassword,
  analyzePassword,
  analyzeCharacterDistribution,
  normalizeInput,

  // Algorithm compatibility validation functions
  validateAlgorithmCompatibility,
  quickCompatibilityCheck,
  validateFullAlgorithm,
  getAlgorithmVersion,

  // Security and configuration constants
  SECURITY_CONFIG,
  CHARACTER_SETS,
  DEFAULT_PASSWORD_OPTIONS,
  ALGORITHM_VERSION,
  ALGORITHM_TEST_VECTORS,
  INPUT_LIMITS,
  STRENGTH_SCORE_CONFIG,

  // Utility functions
  mergeConfig,
  calculateMaxRepetitions,
} from '@nuwax-io/nuwault-core';
```

### Core Functions Reference

**`generatePassword(inputs, options?)`** — Legacy API

Generates a password from a keyword array and returns `Promise<string>`. Same behaviour as `NuwaultCore.generatePassword()`.

**`generatePassword(options)`** — Object API

Generates a password via `PasswordGenerator.generatePassword()` and returns `Promise<PasswordGenerationResult>` with full metadata. Accepts the complete `PasswordGenerationOptions` interface, including the two per-call overrides added in the latest release:

- `characterSets` (`CharacterSets`, optional): Override the character pools for this call only. Falls back to the module-level `CHARACTER_SETS` constant.
- `distributionConfig` (`PasswordDistributionConfig`, optional): Override the length-based distribution ratios for this call only. Falls back to the module-level `PASSWORD_DISTRIBUTION_CONFIG` constant.

```javascript
import { generatePassword } from '@nuwax-io/nuwault-core';

// Per-call character set override (object API)
const result = await generatePassword({
  keywords: ['github.com', 'user@email.com'],
  length: 24,
  characterSets: { SYMBOLS: '!@#$%^&*' },
});
console.log(result.password);
```

**`generateHash(inputs, masterSalt?)`**

Generate a cryptographic hash from input strings using SHA-512 with multiple iterations.

**Parameters:**
- `inputs` (string[]): Array of input strings
- `masterSalt` (string | null, optional): Master salt for additional security
  - **Default:** `null` (uses SECURITY_CONFIG.masterSalt)
  - **Effect:** When provided, overrides the global masterSalt setting
  - **Behavior:** Salt is included in every hash iteration for enhanced uniqueness

**Returns:** `Promise<string>` - 128-character hex hash

**Throws:**
- `Error` - If no inputs provided
- `Error` - If all inputs are empty or whitespace-only

**`hashToPassword(hash, options)`**

Convert a cryptographic hash to a password with specified character distribution.

**Parameters:**
- `hash` (string): 128-character SHA-512 hex string (required)
  - **Format:** Exactly 128 hexadecimal characters (`[0-9a-fA-F]{128}`) — upper and lowercase accepted; internally normalised to lowercase
  - **Source:** Must be the output of `generateHash()` or an equivalent SHA-512 hash
  - **Validation:** Throws if the value is not a valid 128-character hex string
- `options` (object): Password generation options (required)
  - `length` (number): Desired password length
    - **Range:** Any positive integer (typically 8-128)
    - **Effect:** Determines output password length
  - `includeUppercase` (boolean): Include uppercase letters (A-Z)
    - **Character Set:** 26 characters
    - **Distribution:** Adaptive based on password length
  - `includeLowercase` (boolean): Include lowercase letters (a-z)
    - **Character Set:** 26 characters  
    - **Distribution:** Usually highest percentage in longer passwords
  - `includeNumbers` (boolean): Include numeric digits (0-9)
    - **Character Set:** 10 characters
    - **Distribution:** Higher weight in passwords ≥32 characters
  - `includeSymbols` (boolean): Include special symbols
    - **Character Set:** 26 characters (`!@#$%^&*()_+-=[]{}|;:,.<>?`)
    - **Distribution:** Highest priority in passwords ≥32 characters

**Returns:** `string` - Generated password with specified length and character distribution

**Throws:**
- `Error` - If hash is not a valid 128-character hex string: `"Hash must be a valid 128-character SHA-512 hex string"`
- `Error` - If length is outside the 8–128 range
- `Error` - If all character types are disabled

**Algorithm Details:**
- **Deterministic:** Same hash + options always produce identical password
- **Distribution Strategy:** Adaptive algorithm based on password length:
  - **Short (8-31):** Equal distribution across selected character types
  - **Medium (32-63):** Moderate symbol boost (25%/35%/20%/20%)
  - **Long (64+):** Enhanced symbol/number distribution (20%/35%/20%/25%)
- **Character Placement:** Uses hash entropy for deterministic character positioning
- **Fallback Handling:** If no character types enabled, automatically enables all types

**Examples:**
```javascript
import { hashToPassword } from '@nuwax-io/nuwault-core';

// Standard password generation from cryptographic hash
// hash must be exactly 128 hex characters — use generateHash() to obtain it
const hash = 'a1b2c3d4e5f6...'; // 128-character SHA-512 hash from generateHash()
const password = hashToPassword(hash, {
  length: 16,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: true
});

// Numeric-only password generation for PIN-like output
const numericPassword = hashToPassword(hash, {
  length: 12,
  includeUppercase: false,
  includeLowercase: false,
  includeNumbers: true,
  includeSymbols: false
});

// Adaptive distribution demonstration with length-based strategies
const short = hashToPassword(hash, { length: 12, includeUppercase: true, includeLowercase: true, includeNumbers: true, includeSymbols: true });
const long = hashToPassword(hash, { length: 64, includeUppercase: true, includeLowercase: true, includeNumbers: true, includeSymbols: true });
// Note: Longer passwords prioritize symbols and numbers for enhanced security
```

**`analyzePassword(password)`**

Comprehensive password strength analysis. Unlike `NuwaultCore.analyzePassword()` which returns only percentages, this standalone function returns full security metrics.

**Parameters:**
- `password` (string): Password to analyze

**Returns:** `PasswordAnalysisResult`
- `length` (number): Total password length
- `characterCounts` (object): Raw counts — `{ uppercase, lowercase, numbers, symbols, total }`
- `characterDistribution` (object): Percentage of each type — `{ uppercase, lowercase, numbers, symbols }`
- `characterDiversity` (object): Diversity metrics
  - `totalUniqueCharacters` (number): Count of unique characters
  - `maxRepetitions` (number): Highest repetition count for any single character
  - `averageRepetitions` (number): Average repetitions per character
  - `diversityRatio` (number): Unique chars / total length
  - `repetitionScore` (number): 0–100 (100 = no excessive repetition)
  - `varietyScore` (number): 0–100 (100 = fully diverse)
- `repetitionAnalysis` (object): Repetition pattern details
  - `hasExcessiveRepetition` (boolean)
  - `maxAllowedRepetitions` (number): Length-based threshold
  - `repetitionViolations` (array): Characters exceeding the threshold
  - `repetitionQuality` (`'Excellent' | 'Good' | 'Fair' | 'Poor'`)
- `strengthScore` (number): 0–100 composite score
- `strengthLevel` (`'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong' | 'Very Strong'`)
- `entropy` (number): Shannon entropy in bits per character
- `hasSequentialChars` (boolean): True if 3+ sequential characters found (e.g., `abc`, `123`)
- `hasRepeatedChars` (boolean): True if adjacent identical characters found (e.g., `aa`)
- `suggestions` (string[]): Actionable improvement recommendations

**Strength level thresholds:**
| Score | Level |
|-------|-------|
| ≥90 | Very Strong |
| ≥75 | Strong |
| ≥60 | Good |
| ≥45 | Fair |
| ≥25 | Weak |
| <25 | Very Weak |

**Examples:**
```javascript
import { analyzePassword } from '@nuwax-io/nuwault-core';

const analysis = analyzePassword('MyP@ssw0rd123!');

console.log(`Strength: ${analysis.strengthLevel} (${analysis.strengthScore}/100)`);
console.log(`Entropy:  ${analysis.entropy} bits`);
console.log(`Unique chars: ${analysis.characterDiversity.totalUniqueCharacters}`);
console.log(`Repetition quality: ${analysis.repetitionAnalysis.repetitionQuality}`);

if (analysis.suggestions.length > 0) {
  console.log('Suggestions:');
  analysis.suggestions.forEach(s => console.log(`  - ${s}`));
}
```

**`analyzeCharacterDistribution(password)`**

Returns only the percentage distribution of character types. Equivalent to `NuwaultCore.analyzePassword()`.

**`normalizeInput(text)`**

Normalize input text by trimming whitespace and converting to lowercase. Diacritics are **not** removed.

**Parameters:**
- `text` (string): Input text to normalize

**Returns:** `string` - Normalized text

**Examples:**
```javascript
normalizeInput('  GitHub.COM  '); // Output: 'github.com'
normalizeInput('Café');           // Output: 'café'  (diacritics preserved)
normalizeInput('ÉXAMPLE.org');    // Output: 'éxample.org'
```

### Algorithm Validation Functions

**`validateAlgorithmCompatibility()`**

Perform comprehensive algorithm compatibility validation across all components.

**Parameters:** None

**Returns:** `Promise<object>` - Detailed compatibility validation results
- `overall` (object): Overall validation summary
  - `isFullyCompatible` (boolean): Whether all components are compatible
  - `algorithmVersion` (string): Current algorithm version
  - `timestamp` (number): Validation timestamp
- `hashGeneration` (object): Hash generation validation results
  - `isCompatible` (boolean): Hash generation compatibility status
  - `testedVectors` (number): Number of test vectors tested
  - `passedVectors` (number): Number of test vectors that passed
  - `failedVectors` (array): Array of failed test vector details
  - `environment` (object): Environment information
- `passwordGeneration` (object): Password generation validation results (same structure as hashGeneration)

**Algorithm Details:**
- Tests 3 predefined test vectors for hash generation
- Tests 3 predefined test vectors for password generation
- Validates character diversity metadata
- Checks cross-platform compatibility
- Records environment information (Node.js version, user agent, etc.)

**Examples:**
```javascript
import { validateAlgorithmCompatibility } from '@nuwax-io/nuwault-core';

const validation = await validateAlgorithmCompatibility();

if (validation.overall.isFullyCompatible) {
  console.log('✅ Algorithm stack validation successful');
  console.log(`Hash validation: ${validation.hashGeneration.passedVectors}/${validation.hashGeneration.testedVectors} vectors passed`);
  console.log(`Password validation: ${validation.passwordGeneration.passedVectors}/${validation.passwordGeneration.testedVectors} vectors passed`);
} else {
  console.error('❌ Algorithm compatibility validation failed');
  
  // Process hash generation validation failures
  if (validation.hashGeneration.failedVectors.length > 0) {
    console.log('Hash generation validation failures:');
    validation.hashGeneration.failedVectors.forEach(failure => {
      console.log(`  Test Vector ${failure.vectorIndex}: Expected ${failure.expected}, Actual ${failure.actual}`);
    });
  }
  
  // Process password generation validation failures
  if (validation.passwordGeneration.failedVectors.length > 0) {
    console.log('Password generation validation failures:');
    validation.passwordGeneration.failedVectors.forEach(failure => {
      console.log(`  Test Vector ${failure.vectorIndex}: ${failure.differences.join(', ')}`);
    });
  }
}
```

**`quickCompatibilityCheck()`**

Fast algorithm compatibility check using a single test vector from each component.

**Parameters:** None

**Returns:** `Promise<boolean>` - Quick compatibility status
- `true`: Algorithm is compatible (single test vector passed for each component)
- `false`: Compatibility issues detected

**Use Cases:**
- Production health checks
- CI/CD pipeline validation
- Real-time monitoring
- Startup validation

**Performance:**
- ~50-100ms typical execution time
- Minimal resource usage
- Suitable for frequent checks

**Examples:**
```javascript
import { quickCompatibilityCheck } from '@nuwax-io/nuwault-core';

// Production health monitoring endpoint
app.get('/health/algorithm', async (req, res) => {
  const isHealthy = await quickCompatibilityCheck();
  
  res.status(isHealthy ? 200 : 500).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    algorithm: isHealthy ? 'compatible' : 'incompatible',
    timestamp: new Date().toISOString()
  });
});

// Application startup validation
const startupHealthy = await quickCompatibilityCheck();
if (!startupHealthy) {
  console.error('❌ Algorithm compatibility validation failed during application startup');
  process.exit(1);
}
console.log('✅ Algorithm compatibility validation successful');
```

**`validateFullAlgorithm()`**

Comprehensive validation of the complete algorithm stack including hash generation, password generation, and character diversity.

**Parameters:** None

**Returns:** `Promise<object>` - Full algorithm validation results
- `isFullyCompatible` (boolean): Whether the entire algorithm stack is compatible
- `hashCompatibility` (boolean): Hash generation compatibility status
- `passwordCompatibility` (boolean): Password generation compatibility status
- `algorithmVersion` (string): Current algorithm version
- `timestamp` (number): Validation timestamp

**Algorithm Coverage:**
- SHA-512 hash generation with multiple iterations
- Character distribution algorithms
- Character diversity optimization
- Repetition control mechanisms
- Fisher-Yates shuffle algorithm
- Cross-platform behavior validation

**Examples:**
```javascript
import { validateFullAlgorithm } from '@nuwax-io/nuwault-core';

// CI/CD pipeline validation
const validation = await validateFullAlgorithm();

if (validation.isFullyCompatible) {
  console.log('✅ Complete algorithm stack validation successful');
  console.log(`Algorithm version: ${validation.algorithmVersion}`);
  process.exit(0);
} else {
  console.error('❌ Algorithm stack validation failed');
  console.error(`Hash compatibility status: ${validation.hashCompatibility}`);
  console.error(`Password compatibility status: ${validation.passwordCompatibility}`);
  process.exit(1);
}

// Pre-deployment validation routine
async function validateDeployment() {
  const result = await validateFullAlgorithm();
  
  if (result.isFullyCompatible) {
    console.log('🚀 Pre-deployment validation successful - deployment authorized');
    return true;
  } else {
    console.error('🛑 Pre-deployment validation failed - deployment blocked');
    return false;
  }
}
```

**`getAlgorithmVersion()`**

Get comprehensive algorithm version information and feature list.

**Parameters:** None

**Returns:** `object` - Algorithm version information
- `version` (string): Semantic version number (e.g., "1.0.0")
- `hashAlgorithm` (string): Hash algorithm used ("SHA-512")
- `encoding` (string): Text encoding ("UTF-8")
- `jsNumberPrecision` (string): JavaScript number precision ("IEEE-754")
- `shuffleAlgorithm` (string): Shuffle algorithm ("Fisher-Yates")
- `timestamp` (number): Current timestamp
- `features` (string[]): List of algorithm features

**Version Compatibility:**
- Algorithm version tracks core algorithm changes and ensures deterministic behavior across different environments

**Examples:**
```javascript
import { getAlgorithmVersion } from '@nuwax-io/nuwault-core';

const versionInfo = getAlgorithmVersion();

console.log('Algorithm Version Information:');
console.log(`  Core Version: ${versionInfo.version}`);
console.log(`  Hash Algorithm: ${versionInfo.hashAlgorithm}`);
console.log(`  Encoding: ${versionInfo.encoding}`);
console.log(`  Shuffle Algorithm: ${versionInfo.shuffleAlgorithm}`);
console.log(`  Supported Features: ${versionInfo.features.join(', ')}`);

// Algorithm version compatibility validation
function validateVersionCompatibility(expectedVersion) {
  const currentVersion = versionInfo.version;
  
  if (currentVersion !== expectedVersion) {
    console.warn(`Algorithm version mismatch: Current ${currentVersion}, Expected ${expectedVersion}`);
    return false;
  }
  
  console.log(`✅ Algorithm version compatibility confirmed: ${currentVersion}`);
  return true;
}

// Feature availability verification
const hasCharacterDiversity = versionInfo.features.includes('Character Diversity Optimization');
console.log(`Character diversity optimization: ${hasCharacterDiversity ? 'Available' : 'Not available'}`);

// Version validation timestamp logging
console.log(`Algorithm version validated at: ${new Date(versionInfo.timestamp).toISOString()}`);
```

## Configuration Objects

**`SECURITY_CONFIG`**

Core security settings for password generation.

```javascript
{
  minPasswordLength: 8,           // Minimum allowable password length constraint
  maxPasswordLength: 128,         // Maximum allowable password length constraint
  defaultPasswordLength: 16,      // Default password length for standard generation
  hashAlgorithm: 'SHA-512',      // Cryptographic hash algorithm (NIST FIPS 180-4 standard)
  hashIterations: 1000,          // Hash iteration count for security hardening
  masterSalt: null               // Optional cryptographic salt (string | null)
}
```

**Master Salt Configuration:** Optional cryptographic salt parameter for enhanced security. When configured, integrates additional entropy into every hash iteration cycle. Recommended for organization-wide deployment or user-specific password variant generation.

**`CHARACTER_SETS`**

Character sets used for password generation.

```javascript
{
  UPPERCASE: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  LOWERCASE: 'abcdefghijklmnopqrstuvwxyz', 
  NUMBERS: '0123456789',
  SYMBOLS: '!@#$%^&*()_+-=[]{}|;:,.<>?'
}
```

**`DEFAULT_PASSWORD_OPTIONS`**

Default options for password generation.

```javascript
{
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: true
}
```

**`INPUT_LIMITS`**

Maximum allowed lengths for user-supplied inputs. Enforced by `InputValidator` to prevent memory exhaustion from extremely large strings.

```javascript
{
  maxKeywordLength: 1000,      // Per-keyword character limit
  maxMasterSaltLength: 1000    // masterSalt character limit
}
```

**`STRENGTH_SCORE_CONFIG`**

Named constants for all weights, multipliers, and thresholds used by `PasswordAnalyzer.calculateStrengthScore()`. Each of the five score components (length, variety, entropy, diversity, balance) has a maximum of `maxComponentScore` (20), totalling 100.

```javascript
{
  maxComponentScore: 20,
  lengthMultiplier: 1.5,
  entropyMultiplier: 4,
  diversityVarietyWeight: 0.6,
  diversityRepetitionWeight: 0.4,
  diversityScoreNormalizer: 0.2,
  minRepetitionScoreForPenalty: 80,
  repetitionPenaltyFactor: 0.1,
  minDiversityRatio: 0.6,
  sequentialCharPenalty: 5,
  repeatedCharPenalty: 3,
  commonPatternPenalty: 10,
  minRecommendedLength: 12,
  minVarietyScore: 70
}
```

## Utility Functions

**`calculateMaxRepetitions(length)`**

Returns the maximum number of times any single character may appear in a password of the given length. Used internally by both `PasswordGenerator` and `PasswordAnalyzer` to enforce identical repetition limits.

```javascript
calculateMaxRepetitions(8)   // → 2
calculateMaxRepetitions(16)  // → 2
calculateMaxRepetitions(24)  // → 3
calculateMaxRepetitions(32)  // → 4
calculateMaxRepetitions(64)  // → 6
calculateMaxRepetitions(128) // → 12
```

**`mergeConfig(customConfig)`**

Merge custom configuration with default settings.

**Parameters:**
- `customConfig` (object): Custom configuration to merge

**Returns:** `object` - Merged configuration

