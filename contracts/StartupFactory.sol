// SPDX-License-Identifier: MIT

pragma solidity >0.6.0;

import "./Startup.sol";
import "./Factory.sol";

contract StartupFactory is Factory {
    /*
     * Public functions
     */
    /// @dev Allows creation of startup instance.
    /// @param _companyName Startup name.
    /// @param _token Token ticker.
    /// @param _founders List of initial founders.
    function create(
        string memory _companyName,
        string memory _token,
        address[] memory _founders
    ) public returns (address startupAddress) {
        startupAddress = address(
            new Startup(_companyName, _token, _founders)
        );
        register(startupAddress);
    }
}
