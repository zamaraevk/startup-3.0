const PrivateCompany = artifacts.require("PrivateCompany");
// const utils = require("./utils");

contract("PrivateCompany", (accounts) => {
  let privateCompanyInstance;

  let contractAddress;
  const companyName = "Crypto Private Company";
  const ticker = "CPC";

  const founder1 = accounts[1];
  const founder2 = accounts[2];
  const notFounder = accounts[3];

  beforeEach(async () => {
    privateCompanyInstance = await PrivateCompany.new(companyName, ticker, [
      founder1,
      founder2,
    ]);

    contractAddress = privateCompanyInstance.address;

    assert.ok(privateCompanyInstance);
  });

  it("should check founder(company owner) role", async () => {
    const ownerRole = await privateCompanyInstance.OWNER_ROLE();

    const isFounder1 = await privateCompanyInstance.hasRole(
      ownerRole,
      founder1
    );

    const isFounder2 = await privateCompanyInstance.hasRole(
      ownerRole,
      founder2
    );
    const isFounder3 = await privateCompanyInstance.hasRole(
      ownerRole,
      notFounder
    );

    assert.equal(isFounder1, true);
    assert.equal(isFounder2, true);
    assert.equal(isFounder3, false);
  });

  it("should equally distrubute total token supply between founders", async () => {
    const founder1Supply = await privateCompanyInstance.getEquityHolderBalance(
      founder1
    );
    const founder2Supply = await privateCompanyInstance.getEquityHolderBalance(
      founder2
    );

    const founder1TotalBalance = founder1Supply.totalBalance;
    const founder2TotalBalance = founder2Supply.totalBalance;

    assert.equal(Number(founder1TotalBalance), Number(founder2TotalBalance));
  });
});
