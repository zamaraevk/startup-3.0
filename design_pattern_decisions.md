# Design Pattern Decisions

## ERC20Private.sol

### Access Control

This contract is built on top of the Open Zepplin Access Control contract which allows to set the role (Owner) and assign admin rights to it.

- `grantRole` and `revokeRole` overwritten to prevent single Owner to add another one in a non-multisig fashion.
- internal `_addOwner` is the only way to add additional Owner, which uses multisig design in the `PrivateCompany.sol`.

### Restricting Access

This contract is built on top of the Open Zepplin ERC20 contract. It uses internal override for `_beforeTokenTransfer` to restrict ERC20 token transfer only between accounts with Owner role (Private stock)

## PrivateCompany.sol

### Restricting Access

By design of the contract, every action(method) which changing the state restricted to Founder only.

There are two types of methods to change the contract state: multisig transaction and standard non-multisig.

#### Multisig transactions

This type of transaction will only execute itself only after confirmations from every founder. There are 4 types of multi-sig transactions currently:

- Add new founder
- Launch vesting schedule
- External
- Destroy contract(company)

The founder can fetch all available transaction types via the public method `getTransactionTypes`.

#### Non-Multisig transactions

This type of transaction is available to support immediate state change. There are 5 methods, each of the restricted to Founder only:

- Submit transaction
- Confirm transaction
- Stop the contract
- Resume the contract
- Release vested equity

#### Read state methods

Following list of methods to return the contract state restricted to Founder:

- Get all transaction types
- Get transaction details
- Get equity holder balance

### Mortal

This contract supports the Mortal design pattern via multisig transaction. Every founder will need to confirm this type of transaction before execution and all funds from the company contract will be send to `destination` address.

### Circuit Breaker

This contract supports Circuit Breaker design pattern, there are methods to stop and resume contracts functionality, it will block methods such as:

- Submit transaction
- Confirm transaction
- Execute transaction (private method)
