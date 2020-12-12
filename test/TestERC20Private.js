const { BN, expectRevert } = require("@openzeppelin/test-helpers");

const { expect } = require("chai");

const ERC20PrivateMock = artifacts.require("ERC20PrivateMock");

contract("ERC20PrivateMock", function (accounts) {
  const [owner1, newOwnerAccount, anotherAccount] = accounts;

  const ownerBalance = new BN(100);

  const name = "Private Company";
  const token = "PC";

  beforeEach(async function () {
    this.token = await ERC20PrivateMock.new(name, token, ownerBalance);
  });

  describe("addOwner", function () {
    it("allows owner to add another owner", async function () {
      await this.token.addOwner(newOwnerAccount, { from: owner1 });

      expect(await this.token.isOwner(newOwnerAccount)).to.be.true;
    });

    it("reverts when not owner trying to add another owner", async function () {
      await expectRevert(
        this.token.addOwner(newOwnerAccount, { from: anotherAccount }),
        "ERC20Private: Restricted to owners -- Reason given: ERC20Private: Restricted to owners."
      );

      expect(await this.token.isOwner(newOwnerAccount)).to.be.false;
    });
  });

  describe("grantRole", function () {
    // adding role only with internal _addOwner function
    it("not allow to grand role with grantRole method", async function () {
      const ownerRoleAddress = await this.token.OWNER_ROLE({ from: owner1 });
      await this.token.grantRole(ownerRoleAddress, newOwnerAccount, {
        from: owner1,
      });

      expect(await this.token.isOwner(newOwnerAccount)).to.be.false;
    });
  });

  describe("transfer", function () {
    it("allows to transfer to owner address", async function () {
      await this.token.addOwner(newOwnerAccount, { from: owner1 });
      await this.token.transfer(newOwnerAccount, ownerBalance, {
        from: owner1,
      });

      expect(await this.token.balanceOf(owner1)).to.be.bignumber.equal("0");
      expect(await this.token.balanceOf(newOwnerAccount)).to.be.bignumber.equal(
        "100"
      );
    });

    it("reverts when trying to transfer to not owner address", async function () {
      await expectRevert(
        this.token.transfer(anotherAccount, ownerBalance, { from: owner1 }),
        "ERC20Private: token transfer to owner only -- Reason given: ERC20Private: token transfer to owner only."
      );
    });
  });
});
