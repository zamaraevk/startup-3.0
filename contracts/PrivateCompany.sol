// SPDX-License-Identifier: MIT

pragma solidity >0.6.0;

import "./ERC20Private.sol";
import "./DateTimeLibrary.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract PrivateCompany is ERC20Private {
    /* Libraries */
    using SafeMath for uint256;
    using BokkyPooBahsDateTimeLibrary for uint256;

    /* Constants */
    uint256 internal constant TOTAL_SUPPLY = 10000;
    // 1 year for the cliff
    uint256 internal constant TOKEN_CLIFF_TIME = 1;
    // 4 years for the full vesting
    uint256 internal constant TOKEN_VESTING_TIME = 4;

    /* Events */
    event LogFounderEquityDistribution(
        address founderAddress,
        uint256 equityAmount,
        uint256 vestingTime
    );

    event LogReleasedEquityForHolder(
        address founderAddress,
        uint256 equityAmount
    );

    /* Structs */
    struct EquityHolder {
        uint256 lockTimeStart;
        uint256 currentBalance;
        uint256 totalBalance;
        address holderAddress;
    }

    /* Storage */
    mapping(address => EquityHolder) equityHolders;

    /* Modifiers */
    modifier isFounder() {
        require(
            hasRole(OWNER_ROLE, msg.sender),
            "PrivateCompany: sender is not a founder"
        );
        _;
    }

    /* Public functions */
    /**
     * @dev Contract constructor creates private token and sets equal amounts
     * with the vesting schedule (1 year cliff / 4 years duration)
     * @param _companyName Company name.
     * @param _token Company(token) ticker name.
     * @param _founders List of initial founders of the company.
     */
    constructor(
        string memory _companyName,
        string memory _token,
        address[] memory _founders
    ) public ERC20(_companyName, _token) ERC20Private(_founders) {
        uint256 supply = TOTAL_SUPPLY * (10**uint256(decimals()));

        for (uint256 i = 0; i < _founders.length; i++) {
            require(_founders[i] != address(0));
            uint256 equityAmount = supply.div(_founders.length);

            equityHolders[_founders[i]] = EquityHolder(
                block.timestamp,
                0,
                equityAmount,
                _founders[i]
            );

            emit LogFounderEquityDistribution(
                _founders[i],
                equityAmount,
                TOKEN_VESTING_TIME
            );
        }
    }

    /**
     * @param holderAddress address of equity holder.
     */
    function getEquityHolderBalance(address holderAddress)
        public
        view
        returns (uint256 currentBalance, uint256 totalBalance)
    {
        currentBalance = equityHolders[holderAddress].currentBalance;
        totalBalance = equityHolders[holderAddress].totalBalance;

        return (currentBalance, totalBalance);
    }

    function releaseVestedEquity() public isFounder() {
        uint256 unreleasedAmount = _releasableEquityAmount(msg.sender);

        require(
            unreleasedAmount > 0,
            "PrivateCompany: no tokens to release at this time"
        );

        uint256 currentBalance = equityHolders[msg.sender].currentBalance;
        equityHolders[msg.sender].currentBalance = currentBalance.add(
            unreleasedAmount
        );

        _mint(msg.sender, unreleasedAmount);
        emit LogReleasedEquityForHolder(msg.sender, unreleasedAmount);
    }

    /* Private functions */
    /**
     * @param holderAddress address of equity holder.
     */
    function _releasableEquityAmount(address holderAddress)
        private
        view
        returns (uint256)
    {
        EquityHolder memory holder = equityHolders[holderAddress];

        uint256 currentBalance = holder.currentBalance;

        return _vestedEquityAmount(holderAddress).sub(currentBalance);
    }

    /**
     * @param holderAddress address of equity holder.
     */
    function _vestedEquityAmount(address holderAddress)
        private
        view
        returns (uint256)
    {
        EquityHolder memory holder = equityHolders[holderAddress];
        uint256 totalBalance = holder.totalBalance;
        uint256 lockTimeStart = holder.lockTimeStart;
        uint256 cliffTime = holder.lockTimeStart.addYears(TOKEN_CLIFF_TIME);

        if (block.timestamp < cliffTime) {
            return 0;
        } else if (
            block.timestamp >= lockTimeStart.addYears(TOKEN_VESTING_TIME)
        ) {
            return totalBalance;
        } else {
            return
                totalBalance.mul(block.timestamp.sub(lockTimeStart)).div(
                    TOKEN_VESTING_TIME
                );
        }
    }
}

// "Tesla", "TSLA", ["0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2", "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db", "0x5c6B0f7Bf3E7ce046039Bd8FABdfD3f9F5021678"]
