//! StellarWork — Escrow Contract
//!
//! Locks XLM (or a Stellar asset) on behalf of a bounty sponsor until the
//! platform releases funds to an approved contributor, or refunds the sponsor.

#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, token, Address, Env, String,
};

// ─── Storage keys ────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone)]
pub struct EscrowKey(pub String); // bounty_id

#[contracttype]
#[derive(Clone)]
pub struct EscrowEntry {
    pub sponsor: Address,
    pub amount: i128,
    pub token: Address,
    pub released: bool,
}

// ─── Contract ────────────────────────────────────────────────────────────────

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    /// Lock `amount` tokens from `sponsor` into escrow for `bounty_id`.
    pub fn lock_funds(env: Env, bounty_id: String, sponsor: Address, amount: i128, token_addr: Address) {
        sponsor.require_auth();
        assert!(amount > 0, "amount must be positive");

        let key = EscrowKey(bounty_id.clone());
        assert!(
            env.storage().persistent().get::<EscrowKey, EscrowEntry>(&key).is_none(),
            "escrow already exists for this bounty"
        );

        let client = token::Client::new(&env, &token_addr);
        client.transfer(&sponsor, &env.current_contract_address(), &amount);

        env.storage().persistent().set(
            &key,
            &EscrowEntry { sponsor, amount, token: token_addr, released: false },
        );

        env.events().publish((symbol_short!("locked"), bounty_id), amount);
    }

    /// Release escrowed funds to `recipient` (approved contributor).
    /// Only the contract admin (platform) may call this.
    pub fn release_funds(env: Env, bounty_id: String, recipient: Address, admin: Address) {
        admin.require_auth();

        let key = EscrowKey(bounty_id.clone());
        let mut entry: EscrowEntry = env
            .storage()
            .persistent()
            .get(&key)
            .expect("escrow not found");

        assert!(!entry.released, "already released");

        let client = token::Client::new(&env, &entry.token);
        client.transfer(&env.current_contract_address(), &recipient, &entry.amount);

        entry.released = true;
        env.storage().persistent().set(&key, &entry);

        env.events().publish((symbol_short!("released"), bounty_id), entry.amount);
    }

    /// Refund escrowed funds back to the original sponsor.
    pub fn refund(env: Env, bounty_id: String, admin: Address) {
        admin.require_auth();

        let key = EscrowKey(bounty_id.clone());
        let mut entry: EscrowEntry = env
            .storage()
            .persistent()
            .get(&key)
            .expect("escrow not found");

        assert!(!entry.released, "already released");

        let client = token::Client::new(&env, &entry.token);
        client.transfer(&env.current_contract_address(), &entry.sponsor, &entry.amount);

        entry.released = true;
        env.storage().persistent().set(&key, &entry);

        env.events().publish((symbol_short!("refunded"), bounty_id), entry.amount);
    }

    /// Query the escrow entry for a bounty.
    pub fn get_escrow(env: Env, bounty_id: String) -> Option<EscrowEntry> {
        env.storage().persistent().get(&EscrowKey(bounty_id))
    }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{
        testutils::Address as _,
        token::{Client as TokenClient, StellarAssetClient},
        Address, Env, String,
    };

    fn setup() -> (Env, Address, Address, Address, Address, i128) {
        let env = Env::default();
        env.mock_all_auths();

        let admin = Address::generate(&env);
        let sponsor = Address::generate(&env);
        let recipient = Address::generate(&env);

        let token_id = env.register_stellar_asset_contract_v2(admin.clone());
        let token_addr = token_id.address();
        let asset_client = StellarAssetClient::new(&env, &token_addr);
        let amount: i128 = 1_000_0000000; // 1000 XLM in stroops

        asset_client.mint(&sponsor, &amount);

        (env, admin, sponsor, recipient, token_addr, amount)
    }

    #[test]
    fn test_lock_and_release() {
        let (env, admin, sponsor, recipient, token_addr, amount) = setup();
        let contract_id = env.register_contract(None, EscrowContract);
        let client = EscrowContractClient::new(&env, &contract_id);
        let bounty_id = String::from_str(&env, "bounty-001");

        client.lock_funds(&bounty_id, &sponsor, &amount, &token_addr);

        let entry = client.get_escrow(&bounty_id).unwrap();
        assert_eq!(entry.amount, amount);
        assert!(!entry.released);

        client.release_funds(&bounty_id, &recipient, &admin);

        let entry = client.get_escrow(&bounty_id).unwrap();
        assert!(entry.released);

        let token = TokenClient::new(&env, &token_addr);
        assert_eq!(token.balance(&recipient), amount);
    }

    #[test]
    fn test_refund() {
        let (env, admin, sponsor, _recipient, token_addr, amount) = setup();
        let contract_id = env.register_contract(None, EscrowContract);
        let client = EscrowContractClient::new(&env, &contract_id);
        let bounty_id = String::from_str(&env, "bounty-002");

        client.lock_funds(&bounty_id, &sponsor, &amount, &token_addr);
        client.refund(&bounty_id, &admin);

        let token = TokenClient::new(&env, &token_addr);
        assert_eq!(token.balance(&sponsor), amount);
    }
}
