import {
  deploy,
  detectNetwork,
  impersonate,
  Verifier,
} from "@gearbox-protocol/devops";
import {
  formatBN,
  getNetworkType,
  NetworkType,
  SupportedToken,
  tokenDataByNetwork,
} from "@gearbox-protocol/sdk";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import * as dotenv from "dotenv";
import { ethers } from "hardhat";

import { mainnetCreditManagers } from "../config/creditManagers";
import { CMConfig } from "../core/pool";
import {
  ACL,
  ACL__factory,
  AddressProvider,
  AddressProvider__factory,
  ContractsRegister,
  ContractsRegister__factory,
  DataCompressor,
  DataCompressor__factory,
  IVersion__factory,
} from "../types";
import { LoggedDeployer } from "./loggedDeployer";
import { PriceOracleDeployer } from "./priceFeedDeployer";

export class CreditManagerDeployerPhase1 extends LoggedDeployer {
  protected _chainId: number;
  protected _networkType: NetworkType | undefined;
  protected _accounts: Array<SignerWithAddress>;
  protected _deployer: SignerWithAddress;
  protected _bviDeployer: SignerWithAddress;
  protected _wethToken: string;
  protected _creditManagers: Array<CMConfig>;

  public configurator: string;

  protected _addressProvider: AddressProvider;
  protected _contractsRegister: ContractsRegister;
  protected _acl: ACL;
  protected _dataCompressor: DataCompressor;

  protected _root: SignerWithAddress | undefined;
  protected _apRoot: SignerWithAddress | undefined;
  protected _verfier: Verifier;

  constructor() {
    super();
    this._verfier = new Verifier();
    this.enableLogs();
  }

  async init() {
    // Gets accounts
    this._accounts = await ethers.getSigners();
    this._deployer = this._accounts[0];
    this._creditManagers = mainnetCreditManagers;

    // Gets current chainId
    this._chainId = await this._accounts[0].getChainId();

    this._networkType =
      this._chainId === 1337
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
      case 1337:
        this._logger.info("Impersonate multisig account");
        this._root = await impersonate(configurator);
        this._apRoot = await impersonate(apConfigurator);

        break;

      // UNKNOWN NETWORK
      default:
        throw new Error("unknown error");
    }
  }

  async deploy() {
    await this.init();

    const coreBalance = await this._deployer.getBalance();

    this._logger.debug("Eth on core account: ", formatBN(coreBalance, 18));

    this._wethToken = tokenDataByNetwork[this._networkType!].WETH;

    this._logger.info("#1: DEPLOY DATACOMPRESSOR");
    this._logger.info("Deployer account: ", this._deployer.address);

    this._dataCompressor = DataCompressor__factory.connect(
      await this.addressProvider.getDataCompressor(),
      this._deployer
    );

    const dcVersion = await this._dataCompressor.version();

    if (dcVersion.toNumber() === 1) {
      // - Deploy Data Compressor
      // - Set Data compressor in Address provider
      this._dataCompressor = await deploy<DataCompressor>(
        "DataCompressor",
        this._logger,
        this._addressProvider.address
      );

      // VERIFIER: DataCompressor;
      this._verfier.addContract({
        address: this._dataCompressor.address,
        constructorArguments: [this._addressProvider.address],
      });

      this._logger.debug(
        `DataCompressor deployed at ${this._dataCompressor.address}`
      );
    }

    this._logger.info("#2: DEPLOY PRICEFEEDS & PRICEORACLE");

    const po = IVersion__factory.connect(
      await this.addressProvider.getPriceOracle(),
      this._deployer
    );

    const poVersion = await po.version();

    if (poVersion.toNumber() === 1) {
      const priceOracleDeployer = new PriceOracleDeployer({
        network: this._networkType!,
        addressProvider: this._addressProvider.address,
        symbols: this.getTokensFromConfig(),
        type: "usd",
        verifier: this._verfier,
      });
      const priceOracle = await priceOracleDeployer.deployPriceOralce();

      this._logger.debug(`PriceOracle deployed at ${priceOracle.address}`);
    }
  }

  protected getTokensFromConfig(): Array<SupportedToken> {
    const tokensMap: Record<string, boolean> = {};

    for (const cmConfig of this._creditManagers) {
      tokensMap[cmConfig.symbol] = true;
      cmConfig.collateralTokens.forEach((t) => {
        if ("symbol" in t) tokensMap[t.symbol] = true;
        else throw new Error("unknown format for allowed token");
      });
    }

    return Object.keys(tokensMap) as Array<SupportedToken>;
  }

  get root(): SignerWithAddress | undefined {
    return this._root;
  }

  get addressProvider(): AddressProvider {
    return this._addressProvider;
  }
}

const phase1Deployer = new CreditManagerDeployerPhase1();

phase1Deployer
  .deploy()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
