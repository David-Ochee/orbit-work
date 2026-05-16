import { makeExecutableSchema } from '@graphql-tools/schema';
import { readFileSync } from 'fs';
import { join } from 'path';
import { PubSub } from 'graphql-subscriptions';
import { db } from '../services/db';

export const pubsub = new PubSub();

const typeDefs = readFileSync(
  join(__dirname, '../../../..', 'lib/graphql/schema.graphql'),
  'utf-8',
);

const resolvers = {
  Query: {
    bounties: async (_: unknown, args: any) => {
      const { status, category, limit = 20, offset = 0 } = args;
      const conditions: string[] = [];
      const params: unknown[] = [];
      if (status) {
        params.push(status);
        conditions.push(`status = $${params.length}`);
      }
      if (category) {
        params.push(category);
        conditions.push(`category = $${params.length}`);
      }
      const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
      params.push(limit, offset);
      const { rows } = await db.query(
        `SELECT * FROM bounties ${where} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
        params,
      );
      return rows;
    },
    bounty: async (_: unknown, { id }: { id: string }) => {
      const { rows } = await db.query('SELECT * FROM bounties WHERE id = $1', [id]);
      return rows[0] ?? null;
    },
    user: async (_: unknown, { id }: { id: string }) => {
      const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [id]);
      return rows[0] ?? null;
    },
    applications: async (_: unknown, { bountyId }: { bountyId?: string }) => {
      const { rows } = bountyId
        ? await db.query('SELECT * FROM applications WHERE bounty_id = $1', [bountyId])
        : await db.query('SELECT * FROM applications');
      return rows;
    },
  },
  Mutation: {
    createBounty: async (_: unknown, args: any, ctx: any) => {
      if (!ctx.user) throw new Error('Unauthorized');
      const { rows } = await db.query(
        `INSERT INTO bounties (title,description,reward,currency,category,claim_type,sponsor_id,expires_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
        [
          args.title,
          args.description,
          args.reward,
          args.currency,
          args.category,
          args.claimType,
          ctx.user.id,
          args.expiresAt,
        ],
      );
      pubsub.publish('BOUNTY_CREATED', { bountyCreated: rows[0] });
      return rows[0];
    },
  },
  Subscription: {
    bountyCreated: {
      subscribe: () => pubsub.asyncIterator(['BOUNTY_CREATED']),
    },
  },
  Bounty: {
    sponsor: async (parent: any) => {
      const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [parent.sponsor_id]);
      return rows[0];
    },
    applications: async (parent: any) => {
      const { rows } = await db.query('SELECT * FROM applications WHERE bounty_id = $1', [
        parent.id,
      ]);
      return rows;
    },
  },
  Application: {
    applicant: async (parent: any) => {
      const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [parent.applicant_id]);
      return rows[0];
    },
    bounty: async (parent: any) => {
      const { rows } = await db.query('SELECT * FROM bounties WHERE id = $1', [parent.bounty_id]);
      return rows[0];
    },
  },
};

export const schema = makeExecutableSchema({ typeDefs, resolvers });
