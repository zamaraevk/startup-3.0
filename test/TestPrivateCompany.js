const PrivateCompany = artifacts.require("PrivateCompany");

contract("PrivateCompany", (accounts) => {
  let privateCompanyInstance;

  let contractAddress;
  const companyName = "Crypto Private Company";
  const ticker = "CPC";

  const founder1 = accounts[1];
  const notFounder = accounts[3];

  beforeEach(async () => {
    privateCompanyInstance = await PrivateCompany.new(companyName, ticker, {
      from: founder1,
    });

    contractAddress = privateCompanyInstance.address;

    assert.ok(privateCompanyInstance);
  });

  it("should have list of founders", async () => {
    const f1 = await privateCompanyInstance.founders(0);
    assert.equal(f1, founder1);
  });

  it("should check founder(company owner) role", async () => {
    const ownerRole = await privateCompanyInstance.OWNER_ROLE();
    const isFounder1 = await privateCompanyInstance.hasRole(
      ownerRole,
      founder1
    );
    const isFounder2 = await privateCompanyInstance.hasRole(
      ownerRole,
      notFounder
    );

    assert.equal(isFounder1, true);
    assert.equal(isFounder2, false);
  });

  // it("should equally distrubute total token supply between founders", async () => {
  //   const founder1Supply = await privateCompanyInstance.getEquityHolderBalance(
  //     founder1
  //   );
  //   const founder2Supply = await privateCompanyInstance.getEquityHolderBalance(
  //     founder2
  //   );

  //   const founder1TotalBalance = founder1Supply.totalBalance;
  //   const founder2TotalBalance = founder2Supply.totalBalance;

  //   assert.equal(Number(founder1TotalBalance), Number(founder2TotalBalance));
  // });
});
