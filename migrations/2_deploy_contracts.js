const StartupFactory = artifacts.require("StartupFactory.sol");

module.exports = function (deployer) {
  deployer.deploy(StartupFactory);
};
