# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-07-07

### Added
- Core password generation with SHA-512 deterministic hash algorithm
- `PasswordGenerator` class with configurable character sets and length options
- `HashGenerator` class for secure hash generation with 1000 iterations
- `PasswordAnalyzer` class for password strength analysis and character distribution
- `InputValidator` class for input validation and sanitization
- `NuwaultCore` class with dual API support for TypeScript and JavaScript
- Character diversity optimization with repetition control
- Cross-platform compatibility validation
- TypeScript strict type checking with comprehensive type definitions
- Build system with ESM, CommonJS, and UMD bundle support
- Comprehensive test suite with Vitest framework