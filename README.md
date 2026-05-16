# OrbitWork

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Built on Stellar](https://img.shields.io/badge/Built%20on-Stellar-7B2FBE)](https://stellar.org)
[![CI](https://github.com/David-Ochee/orbit-work/actions/workflows/ci.yml/badge.svg)](https://github.com/David-Ochee/orbit-work/actions/workflows/ci.yml)

> **Inclusive Web3 Bounty Platform on Stellar** — earn XLM for design, writing, research, marketing, community management, and development.

[Website](https://orbitwork.xyz) • [Platform](https://app.orbitwork.xyz) • [Docs](docs/)

---

## Overview

OrbitWork is an open-source bounty platform built on the Stellar network. Unlike code-only platforms, it supports **all types of Web3 work** — contributors earn XLM for any skill set.

All bounty budgets are locked in **Soroban smart contracts** until work is approved, ensuring trustless escrow for both sponsors and contributors.

### Key Features

| Feature                      | Description                                           |
| ---------------------------- | ----------------------------------------------------- |
| 🎯 Multiple claiming models  | First-come, competitive, and curated bounty types     |
| ⚡ Credit-based applications | Spam-resistant application system                     |
| 🔐 Passkey wallet            | WebAuthn-based wallet via `smart-account-kit`         |
| 💰 Smart contract escrow     | Soroban contracts hold funds until approval           |
| 📊 On-chain reputation       | Verifiable contributor reputation on Stellar          |
| 🌍 Multi-category            | Code, design, writing, research, marketing, community |

---

## Tech Stack

**Blockchain**

- [Stellar Network](https://stellar.org) + [Soroban](https://soroban.stellar.org) smart contracts
- [`smart-account-kit`](https://github.com/kalepail/passkey-kit) for passkey wallets

**Frontend**

- [Next.js 14](https://nextjs.org) (App Router)
- [TailwindCSS](https://tailwindcss.com)
- [Stellar SDK](https://stellar.github.io/js-stellar-sdk/)

**Backend**

- [Node.js](https://nodejs.org) / [Express](https://expressjs.com)
- [PostgreSQL](https://postgresql.org) + [Redis](https://redis.io)
- [GraphQL](https://graphql.org) with real-time subscriptions via [`graphql-ws`](https://github.com/enisdenjo/graphql-ws)

**Integrations**

- GitHub OAuth
- WebAuthn / Passkeys
- KYC providers

---

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker & Docker Compose (for local services)
- Rust + `cargo` (for smart contract development)

### Installation

```bash
# Clone the repository
git clone https://github.com/David-Ochee/orbit-work.git
cd orbit-work

# Install all workspace dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your values

# Start local services (PostgreSQL, Redis)
npm run docker:up

# Run database migrations
npm run db:migrate

# Seed development data
npm run db:seed

# Start development servers (frontend + backend)
npm run dev
```

The frontend runs at `http://localhost:3000` and the API at `http://localhost:4000`.

---

## Project Structure

```
orbit-work/
├── frontend/               # Next.js 14 app
│   ├── src/
│   │   ├── app/            # App Router pages & layouts
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Stellar SDK helpers, GraphQL client
│   │   └── styles/         # Global CSS / Tailwind config
│   └── package.json
├── backend/                # Express API
│   ├── src/
│   │   ├── routes/         # REST route definitions
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/      # Auth, rate-limit, validation
│   │   ├── models/         # DB models (pg)
│   │   ├── graphql/        # Schema, resolvers, subscriptions
│   │   └── services/       # Business logic, Stellar integration
│   └── package.json
├── contracts/              # Soroban smart contracts (Rust)
│   ├── escrow/             # Bounty escrow contract
│   └── reputation/         # On-chain reputation contract
├── database/
│   ├── schema.sql          # Full DB schema
│   └── migrations/         # Numbered migration files
├── lib/
│   └── graphql/
│       └── schema.graphql  # Canonical GraphQL schema
├── scripts/
│   ├── sync-schema.js      # Schema sync utility
│   └── seed.js             # Dev data seeder
├── docs/
│   ├── API.md
│   ├── CONTRACTS.md
│   └── ARCHITECTURE.md
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── check-schema.yml
│       └── deploy.yml
├── docker-compose.yml
└── Dockerfile
```

---

## Development

### Running Tests

```bash
# Unit tests (all workspaces)
npm test

# Integration tests
npm run test:integration

# Smart contract tests
npm run test:contracts
```

### Code Style

```bash
npm run lint          # ESLint
npm run format        # Prettier (write)
npm run format:check  # Prettier (check only)
```

### Schema Sync

The GraphQL schema in `lib/graphql/schema.graphql` must stay in sync with the backend.

```bash
npm run sync-schema   # Copy canonical schema locally
npm run check-schema  # CI check — fails if out of sync
```

---

## Smart Contracts

Contracts live in `contracts/` and are written in Rust for Soroban.

```bash
# Build contracts
cd contracts/escrow && cargo build --target wasm32-unknown-unknown --release
cd contracts/reputation && cargo build --target wasm32-unknown-unknown --release

# Run contract tests
npm run test:contracts

# Deploy to testnet (requires STELLAR_SECRET_KEY in .env)
./scripts/deploy-contracts.sh testnet
```

See [docs/CONTRACTS.md](docs/CONTRACTS.md) for full contract documentation.

---

## API Reference

See [docs/API.md](docs/API.md) for the full reference. Quick overview:

| Method | Path                        | Description               |
| ------ | --------------------------- | ------------------------- |
| GET    | `/api/bounties`             | List bounties             |
| POST   | `/api/bounties`             | Create bounty (auth)      |
| GET    | `/api/bounties/:id`         | Bounty details            |
| PUT    | `/api/bounties/:id`         | Update bounty (auth)      |
| DELETE | `/api/bounties/:id`         | Delete bounty (auth)      |
| GET    | `/api/applications`         | List applications         |
| POST   | `/api/applications`         | Submit application (auth) |
| PUT    | `/api/applications/:id`     | Update application (auth) |
| GET    | `/api/users/:id`            | User profile              |
| PUT    | `/api/users/:id`            | Update profile (auth)     |
| GET    | `/api/users/:id/reputation` | Reputation score          |

---

## Schema Sync (CI)

The workflow `.github/workflows/check-schema.yml` runs `npm run check-schema` on every push and pull request.

**To enable cross-repo schema checks:**

1. Create a GitHub PAT with `repo` (read) scope for your backend repo.
2. Add it as a repository secret named `ORBITWORK_BACKEND_TOKEN`.
3. The workflow will check out the backend and copy `src/schema.gql` automatically.

**Alternatives (no cross-repo access needed):**

- Set `CANONICAL_SCHEMA` env var / secret to a URL or path.
- Keep `lib/graphql/schema.graphql` updated manually.

---

## Contributing

We welcome all contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

**Good first issues:** look for the `good first issue` label on GitHub.

**Areas for contribution:**

- Frontend components and UI/UX
- API endpoints and services
- Smart contract improvements
- Documentation
- Testing and QA
- Bug fixes and security patches

---

## Security

Please report vulnerabilities to **security@orbitwork.xyz** — do **not** open public issues.

See [SECURITY.md](SECURITY.md) for our full disclosure policy.

---

## License

[MIT](LICENSE) © OrbitWork Contributors

---

## Acknowledgments

Built with [Stellar](https://stellar.org) · [Soroban](https://soroban.stellar.org) · [smart-account-kit](https://github.com/kalepail/passkey-kit)

[![Built on Stellar](https://img.shields.io/badge/Built%20on-Stellar-7B2FBE?style=for-the-badge&logo=stellar)](https://stellar.org)
