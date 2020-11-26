const { BN, expectRevert } = require("@openzeppelin/test-helpers");

const { expect } = require("chai");

const ERC20PrivateMock = artifacts.require("ERC20PrivateMock");

contract("ERC20PrivateMock", function (accounts) {
  const [owner1, owner2, anotherAccount, newOwnerAccount] = accounts;

  const ownerBalance = new BN(100);

  const name = "Private Company";
  const token = "PC";

  beforeEach(async function () {
    this.token = await ERC20PrivateMock.new(
      name,
      token,
      [owner1, owner2],
      ownerBalance
    );
  });

  describe("transfer", function () {
    it("allows to transfer to owner address", async function () {
      await this.token.transfer(owner2, ownerBalance, { from: owner1 });

      expect(await this.token.balanceOf(owner1)).to.be.bignumber.equal("0");
      expect(await this.token.balanceOf(owner2)).to.be.bignumber.equal("200");
    });

    it("reverts when trying to transfer to not owners address", async function () {
      await expectRevert(
        this.token.transfer(anotherAccount, ownerBalance, { from: owner1 }),
        "ERC20Private: token transfer to owner only -- Reason given: ERC20Private: token transfer to owner only."
      );
    });
  });

  describe("new owner", function () {
    it("allows to add new owner", async function () {
      const role = await this.token.OWNER_ROLE();
      await this.token.setupRole(role, newOwnerAccount);

      expect(await this.token.hasRole(role, newOwnerAccount)).to.be.true;
    });
  });
});
