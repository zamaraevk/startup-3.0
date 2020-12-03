// SPDX-License-Identifier: MIT
pragma solidity >0.6.0;

import "./PrivateCompany.sol";
import "./Factory.sol";

contract PrivateCompanyFactory is Factory {
    // Public functions
    /**
     * @dev @dev Allows creation of Private Company instance.
     * @param _companyName Company name.
     * @param _token Company(token) ticker name.
     */
    function create(
        string memory _companyName,
        string memory _token
    ) public returns (address companyAddress) {
        companyAddress = address(
            new PrivateCompany(_companyName, _token, msg.sender)
        );
        register(companyAddress);
        return companyAddress;
    }
}
