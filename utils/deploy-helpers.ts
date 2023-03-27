import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
  NetworkType,
  SupportedToken,
  tokenDataByNetwork,
  WAD,
} from "@gearbox-protocol/sdk";
import { BigNumber, ethers } from "ethers";
import { poolsSettings } from "../deployment-settings";

export const getPoolSettings = (chainId: NetworkType) => {
  const pool = process.argv[4];
  const deploySettings = getSettingsForChain(chainId)[pool]; // DEPLOYMENT_SETTINGS[pool];
  if (!deploySettings)
    throw new Error(
      `Pool with id ${pool} is not found in deployment-settings.ts`
    );

  return deploySettings;
};

export const getChain = async (
  hre: HardhatRuntimeEnvironment
): Promise<NetworkType> => {
  const chain = await hre.ethers.provider.getNetwork();
  if (chain.name !== "Mainnet" && chain.name !== "Goerli") {
    return process.env.FORK_CHAIN === "MAINNET" ? "Mainnet" : "Goerli";
  }
  return chain.name;
};

export type PoolDeploySettings = {
  poolConfig: {
    U_optimal: number;
    R_base: number;
    R_slope1: number;
    R_slope2: number;
    underlying: SupportedToken;
    expectedLiquidityLimit: BigNumber;
    withdrawFee: number;
  };
  creditManagerConfig: {
    minBorrowedAmount: BigNumber;
    maxBorrowedAmount: BigNumber;
    collateralTokens: {
      symbol: SupportedToken;
      liquidationThreshold: number;
    }[];
    salt: number;
  };
};

export type PoolsConfigSettings = Record<string, PoolDeploySettings>;

export type PoolOpts = {
  addressProvider: string;
  underlying: string;
  U_optimal: number;
  R_base: number;
  R_slope1: number;
  R_slope2: number;
  expectedLiquidityLimit: string;
  withdrawFee: number;
};

export type CollateralToken = {
  token: string;
  liquidationThreshold: number;
};

export type CreditManagerOpts = {
  minBorrowedAmount: string;
  maxBorrowedAmount: string;
  collateralTokens: CollateralToken[];
  degenNFT: string;
  expirable: boolean;
};

export type POOL_DEPLOYMENT_PARAMS = {
  poolId: string;
  poolOpts: PoolOpts;
  creditManager: {
    creditManagerOpts: CreditManagerOpts;
    salt: number;
  };
};

export type DEPLOYMENT_SETTINGS = Record<string, POOL_DEPLOYMENT_PARAMS>;

const getTokenAddressFromSdkForChainByName = (
  chainId: NetworkType,
  token: SupportedToken
): string => {
  return tokenDataByNetwork[chainId][token];
};

const getTokenData = (
  chainId: NetworkType,
  data: { symbol: string; liquidationThreshold: number }[]
): { token: string; liquidationThreshold: number }[] => {
  const result: { token: string; liquidationThreshold: number }[] = [];
  data.forEach((tokenData) => {
    const tokenAddress = getTokenAddressFromSdkForChainByName(
      chainId,
      tokenData.symbol as SupportedToken
    );
    result.push({
      token: tokenAddress,
      liquidationThreshold: tokenData.liquidationThreshold * 100,
    });
  });
  return result;
};

export const getSettingsForChain = (
  chainId: NetworkType
): DEPLOYMENT_SETTINGS => {
  const addressProvider =
    chainId === "Mainnet"
      ? "0xcF64698AFF7E5f27A11dff868AF228653ba53be0"
      : "place goerli address provider here";

  const fullSettings: DEPLOYMENT_SETTINGS = {};

  for (const pool in poolsSettings) {
    const poolSettings = poolsSettings[pool];
    fullSettings[pool] = {
      poolId: pool,
      poolOpts: {
        addressProvider,
        U_optimal: poolSettings.poolConfig.U_optimal,
        R_base: poolSettings.poolConfig.R_base,
        R_slope1: poolSettings.poolConfig.R_slope1,
        R_slope2: poolSettings.poolConfig.R_slope2,
        underlying: getTokenAddressFromSdkForChainByName(
          chainId,
          poolSettings.poolConfig.underlying
        ),
        expectedLiquidityLimit:
          poolSettings.poolConfig.expectedLiquidityLimit.toString(),
        withdrawFee: poolSettings.poolConfig.withdrawFee,
      },
      creditManager: {
        creditManagerOpts: {
          minBorrowedAmount:
            poolSettings.creditManagerConfig.minBorrowedAmount.toString(),
          maxBorrowedAmount:
            poolSettings.creditManagerConfig.maxBorrowedAmount.toString(),
          collateralTokens: getTokenData(
            chainId,
            poolSettings.creditManagerConfig.collateralTokens
          ),
          degenNFT: ethers.constants.AddressZero,
          expirable: true,
        },
        salt: poolSettings.creditManagerConfig.salt,
      },
    };
  }

  return fullSettings;
};
