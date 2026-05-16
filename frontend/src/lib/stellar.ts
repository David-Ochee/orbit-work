import { Horizon, Networks } from 'stellar-sdk';

const NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'testnet';

export const horizonServer = new Horizon.Server(
  NETWORK === 'mainnet' ? 'https://horizon.stellar.org' : 'https://horizon-testnet.stellar.org',
);

export const networkPassphrase = NETWORK === 'mainnet' ? Networks.PUBLIC : Networks.TESTNET;

export async function getAccountBalance(publicKey: string): Promise<string> {
  const account = await horizonServer.loadAccount(publicKey);
  const xlm = account.balances.find((b) => b.asset_type === 'native');
  return xlm ? xlm.balance : '0';
}
