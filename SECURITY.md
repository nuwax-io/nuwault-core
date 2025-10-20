# Security Policy

Thank you for taking security seriously and helping keep Nuwault Core safe.

## Reporting a Vulnerability

**Please do not report security vulnerabilities via GitHub issues.**

If you believe you’ve found a security issue in Nuwault Core, please report it privately and responsibly:

- **Email**: [security@nuwault.com](mailto:security@nuwault.com)
- **Subject**: "Security Vulnerability Report"
- **Optional**: You may request our PGP public key for encrypted communication.

Please include:
- A clear description of the vulnerability
- Steps to reproduce the issue
- Affected versions
- Impact assessment (CVSS score if possible)
- Any proof of concept
- Your contact info (optional for credit)

## Our Process & Timeline

1. **Acknowledgment**: Within 48 hours of receiving the report
2. **Assessment**: Within 5 business days
3. **Fix & Testing**: Patched within 7 days for critical issues
4. **Disclosure**: Coordinated with the reporter
5. **Credit**: Public acknowledgment if desired

## Security Practices

We recommend users follow these best practices when using Nuwault Core:

- Keep dependencies updated
- Do not store master passwords in plaintext
- Use HTTPS for all network communication
- Secure your runtime environment and devices
- Clear sensitive data from memory when no longer needed

## Security Features

Nuwault Core implements:

- **Deterministic generation**: Same input → same output
- **SHA-512 hashing** with multiple iterations
- **Secure random generation** for entropy-based operations
- **Input validation** to ensure consistent, expected input structure
- **Timing attack resistance** in critical comparisons

## Security Considerations

- Password strength depends on the master password you choose.
- Security also relies on your environment and application-level practices.
- Memory safety and side-channel resistance are best-effort and should be validated externally for high-security contexts.

## Contact

For any questions, concerns, or coordination:

- **Email**: [support@nuwault.com](mailto:support@nuwault.com)
- **Website**: [https://nuwault.com](https://nuwault.com)

---

**Thank you for helping keep Nuwault Core secure!**