// migrating the appropriate contracts
var SupplyChain = artifacts.require("./SupplyChain.sol");

module.exports = async function (deployer, accounts) {
  const owner = accounts[0];
  await deployer.deploy(SupplyChain);
};
