import { WAD } from "@gearbox-protocol/sdk";
import { PoolsConfigSettings } from "./utils/deploy-helpers";

export const poolsSettings: PoolsConfigSettings = {
  DAI: {
    poolConfig: {
      U_optimal: 8500,
      R_base: 0,
      R_slope1: 200,
      R_slope2: 10000,
      underlying: "DAI",
      expectedLiquidityLimit: WAD.mul(150000),
      withdrawFee: 1000,
    },
    creditManagerConfig: {
      minBorrowedAmount: WAD.mul(150000),
      maxBorrowedAmount: WAD.mul(1000000),
      collateralTokens: [
        { symbol: "WETH", liquidationThreshold: 85 },
        { symbol: "STETH", liquidationThreshold: 82.5 },
        { symbol: "WBTC", liquidationThreshold: 85 },

        { symbol: "USDC", liquidationThreshold: 92 },
        { symbol: "USDT", liquidationThreshold: 90 },
        { symbol: "sUSD", liquidationThreshold: 90 },
        { symbol: "FRAX", liquidationThreshold: 90 },
        { symbol: "GUSD", liquidationThreshold: 90 },
        { symbol: "LUSD", liquidationThreshold: 90 },

        { symbol: "steCRV", liquidationThreshold: 82.5 },
        { symbol: "cvxsteCRV", liquidationThreshold: 82.5 },

        { symbol: "3Crv", liquidationThreshold: 90 },
        { symbol: "cvx3Crv", liquidationThreshold: 90 },

        { symbol: "FRAX3CRV", liquidationThreshold: 90 },
        { symbol: "cvxFRAX3CRV", liquidationThreshold: 90 },

        { symbol: "LUSD3CRV", liquidationThreshold: 90 },
        { symbol: "cvxLUSD3CRV", liquidationThreshold: 90 },

        { symbol: "crvPlain3andSUSD", liquidationThreshold: 90 },
        { symbol: "cvxcrvPlain3andSUSD", liquidationThreshold: 90 },

        { symbol: "gusd3CRV", liquidationThreshold: 90 },
        { symbol: "cvxgusd3CRV", liquidationThreshold: 90 },

        { symbol: "crvFRAX", liquidationThreshold: 90 },
        { symbol: "cvxcrvFRAX", liquidationThreshold: 90 },

        { symbol: "yvDAI", liquidationThreshold: 90 },
        { symbol: "yvUSDC", liquidationThreshold: 90 },
        { symbol: "yvWETH", liquidationThreshold: 82.5 },
        { symbol: "yvWBTC", liquidationThreshold: 82.5 },
        { symbol: "yvCurve_stETH", liquidationThreshold: 82.5 },
        { symbol: "yvCurve_FRAX", liquidationThreshold: 90 },

        { symbol: "CVX", liquidationThreshold: 25 },
        { symbol: "FXS", liquidationThreshold: 25 },
        { symbol: "LQTY", liquidationThreshold: 0 },
        { symbol: "CRV", liquidationThreshold: 25 },
        { symbol: "LDO", liquidationThreshold: 0 },
        { symbol: "SNX", liquidationThreshold: 25 },
      ],
      salt: 123,
    },
  },
};
