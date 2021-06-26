# About

Acala Txwrapper is a library for generating offline transactions for the Acala chain.

## Get Started

```
yarn add @acala-network/txwrapper-acala
```

```
import {
  construct,
  methods,
} from '@acala-network/txwrapper-acala"';

const unsigned = methods.currencies.transfer(
  {
    dest: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
    value: 100,
  },
  {
    // Additional information needed to construct the transaction offline.
  }
);

const signingPayload = construct.signingPayload(unsigned, { registry });

// On your offline device, sign the payload.
const signature = myOfflineSigning(signingPayload);

// Construct signed transaction ready to be broadcasted.
const tx = construct.signedTx(unsigned, signature, { metadataRpc, registry });
```

[See examples of how to use acala-txwrapper.](https://github.com/AcalaNetwork/txwrapper/examples/README.md).
