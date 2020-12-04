const PrivateCompanyFactory = artifacts.require("PrivateCompanyFactory.sol");

module.exports = function (deployer) {
  deployer.deploy(PrivateCompanyFactory);
};
