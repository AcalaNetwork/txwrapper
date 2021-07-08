/**
 * @ignore
 */
import fetch from 'node-fetch';

/**
 * Get data through endoint
 */
export const get = async <T>(endpoint: string): Promise<T> => {
  const result = await fetch(endpoint).then((response) => {
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.json() as Promise<T>;
  });

  return result;
};

/**
 * Send data through endpoint
 */
export const post = async <T>(
  endpoint: string,
  body: { [index: string]: any } = {}
): Promise<T> => {
  const result = await fetch(endpoint, {
    body: JSON.stringify(body),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((response) => {
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.json() as Promise<T>;
  });

  return result;
};

/**
 * Send JSONRPC data to node
 */
export const rpc = async <T = string>(
  node: string,
  method: string,
  params: any[] = []
): Promise<T> => {
  const { result } = await fetch(node, {
    body: JSON.stringify({
      id: 1,
      jsonrpc: '2.0',
      method,
      params
    }),
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST'
  }).then((response) => {
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.json() as Promise<{ result: T }>;
  });

  return result;
};
