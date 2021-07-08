import { Keyring } from '@polkadot/api';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { EXTRINSIC_VERSION } from '@polkadot/types/extrinsic/v4/Extrinsic';

import {
  construct,
  decode,
  deriveAddress,
  methods,
  TokenSymbol,
  getRegistry
} from '../src';

import { rpc } from './util';
import { RuntimeVersion, Block } from './types';

const NODE = 'http://127.0.0.1:9933';

async function main(): Promise<void> {
  await cryptoWaitReady();

  // Create a new keyring and add an Alice account.
  const alice = new Keyring().addFromUri(
    '//Alice',
    { name: 'Alice' },
    'sr25519'
  );

  console.log(
    `Alice's account address: ${deriveAddress(alice.publicKey, 42)}\n`
  );

  // Pull info from the node to construct an offline transaction. It's up
  // to you how you retrieve this info but here we are using RPC calls to the
  // local node.
  const { block } = await rpc<{ block: Block }>(NODE, 'chain_getBlock');
  const blockHash = await rpc(NODE, 'chain_getBlockHash');
  const genesisHash = await rpc(NODE, 'chain_getBlockHash', [0]);
  const metadataRpc = await rpc(NODE, 'state_getMetadata');
  const chainName = await rpc(NODE, 'system_chain');
  const { specVersion, transactionVersion, specName } =
    await rpc<RuntimeVersion>(NODE, 'state_getRuntimeVersion');

  // Create a new registry instance using metadata from node.
  const registry = getRegistry({
    chainName,
    specName,
    specVersion,
    metadataRpc
  });

  // Create an unsigned currency transfer transaction.
  const unsigned = methods.currencies.transfer(
    {
      amount: '900719',
      currencyId: { Token: TokenSymbol.ACA },
      dest: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty' // Bob
    },
    {
      address: deriveAddress(alice.publicKey, 42),
      blockNumber: registry
        .createType('BlockNumber', block.header.number)
        .toNumber(),
      blockHash,
      eraPeriod: 64,
      genesisHash,
      metadataRpc,
      nonce: 4,
      specVersion,
      tip: 0,
      transactionVersion
    },
    {
      metadataRpc,
      registry
    }
  );

  // Construct the signing payload from the unsigned transaction.
  const signingPayload = construct.signingPayload(unsigned, { registry });

  // Sign the payload.
  const { signature } = registry
    .createType('ExtrinsicPayload', signingPayload, {
      version: EXTRINSIC_VERSION
    })
    .sign(alice);

  // Create a signed transaction.
  const tx = construct.signedTx(unsigned, signature, {
    metadataRpc,
    registry
  });

  const expectedTxHash = construct.txHash(tx);

  // Decode transaction payload.
  const payloadInfo = decode(signingPayload, {
    metadataRpc,
    registry
  });

  console.log(`Chain node: ${chainName}\n`);
  console.log(`Tx signature: ${signature}\n`);

  console.log(
    `Decoded transaction\n  To (Bob): ${JSON.stringify(
      payloadInfo.method.args.dest
    )}\n` +
      `  Amount: ${payloadInfo.method.args.amount}\n` +
      `  CurrencyId: ${JSON.stringify(payloadInfo.method.args.currencyId)}\n`
  );

  // Send the transaction to the node. Txwrapper doesn't care how
  // you send this transaction but here we are using an RPC call
  // to the local node.
  const hash = await rpc(NODE, 'author_submitExtrinsic', [tx]);

  console.log(`Expected hash: ${expectedTxHash}`);
  console.log(`Tx hash: ${hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
