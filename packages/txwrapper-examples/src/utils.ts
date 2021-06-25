import { KeyringPair } from '@polkadot/keyring/types';
import { EXTRINSIC_VERSION } from '@polkadot/types/extrinsic/v4/Extrinsic';
import { createMetadata, OptionsWithMeta } from '@substrate/txwrapper-polkadot';
import fetch from 'node-fetch';

/**
 * Sign payload
 */
export function signWith(pair: KeyringPair, signingPayload: string, options: OptionsWithMeta): string {
  const { registry, metadataRpc } = options;

  registry.setMetadata(createMetadata(registry, metadataRpc));

  const { signature } = registry
    .createType('ExtrinsicPayload', signingPayload, {
      version: EXTRINSIC_VERSION,
    })
    .sign(pair);

  return signature;
}

/**
 * Get data through endoint
 */
export const get = async (endpoint: string): Promise<{ [index: string]: any }> => {
  const response = await fetch(endpoint);
  const result = await response.json();
  if (result.error) {
    throw new Error(`${result.error} ${result.cause}`);
  }
  return result;
};

/**
 * Send data through endpoint
 */
export const post = async (
  endpoint: string,
  body: { [index: string]: any } = {}
): Promise<{ [index: string]: any }> => {
  const response = await fetch(endpoint, {
    body: JSON.stringify(body),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const result = await response.json();
  if (result.error) {
    throw new Error(`${result.error} ${result.cause}`);
  }
  return result;
};

/**
 * Send JSONRPC data to node
 */
export const rpc = async (node: string, method: string, params: any[] = []): Promise<any> => {
  const response = await fetch(node, {
    body: JSON.stringify({
      id: 1,
      jsonrpc: '2.0',
      method,
      params,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });
  const { error, result } = await response.json();
  if (error) {
    throw new Error(`${error.code} ${error.message}: ${JSON.stringify(error.data)}`);
  }
  return result;
};
