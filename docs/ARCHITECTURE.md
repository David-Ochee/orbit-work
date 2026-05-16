# Architecture

## Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser / Client                        │
│  Next.js 14 (App Router) · TailwindCSS · Apollo Client          │
│  WebAuthn (passkey) · Stellar SDK                               │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS / WSS
┌────────────────────────────▼────────────────────────────────────┐
│                       Express API (Node.js)                     │
│  REST /api/*  ·  GraphQL /graphql  ·  WS /graphql/ws            │
│  Passport (GitHub OAuth, JWT)  ·  SimpleWebAuthn                │
│  Zod validation  ·  Helmet  ·  Rate limiting                    │
└──────┬──────────────────────────────────────────┬───────────────┘
       │                                          │
┌──────▼──────┐                        ┌──────────▼──────────────┐
│ PostgreSQL  │                        │  Stellar / Soroban      │
│  Users      │                        │  Escrow Contract        │
│  Bounties   │                        │  Reputation Contract    │
│  Applications│                       │  Horizon API            │
│  Reputation │                        └─────────────────────────┘
│  events     │
└──────┬──────┘
       │
┌──────▼──────┐
│   Redis     │
│  Sessions   │
│  Pub/Sub    │
│  Rate limit │
└─────────────┘
```

## Key Design Decisions

### Trustless Escrow

Bounty funds are locked in a Soroban smart contract at creation time. The backend never holds user funds. Release is triggered by the platform admin keypair only after the sponsor approves a submission.

### Credit System

Each user starts with 5 credits. Submitting an application costs 1 credit. Credits are replenished when a bounty is completed. This prevents spam without requiring KYC.

### Real-time Updates

GraphQL subscriptions over `graphql-ws` replace polling for live bounty and application status updates. The backend uses `graphql-subscriptions` PubSub (Redis adapter recommended for multi-instance deployments).

### Passkey Authentication

WebAuthn credentials are stored in PostgreSQL. No passwords are ever stored. The `@simplewebauthn/server` library handles challenge generation and verification.

### Schema Sync

The canonical GraphQL schema lives in `lib/graphql/schema.graphql`. The `scripts/sync-schema.js` utility keeps it in sync with the backend. CI fails if they diverge.

## Data Flow: Create Bounty

```
1. Sponsor connects passkey wallet
2. Frontend calls POST /api/bounties (JWT auth)
3. Backend validates input (Zod), inserts into PostgreSQL
4. Backend calls escrow.lock_funds() on Soroban
5. Escrow contract transfers XLM from sponsor to contract
6. Backend stores escrow_tx_hash on the bounty record
7. GraphQL subscription publishes bountyCreated event
8. All connected clients receive the new bounty in real time
```

## Data Flow: Approve Application

```
1. Sponsor reviews application on frontend
2. Frontend calls PUT /api/applications/:id { status: "accepted" }
3. Backend updates application status in PostgreSQL
4. Backend calls escrow.release_funds() on Soroban
5. Escrow contract transfers XLM to contributor's Stellar address
6. Backend calls reputation.add_score() on Soroban
7. GraphQL subscription publishes applicationUpdated event
```

## Directory Structure

See [README.md](../README.md#project-structure) for the full directory tree.
