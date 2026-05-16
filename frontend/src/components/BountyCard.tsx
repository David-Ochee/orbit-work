import Link from 'next/link';

interface Bounty {
  id: string;
  title: string;
  description: string;
  reward: number;
  currency: string;
  status: string;
  category: string;
  claimType: string;
  sponsor: { username: string; avatarUrl?: string };
  expiresAt?: string;
}

export default function BountyCard({ bounty: b }: { bounty: Bounty }) {
  return (
    <Link
      href={`/bounties/${b.id}`}
      className="block rounded-xl border border-gray-800 bg-gray-900 p-5 hover:border-stellar-purple transition"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-stellar-purple uppercase tracking-wide">{b.category}</span>
        <span className="text-xs text-gray-500">{b.claimType}</span>
      </div>
      <h2 className="font-semibold text-lg leading-snug mb-1">{b.title}</h2>
      <p className="text-sm text-gray-400 line-clamp-2 mb-4">{b.description}</p>
      <div className="flex items-center justify-between text-sm">
        <span className="font-bold text-stellar-blue">
          {b.reward} {b.currency}
        </span>
        <span className="text-gray-500">@{b.sponsor.username}</span>
      </div>
    </Link>
  );
}
