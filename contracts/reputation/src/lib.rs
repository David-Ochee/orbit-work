//! OrbitWork — Reputation Contract
//!
//! Tracks on-chain reputation scores for contributors.
//! Scores are incremented by the platform admin when a bounty is completed.

#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env};

// ─── Storage ─────────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone)]
pub struct ScoreKey(pub Address);

const ADMIN_KEY: &str = "admin";

// ─── Contract ────────────────────────────────────────────────────────────────

#[contract]
pub struct ReputationContract;

#[contractimpl]
impl ReputationContract {
    /// Initialise the contract with an admin address.
    pub fn init(env: Env, admin: Address) {
        assert!(
            env.storage().instance().get::<_, Address>(&ADMIN_KEY).is_none(),
            "already initialised"
        );
        env.storage().instance().set(&ADMIN_KEY, &admin);
    }

    /// Add `delta` points to `contributor`'s score. Admin only.
    pub fn add_score(env: Env, contributor: Address, delta: i32) {
        let admin: Address = env
            .storage()
            .instance()
            .get(&ADMIN_KEY)
            .expect("not initialised");
        admin.require_auth();
        assert!(delta > 0, "delta must be positive");

        let key = ScoreKey(contributor.clone());
        let current: i32 = env.storage().persistent().get(&key).unwrap_or(0);
        let new_score = current.saturating_add(delta);
        env.storage().persistent().set(&key, &new_score);

        env.events()
            .publish((symbol_short!("score"), contributor), new_score);
    }

    /// Get the reputation score for `contributor`.
    pub fn get_score(env: Env, contributor: Address) -> i32 {
        env.storage()
            .persistent()
            .get(&ScoreKey(contributor))
            .unwrap_or(0)
    }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env};

    #[test]
    fn test_score_accumulates() {
        let env = Env::default();
        env.mock_all_auths();

        let admin = Address::generate(&env);
        let contributor = Address::generate(&env);

        let contract_id = env.register_contract(None, ReputationContract);
        let client = ReputationContractClient::new(&env, &contract_id);

        client.init(&admin);
        assert_eq!(client.get_score(&contributor), 0);

        client.add_score(&contributor, &10);
        client.add_score(&contributor, &5);
        assert_eq!(client.get_score(&contributor), 15);
    }
}
