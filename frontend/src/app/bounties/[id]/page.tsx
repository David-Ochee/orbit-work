'use client';

import { useQuery, gql } from '@apollo/client';

const GET_BOUNTY = gql`
  query GetBounty($id: ID!) {
    bounty(id: $id) {
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
      applications {
        id
        applicant {
          id
          username
        }
        status
        createdAt
      }
      createdAt
      expiresAt
    }
  }
`;

export default function BountyDetailPage({ params }: { params: { id: string } }) {
  const { data, loading, error } = useQuery(GET_BOUNTY, { variables: { id: params.id } });

  if (loading) return <div className="p-8 text-center text-gray-400">Loading…</div>;
  if (error) return <div className="p-8 text-center text-red-400">Error: {error.message}</div>;

  const b = data?.bounty;
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <span className="text-sm text-stellar-purple uppercase tracking-wide">{b.category}</span>
      <h1 className="text-3xl font-bold mt-1 mb-3">{b.title}</h1>
      <p className="text-gray-300 mb-6">{b.description}</p>
      <div className="flex items-center gap-4 text-sm text-gray-400">
        <span>
          Reward:{' '}
          <strong className="text-white">
            {b.reward} {b.currency}
          </strong>
        </span>
        <span>Status: {b.status}</span>
        <span>Type: {b.claimType}</span>
      </div>
    </div>
  );
}
