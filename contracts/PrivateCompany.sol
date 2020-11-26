// SPDX-License-Identifier: MIT
pragma solidity >0.6.0;

import "./ERC20Private.sol";
import "./DateTimeLibrary.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

/**
 * @title Private Company contract with predefined founders,
 * simple vesting schedule and transaction agreement between all founders.
 * @dev Internal token(equity) can only circulate between founders.
 * @author Konstantin Zamaraev
 * @notice This final project for Consensys bootcamp. DO NOT USE IN PRODUCTION.
 */
contract PrivateCompany is ERC20Private {
    // Libraries
    using SafeMath for uint256;
    using BokkyPooBahsDateTimeLibrary for uint256;

    // Constants
    uint256 internal constant TOTAL_SUPPLY = 10000;
    uint256 internal constant TOKEN_CLIFF_TIME = 1; // 1 year for the cliff
    uint256 internal constant TOKEN_VESTING_TIME = 4; // 4 years for the full vesting

    // Events
    event LogDeposit(address indexed sender, uint256 value);
    event LogFounderEquityDistribution(
        address indexed founderAddress,
        uint256 equityAmount,
        uint256 vestingTime
    );
    event LogReleasedEquityForHolder(
        address indexed founderAddress,
        uint256 equityAmount
    );
    event LogTransactionSubmission(
        TransactionType txType,
        uint256 indexed transactionId
    );
    event LogTransactionExecution(uint256 indexed transactionId);
    event LogTransactionExecutionFailure(uint256 indexed transactionId);
    event LogTransactionConfirmation(
        address indexed sender,
        uint256 indexed transactionId
    );

    // Storage
    address[] private founders;
    mapping(address => EquityHolder) equityHolders;
    mapping(uint256 => Transaction) public transactions;
    mapping(uint256 => mapping(address => bool)) public confirmations;
    uint256 private transactionCount;
    bool public stopped = false;

    // Enums
    enum TransactionType {External, NewFounder}

    // Structs
    struct EquityHolder {
        uint256 lockTimeStart;
        uint256 currentBalance;
        uint256 totalBalance;
        address holderAddress;
    }

    struct Transaction {
        TransactionType txType;
        address destination;
        uint256 value;
        bytes data;
        bool executed;
    }

    // Modifiers
    modifier stopInEmergency {
        require(!stopped);
        _;
    }

    modifier notNull(address _address) {
        require(_address != address(0));
        _;
    }

    modifier transactionExists(uint256 transactionId) {
        require(transactions[transactionId].destination != address(0));
        _;
    }

    modifier confirmed(uint256 transactionId) {
        require(confirmations[transactionId][msg.sender]);
        _;
    }

    modifier notConfirmed(uint256 transactionId) {
        require(!confirmations[transactionId][msg.sender]);
        _;
    }

    modifier notExecuted(uint256 transactionId) {
        require(!transactions[transactionId].executed);
        _;
    }

    modifier isFounder() {
        require(
            hasRole(OWNER_ROLE, msg.sender),
            "PrivateCompany: sender is not a founder"
        );
        _;
    }

    /**
     * @dev Receive function allows to deposit ether.
     */
    receive() external payable {
        if (msg.value > 0) LogDeposit(msg.sender, msg.value);
    }

    // Public functions
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
        founders = _founders;
    }

    /**
     * @dev Emergency only! Block transaction submition/confirmation/execution
     */
    function stopContract() public isFounder() {
        stopped = true;
    }

    function resumeContract() public isFounder() {
        stopped = false;
    }

    function getTransactionTypes()
        public
        pure
        returns (string memory externalType, string memory newFounderType)
    {
        externalType = "External";
        newFounderType = "NewFounder";
        return (externalType, newFounderType);
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

    /**
     * @dev Allows a founder to submit and confirm a transaction.
     * @param txTypeKey Transaction type key string.
     * @param destination Transaction target address.
     * @param value Transaction ether value.
     * @param data Transaction data payload.
     */

    function submitTransaction(
        string memory txTypeKey,
        address destination,
        uint256 value,
        bytes memory data
    ) public stopInEmergency isFounder() returns (uint256 transactionId) {
        TransactionType txType = _getTransactionEnumValueByKey(txTypeKey);
        transactionId = _addTransaction(txType, destination, value, data);
        confirmTransaction(transactionId);
    }

    /**
     * @dev Allows a founder to confirm a transaction.
     * @param transactionId Transaction ID.
     */
    function confirmTransaction(uint256 transactionId)
        public
        stopInEmergency
        isFounder()
        transactionExists(transactionId)
        notConfirmed(transactionId)
    {
        confirmations[transactionId][msg.sender] = true;
        emit LogTransactionConfirmation(msg.sender, transactionId);
        executeTransaction(transactionId);
    }

    /**
     * @dev Allows anyone to execute a confirmed transaction.
     * @param transactionId Transaction ID.
     */
    function executeTransaction(uint256 transactionId)
        public
        stopInEmergency
        isFounder()
        confirmed(transactionId)
        notExecuted(transactionId)
    {
        if (isConfirmed(transactionId)) {
            Transaction storage txn = transactions[transactionId];
            txn.executed = true;

            if (txn.txType == TransactionType.External) {
                if (_externalCall(txn.destination, txn.value, txn.data)) {
                    emit LogTransactionExecution(transactionId);
                } else {
                    emit LogTransactionExecutionFailure(transactionId);
                    txn.executed = false;
                }
            }

            if (txn.txType == TransactionType.NewFounder) {
                _setupRole(OWNER_ROLE, txn.destination);
            }
        }
    }

    /**
     * @dev Returns the confirmation status of a transaction.
     * @param transactionId Transaction ID.
     * @return Confirmation status.
     */
    function isConfirmed(uint256 transactionId) public view returns (bool) {
        uint256 count = 0;
        for (uint256 i = 0; i < founders.length; i++) {
            if (confirmations[transactionId][founders[i]]) {
                count += 1;
            }
            if (count == founders.length) {
                return true;
            }
        }
    }

    // Private functions
    /**
     * @param txKey Transaction type string.
     */
    function _getTransactionEnumValueByKey(string memory txKey)
        private
        pure
        returns (TransactionType)
    {
        if (keccak256(bytes(txKey)) == keccak256("External"))
            return TransactionType.External;
        if (keccak256(bytes(txKey)) == keccak256("NewFounder"))
            return TransactionType.NewFounder;
        revert();
    }

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

    // Internal functions
    /**
     * @dev Adds a new transaction to the transaction mapping, if transaction does not exist yet.
     * @param txType Transaction type.
     * @param destination Transaction target address.
     * @param value Transaction ether value.
     * @param data Transaction data payload.
     */
    function _addTransaction(
        TransactionType txType,
        address destination,
        uint256 value,
        bytes memory data
    ) internal notNull(destination) returns (uint256 transactionId) {
        transactionId = transactionCount;
        transactions[transactionId] = Transaction({
            txType: txType,
            destination: destination,
            value: value,
            data: data,
            executed: false
        });
        transactionCount += 1;
        emit LogTransactionSubmission(txType, transactionId);
    }

    /**
     * Call has been separated into its own function in order to take advantage
     * of the Solidity's code generator to produce a loop that copies tx.data into memory.
     */
    function _externalCall(
        address destination,
        uint256 value,
        bytes memory data
    ) internal returns (bool) {
        bool result;
        assembly {
            result := call(
                gas(),
                destination,
                value,
                add(data, 32), // First 32 bytes are the padded length of data, so exclude that
                mload(data), // Size of the input (in bytes) - this is what fixes the padding problem
                0,
                0 // Output is ignored, therefore the output size is zero
            )
        }
        return result;
    }
}

// "Tesla", "TSLA", ["0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2", "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db"]
