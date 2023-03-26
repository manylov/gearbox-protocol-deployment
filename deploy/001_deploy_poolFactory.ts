import { PoolService } from "@gearbox-protocol/sdk";
import { PoolFactory } from "./../typechain-types/@gearbox-protocol/core-v2/contracts/factories/PoolFactory";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { getPoolSettings } from "../utils/deploy-helpers";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const deploySettings = getPoolSettings();
  const poolId = deploySettings.poolId;
  const contract = "PoolFactory";
  const options = deploySettings.poolOpts;

  // resulting deploy name is 'DAI.PoolFactory'
  await deploy(`${poolId}.${contract}`, {
    contract: contract,
    from: deployer,
    args: [options],
    log: true,
  });

  const poolFactory = (await hre.ethers.getContract(
    `${poolId}.${contract}`
  )) as PoolFactory;

  const poolServiceAddress = await poolFactory.pool();
  console.log("Deployed PoolService:", poolServiceAddress);

  const poolService = (await hre.ethers.getContractAt(
    "PoolService",
    poolServiceAddress
  )) as PoolService;

  const interestRateModelAddress = await poolService.interestRateModel();
  console.log("Deployed InterestRateModel:", interestRateModelAddress);

  const dieselTokenAddress = await poolService.dieselToken();
  console.log("Deployed DieselToken:", dieselTokenAddress);
};

export default func;

func.tags = ["PoolFactory"];
