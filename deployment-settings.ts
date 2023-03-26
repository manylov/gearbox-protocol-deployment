import {
  contractsByNetwork,
  SupportedToken,
  tokenDataByNetwork,
} from "@gearbox-protocol/sdk";

export const getChain = () => {
  if (process.env.CHAIN === "MAINNET") return "Mainnet";
  return "Goerli";
};

export const addressProvider = "0xcF64698AFF7E5f27A11dff868AF228653ba53be0";
export const degenNFT = "0xB829a5b349b01fc71aFE46E50dD6Ec0222A6E599";

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
  creditFacade: {
    expirable: boolean;
  };
};

export type DEPLOYMENT_SETTINGS = Record<string, POOL_DEPLOYMENT_PARAMS>;

const getTokenAddressFromSdkByName = (token: SupportedToken): string => {
  return tokenDataByNetwork[getChain()][token];
};

export const DEPLOYMENT_SETTINGS: DEPLOYMENT_SETTINGS = {
  DAI: {
    poolId: "DAI",
    poolOpts: {
      addressProvider,
      U_optimal: 8500,
      R_base: 0,
      R_slope1: 200,
      R_slope2: 10000,
      underlying: getTokenAddressFromSdkByName("DAI"),
      expectedLiquidityLimit: "10000000",
      withdrawFee: 1000,
    },
    creditManager: {
      creditManagerOpts: {
        minBorrowedAmount: "1000000",
        maxBorrowedAmount: "1000000",
        collateralTokens: [
          // {
          //   token: getTokenAddressFromSdkByName("USDT"),
          //   liquidationThreshold: 1000,
          // },
        ],
        degenNFT,
        expirable: true,
      },
      salt: 123,
    },

    creditFacade: {
      expirable: true,
    },
  },
};
