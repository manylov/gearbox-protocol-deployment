import "dotenv/config";
import { HardhatUserConfig, types, task } from "hardhat/config";
import { getContractsPathsFromDeps, node_url } from "./utils/config-helpers";
import "hardhat-dependency-compiler";
import "dotenv/config";
import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";
import "hardhat-deploy-ethers";
import "hardhat-gas-reporter";
import "@typechain/hardhat";

task("new-pool", "Deploy new pool")
  .addParam("pool", "Pool id from deployment-settings.ts", "", types.string)
  .setAction(async (args, hre) => {
    if (!args.pool) throw new Error("Pool to deploy is not defined");
    await hre.run("deploy");
  });

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
  namedAccounts: {
    deployer: 0,
  },
  dependencyCompiler: {
    // paths: getContractsPathsFromDeps("@gearbox-protocol/core-v2/contracts/"),
    paths: [
      ...getContractsPathsFromDeps(
        "@gearbox-protocol/integrations-v2/contracts/"
      ),
      ...getContractsPathsFromDeps("@gearbox-protocol/core-v2/contracts/"),
    ],
    // keep: true,
  },
  networks: {
    hardhat: {
      forking: {
        enabled: true,
        url: node_url(process.env.FORK_CHAIN!),
      },
      // accounts: {
      //   mnemonic: process.env.MNEMONIC,
      //   path: "m/44'/60'/0'/0",
      //   initialIndex: 0,
      //   count: 10,
      // },
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
