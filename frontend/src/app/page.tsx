import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-5xl font-bold mb-4">
        Stellar<span className="text-stellar-purple">Work</span>
      </h1>
      <p className="text-xl text-gray-400 mb-8 max-w-xl">
        Earn XLM for design, writing, research, marketing, and development — all on Stellar.
      </p>
      <div className="flex gap-4">
        <Link
          href="/bounties"
          className="px-6 py-3 bg-stellar-purple rounded-lg font-semibold hover:opacity-90 transition"
        >
          Browse Bounties
        </Link>
        <Link
          href="/bounties/new"
          className="px-6 py-3 border border-stellar-purple rounded-lg font-semibold hover:bg-stellar-purple/10 transition"
        >
          Post a Bounty
        </Link>
      </div>
    </main>
  );
}
