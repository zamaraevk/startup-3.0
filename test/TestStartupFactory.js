const StartupFactory = artifacts.require("StartupFactory");
const utils = require("./utils");

contract("StartupFactory", (accounts) => {
  let startupFactoryInstance;
  const companyName = "Crypto Tesla";
  const ticker = "TSLA";
  const founder1 = accounts[1];
  const founder2 = accounts[2];

  beforeEach(async () => {
    startupFactoryInstance = await StartupFactory.new();
    assert.ok(startupFactoryInstance);
  });

  it("should create new instance of the Startup", async () => {
    const tx = await startupFactoryInstance.create(companyName, ticker, [
      founder1,
      founder2,
    ]);
    const startupAddress = utils.getParamFromTxEvent(
      tx,
      "instantiation",
      null,
      "ContractInstantiation"
    );
    const instancesCount = await startupFactoryInstance.getInstantiationCount(
      accounts[0]
    );

    assert.equal(instancesCount.length, 1);
    assert.ok(startupFactoryInstance.isInstantiation(startupAddress));
  });
});
