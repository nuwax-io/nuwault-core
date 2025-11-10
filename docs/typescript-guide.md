# TypeScript Support

Enterprise-grade TypeScript integration with comprehensive type definitions and strict type safety:

## Basic Imports

```typescript
import { 
  PasswordGenerator, 
  HashGenerator, 
  PasswordAnalyzer,
  validateAlgorithmCompatibility,
  quickCompatibilityCheck,
  validateFullAlgorithm,
  getAlgorithmVersion
} from '@nuwax-io/nuwault-core';

import type { 
  PasswordGenerationOptions, 
  PasswordGenerationResult,
  HashResult,
  CompatibilityResult,
  TestVectorResult,
  PasswordValidationResult,
  PasswordTestResult,
  AlgorithmVersion,
  TestVector
} from '@nuwax-io/nuwault-core';
```

## Interface Definitions

### Character Diversity Metadata

```typescript
// Character diversity analytics metadata interface
interface CharacterDiversityMetadata {
  totalUniqueCharacters: number;  // Total count of unique characters in generated password
  maxRepetitions: number;         // Maximum repetition count for any single character
  averageRepetitions: number;     // Statistical average repetition count per character
  diversityRatio: number;         // Character uniqueness ratio (0.0-1.0 range)
}
```

### Password Generation Result

```typescript
// Enhanced password generation result with comprehensive analytics metadata
interface PasswordGenerationResult {
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
    characterDiversity: CharacterDiversityMetadata;  // Advanced character diversity analytics
  };
}
```

### Algorithm Compatibility Results

```typescript
// Algorithm compatibility validation result interface
interface CompatibilityResult {
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

// Password generation compatibility validation result interface
interface PasswordValidationResult {
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
```

### Test Vector Definition

```typescript
// Algorithm test vector definition interface for compatibility validation
interface TestVector {
  readonly input: {
    keywords: string[];
    length: number;
    options?: Partial<PasswordOptions>;
    masterSalt?: string | null;
  };
  readonly expectedOutput: {
    password: string;
    hashPrefix: string; // SHA-512 hash prefix (first 16 characters)
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
```

### Algorithm Version Configuration

```typescript
// Algorithm version configuration interface
interface AlgorithmVersion {
  readonly version: string;
  readonly hashAlgorithm: 'SHA-512';
  readonly encoding: 'UTF-8';
  readonly jsNumberPrecision: 'IEEE-754';
  readonly shuffleAlgorithm: 'Fisher-Yates';
}
```

## Type-Safe Usage Examples

### Basic Password Generation with Types

```typescript
import NuwaultCore from '@nuwax-io/nuwault-core';
import type { PasswordGenerationResult, PasswordGenerationOptions } from '@nuwax-io/nuwault-core';

const generator = new NuwaultCore();

// Type-safe password generation with comprehensive options
const options: PasswordGenerationOptions = {
  length: 32,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: true,
  masterSalt: 'enterprise-salt'
};

const result: PasswordGenerationResult = await generator.generatePassword(
  ['github.com', 'username'], 
  options
);

// TypeScript provides comprehensive intellisense and strict type validation
console.log(`Generated password: ${result.password}`);
console.log(`Character diversity metrics: ${result.metadata.characterDiversity.totalUniqueCharacters}/${result.length}`);
console.log(`Algorithm execution time: ${result.metadata.generationTime}ms`);
```

### Algorithm Validation with Types

```typescript
import { 
  validateAlgorithmCompatibility, 
  quickCompatibilityCheck,
  validateFullAlgorithm,
  getAlgorithmVersion 
} from '@nuwax-io/nuwault-core';
import type { 
  CompatibilityResult, 
  AlgorithmVersion,
  TestVectorResult 
} from '@nuwax-io/nuwault-core';

// Type-safe algorithm validation with comprehensive error handling
async function validateWithTypeScript(): Promise<void> {
  // Comprehensive compatibility validation with detailed test vector results
  const validation: CompatibilityResult = await validateAlgorithmCompatibility();
  
  if (validation.isCompatible) {
    console.log(`✅ Algorithm validation successful: ${validation.testedVectors} test vectors validated`);
  } else {
    console.error(`❌ Algorithm validation failed: ${validation.failedVectors.length} test vectors failed`);
    validation.failedVectors.forEach((failure: TestVectorResult) => {
      console.error(`Test Vector ${failure.vectorIndex}: Expected ${failure.expected}, Actual ${failure.actual}`);
    });
  }
  
  // Production-ready rapid compatibility validation
  const isQuickCompatible: boolean = await quickCompatibilityCheck();
  
  // Complete algorithm stack validation for enterprise deployment
  const fullValidation = await validateFullAlgorithm();
  const isFullyCompatible: boolean = fullValidation.isFullyCompatible;
  
  // Algorithm version metadata retrieval
  const versionInfo: AlgorithmVersion = getAlgorithmVersion();
  console.log(`Algorithm version: ${versionInfo.version}`);
}
```

### Enterprise Configuration with Types

```typescript
import NuwaultCore from '@nuwax-io/nuwault-core';
import type { 
  SecurityConfig, 
  CharacterSets,
  PasswordGenerationResult 
} from '@nuwax-io/nuwault-core';

// Type-safe enterprise configuration interface for production deployment
interface EnterpriseConfig {
  SECURITY_CONFIG: SecurityConfig;
  CHARACTER_SETS?: Partial<CharacterSets>;
}

const enterpriseConfig: EnterpriseConfig = {
  SECURITY_CONFIG: {
    hashIterations: 5000,
    defaultPasswordLength: 32,
    minPasswordLength: 16,
    maxPasswordLength: 128,
    masterSalt: process.env.ORG_MASTER_SALT || null
  }
};

const enterpriseGenerator = new NuwaultCore(enterpriseConfig);

// Type-safe enterprise password generation with organizational context
async function generateEnterprisePassword(
  domain: string, 
  username: string
): Promise<PasswordGenerationResult> {
  return await enterpriseGenerator.generatePassword(
    [domain, username, 'enterprise'],
    {
      length: 32,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true
    }
  );
}
```

### Advanced Type Usage

```typescript
import type { 
  PasswordAnalysisResult,
  HashResult,
  CharacterDiversityMetadata 
} from '@nuwax-io/nuwault-core';

// Type-safe password analysis with comprehensive metadata extraction
async function analyzePasswordWithTypes(
  inputs: string[], 
  options: PasswordGenerationOptions
): Promise<{
  password: string;
  analysis: PasswordAnalysisResult;
  diversity: CharacterDiversityMetadata;
}> {
  const generator = new NuwaultCore();
  
  const result: PasswordGenerationResult = await generator.generatePassword(inputs, options);
  const analysis: PasswordAnalysisResult = generator.analyzePassword(result.password, options);
  
  return {
    password: result.password,
    analysis,
    diversity: result.metadata.characterDiversity
  };
}

// Type-safe cryptographic hash generation with SHA-512
async function generateHashWithTypes(inputs: string[]): Promise<HashResult> {
  const { generateHash } = await import('@nuwax-io/nuwault-core');
  const hash: string = await generateHash(inputs);
  
  return {
    hash,
    length: hash.length,
    algorithm: 'SHA-512' as const,
    iterations: 1000 // Default cryptographic iterations
  };
}
```

### Generic Type Usage

```typescript
// Generic validation result type for enterprise-grade error handling
type ValidationResult<T> = {
  isValid: boolean;
  data: T;
  errors?: string[];
  timestamp: number;
};

// Type-safe validation wrapper with comprehensive error handling
async function validatePassword<T extends PasswordGenerationOptions>(
  inputs: string[],
  options: T
): Promise<ValidationResult<PasswordGenerationResult>> {
  try {
    const generator = new NuwaultCore();
    const result = await generator.generatePassword(inputs, options);
    
    return {
      isValid: true,
      data: result,
      timestamp: Date.now()
    };
  } catch (error) {
    return {
      isValid: false,
      data: {} as PasswordGenerationResult,
      errors: [error instanceof Error ? error.message : 'Unknown cryptographic error'],
      timestamp: Date.now()
    };
  }
}
```

### Utility Types

```typescript
// Utility types for enterprise password operations
type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong' | 'excellent';
type EnvironmentType = 'node' | 'browser' | 'webworker';

// Runtime type guards for production validation
function isPasswordGenerationResult(obj: any): obj is PasswordGenerationResult {
  return obj && 
         typeof obj.password === 'string' && 
         typeof obj.length === 'number' &&
         obj.metadata &&
         typeof obj.metadata.hashIterations === 'number';
}

function isCompatibilityResult(obj: any): obj is CompatibilityResult {
  return obj &&
         typeof obj.isCompatible === 'boolean' &&
         typeof obj.algorithmVersion === 'string' &&
         typeof obj.testedVectors === 'number';
}

// Production-ready password generation with comprehensive error handling
async function safePasswordGeneration(inputs: string[]): Promise<PasswordGenerationResult | null> {
  try {
    const generator = new NuwaultCore();
    const result = await generator.generatePassword(inputs);
    
    if (isPasswordGenerationResult(result)) {
      return result;
    }
    
    console.error('Invalid password generation result structure');
    return null;
  } catch (error) {
    console.error('Password generation algorithm failed:', error);
    return null;
  }
}
```

## TypeScript Configuration

### tsconfig.json

Enterprise-grade TypeScript configuration for projects using @nuwax-io/nuwault-core:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "lib": ["ES2020", "DOM"],
    "strict": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "types": ["node"]
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

### Environment Types

```typescript
// environment.d.ts - Enterprise environment type definitions
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ORG_MASTER_SALT?: string;
      ORG_ID?: string;
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }
}

export {};
```

## Best Practices

### 1. Always Use Type Imports

```typescript
// ✅ Enterprise Best Practice: Use type-only imports for interface definitions
import type { PasswordGenerationOptions } from '@nuwax-io/nuwault-core';

// ❌ Avoid: Mixing value and type imports unnecessarily
import { PasswordGenerationOptions } from '@nuwax-io/nuwault-core';
```

### 2. Leverage Strict Mode

```typescript
// Enable strict mode in tsconfig.json for enterprise-grade type safety
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### 3. Use Type Guards

```typescript
// Runtime type validation guard for production environments
function isValidPasswordOptions(options: unknown): options is PasswordGenerationOptions {
  return typeof options === 'object' && 
         options !== null &&
         'length' in options &&
         typeof (options as any).length === 'number';
}
```

### 4. Define Custom Types

```typescript
// Custom application-specific types for enterprise integration
type UserPasswordRequest = {
  domain: string;
  username: string;
  requirements: PasswordGenerationOptions;
  userId: string;
};

type PasswordGenerationResponse = {
  password: string;
  metadata: PasswordGenerationResult['metadata'];
  generatedAt: Date;
  expiresAt?: Date;
};
```

## Troubleshooting

### Common TypeScript Issues

1. **Module Resolution Issues**
   ```typescript
   // Solution: Use explicit module imports for NuwaultCore components
   import { generatePassword } from '@nuwax-io/nuwault-core';
   ```

2. **Type Declaration Missing**
   ```typescript
   // Solution: Ensure @types packages are installed for Node.js environments
   npm install --save-dev @types/node
   ```

3. **Strict Mode Errors**
   ```typescript
   // Solution: Use optional chaining and null coalescing for safe property access
   const diversity = result.metadata?.characterDiversity?.totalUniqueCharacters ?? 0;
   ```

### IDE Configuration

For optimal TypeScript development experience with VSCode:

```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always"
}
``` 