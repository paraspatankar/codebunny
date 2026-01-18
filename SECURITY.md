# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| `main` (latest) | ✅ Yes |
| `v1.x` | ✅ Yes |
| Older releases | ❌ No |

## Reporting a Vulnerability

If you discover a security vulnerability, please **do not** open a public issue. Instead, disclose it privately by emailing **patankarparas@gmail.com**. Include:
- A brief description of the vulnerability
- Steps to reproduce (if applicable)
- Potential impact
- Any suggested mitigation or fix

We aim to respond within 48 hours and will work with you to resolve the issue promptly.

## Security Updates

- Security patches will be merged into the `main` branch as soon as they are verified.
- Release notes will include a summary of security fixes.
- Users are encouraged to keep their dependencies up‑to‑date using `bun upgrade` or `npm audit`.

## Best Practices for Contributors

- Do not commit secrets (API keys, passwords) to the repository.
- Use environment variables for all credentials (see `.env.example`).
- Run static analysis tools (`eslint`, `prettier`) before submitting PRs.
- Review third‑party dependencies for known vulnerabilities (`npm audit` or `bun audit`).

---

**Contact**: For any security concerns, email **patankarparas@gmail.com**.
