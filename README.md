# Gearbox protocol pool deployment suite

1. Set new pool to be deployed in ./deployment-settings.ts
2. Copy .env.examples to .env
3. Fill in an alchemy keys and deployment walled mnemonic

## Deploy to hardhat network

Deployment uses fork of mainnet or testnet.

Currently tested on Mainnet fork. You can set up hardhat fork chain in .env's FORK_CHAIN = MAINNET | GOERLI

`npx hardhat new-pool --pool DAI`

This command will search DAI settings in ./deployment-settings.ts and deploy following contracts:

1. PoolFactory with all pools contracts
2. CreditManagerFactory with all credit contracts
3. Adapters from SDK list

Finally, last deploy script will add created adapters to the Credit manager.

Actually, all adapters are deployed in ./003_deploy_adapters.ts, and I've implemented first few adapters only.
