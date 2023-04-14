import {
  deploy,
  impersonate,
  LoggedDeployer,
  Verifier,
  detectNetwork,
} from "@gearbox-protocol/devops";
import { ethers } from "hardhat";
import * as fs from "fs";

import * as dotenv from "dotenv";

import {
  formatBN,
  getNetworkType,
  NetworkType,
  SupportedToken,
  tokenDataByNetwork,
} from "@gearbox-protocol/sdk";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { creditManagers } from "./credit-managers";

import {
  ACL,
  ACL__factory,
  AddressProvider,
  AddressProvider__factory,
  ContractsRegister,
  ContractsRegister__factory,
  CreditConfigurator,
  CreditConfigurator__factory,
  CreditFacade,
  CreditFacade__factory,
  DataCompressor,
} from "../typechain-types";
import path from "path";
import { creditManagersConfig } from "./managers-configs";
import {
  defaultCreditManagerOpts,
  DeployedContracts,
  DeployedContractType,
  getCreditManagerAddressByTokenAndNetwork,
  getCreditManagerConfigByTokenAndNetwork,
  SafeTransaction,
} from "./helpers";
import { Contract } from "ethers";

export class CreditManagerPeripheryDeployer extends LoggedDeployer {
  protected _verfier: Verifier;
  protected _creditConfigurator: CreditConfigurator | undefined;
  protected _creditFacade: CreditFacade | undefined;

  protected _chainId: number;
  protected _networkType: NetworkType | undefined;
  protected _accounts: Array<SignerWithAddress>;
  protected _deployer: SignerWithAddress;
  protected _bviDeployer: SignerWithAddress;
  protected _wethToken: string;
  protected _creditManagers: typeof creditManagers;

  public configurator: string;

  protected _addressProvider: AddressProvider;
  protected _contractsRegister: ContractsRegister;
  protected _acl: ACL;
  protected _dataCompressor: DataCompressor;

  protected _root: SignerWithAddress | undefined;
  protected _apRoot: SignerWithAddress | undefined;

  protected _deployedContracts: DeployedContracts = {};

  constructor() {
    super();
    this._verfier = new Verifier();
    this.enableLogs();
  }

  async init() {
    // Gets accounts
    this._accounts = await ethers.getSigners();
    this._deployer = this._accounts[0];
    this._creditManagers = creditManagers;

    // Gets current chainId
    this._chainId = await this._accounts[0].getChainId();

    this._networkType =
      this._chainId === 31337
        ? await detectNetwork()
        : getNetworkType(this._chainId);

    this._logger.warn(this._networkType);

    dotenv.config({
      path: this._networkType === "Goerli" ? ".env.goerli" : ".env.mainnet",
    });

    const addressProvider = process.env.REACT_APP_ADDRESS_PROVIDER || "";

    this._logger.warn(`Address provider ${addressProvider}`);

    if (addressProvider === "")
      throw new Error("REACT_APP_ADDRESS_PROVIDER is not set");

    this._addressProvider = await AddressProvider__factory.connect(
      addressProvider,
      this._deployer
    );

    this._acl = ACL__factory.connect(
      await this._addressProvider.getACL(),
      this._deployer
    );

    this._contractsRegister = ContractsRegister__factory.connect(
      await this._addressProvider.getContractsRegister(),
      this._deployer
    );

    const configurator = await this._acl.owner();
    this.configurator = configurator;

    const apConfigurator = await this._addressProvider.owner();
    this._logger.warn(`Start deploying to network ${this._chainId}`);
    this._logger.debug(`System configurator: ${configurator}`);

    switch (this._chainId) {
      // MAINNET
      case 1:
        break;

      // GOERLI
      case 5:
        if (this._deployer.address !== configurator) {
          throw new Error("Deployer has no root privileges");
        }
        this._root = this._deployer;
        this._apRoot = this._deployer;
        break;

      // FORK
      case 31337:
        this._logger.info("Impersonate multisig account");
        this._root = await impersonate(configurator);
        this._apRoot = await impersonate(apConfigurator);

        break;

      // UNKNOWN NETWORK
      default:
        throw new Error("unknown error");
    }

    this.loadDeployedContractsFromFile();
  }

  async deploy() {
    await this.init();

    const coreBalance = await this._deployer.getBalance();

    this._logger.debug("Eth on core account: ", formatBN(coreBalance, 18));

    this._wethToken = tokenDataByNetwork[this._networkType!].WETH;

    this._logger.info("Deployer account: ", this._deployer.address);

    // ------- start deploy for all managers in creditManagers.ts ----------

    for (const record in creditManagers[this._networkType!]) {
      const token = record as SupportedToken;

      const creditManagerAddress = getCreditManagerAddressByTokenAndNetwork(
        token,
        this._networkType!
      );

      if (!this.isContractDeployed(token, "CreditFacade")) {
        console.log("Deploing CreditFacade for", token);

        this._logger.info("#1: DEPLOY CREDITFACADE FOR", token);

        const creditFacadeConstructorArgs = [
          creditManagerAddress,
          ethers.constants.AddressZero, // when to use degenNFT
          ethers.constants.AddressZero, // todo deploy and use blackListHelper for usdc/usdt managers
          false, // when to set expirable to true
        ];

        this._creditFacade = await deploy<CreditFacade>(
          "CreditFacade",
          this._logger,
          ...creditFacadeConstructorArgs
        );

        this._verfier.addContract({
          address: this._creditFacade.address,
          constructorArguments: creditFacadeConstructorArgs,
        });

        this._logger.info(
          "CreditFacade for",
          token,
          "deployed at: ",
          this._creditFacade.address
        );

        this.addContractToDeployedContracts(
          token,
          "CreditFacade",
          this._creditFacade.address
        );
      } else {
        this._logger.info("creditFacade for", token, "already deployed");
      }

      if (!this.isContractDeployed(token, "CreditConfigurator")) {
        this._logger.info("#1: DEPLOY CREDITCONFIGURATOR FOR", token);

        const creditConfiguratorConstructorArgs = [
          creditManagerAddress,
          this.getContractDeployedAddress(token, "CreditFacade"),
          defaultCreditManagerOpts,
        ];

        this._creditConfigurator = await deploy<CreditConfigurator>(
          "CreditConfigurator",
          this._logger,
          ...creditConfiguratorConstructorArgs
        );

        this._verfier.addContract({
          address: this._creditConfigurator.address,
          constructorArguments: creditConfiguratorConstructorArgs,
        });

        this._logger.info(
          "CreditConfigurator for",
          token,
          "deployed at: ",
          this._creditConfigurator.address
        );

        this.addContractToDeployedContracts(
          token,
          "CreditConfigurator",
          this._creditConfigurator.address
        );
      } else {
        this._logger.info("CreditConfigurator for", token, "already deployed");
      }
    }
  }

  async generateJsonTxsForSafe() {
    await this.init();

    const configs = creditManagersConfig[this._networkType!];

    const txsJson: SafeTransaction[] = [];

    for (const record in configs) {
      const token = record as SupportedToken;

      // check if both contracts are deployed for this token
      if (
        !(
          this.isContractDeployed(token, "CreditFacade") &&
          this.isContractDeployed(token, "CreditConfigurator")
        )
      ) {
        this._logger.warn(
          `Contracts for ${token} are not deployed, skip this token for now`
        );
        continue;
      }

      // generate json txs for safe for configurator
      const creditConfiguratorAddress = this.getContractDeployedAddress(
        token,
        "CreditConfigurator"
      );

      const creditConfigurator = CreditConfigurator__factory.connect(
        creditConfiguratorAddress!,
        this._deployer
      );

      const collateralTokens = configs[token]!.collateralTokens;

      const collateralToken = collateralTokens[0];

      const callData = await this.generateCalldata(
        creditConfigurator,
        "addCollateralToken",
        [
          this.getTokenAddressBySymbol(collateralToken.token),
          collateralToken.liquidationThreshold,
        ]
      );

      const tx: SafeTransaction = {
        to: creditConfiguratorAddress!,
        value: "0",
        data: callData!,
        operation: 0,
      };

      txsJson.push(tx);
    }

    const txsJsonString = JSON.stringify(txsJson, null, 2);

    const txsJsonPath = path.join(__dirname, `txs.json`);

    fs.writeFileSync(txsJsonPath, txsJsonString);

    this._logger.info("txs.json generated at", txsJsonPath);
  }

  private isContractDeployed(
    token: SupportedToken,
    contractType: DeployedContractType
  ): boolean {
    if (this._networkType! in this._deployedContracts) {
      if (token in this._deployedContracts[this._networkType!]!) {
        if (
          contractType in this._deployedContracts[this._networkType!]![token]!
        ) {
          return true;
        }
      }
    }
    return false;
  }

  private getContractDeployedAddress(
    token: SupportedToken,
    contractType: DeployedContractType
  ) {
    if (this._networkType! in this._deployedContracts) {
      if (token in this._deployedContracts[this._networkType!]!) {
        if (
          contractType in this._deployedContracts[this._networkType!]![token]!
        ) {
          return this._deployedContracts[this._networkType!]![token]![
            contractType
          ];
        }
      }
    }
  }

  private addContractToDeployedContracts(
    token: SupportedToken,
    contractType: DeployedContractType,
    address: string
  ) {
    if (!(this._networkType! in this._deployedContracts)) {
      this._deployedContracts[this._networkType!] = {};
    }

    if (!(token in this._deployedContracts[this._networkType!]!)) {
      this._deployedContracts[this._networkType!]![token] = {};
    }

    this._deployedContracts[this._networkType!]![token]![contractType] =
      address;

    this.updateDeployedContractsJSON();
  }

  private updateDeployedContractsJSON() {
    const deployedContractsJson = path.join(
      __dirname,
      "deployedContracts.json"
    );

    fs.writeFileSync(
      deployedContractsJson,
      JSON.stringify(this._deployedContracts, null, 2)
    );
  }

  private loadDeployedContractsFromFile() {
    const deployedContractsJson = path.join(
      __dirname,
      "deployedContracts.json"
    );

    if (!fs.existsSync(deployedContractsJson)) {
      fs.writeFileSync(deployedContractsJson, "{}");
    }

    const deployedContracts = JSON.parse(
      fs.readFileSync(deployedContractsJson, "utf8")
    ) as DeployedContracts;

    this._deployedContracts = deployedContracts;
  }

  private async generateCalldata(
    contract: Contract,
    method: string,
    args: any[]
  ) {
    const calldata = await contract.populateTransaction[method](...args);
    return calldata.data;
  }

  private getTokenAddressBySymbol(symbol: SupportedToken) {
    return tokenDataByNetwork[this._networkType!][symbol];
  }
}
