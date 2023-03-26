import { CreditManagerFactory } from "../typechain-types/@gearbox-protocol/integrations-v2/contracts/factories/CreditManagerFactory";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { getChain, getPoolSettings } from "../utils/deploy-helpers";
import { PoolFactory } from "../typechain-types";
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

  const deploySettings = getPoolSettings();
  const poolId = deploySettings.poolId;

  const deployedCreditManagerFactory = (await hre.ethers.getContract(
    `${poolId}.CreditManagerFactory`
  )) as CreditManagerFactory;

  const creditManagerAddress =
    await deployedCreditManagerFactory.creditManager();

  type Adapter = {
    adapter: string;
    targetContract: string;
  };

  const adapters: Adapter[] = [];

  const routers = contractsByNetwork[getChain()];

  for (const adapter in routers) {
    switch (adapter) {
      case "UNISWAP_V2_ROUTER":
        {
          const adapterName = "UniswapV2Adapter";
          const router = contractsByNetwork[getChain()][adapter];
          const connectorTokensInit: string[] = []; // where to get connector tokens?

          const result = await deploy(`${poolId}.${adapterName}`, {
            contract: adapterName,
            from: deployer,
            args: [creditManagerAddress, router, connectorTokensInit],
            log: true,
          });

          adapters.push({
            adapter: result.address,
            targetContract: router,
          });
        }
        break;
      case "UNISWAP_V3_ROUTER":
        {
          const adapterName = "UniswapV3Adapter";
          const router = contractsByNetwork[getChain()][adapter];
          const connectorTokensInit: string[] = []; // where to get connector tokens?

          const result = await deploy(`${poolId}.${adapterName}`, {
            contract: adapterName,
            from: deployer,
            args: [creditManagerAddress, router, connectorTokensInit],
            log: true,
          });

          adapters.push({
            adapter: result.address,
            targetContract: router,
          });
        }

        break;
      case "SUSHISWAP_ROUTER":
        {
          const adapterName = "UniswapV2Adapter";
          const router = contractsByNetwork[getChain()][adapter];
          const connectorTokensInit: string[] = []; // where to get connector tokens?

          const result = await deploy(`${poolId}.${adapterName}`, {
            contract: adapterName,
            from: deployer,
            args: [creditManagerAddress, router, connectorTokensInit],
            log: true,
          });

          adapters.push({
            adapter: result.address,
            targetContract: router,
          });
        }

        break;

      // case "CURVE_3CRV_POOL":
      //   {
      //     const adapterName = "CurveV1Adapter3Assets";
      //     const curvePool = contractsByNetwork[getChain()][adapter];
      //     const contractParamsData = contractParams[
      //       "CURVE_3CRV_POOL"
      //     ] as CurveParams;

      //     console.log({ contractParamsData });

      //     const lp_token =
      //       tokenDataByNetwork[getChain()][contractParamsData.lpToken];

      //     console.log({ lp_token });

      //     const metapoolBase = hre.ethers.constants.AddressZero; // what is metapoolBase?

      //     /*
      //     address _creditManager,
      //     address _curvePool,
      //     address _lp_token,
      //     address _metapoolBase
      //   */
      //     console.log([
      //       creditManagerAddress,
      //       curvePool,
      //       lp_token,
      //       metapoolBase,
      //     ]);

      //     const result = await deploy(`${poolId}.${adapterName}`, {
      //       contract: adapterName,
      //       from: deployer,
      //       args: [creditManagerAddress, curvePool, lp_token, metapoolBase],
      //       log: true,
      //     });

      //     adapters.push(result.address);
      //   }

      //   break;

      // case "CURVE_FRAX_USDC_POOL":
      //   {
      //     const adapterName = "CurveV1Adapter2Assets";
      //     const curvePool = contractsByNetwork[getChain()][adapter];
      //     const contractParamsData = contractParams[
      //       "CURVE_FRAX_USDC_POOL"
      //     ] as CurveParams;

      //     console.log({ contractParamsData });

      //     const lp_token =
      //       tokenDataByNetwork[getChain()][contractParamsData.lpToken];

      //     console.log({ lp_token });

      //     const metapoolBase =
      //       contractsByNetwork[getChain()]["CURVE_3CRV_POOL"]; // what is metapoolBase?

      //     /*
      //     address _creditManager,
      //     address _curvePool,
      //     address _lp_token,
      //     address _metapoolBase
      //   */
      //     console.log([
      //       creditManagerAddress,
      //       curvePool,
      //       lp_token,
      //       metapoolBase,
      //     ]);

      //     const result = await deploy(`${poolId}.${adapterName}`, {
      //       contract: adapterName,
      //       from: deployer,
      //       args: [creditManagerAddress, curvePool, lp_token, metapoolBase],
      //       log: true,
      //     });

      //     adapters.push(result.address);
      //   }

      //   break;
    }
  }

  console.log("adapters deployed", adapters);

  const creditManagerFactory = (await hre.ethers.getContract(
    `${poolId}.CreditManagerFactory`
  )) as CreditManagerFactory;

  await creditManagerFactory.addAdapters(adapters);

  console.log("Adapters added to credit manager");
};
export default func;
func.tags = ["CreditManagerFactory"];
