import { Keyring } from '@polkadot/api';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { getRegistry } from '@substrate/txwrapper-registry';
import { construct, decode, deriveAddress, methods, TokenSymbol } from '@acala-network/txwrapper';

import { get, post, signWith } from './utils';

const SIDECAR_HOST = 'http://127.0.0.1:8080';

async function main(): Promise<void> {
  await cryptoWaitReady();

  const alice = new Keyring().addFromUri('//Alice', { name: 'Alice' }, 'sr25519');

  console.log(`From address: ${deriveAddress(alice.publicKey, 42)}\n`);

  const material = await get(`${SIDECAR_HOST}/transaction/material`);
  const balance = await get(`${SIDECAR_HOST}/accounts/${deriveAddress(alice.publicKey, 42)}/balance-info`);

  const {
    at: { hash, height },
    genesisHash,
    chainName,
    specName,
    specVersion,
    txVersion,
    metadata,
  } = material;

  const registry = getRegistry({
    chainName,
    specName,
    specVersion,
    metadataRpc: metadata,
  });

  const unsigned = methods.currencies.transfer(
    {
      amount: '900719',
      currencyId: { Token: TokenSymbol.ACA },
      dest: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty', // Bob
    },
    {
      address: deriveAddress(alice.publicKey, 42),
      blockHash: hash,
      blockNumber: height,
      eraPeriod: 64,
      genesisHash,
      metadataRpc: metadata,
      nonce: balance.nonce++, // This doesn't take into account pending transactions in the pool
      specVersion,
      tip: 0,
      transactionVersion: txVersion,
    },
    {
      metadataRpc: metadata,
      registry,
    }
  );

  const signingPayload = construct.signingPayload(unsigned, { registry });
  const signature = signWith(alice, signingPayload, {
    metadataRpc: metadata,
    registry,
  });

  const tx = construct.signedTx(unsigned, signature, {
    metadataRpc: metadata,
    registry,
  });

  const expectedTxHash = construct.txHash(tx);
  const payloadInfo = decode(signingPayload, {
    metadataRpc: metadata,
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

  let response = await post(`${SIDECAR_HOST}/transaction`, { tx: tx });

  console.log(`Sent with hash: ${response.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
