[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Test Coverage](https://img.shields.io/badge/coverage-vitest-green.svg?style=flat-square&logo=vitest)](https://vitest.dev/)
[![Security](https://img.shields.io/badge/Security-SHA--512-red.svg?style=flat-square&logo=security)](SECURITY.md)

> **Nuwault Core** - Enterprise-grade deterministic password generation library built with TypeScript. Transform your memorable keywords into cryptographically secure passwords with guaranteed consistency across all platforms and devices. Featuring advanced character diversity algorithms, repetition control, and balanced distribution for maximum security without compromising usability.

### Key Highlights
- **Enterprise Security**: SHA-512 cryptographic hashing with 1000+ configurable iterations, unique salt per iteration, timing attack resistance, and optional master salt support
- **Deterministic Generation**: Same inputs always produce identical passwords across all platforms (Node.js, browsers, different OS) with test vector validation
- **Privacy-First**: Zero data collection, works completely offline, no external dependencies, uses native Web Crypto API
- **Performance Optimized**: Configurable hash iterations (fast: 100, secure: 1000, maximum: 5000+) for different security needs
- **Advanced Character Analytics**: Built-in password strength analysis, entropy calculation, character diversity metrics, repetition control, and balanced distribution algorithms
- **Cross-Platform Validated**: Node.js 16+, modern browsers (Chrome 60+, Firefox 55+, Safari 11+), Web Workers, Electron, with automated compatibility testing
- **Developer-Friendly**: Full TypeScript support, comprehensive type definitions, intellisense, both modern and legacy JavaScript APIs
- **Production Ready**: Algorithm stability validation, health check endpoints, regression testing, version synchronization, and deployment validation
- **Highly Customizable**: Flexible character sets, adaptive distribution algorithms, security configurations, and password composition options
- **Algorithm Validation**: Comprehensive test vector validation, cross-platform consistency checks, and version tracking with compatibility guarantees
- **Stability Monitoring**: Automated regression detection, algorithm change detection, and deployment safety validation
- **Modular Design**: Use individual functions (generatePassword, analyzePassword) or complete NuwaultCore class
- **Dual API Support**: Modern TypeScript API with full type safety and legacy JavaScript API for backward compatibility

### Perfect For
- **Enterprise Applications**: Password managers, authentication systems, security platforms requiring deterministic password generation
- **Personal Security Tools**: Generate unique, memorable passwords for each service without storing them locally
- **Gaming & Simulation**: Consistent seed generation for deterministic content, procedural generation, and reproducible randomness
- **Web Applications**: Client-side password generation with zero server dependencies and offline capability
- **Progressive Web Apps**: Offline password generation for enhanced privacy and cross-device synchronization
- **Developer & Testing Tools**: Reproducible password generation for unit tests, integration tests, and CI/CD pipelines
- **CLI Tools & Scripts**: Deterministic password generation for automation, deployment scripts, and infrastructure tools

### Quality Assurance
- **Comprehensive Testing**: 28+ test cases covering hash generation, password generation, character diversity, and cross-platform compatibility
- **Character Diversity Algorithms**: Dynamic repetition control (8-char: max 2 reps, 32-char: max 4 reps), balanced distribution, and entropy maximization
- **Adaptive Distribution**: Length-based strategies (short: equal, medium: 25/35/20/20, long: 20/35/20/25) for optimal security
- **Algorithm Stability**: Test vector validation across Node.js, browsers, and Electron with automated regression detection
- **Cryptographic Standards**: SHA-512 (NIST FIPS 180-4), Web Crypto API (W3C standard), IEEE-754 number precision
- **Complete Documentation**: API reference, usage examples, TypeScript integration guide, and production deployment guide

### Extended Documentation
- [Developer Guide](docs/developer-guide.md) - Complete API reference and configuration
- [Usage Examples](docs/usage-examples.md) - Comprehensive examples and patterns
- [Production Guide](docs/production-guide.md) - Enterprise deployment and monitoring
- [TypeScript Guide](docs/typescript-guide.md) - Full TypeScript integration guide

## Table of Contents

**Getting Started**
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)

**Core Features**
- [Algorithm Overview](#algorithm-overview)
- [Security & Validation](#security--validation)

**Development**
- [Developer Guide](#developer-guide)
- [TypeScript Support](#typescript-support)
- [Browser Support](#browser-support)

**Production & Examples**
- [Production Features](#production-features)
- [Usage Examples](#usage-examples)

**Project Info**
- [License](#license)
- [Contributing](#contributing)
- [Security Policy](#security-policy)
- [Changelog](#changelog)

---

## Installation

```bash
npm install @nuwax-io/nuwault-core
```

## Quick Start

### Using the Main Class (Recommended)

```javascript
import NuwaultCore from '@nuwax-io/nuwault-core';

const generator = new NuwaultCore();

// Generate a password
const password = await generator.generatePassword(
  ['github.com', 'john.doe@email.com', 'my-master-key'],
  {
    length: 32,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true
  }
);

console.log('Generated password:', password);

// Check algorithm health and version
import { getAlgorithmVersion, quickCompatibilityCheck } from '@nuwax-io/nuwault-core';

const version = getAlgorithmVersion();
const isHealthy = await quickCompatibilityCheck();

console.log(`Algorithm version: ${version.version}`);
console.log(`Library status: ${isHealthy ? 'Healthy ✅' : 'Issues detected ❌'}`);
```

### Using Individual Functions

```javascript
import { generatePassword, analyzeCharacterDistribution } from '@nuwax-io/nuwault-core';

// Generate password
const password = await generatePassword(
  ['github.com', 'user@email.com'],
  { length: 16 }
);

// Analyze password strength
const analysis = analyzeCharacterDistribution(password, {
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: true
});

console.log('Password:', password);
console.log('Distribution quality:', analysis.distribution);
```

## Developer Guide

For detailed documentation on using the library, including comprehensive API reference, configuration options, and advanced usage examples, please see the [Developer Guide](docs/developer-guide.md).

### Quick Class Reference

```javascript
import NuwaultCore from '@nuwax-io/nuwault-core';

// Create generator
const generator = new NuwaultCore(customConfig);

// Generate password
const password = await generator.generatePassword(['github.com', 'username'], {
  length: 32,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: true
});

// Analyze password quality
const analysis = generator.analyzePassword(password);
console.log(`Password quality: ${analysis.distribution}`);
```

### Available Functions

```javascript
import {
  generatePassword,
  generateHash,
  hashToPassword,
  analyzeCharacterDistribution,
  validateAlgorithmCompatibility,
  quickCompatibilityCheck,
  getAlgorithmVersion,
  SECURITY_CONFIG,
  CHARACTER_SETS
} from '@nuwax-io/nuwault-core';
```

**[Complete API Documentation](docs/developer-guide.md)**

## Configuration

You can customize the security settings by providing a custom configuration:

```javascript
import NuwaultCore from '@nuwax-io/nuwault-core';

const generator = new NuwaultCore({
  SECURITY_CONFIG: {
    hashIterations: 2000,        // More iterations = more secure but slower
    defaultPasswordLength: 32,   // Default password length
    minPasswordLength: 8,        // Minimum allowed length
    maxPasswordLength: 128,      // Maximum allowed length
    masterSalt: 'your-custom-salt' // Optional master salt (null = no salt)
  },
  CHARACTER_SETS: {
    SYMBOLS: '!@#$%^&*'         // Custom symbol set
  }
});
```

## Algorithm Overview

### Core Process
1. **Input Validation**: Validates and sanitizes input strings
2. **Normalization**: Converts inputs to lowercase, removes diacritics
3. **Hash Generation**: Multiple SHA-512 iterations with unique salts
4. **Character Distribution**: Advanced algorithms for balanced output
5. **Deterministic Shuffle**: Consistent results across generations

### Character Distribution
The library uses sophisticated algorithms to ensure balanced character distribution with minimal repetition:

- **Adaptive Distribution**: Different strategies based on password length
- **Character Repetition Control**: Dynamic maximum repetition limits
- **Intelligent Character Selection**: Multi-layer selection algorithm
- **Character Diversity Optimization**: Maximizes unique character usage
- **Weighted Selection**: Symbols and numbers get higher priority in longer passwords
- **Deterministic Shuffle**: Fisher-Yates shuffle using hash entropy for consistent results

### Hash Generation Security
- **Multiple Iterations**: Configurable iterations (default: 1000) prevent rainbow table attacks
- **Unique Salt per Iteration**: Each iteration uses a unique salt combining master salt, iteration counter, and previous hash
- **Master Salt Integration**: When provided, prepended to every iteration for unique password variants
- **Timing Attack Prevention**: Small delays during first iteration
- **Input Entropy Validation**: Minimum combined input length requirements

**Salt Construction Example:**
```javascript
// With master salt "org-salt"  
"org-salt|iter-0|github.com|user@email.com|initial-hash"
"org-salt|iter-1|github.com|user@email.com|previous-iteration-hash"
```

## Security & Validation

### Security Features
- **Multiple Hash Iterations**: Configurable iterations (default: 1000) to prevent rainbow table attacks
- **Optional Master Salt**: User-provided master salt for additional security (null by default)
- **Unique Salt per Iteration**: Each hash iteration uses a unique salt combining master salt, iteration counter, and previous hash
- **Timing Attack Prevention**: Small delays during hash generation
- **Input Validation**: Comprehensive validation and sanitization
- **Deterministic Generation**: Same inputs always produce the same password

### Algorithm Validation
The library includes comprehensive validation systems to ensure algorithm consistency across different environments, platforms, and library versions.

```javascript
import { validateAlgorithmCompatibility, getAlgorithmVersion } from '@nuwax-io/nuwault-core';

// Algorithm version tracking
const versionInfo = getAlgorithmVersion();
console.log(`Algorithm Version: ${versionInfo.version}`);

// Comprehensive validation
const validation = await validateAlgorithmCompatibility();
console.log(`Overall Compatible: ${validation.overall.isFullyCompatible}`);
console.log(`Hash Generation: ${validation.hashGeneration.isCompatible}`);
console.log(`Password Generation: ${validation.passwordGeneration.isCompatible}`);
```

### Stability Guarantees
- **Deterministic Behavior**: Same inputs always produce identical outputs across all platforms
- **Version Compatibility**: Algorithm versioning prevents breaking changes
- **Platform Independence**: Identical results on Node.js vs. Browser vs. Electron across different OS
- **Future-Proof Design**: SHA-512 algorithm standardized by NIST (FIPS 180-4)

### Supported Environments
- ✅ **Node.js 16+**: Full support with all features using Node.js crypto module
- ✅ **Modern Browsers**: Chrome 60+, Firefox 55+, Safari 11+, Edge 79+ with Web Crypto API
- ✅ **Web Workers**: Full support for background password generation
- ✅ **Electron**: Compatible with all Electron versions (uses Chromium's Web Crypto API)
- ❌ **React Native**: NOT supported - JavaScriptCore engine lacks Web Crypto API support

**Note**: React Native developers need to use crypto polyfills (like `react-native-crypto`) or alternative approaches as the native JavaScriptCore engine does not support the Web Crypto API required by this library.

### Validation Commands
```bash
npm test                    # Run all tests including algorithm validation
npm run validate           # Comprehensive validation (type-check + test + version-check)
npm run version-check      # Check algorithm/package version synchronization
npm run prepublishOnly     # Pre-deployment validation
```

## Production Features

The library is designed for enterprise production environments with comprehensive monitoring and validation capabilities. For detailed production deployment guides, enterprise configurations, and monitoring implementations, please see the [Production Guide](docs/production-guide.md).

### Key Features
- **Health Check API**: Real-time algorithm compatibility monitoring endpoints
- **Deployment Validation**: Automated algorithm integrity verification after deployments  
- **Performance Monitoring**: Built-in performance metrics and alerting
- **Enterprise Configuration**: Organization-wide security settings and standards
- **Monitoring Dashboard Integration**: Prometheus/Grafana metrics collection
- **Version Synchronization**: Automated package.json ↔ algorithm version sync
- **CI/CD Integration**: Pipeline validation and deployment safety checks

### Quick Setup
```javascript
// Health check endpoint
import { quickCompatibilityCheck } from '@nuwax-io/nuwault-core';

app.get('/health/algorithm', async (req, res) => {
  const isHealthy = await quickCompatibilityCheck();
  res.json({ 
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString()
  });
});

// Enterprise configuration
const enterpriseGenerator = new NuwaultCore({
  SECURITY_CONFIG: {
    hashIterations: 5000,
    defaultPasswordLength: 32,
    masterSalt: process.env.ORG_MASTER_SALT
  }
});

// Deployment validation
import { validateAlgorithmCompatibility } from '@nuwax-io/nuwault-core';
const validation = await validateAlgorithmCompatibility();
if (!validation.overall.isFullyCompatible) {
  throw new Error('Deployment validation failed');
}
```

**[Complete Production Guide](docs/production-guide.md)**

## Browser Support

- ✅ Modern browsers with Web Crypto API support
- ✅ Node.js 16+ 
- ✅ Supports ES modules and CommonJS
- ✅ UMD build for legacy browser support

## TypeScript Support

Full TypeScript support included with comprehensive type definitions and intellisense. For detailed TypeScript usage, interface definitions, configuration, and best practices, please see the [TypeScript Guide](docs/typescript-guide.md).

### Key TypeScript Features

- **Complete Type Definitions**: Full type coverage for all functions and interfaces
- **Intellisense Support**: Rich autocomplete and error detection in IDEs
- **Type-Safe API**: Strict typing for all password generation and validation functions
- **Generic Support**: Advanced generic types for custom implementations
- **Utility Types**: Type guards, validation helpers, and custom type definitions

### Quick TypeScript Example

```typescript
import NuwaultCore from '@nuwax-io/nuwault-core';
import type { 
  PasswordGenerationResult, 
  CompatibilityResult,
  AlgorithmVersion 
} from '@nuwax-io/nuwault-core';

// Type-safe password generation
const generator = new NuwaultCore();
const result: PasswordGenerationResult = await generator.generatePassword(
  ['github.com', 'username'],
  { length: 32, includeSymbols: true }
);

// Type-safe algorithm validation
const validation: CompatibilityResult = await validateAlgorithmCompatibility();
const version: AlgorithmVersion = getAlgorithmVersion();

console.log(`Password: ${result.password}`);
console.log(`Algorithm compatible: ${validation.overall.isFullyCompatible}`);
console.log(`Version: ${version.version}`);
```

**[Complete TypeScript Guide](docs/typescript-guide.md)**

## Usage Examples

For comprehensive usage examples, including advanced configurations, enterprise implementations, algorithm validation, and production monitoring examples, please see the [Usage Examples](docs/usage-examples.md).

### Quick Examples

```javascript
import NuwaultCore from '@nuwax-io/nuwault-core';

// Basic usage
const generator = new NuwaultCore();
const password = await generator.generatePassword(['github.com', 'username']);

// Advanced configuration
const advancedGenerator = new NuwaultCore({
  SECURITY_CONFIG: {
    hashIterations: 5000,
    defaultPasswordLength: 32,
    masterSalt: 'my-organization-salt'
  }
});

// Master salt usage
const userPassword = await generator.generatePassword(
  ['secure-site.com', 'user@email.com'],
  { 
    length: 24,
    masterSalt: 'user-specific-salt' 
  }
);

// Password analysis
const analysis = generator.analyzePassword(password);
console.log(`Password quality: ${analysis.distribution}`);

// Algorithm validation
import { quickCompatibilityCheck, getAlgorithmVersion } from '@nuwax-io/nuwault-core';

const isHealthy = await quickCompatibilityCheck();
const version = getAlgorithmVersion();
console.log(`Algorithm version: ${version.version}, Status: ${isHealthy ? 'Healthy' : 'Issues detected'}`);
```

**[Complete Usage Examples](docs/usage-examples.md)**

---

## License

MIT - see [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Security Policy

We take security seriously and appreciate responsible disclosure of vulnerabilities. For detailed security information, vulnerability reporting procedures, and security best practices, please see our [Security Policy](SECURITY.md).

### Security Overview
- **Secure by Design**: SHA-512 hashing with multiple iterations
- **Deterministic Generation**: Consistent, predictable outputs
- **Input Validation**: Comprehensive validation and sanitization
- **Timing Attack Resistance**: Protected against timing-based attacks
- **Memory Safety**: Best-effort secure memory handling

### Reporting Vulnerabilities
**Please do not report security vulnerabilities via GitHub issues.**

For security vulnerabilities, please:
- Email: [security@nuwault.com](mailto:security@nuwault.com)
- Follow our coordinated disclosure process
- Receive acknowledgment within 48 hours

**[Complete Security Policy](SECURITY.md)** 

## Contact & Support

For general inquiries, technical support, or feedback, please reach out to us:

- **Support Email**: [support@nuwault.com](mailto:support@nuwault.com)
- **GitHub Issues**: [Report bugs or request features](https://github.com/nuwax-io/nuwault-core/issues)
- **Documentation**: [Complete documentation and guides](docs/)

We welcome your feedback and are committed to helping you get the most out of Nuwault Core.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed history of changes. 