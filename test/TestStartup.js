const Startup = artifacts.require("Startup");
const utils = require("./utils");

contract("Startup", (accounts) => {
  let startupInstance;
  let contractAddress;
  const companyName = "Crypto Tesla";
  const ticker = "TSLA";

  const founder1 = accounts[1];
  const founder2 = accounts[2];
  const notFounder = accounts[3];

  beforeEach(async () => {
    startupInstance = await Startup.new(companyName, ticker, [
      founder1,
      founder2,
    ]);

    contractAddress = startupInstance.address;

    assert.ok(startupInstance);
  });

  it("should check founder accounts", async () => {
    const isFounder1 = await startupInstance.isFounder(founder1);
    const isFounder2 = await startupInstance.isFounder(founder2);
    const isFounder3 = await startupInstance.isFounder(notFounder);

    assert.equal(isFounder1, true);
    assert.equal(isFounder2, true);
    assert.equal(isFounder3, false);
  });

  it("should only allow to a founder add new founder", async () => {
    const newFounder1 = accounts[4];
    const newFounder2 = accounts[5];

    await startupInstance.addFounder(newFounder1, { from: founder1 });
    const isNewFounder1 = await startupInstance.isFounder(newFounder1);
    assert.equal(isNewFounder1, true);

    await utils.expectThrow(startupInstance.addFounder(newFounder2));
    const isNewFounder2 = await startupInstance.isFounder(newFounder2);
    assert.equal(isNewFounder2, false);
  });

  it("should only allow to a founder remove another founder", async () => {
    await startupInstance.removeFounder(founder1, { from: founder2 });

    assert.equal(await startupInstance.isFounder(founder1), false);
  });

  it("should equally distrubute total token supply between founders", async () => {
    const totalSupply = await startupInstance.totalSupply();

    const founder1Supply = await startupInstance.balanceOf(founder1);
    const founder2Supply = await startupInstance.balanceOf(founder2);

    assert.equal(Number(founder1Supply), Number(founder2Supply));
    assert.equal(totalSupply, Number(founder1Supply) + Number(founder2Supply));
  });
});
