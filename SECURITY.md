# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 1.x     | ✅        |
| < 1.0   | ❌        |

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Email **security@orbitwork.xyz** with:

- A description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested mitigations

You will receive an acknowledgement within **48 hours** and a status update within **7 days**.

We follow [responsible disclosure](https://en.wikipedia.org/wiki/Responsible_disclosure): please give us reasonable time to patch before public disclosure.

## Security Features

- **Passkey authentication** (WebAuthn / FIDO2) — no passwords stored
- **Smart contract escrow** — funds held on-chain, not by us
- **Rate limiting** on all API endpoints
- **Input validation and sanitisation** via Zod schemas
- **Parameterised queries** — no raw SQL string interpolation
- **CORS** restricted to known origins
- **Helmet.js** HTTP security headers
- **JWT** with short expiry + refresh token rotation
- **Dependency auditing** via `npm audit` in CI

## Dependency Updates

We use Dependabot for automated dependency updates. Security patches are merged with priority.
