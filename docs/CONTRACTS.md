# Smart Contract Documentation

Contracts are written in Rust for [Soroban](https://soroban.stellar.org) and live in `contracts/`.

---

## Escrow Contract (`contracts/escrow`)

Holds bounty funds on-chain until the platform releases them to an approved contributor or refunds the sponsor.

### Functions

#### `lock_funds(bounty_id, sponsor, amount, token_addr)`

Transfers `amount` tokens from `sponsor` into the contract's escrow for `bounty_id`.

- Requires `sponsor` auth.
- Panics if an escrow already exists for `bounty_id`.

#### `release_funds(bounty_id, recipient, admin)`

Transfers escrowed funds to `recipient`.

- Requires `admin` auth (platform keypair).
- Panics if already released.

#### `refund(bounty_id, admin)`

Returns escrowed funds to the original sponsor.

- Requires `admin` auth.
- Panics if already released.

#### `get_escrow(bounty_id) → Option<EscrowEntry>`

Returns the escrow entry for a bounty, or `None` if not found.

### EscrowEntry

```rust
pub struct EscrowEntry {
    pub sponsor: Address,
    pub amount: i128,
    pub token: Address,
    pub released: bool,
}
```

### Events

| Topic                     | Data           |
| ------------------------- | -------------- |
| `("locked", bounty_id)`   | `amount: i128` |
| `("released", bounty_id)` | `amount: i128` |
| `("refunded", bounty_id)` | `amount: i128` |

---

## Reputation Contract (`contracts/reputation`)

Tracks on-chain reputation scores for contributors.

### Functions

#### `init(admin)`

Initialises the contract with an admin address. Can only be called once.

#### `add_score(contributor, delta)`

Adds `delta` points to `contributor`'s score. Requires admin auth.

#### `get_score(contributor) → i32`

Returns the current reputation score for `contributor`.

### Events

| Topic                    | Data             |
| ------------------------ | ---------------- |
| `("score", contributor)` | `new_score: i32` |

---

## Building

```bash
rustup target add wasm32-unknown-unknown

cd contracts/escrow
cargo build --target wasm32-unknown-unknown --release

cd contracts/reputation
cargo build --target wasm32-unknown-unknown --release
```

## Testing

```bash
cd contracts && cargo test
```

## Deployment

```bash
stellar contract deploy \
  --wasm contracts/escrow/target/wasm32-unknown-unknown/release/orbit_work_escrow.wasm \
  --source $STELLAR_SECRET_KEY \
  --network testnet
```

Store the returned contract ID in `.env` as `ESCROW_CONTRACT_ID`.
