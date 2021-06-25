import { Keyring } from '@polkadot/api';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { getRegistry } from '@substrate/txwrapper-registry';
import { construct, decode, deriveAddress, methods, TokenSymbol } from '@acala-network/txwrapper';

import { rpc, signWith } from './utils';

const NODE = 'http://127.0.0.1:9933';

async function main(): Promise<void> {
  await cryptoWaitReady();

  const alice = new Keyring().addFromUri('//Alice', { name: 'Alice' }, 'sr25519');

  console.log(`From address: ${deriveAddress(alice.publicKey, 42)}\n`);

  const { block } = await rpc(NODE, 'chain_getBlock');
  const blockHash = await rpc(NODE, 'chain_getBlockHash');
  const genesisHash = await rpc(NODE, 'chain_getBlockHash', [0]);
  const metadataRpc = await rpc(NODE, 'state_getMetadata');
  const chainName = await rpc(NODE, 'system_chain');
  const { specVersion, transactionVersion, specName } = await rpc(NODE, 'state_getRuntimeVersion');

  const registry = getRegistry({
    chainName,
    specName,
    specVersion,
    metadataRpc,
  });

  const unsigned = methods.currencies.transfer(
    {
      amount: '900719',
      currencyId: { Token: TokenSymbol.ACA },
      dest: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty', // Bob
    },
    {
      address: deriveAddress(alice.publicKey, 42),
      blockNumber: registry.createType('BlockNumber', block.header.number).toNumber(),
      blockHash,
      eraPeriod: 64,
      genesisHash,
      metadataRpc,
      nonce: 0, // This needs to be incremented from user account nonce
      specVersion,
      tip: 0,
      transactionVersion,
    },
    {
      metadataRpc,
      registry,
    }
  );

  const signingPayload = construct.signingPayload(unsigned, { registry });
  const signature = signWith(alice, signingPayload, {
    metadataRpc,
    registry,
  });

  const tx = construct.signedTx(unsigned, signature, {
    metadataRpc,
    registry,
  });

  const expectedTxHash = construct.txHash(tx);
  const payloadInfo = decode(signingPayload, {
    metadataRpc,
    registry,
  });

  console.log(`Chain node: ${chainName}`);
  console.log(`Tx signature: ${signature}`);
  console.log(`Expected hash: ${expectedTxHash}\n`);

  console.log(
    `Sending transaction\n  To: ${JSON.stringify(payloadInfo.method.args.dest)}\n` +
      `  Amount: ${payloadInfo.method.args.amount}\n` +
      `  CurrencyId: ${JSON.stringify(payloadInfo.method.args.currencyId)}\n`
  );

  let hash = await rpc(NODE, 'author_submitExtrinsic', [tx]);

  console.log(`Sent with hash: ${hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
