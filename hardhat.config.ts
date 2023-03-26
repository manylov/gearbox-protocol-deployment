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
    // todo calculate deployer address from PK in .env
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
      forking: process.env.HARDHAT_FORK
        ? {
            enabled: true,
            url: node_url(process.env.HARDHAT_FORK),
          }
        : undefined,
    },
  },
};

export default config;
