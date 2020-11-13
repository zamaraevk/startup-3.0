// SPDX-License-Identifier: MIT

pragma solidity >0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Startup is ERC20 {
    /*
     *  Events
     */
    event LogNewFounder(address indexed founder);
    event LogRemoveFounder(address indexed founder);

    /*
     *  Constants
     */
    uint256 public constant MAX_FOUNDER_COUNT = 10;

    /*
     *  Storage
     */
    mapping(address => bool) public isFounder;
    address[] public founders;

    /*
     *  Modifiers
     */
    modifier onlyWallet() {
        require(msg.sender == address(this));
        _;
    }

    modifier notNull(address _address) {
        require(_address != address(0));
        _;
    }

    modifier founderDoesNotExist(address founder) {
        require(!isFounder[founder]);
        _;
    }

    modifier founderExists(address founder) {
        require(isFounder[founder]);
        _;
    }

    modifier validRequirement(uint256 founderCount) {
        require(founderCount <= MAX_FOUNDER_COUNT && founderCount != 0);
        _;
    }

    /*
     * Public functions
     */
    /// @dev Contract constructor sets initial founders.
    /// @param _founders List of initial founders.
    constructor(
        string memory _companyName,
        string memory _token,
        address[] memory _founders
    ) public validRequirement(_founders.length) ERC20(_companyName, _token) {
        for (uint256 i = 0; i < _founders.length; i++) {
            require(!isFounder[_founders[i]] && _founders[i] != address(0));
            isFounder[_founders[i]] = true;
            emit LogNewFounder(_founders[i]);
        }
        founders = _founders;
    }

    /// @dev Allows to add a new founder. Transaction has to be sent by wallet.
    /// @param founder Address of new founder.
    function addFounder(address founder)
        public
        onlyWallet
        founderDoesNotExist(founder)
        notNull(founder)
        validRequirement(founders.length + 1)
    {
        isFounder[founder] = true;
        founders.push(founder);
        emit LogNewFounder(founder);
    }

    /// @dev Allows to remove an founder. Transaction has to be sent by wallet.
    /// @param founder Address of founder.
    function removeFounder(address founder)
        public
        onlyWallet
        founderExists(founder)
    {
        isFounder[founder] = false;
        for (uint256 i = 0; i < founders.length - 1; i++)
            if (founders[i] == founder) {
                delete founders[i];
                break;
            }
        emit LogRemoveFounder(founder);
    }

    // Fallback function - Called if other functions don't match call or
    // sent ether without data
    // fallback() external payable {
    //     revert();
    // }
}
