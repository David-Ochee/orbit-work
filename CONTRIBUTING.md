# Contributing to OrbitWork

Thank you for your interest in contributing! This document explains how to get involved.

## Code of Conduct

By participating you agree to our [Code of Conduct](CODE_OF_CONDUCT.md).

## How to Contribute

### Reporting Bugs

1. Search [existing issues](https://github.com/David-Ochee/orbit-work/issues) first.
2. Open a new issue using the **Bug Report** template.
3. Include steps to reproduce, expected vs actual behaviour, and environment details.

### Suggesting Features

Open an issue using the **Feature Request** template. Describe the problem you're solving and your proposed solution.

### Pull Requests

1. Fork the repository and create a branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes following the [code style](#code-style) guidelines.
3. Add or update tests for your changes.
4. Ensure all checks pass:
   ```bash
   npm run lint
   npm run format:check
   npm test
   ```
5. Commit with a clear message following [Conventional Commits](https://www.conventionalcommits.org/):
   ```
   feat: add competitive bounty claiming model
   fix: correct escrow release condition
   docs: update API reference for /bounties
   ```
6. Push your branch and open a Pull Request against `main`.
7. Fill in the PR template completely.

### Good First Issues

Look for issues labelled `good first issue` — these are scoped to be approachable for new contributors.

## Development Setup

See the [Getting Started](README.md#getting-started) section in the README.

## Code Style

- **TypeScript** everywhere (strict mode).
- **ESLint** + **Prettier** enforced via CI.
- Run `npm run lint` and `npm run format` before committing.
- Rust code in `contracts/` follows `rustfmt` defaults (`cargo fmt`).

## Testing

- Write unit tests for all new logic.
- Integration tests live in `backend/src/__tests__/integration/`.
- Smart contract tests live alongside the contract source (`contracts/*/src/test.rs`).
- Aim for meaningful coverage, not 100% line coverage.

## Commit Signing

We encourage (but do not require) GPG-signed commits.

## Questions?

Open a [Discussion](https://github.com/David-Ochee/orbit-work/discussions) or email **dev@orbitwork.xyz**.
