// SPDX-License-Identifier: MIT

pragma solidity ^0.7.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Company is ERC20, AccessControl {
    mapping(address => bool) public founders;

    address public owner;

    event LogNewFounder(address indexed accountAddress);

    modifier isOwner() {
        require(msg.sender == owner);
        _;
    }

    modifier isFounder() {
        require(founders[msg.sender], "Not of of the founders");
        _;
    }

    modifier isNotFounder() {
        require(founders[msg.sender], "Already founder");
        _;
    }

    constructor() public ERC20("CompanyToken", "TKN") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function addFounder() public isNotFounder() returns (bool) {
        founders[msg.sender] = true;
        emit LogNewFounder(msg.sender);
        return true;
    }
}
