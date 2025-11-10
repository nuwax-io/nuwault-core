# Usage Examples

## Basic Password Generation

```javascript
import NuwaultCore from '@nuwax-io/nuwault-core';

const generator = new NuwaultCore();

// Standard password generation with deterministic output
const password = await generator.generatePassword(['github.com', 'username']);
console.log(password); // Deterministic: identical inputs always produce identical results

// Custom length and character set configuration
const customPassword = await generator.generatePassword(
  ['secure-site.com', 'user@email.com'], 
  { 
    length: 24, 
    includeSymbols: false // Alphanumeric characters only (excludes symbols)
  }
);
```

## Input Validation Examples

```javascript
import { generatePassword } from '@nuwax-io/nuwault-core';

// ✅ Valid input patterns for password generation
await generatePassword(['github.com', 'user@email.com']); // Valid: domain and identifier
await generatePassword(['site', 'username', 'key']); // Valid: multiple context identifiers
await generatePassword(['my-site']); // Valid: single identifier (minimum 3 chars post-normalization)

// ❌ Invalid input patterns (will throw validation errors)
await generatePassword([]); // Error: No inputs provided
await generatePassword(['', '  ']); // Error: All inputs are empty after normalization
await generatePassword(['ab']); // Error: Combined inputs too short after normalization
await generatePassword([null, undefined]); // Error: All inputs are empty or null

// ❌ Length validation constraints
await generatePassword(['test'], { length: 7 }); // Error: Length must be 8-128 characters
await generatePassword(['test'], { length: 200 }); // Error: Length must be 8-128 characters
```

## Advanced Configuration

```javascript
import NuwaultCore from '@nuwax-io/nuwault-core';

const generator = new NuwaultCore({
  SECURITY_CONFIG: {
    hashIterations: 5000,  // Enhanced security with increased iterations
    defaultPasswordLength: 64,
    masterSalt: 'enterprise-salt-key' // Optional master salt for additional entropy
  }
});

const password = await generator.generatePassword(
  ['secure-site.com', 'my-email@domain.com', 'master-password'],
  {
    length: 64,
    includeSymbols: true
  }
);
```

## Master Salt Usage

Master salt can be used in **two different ways**. Choose the method that best fits your use case:

### Method 1: Global Salt (Constructor Configuration)
**Best for:** Consistent salt across all password generations in an application

```javascript
import NuwaultCore from '@nuwax-io/nuwault-core';

// Configure global master salt for consistent application-wide password generation
const generator = new NuwaultCore({
  SECURITY_CONFIG: {
    masterSalt: 'enterprise-application-salt'
  }
});

// All password generations will inherit the global master salt
const password1 = await generator.generatePassword(['github.com', 'user1']);
const password2 = await generator.generatePassword(['github.com', 'user2']);
// Both passwords use 'enterprise-application-salt' as additional entropy
```

### Method 2: Per-Call Salt (Options Parameter)
**Best for:** Dynamic salt values or different salts for different operations

```javascript
import NuwaultCore from '@nuwax-io/nuwault-core';

const generator = new NuwaultCore(); // No global salt configuration

// Apply different master salts for role-based password generation
const userPassword = await generator.generatePassword(
  ['github.com', 'user@email.com'],
  { masterSalt: 'user-role-specific-salt' }
);

const adminPassword = await generator.generatePassword(
  ['github.com', 'admin@email.com'],
  { masterSalt: 'admin-role-specific-salt' }
);
```

### Method 3: Combined Usage (Override Pattern)
**Best for:** Default salt with occasional overrides

```javascript
import NuwaultCore from '@nuwax-io/nuwault-core';

// Configure default master salt in constructor
const generator = new NuwaultCore({
  SECURITY_CONFIG: {
    masterSalt: 'default-application-salt'  // Default salt for standard operations
  }
});

// Standard password generation inherits default salt
const normalPassword = await generator.generatePassword(['site.com', 'user']);
// Uses 'default-application-salt' as configured

// Override default salt for specific security contexts
const specialPassword = await generator.generatePassword(
  ['secure-site.com', 'admin'],
  { masterSalt: 'high-security-admin-salt' }  // Overrides default salt
);
// Uses 'high-security-admin-salt' instead of default configuration
```

### Real-World Examples

**Organization-wide Salt:**
```javascript
// Organization-wide consistent salt for all users
const orgGenerator = new NuwaultCore({
  SECURITY_CONFIG: {
    masterSalt: 'acme-corp-enterprise-salt',
    hashIterations: 2000
  }
});
```

**User-specific Salts:**
```javascript
// Dynamic user-specific salt generation for individual entropy
const generator = new NuwaultCore();

async function generateUserPassword(userId, site, username) {
  return await generator.generatePassword([site, username], {
    masterSalt: `user-${userId}-salt-${new Date().getFullYear()}`
  });
}

const user123Password = await generateUserPassword('123', 'github.com', 'username');
const user456Password = await generateUserPassword('456', 'github.com', 'username');
// Different salts produce different passwords even with identical inputs
```

**Environment-specific Salts:**
```javascript
// Environment-specific salt configuration for deployment isolation
const config = {
  development: { masterSalt: 'dev-environment-salt' },
  staging: { masterSalt: 'staging-environment-salt' },
  production: { masterSalt: 'prod-environment-salt' }
};

const generator = new NuwaultCore({
  SECURITY_CONFIG: config[process.env.NODE_ENV]
});
```

> **Priority Rule:** When both constructor and options provide masterSalt, the **options parameter always takes precedence** for that specific call.

## Password Analysis and Quality Assessment

```javascript
import NuwaultCore from '@nuwax-io/nuwault-core';

const generator = new NuwaultCore();

// Generate password with comprehensive metadata analysis
const result = await generator.generatePassword(['test-site.com', 'user@email.com'], { 
  length: 32 
});

// Enhanced result structure includes character diversity metrics
console.log(`Generated Password: ${result.password}`);
console.log(`Algorithm Execution Time: ${result.metadata.generationTime}ms`);
console.log(`Cryptographic Hash Iterations: ${result.metadata.hashIterations}`);

// Character Distribution Statistical Analysis
const dist = result.metadata.characterDistribution;
console.log(`Character Distribution Analysis:`);
console.log(`  Uppercase Letters: ${dist.uppercase} chars`);
console.log(`  Lowercase Letters: ${dist.lowercase} chars`);
console.log(`  Numeric Characters: ${dist.numbers} chars`);
console.log(`  Symbol Characters: ${dist.symbols} chars`);

// Advanced Character Diversity Metrics
const diversity = result.metadata.characterDiversity;
console.log(`Character Diversity Analysis:`);
console.log(`  Unique Characters: ${diversity.totalUniqueCharacters}/${result.length}`);
console.log(`  Maximum Repetitions: ${diversity.maxRepetitions}`);
console.log(`  Average Repetitions: ${diversity.averageRepetitions}`);

// Calculate diversity percentage for quality assessment
const diversityPercentage = (diversity.totalUniqueCharacters / result.length) * 100;
console.log(`  Diversity Percentage: ${diversityPercentage.toFixed(1)}%`);

// Legacy analysis method for backward compatibility
const analysis = generator.analyzePassword(result.password, {
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: true
});

console.log(`Overall Quality Rating: ${analysis.distribution}`);
```

## Character Diversity Analysis Examples

```javascript
import NuwaultCore from '@nuwax-io/nuwault-core';

const generator = new NuwaultCore();

// Comparative diversity analysis across multiple password lengths
const lengths = [12, 24, 48, 64];

for (const length of lengths) {
  const result = await generator.generatePassword(['test-site.com', 'user'], { length });
  const diversity = result.metadata.characterDiversity;
  
  console.log(`\nLength ${length}:`);
  console.log(`  Password: ${result.password}`);
  console.log(`  Unique chars: ${diversity.totalUniqueCharacters}/${length} (${(diversity.totalUniqueCharacters/length*100).toFixed(1)}%)`);
  console.log(`  Max repetitions: ${diversity.maxRepetitions}`);
  console.log(`  Avg repetitions: ${diversity.averageRepetitions}`);
  
  // Calculate theoretical maximum repetitions for length-based compliance
  const maxAllowed = length <= 8 ? 2 : 
                    length <= 16 ? Math.max(2, Math.floor(length/6)) :
                    length <= 32 ? Math.max(2, Math.floor(length/8)) :
                    Math.max(3, Math.floor(length/10));
  
  console.log(`  Max allowed repetitions: ${maxAllowed}`);
  console.log(`  Repetition compliance: ${diversity.maxRepetitions <= maxAllowed ? '✅' : '❌'}`);
}

// Comprehensive password quality analysis function
async function analyzePasswordQuality(inputs, options = {}) {
  const result = await generator.generatePassword(inputs, options);
  const { characterDistribution, characterDiversity } = result.metadata;
  
  // Calculate character distribution balance for quality assessment
  const total = Object.values(characterDistribution).reduce((a, b) => a + b, 0);
  const distribution = Object.entries(characterDistribution)
    .map(([type, count]) => ({ type, count, percentage: (count/total*100).toFixed(1) }));
  
  console.log(`\nPassword Quality Analysis:`);
  console.log(`Password: ${result.password}`);
  console.log(`\nCharacter Distribution:`);
  distribution.forEach(({ type, count, percentage }) => 
    console.log(`  ${type}: ${count} chars (${percentage}%)`));
  
  console.log(`\nDiversity Metrics:`);
  console.log(`  Unique Characters: ${characterDiversity.totalUniqueCharacters}/${result.length}`);
  console.log(`  Diversity Ratio: ${(characterDiversity.totalUniqueCharacters/result.length).toFixed(3)}`);
  console.log(`  Max Repetitions: ${characterDiversity.maxRepetitions}`);
  console.log(`  Avg Repetitions: ${characterDiversity.averageRepetitions}`);
  
  // Quality assessment based on diversity metrics
  const diversityRatio = characterDiversity.totalUniqueCharacters / result.length;
  const qualityScore = diversityRatio >= 0.8 ? 'Excellent' :
                      diversityRatio >= 0.6 ? 'Good' :
                      diversityRatio >= 0.4 ? 'Fair' : 'Poor';
  
  console.log(`  Overall Diversity: ${qualityScore}`);
  
  return result;
}

// Example usage with different password configurations
await analyzePasswordQuality(['github.com', 'username'], { length: 32 });
await analyzePasswordQuality(['secure-site.com', 'admin'], { length: 64 });
```

## Advanced Hash Generation

```javascript
import { generateHash, normalizeInput } from '@nuwax-io/nuwault-core';

// Direct cryptographic hash generation
const inputs = ['GitHub.COM', '  user@EMAIL.com  ', 'Master-Key'];

// Manual input normalization (optional - generateHash performs this automatically)
const normalized = inputs.map(normalizeInput);
console.log('Normalized inputs:', normalized); // ['github.com', 'user@email.com', 'master-key']

// Generate SHA-512 hash with configurable iterations
const hash = await generateHash(inputs);
console.log(`Generated hash: ${hash}`); // 128-character hexadecimal string
console.log(`Hash length: ${hash.length}`); // 128

// Cryptographic hash is deterministic - identical inputs always produce identical hash
const hash2 = await generateHash(inputs);
console.log(`Hashes match: ${hash === hash2}`); // true
```

## Error Handling Best Practices

```javascript
import NuwaultCore from '@nuwax-io/nuwault-core';

const generator = new NuwaultCore();

async function generateSecurePassword(inputs, options = {}) {
  try {
    // Validate inputs before processing algorithm
    if (!inputs || inputs.length === 0) {
      throw new Error('At least one input is required');
    }
    
    // Generate password with comprehensive error handling
    const password = await generator.generatePassword(inputs, {
      length: 16,
      ...options
    });
    
    // Analyze password quality metrics
    const analysis = generator.analyzePassword(password, options);
    
    if (analysis.distribution === 'poor') {
      console.warn('Generated password has poor character distribution');
    }
    
    return {
      password,
      quality: analysis.distribution,
      analysis
    };
    
  } catch (error) {
    console.error('Password generation failed:', error.message);
    throw error;
  }
}

// Usage with comprehensive error handling
try {
  const result = await generateSecurePassword(['github.com', 'username'], {
    length: 24,
    includeSymbols: true
  });
  
  console.log(`Password: ${result.password}`);
  console.log(`Quality: ${result.quality}`);
  
} catch (error) {
  console.error('Failed to generate password:', error.message);
}
```

## Algorithm Validation Usage Examples

```javascript
import { 
  validateAlgorithmCompatibility,
  quickCompatibilityCheck,
  validateFullAlgorithm,
  getAlgorithmVersion,
  ALGORITHM_TEST_VECTORS
} from '@nuwax-io/nuwault-core';

// Example 1: Production-Ready Health Check
async function performHealthCheck() {
  console.log('🔍 Performing algorithm health check...');
  
  try {
    const isHealthy = await quickCompatibilityCheck();
    
    if (isHealthy) {
      console.log('✅ Algorithm is healthy and compatible');
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } else {
      console.error('❌ Algorithm compatibility issues detected');
      return { status: 'unhealthy', timestamp: new Date().toISOString() };
    }
  } catch (error) {
    console.error('💥 Health check failed:', error.message);
    return { status: 'error', error: error.message, timestamp: new Date().toISOString() };
  }
}

// Example 2: Comprehensive Algorithm Validation Report
async function generateValidationReport() {
  console.log('📊 Generating comprehensive validation report...');
  
  const [compatibility, version] = await Promise.all([
    validateAlgorithmCompatibility(),
    getAlgorithmVersion()
  ]);
  
  const report = {
    timestamp: new Date().toISOString(),
    algorithmVersion: version.version,
    features: version.features,
    environment: {
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Node.js',
      nodeVersion: typeof process !== 'undefined' ? process.version : 'Browser'
    },
    validation: {
      overall: compatibility.overall.isFullyCompatible,
      hashGeneration: {
        compatible: compatibility.hashGeneration.isCompatible,
        passed: compatibility.hashGeneration.passedVectors,
        total: compatibility.hashGeneration.testedVectors,
        failures: compatibility.hashGeneration.failedVectors
      },
      passwordGeneration: {
        compatible: compatibility.passwordGeneration.isCompatible,
        passed: compatibility.passwordGeneration.passedVectors,
        total: compatibility.passwordGeneration.testedVectors,
        failures: compatibility.passwordGeneration.failedVectors
      }
    }
  };
  
  console.log('📋 Validation Report:');
  console.log(`   Algorithm Version: ${report.algorithmVersion}`);
  console.log(`   Overall Compatible: ${report.validation.overall ? '✅' : '❌'}`);
  console.log(`   Hash Generation: ${report.validation.hashGeneration.passed}/${report.validation.hashGeneration.total} passed`);
  console.log(`   Password Generation: ${report.validation.passwordGeneration.passed}/${report.validation.passwordGeneration.total} passed`);
  
  if (report.validation.hashGeneration.failures.length > 0) {
    console.log('🔍 Hash Generation Failures:');
    report.validation.hashGeneration.failures.forEach(failure => {
      console.log(`   Vector ${failure.vectorIndex}: expected ${failure.expected}, got ${failure.actual}`);
    });
  }
  
  if (report.validation.passwordGeneration.failures.length > 0) {
    console.log('🔍 Password Generation Failures:');
    report.validation.passwordGeneration.failures.forEach(failure => {
      console.log(`   Vector ${failure.vectorIndex}: ${failure.differences.join(', ')}`);
    });
  }
  
  return report;
}

// Example 3: Continuous Algorithm Monitoring
async function setupContinuousMonitoring(intervalMinutes = 60) {
  console.log(`🔄 Setting up continuous monitoring (${intervalMinutes} minute intervals)...`);
  
  let consecutiveFailures = 0;
  const maxFailures = 3;
  
  const monitor = async () => {
    try {
      const isHealthy = await quickCompatibilityCheck();
      
      if (isHealthy) {
        consecutiveFailures = 0;
        console.log(`✅ ${new Date().toISOString()} - Algorithm health check passed`);
      } else {
        consecutiveFailures++;
        console.error(`❌ ${new Date().toISOString()} - Algorithm health check failed (${consecutiveFailures}/${maxFailures})`);
        
        if (consecutiveFailures >= maxFailures) {
          console.error('🚨 CRITICAL: Algorithm compatibility has failed multiple times!');
          // In production environment: send alert, create incident, notify on-call team
        }
      }
    } catch (error) {
      consecutiveFailures++;
      console.error(`💥 ${new Date().toISOString()} - Monitoring error: ${error.message}`);
    }
  };
  
  // Run initial health check
  await monitor();
  
  // Schedule periodic health checks
  const intervalId = setInterval(monitor, intervalMinutes * 60 * 1000);
  
  return {
    stop: () => clearInterval(intervalId),
    runNow: monitor
  };
}

// Example 4: CI/CD Integration Validation Check
async function cicdValidationCheck() {
  console.log('🚀 Running CI/CD algorithm validation...');
  
  const validation = await validateFullAlgorithm();
  
  if (validation.isFullyCompatible) {
    console.log('✅ CI/CD validation passed - safe to deploy');
    process.exit(0);
  } else {
    console.error('❌ CI/CD validation failed - deployment blocked');
    console.error(`   Hash Compatibility: ${validation.hashCompatibility ? '✅' : '❌'}`);
    console.error(`   Password Compatibility: ${validation.passwordCompatibility ? '✅' : '❌'}`);
    console.error(`   Algorithm Version: ${validation.algorithmVersion}`);
    process.exit(1);
  }
}

// Example 5: Algorithm Test Vector Analysis
async function analyzeTestVectors() {
  console.log('🧪 Analyzing algorithm test vectors...');
  
  console.log(`📊 Test Vector Statistics:`);
  console.log(`   Total Vectors: ${ALGORITHM_TEST_VECTORS.length}`);
  
  for (let i = 0; i < ALGORITHM_TEST_VECTORS.length; i++) {
    const vector = ALGORITHM_TEST_VECTORS[i];
    console.log(`\n🔬 Vector ${i + 1}:`);
    console.log(`   Keywords: ${vector.input.keywords.join(', ')}`);
    console.log(`   Length: ${vector.input.length}`);
    console.log(`   Expected Password: ${vector.expectedOutput.password}`);
    console.log(`   Expected Hash Prefix: ${vector.expectedOutput.hashPrefix}`);
    console.log(`   Expected Diversity:`);
    console.log(`     - Unique Characters: ${vector.expectedOutput.characterDiversity.totalUniqueCharacters}`);
    console.log(`     - Max Repetitions: ${vector.expectedOutput.characterDiversity.maxRepetitions}`);
    console.log(`     - Diversity Ratio: ${vector.expectedOutput.characterDiversity.diversityRatio}`);
  }
}

// Example Usage Orchestration
async function runExamples() {
  // Run production health check
  await performHealthCheck();
  
  // Generate comprehensive validation report
  await generateValidationReport();
  
  // Setup continuous monitoring (in production environment)
  // const monitoring = await setupContinuousMonitoring(30); // Every 30 minutes
  
  // Analyze algorithm test vectors
  await analyzeTestVectors();
  
  // CI/CD validation check (uncomment in CI environment)
  // await cicdValidationCheck();
}

// Execute examples
// runExamples().catch(console.error);
```

## Version Management Usage Examples

```javascript
import { 
  getAlgorithmVersion,
  validateAlgorithmCompatibility,
  quickCompatibilityCheck,
  ALGORITHM_VERSION 
} from '@nuwax-io/nuwault-core';

// Example 1: Comprehensive Library Health and Version Check
async function checkLibraryHealth() {
  console.log('🔍 Checking library health and version info...');
  
  // Get detailed version information
  const versionInfo = getAlgorithmVersion();
  console.log('📋 Library Version Information:');
  console.log(`   Version: ${versionInfo.version}`);
  console.log(`   Hash Algorithm: ${versionInfo.hashAlgorithm}`);
  console.log(`   Encoding: ${versionInfo.encoding}`);
  console.log(`   Shuffle Algorithm: ${versionInfo.shuffleAlgorithm}`);
  console.log(`   Features: ${versionInfo.features.join(', ')}`);
  
  // Quick health check
  const isHealthy = await quickCompatibilityCheck();
  console.log(`\n🏥 Health Status: ${isHealthy ? '✅ Healthy' : '❌ Issues Detected'}`);
  
  // Comprehensive validation
  const validation = await validateAlgorithmCompatibility();
  console.log('\n📊 Detailed Validation:');
  console.log(`   Overall Compatible: ${validation.overall.isFullyCompatible ? '✅' : '❌'}`);
  console.log(`   Hash Generation: ${validation.hashGeneration.passedVectors}/${validation.hashGeneration.testedVectors} tests passed`);
  console.log(`   Password Generation: ${validation.passwordGeneration.passedVectors}/${validation.passwordGeneration.testedVectors} tests passed`);
  
  return {
    version: versionInfo.version,
    healthy: isHealthy,
    fullyCompatible: validation.overall.isFullyCompatible
  };
}

// Example 2: Cross-Environment Version Compatibility Validation
async function checkCrossEnvironmentCompatibility() {
  console.log('🌐 Testing cross-environment compatibility...');
  
  const environments = [
    { name: 'Node.js', detected: typeof process !== 'undefined' },
    { name: 'Browser', detected: typeof window !== 'undefined' },
    { name: 'Web Worker', detected: typeof importScripts === 'function' }
  ];
  
  const currentEnv = environments.find(env => env.detected)?.name || 'Unknown';
  console.log(`📍 Current Environment: ${currentEnv}`);
  
  // Test algorithm compatibility in current environment
  const validation = await validateAlgorithmCompatibility();
  
  console.log('\n🧪 Environment-Specific Results:');
  console.log(`   Environment: ${validation.hashGeneration.environment.userAgent || validation.hashGeneration.environment.nodeVersion || 'Unknown'}`);
  console.log(`   Timestamp: ${new Date(validation.hashGeneration.environment.timestamp).toISOString()}`);
  console.log(`   Hash Generation Compatible: ${validation.hashGeneration.isCompatible ? '✅' : '❌'}`);
  console.log(`   Password Generation Compatible: ${validation.passwordGeneration.isCompatible ? '✅' : '❌'}`);
  
  if (!validation.overall.isFullyCompatible) {
    console.log('\n⚠️ Compatibility Issues Detected:');
    [...validation.hashGeneration.failedVectors, ...validation.passwordGeneration.failedVectors]
      .forEach(failure => {
        console.log(`   - Vector ${failure.vectorIndex}: ${failure.expected} ≠ ${failure.actual}`);
      });
  }
  
  return validation;
}

// Example 3: Production Environment Validator Class
class ProductionValidator {
  constructor() {
    this.validationHistory = [];
    this.consecutiveFailures = 0;
    this.maxFailures = 3;
  }
  
  async performValidation() {
    const timestamp = new Date().toISOString();
    console.log(`🔍 [${timestamp}] Starting production validation...`);
    
    try {
      // Quick compatibility check first
      const quickResult = await quickCompatibilityCheck();
      
      if (!quickResult) {
        this.consecutiveFailures++;
        console.error(`❌ [${timestamp}] Quick compatibility check failed (${this.consecutiveFailures}/${this.maxFailures})`);
        
        if (this.consecutiveFailures >= this.maxFailures) {
          await this.handleCriticalFailure();
        }
        
        return { status: 'failed', type: 'quick-check', timestamp };
      }
      
      // Full validation if quick check passes
      const fullValidation = await validateAlgorithmCompatibility();
      
      if (fullValidation.overall.isFullyCompatible) {
        this.consecutiveFailures = 0;
        console.log(`✅ [${timestamp}] Production validation passed`);
        
        const result = {
          status: 'passed',
          timestamp,
          version: fullValidation.overall.algorithmVersion,
          hashTests: `${fullValidation.hashGeneration.passedVectors}/${fullValidation.hashGeneration.testedVectors}`,
          passwordTests: `${fullValidation.passwordGeneration.passedVectors}/${fullValidation.passwordGeneration.testedVectors}`
        };
        
        this.validationHistory.push(result);
        return result;
      } else {
        this.consecutiveFailures++;
        console.error(`❌ [${timestamp}] Full validation failed (${this.consecutiveFailures}/${this.maxFailures})`);
        
        const result = {
          status: 'failed',
          type: 'full-validation',
          timestamp,
          failures: [
            ...fullValidation.hashGeneration.failedVectors,
            ...fullValidation.passwordGeneration.failedVectors
          ]
        };
        
        this.validationHistory.push(result);
        
        if (this.consecutiveFailures >= this.maxFailures) {
          await this.handleCriticalFailure();
        }
        
        return result;
      }
      
    } catch (error) {
      this.consecutiveFailures++;
      console.error(`💥 [${timestamp}] Validation error: ${error.message}`);
      
      const result = {
        status: 'error',
        timestamp,
        error: error.message
      };
      
      this.validationHistory.push(result);
      return result;
    }
  }
  
  async handleCriticalFailure() {
    console.error('🚨 CRITICAL: Algorithm validation has failed multiple consecutive times!');
    console.error('🔧 Recommended actions:');
    console.error('   1. Check for environment changes or updates');
    console.error('   2. Verify algorithm version consistency');
    console.error('   3. Run manual validation: npm run validate');
    console.error('   4. Contact development team if issues persist');
    
    // In production environments, you might:
    // - Send alert to monitoring system
    // - Create incident ticket
    // - Trigger fallback mechanisms
    // - Notify on-call team
  }
  
  getValidationSummary() {
    const recentValidations = this.validationHistory.slice(-10);
    const passedCount = recentValidations.filter(v => v.status === 'passed').length;
    const failedCount = recentValidations.filter(v => v.status === 'failed').length;
    const errorCount = recentValidations.filter(v => v.status === 'error').length;
    
    return {
      totalValidations: recentValidations.length,
      passedCount,
      failedCount,
      errorCount,
      successRate: recentValidations.length > 0 ? (passedCount / recentValidations.length * 100).toFixed(1) : 0,
      consecutiveFailures: this.consecutiveFailures,
      lastValidation: recentValidations[recentValidations.length - 1],
      history: recentValidations
    };
  }
}

// Example 4: Version Migration Helper Function
async function checkVersionMigration(fromVersion, toVersion) {
  console.log(`🔄 Checking version migration: ${fromVersion} → ${toVersion}`);
  
  const currentVersion = getAlgorithmVersion();
  console.log(`📍 Current Version: ${currentVersion.version}`);
  
  if (currentVersion.version !== toVersion) {
    console.warn(`⚠️ Version mismatch: Expected ${toVersion}, got ${currentVersion.version}`);
    console.log('💡 To fix: Update ALGORITHM_VERSION in src/config.ts and run npm run version-sync -- --fix');
    return false;
  }
  
  // Validate algorithm compatibility with new version
  const validation = await validateAlgorithmCompatibility();
  
  if (validation.overall.isFullyCompatible) {
    console.log('✅ Version migration validation passed');
    console.log(`   Algorithm tests: ${validation.hashGeneration.passedVectors + validation.passwordGeneration.passedVectors} passed`);
    return true;
  } else {
    console.error('❌ Version migration validation failed');
    console.error('   Failed test vectors:', [
      ...validation.hashGeneration.failedVectors,
      ...validation.passwordGeneration.failedVectors
    ]);
    return false;
  }
}

// Version Management Usage Examples
async function runVersionManagementExamples() {
  // Basic health check
  await checkLibraryHealth();
  
  // Environment compatibility test
  await checkCrossEnvironmentCompatibility();
  
  // Production validation
  const validator = new ProductionValidator();
  await validator.performValidation();
  console.log('Validation Summary:', validator.getValidationSummary());
  
  // Version migration check
  await checkVersionMigration('1.0.0', '1.0.0');
}

// Execute version management examples
// runVersionManagementExamples().catch(console.error);
```

## Enterprise Usage Examples

```javascript
import NuwaultCore, { 
  validateAlgorithmCompatibility,
  getAlgorithmVersion 
} from '@nuwax-io/nuwault-core';

// Enterprise-grade password manager class for organizational use
class EnterprisePasswordManager {
  constructor(organizationId, config = {}) {
    this.organizationId = organizationId;
    this.generator = new NuwaultCore({
      SECURITY_CONFIG: {
        hashIterations: 5000,
        defaultPasswordLength: 32,
        masterSalt: `org-${organizationId}-${new Date().getFullYear()}`,
        ...config.SECURITY_CONFIG
      }
    });
    
    // Validate algorithm on initialization
    this.validateOnInit();
  }
  
  async validateOnInit() {
    const isCompatible = await validateAlgorithmCompatibility();
    if (!isCompatible.overall.isFullyCompatible) {
      throw new Error('Enterprise password manager initialization failed: algorithm incompatibility detected');
    }
    
    const version = getAlgorithmVersion();
    console.log(`✅ Enterprise Password Manager initialized`);
    console.log(`   Organization: ${this.organizationId}`);
    console.log(`   Algorithm Version: ${version.version}`);
  }
  
  async generateStandardPassword(domain, username, options = {}) {
    const defaultOptions = {
      length: 32,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true
    };
    
    const result = await this.generator.generatePassword(
      [domain, username, this.organizationId],
      { ...defaultOptions, ...options }
    );
    
    // Validate enterprise standards
    this.validateEnterpriseStandards(result);
    
    return result;
  }
  
  validateEnterpriseStandards(result) {
    const { characterDiversity } = result.metadata;
    
    // Enterprise security requirements
    const minDiversityRatio = 0.7;
    const maxRepetitions = Math.floor(result.length / 8);
    
    if (characterDiversity.diversityRatio < minDiversityRatio) {
      console.warn(`⚠️ Password diversity below enterprise standard: ${characterDiversity.diversityRatio} < ${minDiversityRatio}`);
    }
    
    if (characterDiversity.maxRepetitions > maxRepetitions) {
      console.warn(`⚠️ Character repetition exceeds enterprise standard: ${characterDiversity.maxRepetitions} > ${maxRepetitions}`);
    }
    
    return {
      diversityCompliant: characterDiversity.diversityRatio >= minDiversityRatio,
      repetitionCompliant: characterDiversity.maxRepetitions <= maxRepetitions
    };
  }
  
  async generateAuditReport() {
    const [validation, version] = await Promise.all([
      validateAlgorithmCompatibility(),
      getAlgorithmVersion()
    ]);
    
    return {
      timestamp: new Date().toISOString(),
      organizationId: this.organizationId,
      algorithmVersion: version.version,
      compliance: {
        algorithmStable: validation.overall.isFullyCompatible,
        hashGeneration: validation.hashGeneration.isCompatible,
        passwordGeneration: validation.passwordGeneration.isCompatible
      },
      security: {
        features: version.features,
        hashIterations: this.generator.SECURITY_CONFIG?.hashIterations || 1000
      }
    };
  }
}

// Enterprise Usage Example
async function enterpriseExample() {
  try {
    const passwordManager = new EnterprisePasswordManager('acme-corp');
    
    // Generate enterprise password
    const result = await passwordManager.generateStandardPassword(
      'secure-portal.acme.com',
      'john.doe@acme.com'
    );
    
    console.log(`Generated Password: ${result.password}`);
    console.log(`Character Diversity: ${result.metadata.characterDiversity.totalUniqueCharacters}/${result.length} (${(result.metadata.characterDiversity.diversityRatio * 100).toFixed(1)}%)`);
    
    // Generate audit report
    const auditReport = await passwordManager.generateAuditReport();
    console.log('📊 Enterprise Audit Report:', JSON.stringify(auditReport, null, 2));
    
  } catch (error) {
    console.error('Enterprise password manager error:', error.message);
  }
} 