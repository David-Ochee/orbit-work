#!/usr/bin/env node
/**
 * sync-schema.js
 *
 * Copies the canonical GraphQL schema into lib/graphql/schema.graphql.
 *
 * Sources (checked in order):
 *   1. CANONICAL_SCHEMA env var — a file path or URL
 *   2. ./orbit-work-backend/src/schema.gql  (checked-out private repo in CI)
 *   3. ./backend/src/graphql/schema.graphql   (local monorepo fallback)
 *   4. ./lib/graphql/schema.graphql           (canonical local copy)
 *
 * Usage:
 *   node scripts/sync-schema.js          # copy
 *   node scripts/sync-schema.js --check  # fail if out of sync (CI)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const crypto = require('crypto');

const CHECK = process.argv.includes('--check');
const DEST = path.resolve(__dirname, '../lib/graphql/schema.graphql');

function hash(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    mod
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(data));
      })
      .on('error', reject);
  });
}

async function getCanonical() {
  const env = process.env.CANONICAL_SCHEMA;
  if (env) {
    if (env.startsWith('http://') || env.startsWith('https://')) return fetchUrl(env);
    return fs.readFileSync(path.resolve(env), 'utf-8');
  }
  const ciPath = path.resolve(__dirname, '../orbit-work-backend/src/schema.gql');
  if (fs.existsSync(ciPath)) return fs.readFileSync(ciPath, 'utf-8');
  const localPath = path.resolve(__dirname, '../backend/src/graphql/schema.graphql');
  if (fs.existsSync(localPath)) return fs.readFileSync(localPath, 'utf-8');
  const libPath = path.resolve(__dirname, '../lib/graphql/schema.graphql');
  if (fs.existsSync(libPath)) return fs.readFileSync(libPath, 'utf-8');
  throw new Error(
    'No canonical schema source found. Set CANONICAL_SCHEMA or provide a local copy.',
  );
}

(async () => {
  const canonical = await getCanonical();
  if (CHECK) {
    if (!fs.existsSync(DEST)) {
      console.error('❌ lib/graphql/schema.graphql does not exist. Run: npm run sync-schema');
      process.exit(1);
    }
    const current = fs.readFileSync(DEST, 'utf-8');
    if (hash(canonical) !== hash(current)) {
      console.error('❌ Schema out of sync. Run: npm run sync-schema');
      process.exit(1);
    }
    console.log('✅ Schema is in sync.');
  } else {
    fs.mkdirSync(path.dirname(DEST), { recursive: true });
    fs.writeFileSync(DEST, canonical, 'utf-8');
    console.log(`✅ Schema written to ${DEST}`);
  }
})();
