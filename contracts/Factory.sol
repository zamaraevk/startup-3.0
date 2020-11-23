// SPDX-License-Identifier: MIT
pragma solidity >0.6.0;

contract Factory {
    // Events
    event ContractInstantiation(address sender, address instantiation);

    // Storage
    mapping(address => bool) public isInstantiation;
    mapping(address => address[]) public instantiations;

    // Public functions
    /**
     * @param creator Contract creator address.
     * @return Returns number of instantiations by creator.
     */
    function getInstantiationCount(address creator)
        public
        view
        returns (uint256)
    {
        return instantiations[creator].length;
    }

    // Internal functions
    /**
     * @dev @dev Registers contract in factory registry.
     * @param instantiation Address of contract instantiation.
     */
    function register(address instantiation) internal {
        isInstantiation[instantiation] = true;
        instantiations[msg.sender].push(instantiation);
        emit ContractInstantiation(msg.sender, instantiation);
    }
}
