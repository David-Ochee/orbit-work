import type { Metadata } from 'next';
import '../styles/globals.css';
import { ApolloWrapper } from '@/components/ApolloWrapper';

export const metadata: Metadata = {
  title: 'OrbitWork — Earn XLM for Any Skill',
  description:
    'Inclusive Web3 bounty platform on Stellar. Earn XLM for design, writing, research, marketing, and development.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ApolloWrapper>{children}</ApolloWrapper>
      </body>
    </html>
  );
}
