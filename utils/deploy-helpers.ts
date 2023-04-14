import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
  NetworkType,
  SupportedToken,
  tokenDataByNetwork,
  WAD,
} from "@gearbox-protocol/sdk";
import { BigNumber, ethers } from "ethers";

export const getChain = async (
  hre: HardhatRuntimeEnvironment
): Promise<NetworkType> => {
  const chain = await hre.ethers.provider.getNetwork();
  if (chain.name !== "Mainnet" && chain.name !== "Goerli") {
    return process.env.FORK_CHAIN === "MAINNET" ? "Mainnet" : "Goerli";
  }
  return chain.name;
};

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
