const PrivateCompanyFactory = artifacts.require("PrivateCompanyFactory");
const utils = require("./utils");

contract("PrivateCompanyFactory", (accounts) => {
  let privateCompanyFactoryFactoryInstance;

  const companyName = "Crypto Private Company";
  const ticker = "CPC";
  const founder1 = accounts[1];

  beforeEach(async () => {
    privateCompanyFactoryFactoryInstance = await PrivateCompanyFactory.new();
    assert.ok(privateCompanyFactoryFactoryInstance);
  });

  it("should create new instance of the Private Company", async () => {
    const tx = await privateCompanyFactoryFactoryInstance.create(
      companyName,
      ticker
    );
    const startupAddress = utils.getParamFromTxEvent(
      tx,
      "instantiation",
      null,
      "ContractInstantiation"
    );
    const instancesCount = await privateCompanyFactoryFactoryInstance.getInstantiationCount(
      accounts[0]
    );

    assert.equal(instancesCount.length, 1);
    assert.ok(
      privateCompanyFactoryFactoryInstance.isInstantiation(startupAddress)
    );
  });
});
