# Contributing to Nuwault Core

Thank you for your interest in contributing to Nuwault Core! This document provides guidelines and information about contributing to this TypeScript-based deterministic password generation library.

## Table of Contents
- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [TypeScript Guidelines](#typescript-guidelines)
- [Testing](#testing)
- [Security Considerations](#security-considerations)
- [Code Style](#code-style)
- [Build System](#build-system)
- [Pull Request Process](#pull-request-process)
- [Available Scripts](#available-scripts)
- [Reporting Security Vulnerabilities](#reporting-security-vulnerabilities)

---

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. Run tests: `npm test`
5. Type check: `npm run type-check`

## Development Workflow

1. **Create a branch** for your feature/fix
2. **Write TypeScript code** following project conventions
3. **Add comprehensive type definitions** for new interfaces
4. **Write tests** for new functionality
5. **Ensure type checking passes**: `npm run type-check`
6. **Ensure all tests pass**: `npm test`
7. **Build successfully**: `npm run build`
8. **Follow code style** conventions
9. **Submit a pull request**

## TypeScript Guidelines

- Use **strict TypeScript configuration** (already configured in `tsconfig.json`)
- Define **comprehensive interfaces** for all data structures
- Use **proper async/await** patterns for cryptographic operations
- Implement **generic types** where appropriate
- Add **JSDoc comments** with TypeScript annotations
- Export both **types and implementations** from modules
- Maintain **dual API compatibility** (TypeScript + vanilla JS)

## Testing

- Write comprehensive tests for new features
- Test both **TypeScript API** and **vanilla JS compatibility**
- Ensure existing tests continue to pass
- Test coverage should remain high (aim for 100%)
- Include edge cases and error scenarios
- Test **compiled output** (tests run against `dist/` files)
- Verify **deterministic behavior** for password generation

## Security Considerations

This is a security-focused library. When contributing:

- **Never weaken security defaults**
- **Document security implications** of changes
- **Consider timing attacks** and side-channel vulnerabilities
- **Use secure random generation** where needed (Web Crypto API)
- **Validate all inputs** thoroughly with TypeScript types
- **Maintain algorithm integrity** - changes must preserve deterministic behavior
- **Test hash consistency** across different environments
- **Preserve salt generation** mechanisms (1000 iterations)

## Code Style

- Use **TypeScript strict mode** features
- Use clear, descriptive variable and interface names
- Add **JSDoc comments** with TypeScript type annotations
- Follow existing code patterns and class structures
- Keep functions focused and small
- Prefer **immutable patterns** where possible
- Use **async/await** for asynchronous operations
- Implement proper **error handling** with typed exceptions
- Follow **SOLID principles** in class design

## Build System

The project uses a multi-stage build process:

1. **TypeScript compilation**: `npm run build:tsc`
2. **Rollup bundling**: `npm run build:rollup`
3. **Full build**: `npm run build` (runs both)

### Output formats:
- **ESM**: `dist/index.js` (for modern environments)
- **CommonJS**: `dist/index.cjs` (for Node.js compatibility)
- **UMD**: `dist/nuwault-core.umd.js` (for browser usage)
- **Types**: `dist/index.d.ts` (TypeScript declarations)

## API Compatibility

When making changes, ensure:
- **TypeScript API** works correctly
- **Vanilla JavaScript API** remains functional
- **Backward compatibility** is maintained
- **Function overloads** work as expected
- **Export compatibility** across all build formats

## Pull Request Process

1. Update **TypeScript interfaces** if needed
2. Update **documentation** with TypeScript examples
3. Add entries to **CHANGELOG.md**
4. Ensure **CI passes** (type checking + tests)
5. Verify **build outputs** are correct
6. Request review from maintainers
7. Address review feedback

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Full build (TypeScript + Rollup) |
| `npm run build:tsc` | TypeScript compilation only |
| `npm run build:rollup` | Rollup bundling only |
| `npm run dev` | TypeScript watch mode |
| `npm test` | Run test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:ui` | Run tests with UI |
| `npm run test:coverage` | Run tests with coverage |
| `npm run type-check` | TypeScript type checking |
| `npm run clean` | Clean build artifacts |

## Reporting Security Vulnerabilities

> **⚠️ Important**: Do not report security vulnerabilities through public GitHub issues.

Please send security vulnerabilities to: **support@nuwault.com**

### Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact assessment
- Suggested fix (if available)
- Affected TypeScript/JavaScript APIs

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Maintain a welcoming environment
- Share knowledge about TypeScript and security best practices

## Questions?

Feel free to open an issue for:
- Bug reports
- Feature requests
- TypeScript-related questions
- Documentation improvements
- API design discussions
- Security concerns
- General questions

## Development Tips

### Best Practices:
- Use **VS Code** with TypeScript support for best experience
- Enable **strict mode** in your editor for TypeScript
- Use **type assertions** carefully and only when necessary
- Test your changes with both **TypeScript** and **JavaScript** consumers
- Verify **deterministic behavior** - same inputs should always produce same outputs

### 🔧 Debugging:
- Use source maps for debugging compiled code
- Check both development and production builds
- Test across different Node.js versions
- Verify browser compatibility for UMD builds

---

**Thank you for contributing to Nuwault Core!**

> *Your contributions help make password security accessible and reliable for everyone.* 