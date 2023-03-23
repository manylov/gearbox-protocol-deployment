import { PoolService } from "./../typechain-types/contracts/pool/PoolService";
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

  const underlyingToken = deploySettings.pool.underlyingToken;
  const expectedLiquidityLimit = deploySettings.pool.expectedLiquidityLimit;

  const interestRateModelDeployment = await deployments.get(
    `${pool}.${interestRateModel}`
  );

  const poolContract = "PoolService";

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

  const contract = (await hre.ethers.getContract(
    `${pool}.${poolContract}`
  )) as PoolService;

  const dToken = await contract.dieselToken();

  console.log("Diesel Token deployed:", dToken);
};
export default func;
func.tags = ["PoolService"];
