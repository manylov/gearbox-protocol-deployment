import { NetworkType, SupportedToken } from "@gearbox-protocol/sdk";
import { BigNumber, ethers } from "ethers";
import { creditManagers } from "./credit-managers";
import { creditManagersConfig } from "./managers-configs";

type CollateralToken = {
  token: SupportedToken;
  liquidationThreshold: number;
};

export type CreditManagerOpts = {
  minBorrowedAmount: BigNumber;
  maxBorrowedAmount: BigNumber;
  collateralTokens: CollateralToken[];
  degenNFT: string;
  blacklistHelper: string;
  expirable: boolean;
};

export type CreditManagersConfig = Partial<
  Record<
    NetworkType,
    Partial<
      Record<
        SupportedToken,
        Omit<CreditManagerOpts, "degenNFT" | "blacklistHelper" | "expirable">
      >
    >
  >
>;

export const defaultCreditManagerOpts: CreditManagerOpts = {
  minBorrowedAmount: BigNumber.from(0),
  maxBorrowedAmount: BigNumber.from(0),
  collateralTokens: [],
  degenNFT: ethers.constants.AddressZero,
  blacklistHelper: ethers.constants.AddressZero,
  expirable: false,
};

export type CreditManager = Record<SupportedToken, string>;

export type CreditManagers = Partial<
  Record<NetworkType, Partial<CreditManager>>
>;

export const getCreditManagerAddressByTokenAndNetwork = (
  token: SupportedToken,
  network: NetworkType
): string => {
  const address = creditManagers[network]?.[token];

  if (!address) {
    throw new Error(
      `No credit manager found for token ${token} on network ${network}`
    );
  }
  return address;
};

export const getCreditManagerConfigByTokenAndNetwork = (
  token: SupportedToken,
  network: NetworkType
) => {
  const config = creditManagersConfig[network]?.[token];
  if (!config) {
    throw new Error(
      `No credit manager config found for token ${token} on network ${network}`
    );
  }
  return config;
};

export type DeployedContractType = "CreditConfigurator" | "CreditFacade";

export type DeployedContracts = Partial<
  Record<
    NetworkType,
    Partial<
      Record<SupportedToken, Partial<Record<DeployedContractType, string>>>
    >
  >
>;

/*
{
    "txs": [
        {
            "to": "0x1234567890123456789012345678901234567890",
            "value": "1000000000000000000",
            "data": "0x",
            "operation": 0
        },
        {
            "to": "0x0987654321098765432109876543210987654321",
            "value": "2000000000000000000",
            "data": "0x",
            "operation": 0
        }
    ],
    "nonce": 1,
    "gasPrice": "1000000000",
    "gasToken": "0x0000000000000000000000000000000000000000",
    "refundReceiver": "0x0000000000000000000000000000000000000000",
    "safeTxGas": 50000,
    "baseGas": 0,
    "gasPriceCeil": "0",
    "signatures": []
}
*/

export type SafeTransaction = {
  to: string;
  value: string;
  data: string;
  operation: number;
};
