import {
  Contract,
  SorobanRpc,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  Keypair,
  nativeToScVal,
  Address,
} from 'stellar-sdk';

const server = new SorobanRpc.Server(
  process.env.STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org',
);
const networkPassphrase =
  process.env.STELLAR_NETWORK === 'mainnet' ? Networks.PUBLIC : Networks.TESTNET;

async function submitTx(tx: any) {
  const keypair = Keypair.fromSecret(process.env.STELLAR_SECRET_KEY!);
  const prepared = await server.prepareTransaction(tx);
  prepared.sign(keypair);
  return server.sendTransaction(prepared);
}

export const escrowService = {
  async lockFunds(bountyId: string, sponsorAddress: string, amount: bigint): Promise<string> {
    const contractId = process.env.ESCROW_CONTRACT_ID!;
    const contract = new Contract(contractId);
    const keypair = Keypair.fromSecret(process.env.STELLAR_SECRET_KEY!);
    const account = await server.getAccount(keypair.publicKey());
    const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase })
      .addOperation(
        contract.call(
          'lock_funds',
          nativeToScVal(bountyId, { type: 'string' }),
          new Address(sponsorAddress).toScVal(),
          nativeToScVal(amount, { type: 'i128' }),
        ),
      )
      .setTimeout(30)
      .build();
    const result = await submitTx(tx);
    return result.hash;
  },

  async releaseFunds(bountyId: string, recipientAddress: string): Promise<string> {
    const contractId = process.env.ESCROW_CONTRACT_ID!;
    const contract = new Contract(contractId);
    const keypair = Keypair.fromSecret(process.env.STELLAR_SECRET_KEY!);
    const account = await server.getAccount(keypair.publicKey());
    const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase })
      .addOperation(
        contract.call(
          'release_funds',
          nativeToScVal(bountyId, { type: 'string' }),
          new Address(recipientAddress).toScVal(),
        ),
      )
      .setTimeout(30)
      .build();
    const result = await submitTx(tx);
    return result.hash;
  },
};
