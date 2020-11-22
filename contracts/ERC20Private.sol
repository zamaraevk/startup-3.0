// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @dev ERC20 token with private token transfers.
 *
 * Useful for scenarios when full supply needs to circulate between
 * predefined set of addresses. Example: Private company.
 */
abstract contract ERC20Private is ERC20, AccessControl {
    /* Constants */
    bytes32 public constant OWNER_ROLE = keccak256("OWNER_ROLE");

    /**
     * @dev Contract constructor sets initial owners.
     * @param _owners List of initial owners.
     */
    constructor(address[] memory _owners) public {
        for (uint256 i = 0; i < _owners.length; i++) {
            require(_owners[i] != address(0));
            _setupRole(OWNER_ROLE, _owners[i]);
        }
    }

    /**
     * @dev See {ERC20-_beforeTokenTransfer}.
     *
     * Requirements:
     *
     * - the contract can only send token from/to owners
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, amount);

        require(
            hasRole(OWNER_ROLE, to),
            "ERC20Private: token transfer to owner only"
        );
    }
}
