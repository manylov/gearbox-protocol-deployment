import { underlyingToken } from "./../utils/deps";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { getPoolSettings } from "../utils/get-pool-settings";
import { addressProvider } from "../deployment-settings";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const deploySettings = getPoolSettings();
  const pool = deploySettings.tag;
  const interestRateModel = deploySettings.interestRateModel.contract;
  const poolContract = deploySettings.pool.contract;
  const underlyingToken = deploySettings.pool.underlyingToken;

  const interestRateModelDeployment = await deployments.get(
    `${pool}.${interestRateModel}`
  );

  // todo read limit from external json file
  const expectedLiquidityLimit = 0;

  await deploy(`${pool}.${poolContract}`, {
    contract: poolContract,
    from: deployer,
    args: [
      addressProvider,
      underlyingToken,
      interestRateModelDeployment.address,
      expectedLiquidityLimit,
    ],
    log: true,
  });
};
export default func;
func.tags = ["PoolService"];
