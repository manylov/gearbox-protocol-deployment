import { CreditManagerPeripheryDeployer } from "./CreditPeriferyDeployer";

const deployer = new CreditManagerPeripheryDeployer();

deployer.generateJsonTxsForSafe().then(() => {
  console.log("JSON for Safe generated");
});
