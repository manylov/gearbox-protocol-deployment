import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { getPoolSettings } from "../utils/get-pool-settings";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  // todo read linear model from external params as single json file?
  /*
    Arg [0] : U_optimal (uint256): 8500
    Arg [1] : R_base (uint256): 0
    Arg [2] : R_slope1 (uint256): 200
    Arg [3] : R_slope2 (uint256): 10000
  */

  const deploySettings = getPoolSettings();
  const pool = deploySettings.tag;
  const contract = deploySettings.interestRateModel.contract;
  const options = deploySettings.interestRateModel.options;

  // resulting deploy name is 'dai.LinearInterestRateModel'
  await deploy(`${pool}.${contract}`, {
    contract: contract,
    from: deployer,
    args: options,
    log: true,
  });
};

export default func;

func.tags = ["interestRateModel"];
