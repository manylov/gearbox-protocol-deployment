import "dotenv/config";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { getContractsPathsFromDeps, node_url } from "./utils/config-helpers";
import "hardhat-dependency-compiler";
import "hardhat-deploy";

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
    paths: getContractsPathsFromDeps("@gearbox-protocol/core-v2/contracts/")
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
