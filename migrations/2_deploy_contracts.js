const PrivateCompanyFactory = artifacts.require("PrivateCompanyFactory.sol");

module.exports = function (deployer) {
  deployer
    .deploy(PrivateCompanyFactory)
    .then(() => console.log("Deployed to: ", PrivateCompanyFactory.address));
};
