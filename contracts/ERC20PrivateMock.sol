// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.8.0;

import "./ERC20Private.sol";

// mock class using ERC20Private
contract ERC20PrivateMock is ERC20Private {
    constructor(
        string memory _companyName,
        string memory _token,
        uint256 ownerBalance
    ) public payable ERC20(_companyName, _token) ERC20Private(msg.sender) {
        _mint(msg.sender, ownerBalance);
    }

    function addOwner(address account) external {
        _addOwner(account);
    }

    function removeOwner(address account) external {
        _removeOwner(account);
    }
}
