import { WAD } from "@gearbox-protocol/sdk";
import { CreditManagersConfig } from "./helpers";

export const creditManagersConfig: CreditManagersConfig = {
  Mainnet: {
    DAI: {
      minBorrowedAmount: WAD.mul(100),
      maxBorrowedAmount: WAD.mul(100000),
      collateralTokens: [
        {
          token: "WETH",
          liquidationThreshold: 10000,
        },
        {
          token: "DAI",
          liquidationThreshold: 10000,
        },
      ],
    },
    USDC: {
      minBorrowedAmount: WAD.mul(100),
      maxBorrowedAmount: WAD.mul(100000),
      collateralTokens: [
        {
          token: "WETH",
          liquidationThreshold: 10000,
        },
        {
          token: "DAI",
          liquidationThreshold: 10000,
        },
      ],
    },
    WETH: {
      minBorrowedAmount: WAD.mul(100),
      maxBorrowedAmount: WAD.mul(100000),
      collateralTokens: [
        {
          token: "WETH",
          liquidationThreshold: 10000,
        },
        {
          token: "DAI",
          liquidationThreshold: 10000,
        },
      ],
    },
  },
};
