export interface TransactionMaterial {
  at: {
    hash: string;
    height: number;
  };
  genesisHash: string;
  chainName: string;
  specName: 'acala' | 'karura' | 'mandala';
  specVersion: number;
  txVersion: number;
  metadata: string;
}

export interface RuntimeVersion {
  specVersion: number;
  transactionVersion: number;
  specName: 'acala' | 'karura' | 'mandala';
}

export interface Block {
  header: {
    number: number;
  };
}

export interface Balance {
  nonce: number;
}

export interface Transaction {
  hash: string;
}
