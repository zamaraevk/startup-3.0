// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.8.0;

import "../contracts/ERC20Private.sol";

// mock class using ERC20Private
contract ERC20PrivateMock is ERC20Private {
    constructor(
        string memory _companyName,
        string memory _token,
        address[] memory _owners,
        uint256 ownerBalance
    ) public payable ERC20(_companyName, _token) ERC20Private(_owners) {
        for (uint256 i = 0; i < _owners.length; i++) {
            _mint(_owners[i], ownerBalance);
        }
    }

    function setupRole(bytes32 role, address ownerAddress) external {
        _setupRole(role, ownerAddress);
    }
}
