import { CreditManagerFactory } from "./../typechain-types/@gearbox-protocol/integrations-v2/contracts/factories/CreditManagerFactory";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { getPoolSettings } from "../utils/deploy-helpers";
import { PoolFactory } from "../typechain-types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const deploySettings = getPoolSettings();
  const poolId = deploySettings.poolId;

  const contract = "CreditManagerFactory";

  const poolFactory = (await hre.ethers.getContract(
    `${poolId}.PoolFactory`
  )) as PoolFactory;

  const poolServiceAddress = await poolFactory.pool();

  await deploy(`${poolId}.${contract}`, {
    contract: contract,
    from: deployer,
    args: [
      poolServiceAddress,
      deploySettings.creditManager.creditManagerOpts,
      deploySettings.creditManager.salt,
    ],
    log: true,
  });

  const deployedCreditManagerFactory = (await hre.ethers.getContract(
    `${poolId}.${contract}`
  )) as CreditManagerFactory;

  const creditManagerAddress =
    await deployedCreditManagerFactory.creditManager();
  const creditFacadeAddress = await deployedCreditManagerFactory.creditFacade();
  const creditConfiguratorAddress =
    await deployedCreditManagerFactory.creditConfigurator();

  console.log("Deployed CreditManager:", creditManagerAddress);
  console.log("Deployed CreditFacade:", creditFacadeAddress);
  console.log("Deployed CreditConfigurator:", creditConfiguratorAddress);
};
export default func;
func.tags = ["CreditManagerFactory"];
