import {
  CREDIT_MANAGER_DAI_V2_MAINNET,
  CREDIT_MANAGER_USDC_V2_MAINNET,
  CREDIT_MANAGER_WETH_V2_MAINNET,
  CREDIT_MANAGER_WSTETH_V2_MAINNET,
  CREDIT_MANAGER_WBTC_V2_MAINNET,
  CREDIT_MANAGER_FRAX_V2_MAINNET,
  CREDIT_MANAGER_DAI_V2_GOERLI,
  CREDIT_MANAGER_USDC_V2_GOERLI,
  CREDIT_MANAGER_WETH_V2_GOERLI,
  CREDIT_MANAGER_WSTETH_V2_GOERLI,
  CREDIT_MANAGER_WBTC_V2_GOERLI,
} from "@gearbox-protocol/sdk";

import { CreditManagers } from "./helpers";

export const creditManagers: CreditManagers = {
  Mainnet: {
    DAI: CREDIT_MANAGER_DAI_V2_MAINNET,
    USDC: CREDIT_MANAGER_USDC_V2_MAINNET,
    WETH: CREDIT_MANAGER_WETH_V2_MAINNET,
    wstETH: CREDIT_MANAGER_WSTETH_V2_MAINNET,
    WBTC: CREDIT_MANAGER_WBTC_V2_MAINNET,
    FRAX: CREDIT_MANAGER_FRAX_V2_MAINNET,
  },
  Goerli: {
    DAI: CREDIT_MANAGER_DAI_V2_GOERLI,
    USDC: CREDIT_MANAGER_USDC_V2_GOERLI,
    WETH: CREDIT_MANAGER_WETH_V2_GOERLI,
    wstETH: CREDIT_MANAGER_WSTETH_V2_GOERLI,
    WBTC: CREDIT_MANAGER_WBTC_V2_GOERLI,
  },
};