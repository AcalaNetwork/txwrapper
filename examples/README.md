# How to use `txwrapper-acala`

Here's a mini-tutorial on how txwrapper-acala can interact with a Substrate chain. We're using a [Acala dev chain](https://wiki.acala.network/maintain/network-maintainers/node-management).

## Get Started

1. Build and run a Acala dev node. One way to do that is throguh [Docker](https://www.docker.com/get-started).

   To install Docker on Linux:

   ```
   wget -qO- https://get.docker.com/ | sh
   ```

   You can also [build and run an Acala node](https://wiki.acala.network/maintain/network-maintainers/node-management) with Rust.

2. After install Docker, pull the latest acala node image and start the dev container. Be sure to externalize RPC and WS with the `--ws-external` and `--rpc-external` flags respectively.

   ```bash
    docker pull acala/acala-node:latest
    docker run -it -p 9944:9944 -p 9933:9933 acala/acala-node:latest --dev --ws-external --rpc-external --rpc-cors=all
   ```

3. Run the RPC example from the root of the repository.

   ```bash
   yarn run example:rpc
   ```

## Sidecar

You can run an example using the [Substrate API sidecar](https://github.com/paritytech/substrate-api-sidecar) instead of RPC.

1. Install the API sidecar:

   ```
   npm install -g @substrate/api-sidecar
   ```

2. Follow the instructions in the previous example to start a local Acala dev node.

3. Start the API sidecar:

   ```
   substrate-api-sidecar
   ```

4. In another terminal window, run the sidear example from the root of this repository.

   ```bash
   yarn run example:sidecar
   ```

## Expected Output

Here's a sample output of the above script, using a Acala node. Your payload to sign and signature will of course differ from this example.

```
Alice's account address: 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY

Chain node: Development

Tx signature: 0x01fefdb9ecf773da528de2f195290f209dba14b0ae8f0c962efa77de3b639ec83ff2a4d0392f5fa4f4d822ab28fd7b21ddfe72c1d5eaa47d1ad15ca8a3df76fa8c

Decoded transaction
  To (Bob): {"id":"5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty"}
  Amount: 900719
  CurrencyId: {"token":"ACA"}

Expected hash: 0x2a4271ea206892e46f38a0abf2726ca6e974d58cf7ffc4f4dbd8fb1c7885e440
Tx hash: 0x2a4271ea206892e46f38a0abf2726ca6e974d58cf7ffc4f4dbd8fb1c7885e440
```

## Offline vs. Online

In the examples, the `rpc`, `get` and `post` functions are the only functions that needs to be called with internet access. Everything else can be performed offline. In particular, this example shows how to perform the following operations offline:

- Generate a tx,
- Create its signing payload,
- Sign the signing payload,
- Calculate the tx hash,
- Decode payload data.
