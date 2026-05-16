import { Contract, SorobanRpc, TransactionBuilder, Networks, BASE_FEE, Keypair } from 'stellar-sdk';

const server = new SorobanRpc.Server(
  process.env.STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org',
);
const networkPassphrase =
  process.env.STELLAR_NETWORK === 'mainnet' ? Networks.PUBLIC : Networks.TESTNET;

export const reputationService = {
  async getScore(stellarAddress: string): Promise<number> {
    const contractId = process.env.REPUTATION_CONTRACT_ID;
    if (!contractId) return 0;
    try {
      const contract = new Contract(contractId);
      const keypair = Keypair.fromSecret(process.env.STELLAR_SECRET_KEY!);
      const account = await server.getAccount(keypair.publicKey());
      const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase })
        .addOperation(contract.call('get_score', ...[]))
        .setTimeout(30)
        .build();
      const simResult = await server.simulateTransaction(tx);
      if (SorobanRpc.Api.isSimulationError(simResult)) return 0;
      void stellarAddress; // address used for future on-chain lookup
      return 0; // Placeholder — parse XDR result in production
    } catch {
      return 0;
    }
  },
};
