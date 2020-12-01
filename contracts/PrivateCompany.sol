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
    event LogContractStopped();
    event LogContractResume();

    // Storage
    uint256 private equityPool;
    address[] public founders;
    mapping(address => EquityHolder) equityHolders;
    mapping(uint256 => Transaction) public transactions;
    mapping(uint256 => mapping(address => bool)) public confirmations;
    uint256 private transactionCount;
    bool public stopped = false;

    // Enums
    enum TransactionType {
        External,
        NewFounder,
        LaunchVestingSchedule,
        DestroyCompany
    }

    // Structs
    struct EquityHolder {
        uint256 lockTimeStart;
        uint256 currentBalance;
        uint256 lockedBalance;
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

    modifier onlyFounder() {
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
     * with the vesting schedule (4 years duration)
     * @param _companyName Company name.
     * @param _token Company(token) ticker name.
     */
    constructor(string memory _companyName, string memory _token)
        public
        payable
        ERC20(_companyName, _token)
        ERC20Private()
    {
        founders.push(msg.sender);
    }

    /**
     * @dev Emergency only! Block transaction submition/confirmation/execution
     */
    function stopContract() public onlyFounder {
        stopped = true;
        emit LogContractStopped();
    }

    function resumeContract() public onlyFounder {
        stopped = false;
        emit LogContractResume();
    }

    function getLastTransactionDetails(address holderAddress)
        public
        view
        returns (
            bool isConfirmedByMe,
            bool isExecuted,
            TransactionType txType
        )
    {
        uint256 lastTxId = 0;

        if (transactionCount > 0) {
            lastTxId = transactionCount.sub(1);
        }

        Transaction memory lastTx = transactions[lastTxId];
        isConfirmedByMe = confirmations[lastTxId][holderAddress];
        isExecuted = lastTx.executed;
        txType = lastTx.txType;

        return (isConfirmedByMe, isExecuted, txType);
    }

    function getTransactionTypes()
        public
        pure
        returns (
            string memory externalType,
            string memory newFounderType,
            string memory launchVestingScheduleType,
            string memory destroyCompanyType
        )
    {
        externalType = "External";
        newFounderType = "NewFounder";
        launchVestingScheduleType = "LaunchVestingSchedule";
        destroyCompanyType = "DestroyCompany";

        return (
            externalType,
            newFounderType,
            launchVestingScheduleType,
            destroyCompanyType
        );
    }

    /**
     * @param holderAddress address of equity holder.
     */
    function getEquityHolderBalance(address holderAddress)
        public
        view
        returns (
            uint256 currentBalance,
            uint256 lockedBalance,
            uint256 totalBalance
        )
    {
        currentBalance = equityHolders[holderAddress].currentBalance;
        lockedBalance = equityHolders[holderAddress].lockedBalance;
        totalBalance = equityHolders[holderAddress].totalBalance;

        return (currentBalance, lockedBalance, totalBalance);
    }

    function releaseVestedEquity() public onlyFounder {
        uint256 unreleasedAmount = _releasableEquityAmount(msg.sender);

        require(
            unreleasedAmount > 0,
            "PrivateCompany: no tokens to release at this time"
        );

        EquityHolder storage equityHolder = equityHolders[msg.sender];

        equityHolder.currentBalance = equityHolder.currentBalance.add(
            unreleasedAmount
        );

        equityHolder.lockedBalance = equityHolder.lockedBalance.sub(
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
    ) public stopInEmergency onlyFounder returns (uint256 transactionId) {
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
        onlyFounder
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
        onlyFounder
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
                _addNewFounder(txn.destination);
            }

            if (txn.txType == TransactionType.LaunchVestingSchedule) {
                _launchVestingSchedule();
            }

            if (txn.txType == TransactionType.DestroyCompany) {
                selfdestruct(address(uint160(txn.destination)));
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
    function _launchVestingSchedule() private onlyFounder {
        uint256 totalSupply = TOTAL_SUPPLY.mul(10**uint256(decimals()));
        uint256 founderDistributonSupply = totalSupply.mul(90).div(100); // 90% goes to initial founders / 10% to equity pool
        equityPool = totalSupply.sub(founderDistributonSupply);
        uint256 equityAmount = founderDistributonSupply.div(founders.length);

        for (uint256 i = 0; i < founders.length; i++) {
            equityHolders[founders[i]] = EquityHolder(
                block.timestamp,
                0,
                equityAmount,
                equityAmount,
                founders[i]
            );

            emit LogFounderEquityDistribution(
                founders[i],
                equityAmount,
                TOKEN_VESTING_TIME
            );
        }
    }

    /**
     * @param founderAddress new founder address.
     */
    function _addNewFounder(address founderAddress) private returns (bool) {
        require(founderAddress != address(0));

        _addOwner(founderAddress);
        founders.push(founderAddress);
    }

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
        if (keccak256(bytes(txKey)) == keccak256("LaunchVestingSchedule"))
            return TransactionType.LaunchVestingSchedule;
        if (keccak256(bytes(txKey)) == keccak256("DestroyCompany"))
            return TransactionType.DestroyCompany;
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

    // Internal functions
    /**
     * @param holderAddress address of equity holder.
     */
    function _vestedEquityAmount(address holderAddress)
        internal
        view
        returns (uint256)
    {
        EquityHolder memory holder = equityHolders[holderAddress];
        uint256 totalBalance = holder.totalBalance;
        uint256 lockTimeStart = holder.lockTimeStart;
        uint256 durationLeft = block.timestamp.sub(lockTimeStart);
        uint256 durationFull = lockTimeStart.addYears(TOKEN_VESTING_TIME);

        if (block.timestamp >= durationFull) {
            return totalBalance;
        } else {
            return totalBalance.mul(durationLeft).div(durationFull);
        }
    }

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

// "test","TST"
