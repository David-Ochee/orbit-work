# API Reference

Base URL: `http://localhost:4000` (development) · `https://api.orbitwork.xyz` (production)

All authenticated endpoints require `Authorization: Bearer <token>`.

---

## Authentication

### GitHub OAuth

| Method | Path                        | Description                  |
| ------ | --------------------------- | ---------------------------- |
| GET    | `/api/auth/github`          | Redirect to GitHub OAuth     |
| GET    | `/api/auth/github/callback` | OAuth callback — returns JWT |

### Passkey (WebAuthn)

| Method | Path                                     | Description                      |
| ------ | ---------------------------------------- | -------------------------------- |
| POST   | `/api/auth/passkey/register/options`     | Get registration options         |
| POST   | `/api/auth/passkey/register/verify`      | Verify registration credential   |
| GET    | `/api/auth/passkey/authenticate/options` | Get authentication options       |
| POST   | `/api/auth/passkey/authenticate/verify`  | Verify authentication credential |
| POST   | `/api/auth/refresh`                      | Refresh JWT                      |
| POST   | `/api/auth/logout`                       | Invalidate session               |

---

## Bounties

`GET /api/bounties` — query params: `status`, `category`, `limit`, `offset`

`GET /api/bounties/:id`

`POST /api/bounties` _(auth)_

```json
{
  "title": "string",
  "description": "string",
  "reward": 500,
  "currency": "XLM",
  "category": "design",
  "claimType": "competitive",
  "expiresAt": "2026-06-01T00:00:00Z"
}
```

`PUT /api/bounties/:id` _(auth, sponsor only)_

`DELETE /api/bounties/:id` _(auth, sponsor only)_

---

## Applications

`GET /api/applications?bountyId=<uuid>`

`POST /api/applications` _(auth)_ — deducts 1 credit; returns `402` if exhausted

```json
{ "bountyId": "uuid", "proposal": "string (50–5000)" }
```

`PUT /api/applications/:id` _(auth)_

---

## Users

`GET /api/users/:id`

`PUT /api/users/:id` _(auth, self only)_

`GET /api/users/:id/reputation` → `{ "userId": "uuid", "score": 42 }`

---

## GraphQL

Endpoint: `POST /graphql` · WebSocket: `ws://localhost:4000/graphql/ws`

See `lib/graphql/schema.graphql` for the full schema.

---

## Error format

```json
{ "error": "Human-readable message", "details": {} }
```
