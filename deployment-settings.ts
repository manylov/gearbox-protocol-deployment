import { contractsByNetwork, tokenDataByNetwork } from "@gearbox-protocol/sdk";

export const addressProvider = "0xcF64698AFF7E5f27A11dff868AF228653ba53be0";

export type POOL_DEPLOYMENT_PARAMS = {
  tag: string;
  interestRateModel: {
    contract: string;
    options: any[];
  };
  pool: {
    contract: string;
    underlyingToken: string;
    expectedLiquidityLimit: bigint;
  };
};

export type DEPLOYMENT_SETTINGS = Record<string, POOL_DEPLOYMENT_PARAMS>;

export const DEPLOYMENT_SETTINGS: DEPLOYMENT_SETTINGS = {
  DAI: {
    tag: "DAI",
    interestRateModel: {
      contract: "LinearInterestRateModel",
      /*
        U_optimal: 8500,
        R_base: 0,
        R_slope1: 200,
        R_slope2: 10000,
      */
      options: [8500, 0, 200, 10000],
    },
    pool: {
      contract: "PoolService",
      underlyingToken: tokenDataByNetwork.Mainnet.DAI,
      expectedLiquidityLimit: BigInt("10000000"),
    },
  },
};
