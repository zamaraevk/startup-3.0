// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title ERC20 token with restricted transfers between owners only.
 * @author Konstantin Zamaraev
 * @notice Useful for scenarios when full supply needs to circulate between
 * predefined set of addresses. Example: Private company equities.
 */
abstract contract ERC20Private is ERC20, AccessControl {
    /// Constants
    bytes32 public constant OWNER_ROLE = keccak256("OWNER");

    /**
     * @dev Restricted to members of the owner role.
     */
    modifier onlyOwner() {
        require(isOwner(msg.sender), "ERC20Private: Restricted to owners");
        _;
    }

    /// Public functions
    /**
     * @dev Contract constructor sets initial owner and the Owner role as admin's role.
     * @param _owner First owner -- contract creator.
     */
    constructor(address _owner) public {
        _setupRole(OWNER_ROLE, _owner);
        _setRoleAdmin(OWNER_ROLE, OWNER_ROLE);
    }

    /**
     * @dev Return `true` if the account belongs to the owner role.
     */
    function isOwner(address account) public virtual view returns (bool) {
        return hasRole(OWNER_ROLE, account);
    }

    /**
     * @dev Override to block this behaivour
     * @dev Adding new role only available thru {_addOwner}
     */
    function grantRole(bytes32 role, address account) public override {}

    /**
     * @dev Override to block this behaivour
     */
    function revokeRole(bytes32 role, address account) public override {}

    /// Internal functions
    /**
     * @dev Add an account to the owner role.
     */
    function _addOwner(address account) internal virtual onlyOwner {
        _setupRole(OWNER_ROLE, account);
    }

    /**
     * @dev See {ERC20-_beforeTokenTransfer}.
     *
     * Requirements:
     *
     * - the contract can only send token from/to owner
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, amount);

        require(isOwner(to), "ERC20Private: token transfer to owner only");
    }
}
