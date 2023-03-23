import { contractsByNetwork, tokenDataByNetwork } from "@gearbox-protocol/sdk";

export const addressProvider = "0xcF64698AFF7E5f27A11dff868AF228653ba53be0";
export const degenNFT = "0xB829a5b349b01fc71aFE46E50dD6Ec0222A6E599";

export type POOL_DEPLOYMENT_PARAMS = {
  tag: string;
  interestRateModel: {
    contract: string;
    // todo add generic to strictly define options types depended on rateModel type
    options: any[];
  };
  pool: {
    underlyingToken: string;
    expectedLiquidityLimit: string;
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
      underlyingToken: tokenDataByNetwork.Mainnet.DAI,
      expectedLiquidityLimit: "10000000",
    },
  },
};
