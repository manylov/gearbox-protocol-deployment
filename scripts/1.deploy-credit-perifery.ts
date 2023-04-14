import { CreditManagerPeripheryDeployer } from "./CreditPeriferyDeployer";

const deployer = new CreditManagerPeripheryDeployer();

deployer.deploy().then(() => {
  console.log("Deployed");
});
