import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { getPoolSettings } from "../utils/get-pool-settings";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const deploySettings = getPoolSettings();
  const pool = deploySettings.tag;

  const poolDeployment = await deployments.get(`${pool}.PoolService`);

  const creditManagerContract = "CreditManager";

  await deploy(`${pool}.${creditManagerContract}`, {
    contract: creditManagerContract,
    from: deployer,
    args: [poolDeployment.address],
    log: true,
  });
};
export default func;
func.tags = ["CreditManager"];
