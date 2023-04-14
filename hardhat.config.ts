import "dotenv/config";
import { HardhatUserConfig, types, task } from "hardhat/config";
import { getContractsPathsFromDeps, node_url } from "./utils/config-helpers";
import "hardhat-dependency-compiler";
import "dotenv/config";
import "@nomiclabs/hardhat-ethers";
import "hardhat-deploy-ethers";
import "hardhat-gas-reporter";
import "@typechain/hardhat";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.10",
    settings: {
      optimizer: {
        enabled: true,
        runs: 100000,
      },
    },
  },
  paths: {
    sources: "contracts",
  },
  dependencyCompiler: {
    paths: [
      // ...getContractsPathsFromDeps(
      //   "@gearbox-protocol/integrations-v2/contracts/"
      // ),
      ...getContractsPathsFromDeps("@gearbox-protocol/core-v2/contracts/"),
    ],
    // keep: true,
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      forking: {
        enabled: true,
        url: node_url(process.env.FORK_CHAIN!),
      },
    },
    mainnet: {
      url: process.env.MAINNET_NODE_URI,
      accounts: {
        mnemonic: process.env.MNEMONIC,
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 10,
      },
    },
    goerli: {
      url: process.env.GOERLI_NODE_URI,
      accounts: {
        mnemonic: process.env.MNEMONIC,
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 10,
      },
    },
  },
};

export default config;
