'use client';

import { useQuery, gql } from '@apollo/client';
import BountyCard from '@/components/BountyCard';

const GET_BOUNTIES = gql`
  query GetBounties($status: BountyStatus, $category: String, $limit: Int, $offset: Int) {
    bounties(status: $status, category: $category, limit: $limit, offset: $offset) {
      id
      title
      description
      reward
      currency
      status
      category
      claimType
      sponsor {
        id
        username
        avatarUrl
      }
      createdAt
      expiresAt
    }
  }
`;

export default function BountiesPage() {
  const { data, loading, error } = useQuery(GET_BOUNTIES, {
    variables: { limit: 20, offset: 0 },
  });

  if (loading) return <div className="p-8 text-center text-gray-400">Loading bounties…</div>;
  if (error) return <div className="p-8 text-center text-red-400">Error: {error.message}</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Open Bounties</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.bounties.map((b: any) => (
          <BountyCard key={b.id} bounty={b} />
        ))}
      </div>
    </div>
  );
}
