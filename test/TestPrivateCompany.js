const { expectRevert } = require("@openzeppelin/test-helpers");
const utils = require("./utils");

const PrivateCompany = artifacts.require("PrivateCompany");

contract("PrivateCompany", (accounts) => {
  const [founder, notFounder, newFounder] = accounts;

  let privateCompanyInstance;

  const companyName = "Crypto Private Company";
  const ticker = "CPC";

  beforeEach(async function () {
    privateCompanyInstance = await PrivateCompany.new(companyName, ticker, {
      from: founder,
    });

    assert.ok(privateCompanyInstance);
  });

  describe("founders", async function () {
    it("should add contract creator to the founders list", async () => {
      const f1 = await privateCompanyInstance.founders(0);
      expect(assert.equal(f1, founder));
    });

    it("should founder have ERC20Private owner role", async () => {
      expect(await privateCompanyInstance.isOwner(founder)).to.be.true;
      expect(await privateCompanyInstance.isOwner(notFounder)).to.be.false;
    });

    it("allows to submit new transaction with type NewFounder", async function () {
      const txTypeKey = "NewFounder";
      const destination = newFounder;
      const value = 0;
      const data = "0x00";

      await privateCompanyInstance.submitTransaction(
        txTypeKey,
        destination,
        value,
        data,
        {
          from: founder,
        }
      );

      const founder2 = await privateCompanyInstance.founders(1);

      expect(assert.equal(founder2, newFounder));
      expect(await privateCompanyInstance.isOwner(newFounder)).to.be.true;
    });

    it("revert to submit new transaction with type NewFounder for non founder", async function () {
      const txTypeKey = "NewFounder";
      const destination = newFounder;
      const value = 0;
      const data = "0x00";

      await expectRevert(
        privateCompanyInstance.submitTransaction(
          txTypeKey,
          destination,
          value,
          data,
          {
            from: notFounder,
          }
        ),
        "PrivateCompany: sender is not a founder -- Reason given: PrivateCompany: sender is not a founder."
      );
    });
  });

  describe("equity schedule", async function () {
    it("allows to submit new transaction with type LaunchVestingSchedule", async function () {
      const destination = newFounder;
      const value = 0;
      const data = "0x00";
      // Add one more founder to test consensus
      await privateCompanyInstance.submitTransaction(
        "NewFounder",
        destination,
        value,
        data,
        {
          from: founder,
        }
      );
      // Create and confirm LaunchVestingSchedule from new founder
      await privateCompanyInstance.submitTransaction(
        "LaunchVestingSchedule",
        destination,
        value,
        data,
        {
          from: newFounder,
        }
      );
      // Confirm LaunchVestingSchedule transaction from another founder
      const launchVestingScheduleTx = await privateCompanyInstance.confirmTransaction(
        1,
        {
          from: founder,
        }
      );
      const txEventNames = launchVestingScheduleTx.logs.map((log) => log.event);

      expect(txEventNames.includes("LogTransactionConfirmation")).to.be.true;
      expect(txEventNames.includes("LogFounderEquityDistribution")).to.be.true;

      // Check equity holder balances after distribution.
      const equityHolder1 = await privateCompanyInstance.getEquityHolderBalance(
        founder
      );

      const equityHolder2 = await privateCompanyInstance.getEquityHolderBalance(
        newFounder
      );

      expect(
        Number(equityHolder1.currentBalance) ===
          Number(equityHolder2.currentBalance)
      ).to.be.true;
      expect(
        Number(equityHolder1.lockedBalance) ===
          Number(equityHolder2.lockedBalance)
      ).to.be.true;
      expect(
        Number(equityHolder1.totalBalance) ===
          Number(equityHolder2.totalBalance)
      ).to.be.true;
    });
  });
});
