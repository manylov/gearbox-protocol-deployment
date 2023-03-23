import "@nomicfoundation/hardhat-toolbox";
import { task } from "hardhat/config";

task("balance", "Prints an account's balance").setAction(async () => {});

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
};
