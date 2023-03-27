import { CreditManagerFactory } from "../typechain-types/@gearbox-protocol/integrations-v2/contracts/factories/CreditManagerFactory";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { getChain, getPoolSettings } from "../utils/deploy-helpers";
import { PoolFactory } from "../typechain-types";
import { NetworkType } from "@gearbox-protocol/sdk";
import {
  ContractParams,
  contractParams,
  contractsByNetwork,
  CurveParams,
  SupportedContract,
  tokenDataByNetwork,
} from "@gearbox-protocol/sdk";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const chain = await getChain(hre);
  const deploySettings = getPoolSettings(chain);
  const poolId = deploySettings.poolId;

  const deployedCreditManagerFactory = (await hre.ethers.getContract(
    `${poolId}.CreditManagerFactory`
  )) as CreditManagerFactory;

  const creditManagerAddress =
    await deployedCreditManagerFactory.creditManager();

  type Adapter = {
    name: string;
    adapter: {
      adapter: string;
      targetContract: string;
    };
  };

  const adapters: Adapter[] = [];
  const routers = contractsByNetwork[chain];

  for (const adapter in routers) {
    switch (adapter) {
      case "UNISWAP_V2_ROUTER":
        {
          const adapterName = "UniswapV2Adapter";
          const router = contractsByNetwork[chain][adapter];
          const connectorTokensInit: string[] = []; // where to get connector tokens?

          const result = await deploy(`${poolId}.${adapterName}`, {
            contract: adapterName,
            from: deployer,
            args: [creditManagerAddress, router, connectorTokensInit],
            log: true,
          });

          adapters.push({
            name: adapter,
            adapter: {
              adapter: result.address,
              targetContract: router,
            },
          });
        }
        break;
      case "UNISWAP_V3_ROUTER":
        {
          const adapterName = "UniswapV3Adapter";
          const router = contractsByNetwork[chain][adapter];
          const connectorTokensInit: string[] = []; // where to get connector tokens?

          const result = await deploy(`${poolId}.${adapterName}`, {
            contract: adapterName,
            from: deployer,
            args: [creditManagerAddress, router, connectorTokensInit],
            log: true,
          });

          adapters.push({
            name: adapter,
            adapter: {
              adapter: result.address,
              targetContract: router,
            },
          });
        }
        break;
      case "SUSHISWAP_ROUTER":
        {
          const adapterName = "UniswapV2Adapter";
          const router = contractsByNetwork[chain][adapter];
          const connectorTokensInit: string[] = []; // where to get connector tokens?

          const result = await deploy(`${poolId}.${adapterName}`, {
            contract: adapterName,
            from: deployer,
            args: [creditManagerAddress, router, connectorTokensInit],
            log: true,
          });

          adapters.push({
            name: adapter,
            adapter: {
              adapter: result.address,
              targetContract: router,
            },
          });
        }
        break;

      case "CURVE_3CRV_POOL":
        {
          const adapterName = "CurveV1Adapter3Assets";
          const curvePool = contractsByNetwork[chain][adapter];
          const contractParamsData = contractParams[adapter] as CurveParams;

          const lp_token =
            tokenDataByNetwork[chain][contractParamsData.lpToken];

          const metapoolBase = hre.ethers.constants.AddressZero; 

          const result = await deploy(`${poolId}.${adapterName}`, {
            contract: adapterName,
            from: deployer,
            args: [creditManagerAddress, curvePool, lp_token, metapoolBase],
            log: true,
          });

          adapters.push({
            name: adapter,
            adapter: {
              adapter: result.address,
              targetContract: curvePool,
            },
          });
        }

        break;
    }
  }

  console.log("\r\nAdapters deployed");
  adapters.map((rec) => console.log(`${rec.name}: ${rec.adapter.adapter}`));

  const creditManagerFactory = (await hre.ethers.getContract(
    `${poolId}.CreditManagerFactory`
  )) as CreditManagerFactory;

  await creditManagerFactory.addAdapters(
    adapters.map((adapter) => adapter.adapter)
  );

  console.log("Adapters added to credit manager");
};
export default func;
func.tags = ["CreditManagerFactory"];
