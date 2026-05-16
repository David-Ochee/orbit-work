#!/usr/bin/env node
/**
 * seed.js — populate the database with development data
 * Usage: node scripts/seed.js
 */

require('dotenv').config();
const { Pool } = require('pg');

const db = new Pool({ connectionString: process.env.DATABASE_URL });

const USERS = [
  { username: 'alice', email: 'alice@example.com', bio: 'Designer & illustrator', credits: 10 },
  { username: 'bob', email: 'bob@example.com', bio: 'Rust developer', credits: 10 },
  { username: 'carol', email: 'carol@example.com', bio: 'Technical writer', credits: 10 },
];

const BOUNTIES = [
  {
    title: 'Design a landing page for OrbitWork',
    description:
      'Create a modern, accessible landing page design (Figma). Must include hero, features, and CTA sections.',
    reward: 500,
    currency: 'XLM',
    category: 'design',
    claim_type: 'competitive',
  },
  {
    title: 'Write integration tests for the escrow contract',
    description:
      'Add comprehensive Rust integration tests for the Soroban escrow contract covering lock, release, and refund paths.',
    reward: 300,
    currency: 'XLM',
    category: 'code',
    claim_type: 'first_come',
  },
  {
    title: 'Write a blog post about Stellar for non-developers',
    description:
      'Explain Stellar and XLM to a non-technical audience. 1000–1500 words, published on Mirror or Medium.',
    reward: 150,
    currency: 'XLM',
    category: 'writing',
    claim_type: 'curated',
  },
];

async function seed() {
  console.log('🌱 Seeding database…');

  const userIds = [];
  for (const u of USERS) {
    const { rows } = await db.query(
      `INSERT INTO users (username, email, bio, credits)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (username) DO UPDATE SET bio=EXCLUDED.bio RETURNING id`,
      [u.username, u.email, u.bio, u.credits],
    );
    userIds.push(rows[0].id);
    console.log(`  👤 ${u.username} (${rows[0].id})`);
  }

  for (const b of BOUNTIES) {
    const { rows } = await db.query(
      `INSERT INTO bounties (title, description, reward, currency, category, claim_type, sponsor_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT DO NOTHING RETURNING id`,
      [b.title, b.description, b.reward, b.currency, b.category, b.claim_type, userIds[0]],
    );
    if (rows[0]) console.log(`  🎯 ${b.title.slice(0, 50)}… (${rows[0].id})`);
  }

  console.log('✅ Seed complete.');
  await db.end();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
