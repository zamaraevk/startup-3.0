# Startup 3.0

<img src="https://github.com/zamaraevk/startup-3.0/blob/main/client/src/assets/company.svg" width="350">

## Demo

The project is deployed to the IPFS network via Fleek.
URL: https://morning-term-8658.on.fleek.co

## Requirements

1. node v12.13.0
2. npm 6.14.8
3. yarn v1.19.0
4. truffle

## Folder structure

`root directory` has a standard truffle project structure. It has `package.json` to install all necessary dependencies for local contract development.
`client/` folder is a client-side part of the project. It was built with `truffle unbox react` and has CRA under the hood.

## Javascript unit tests

For unit tests, I choose to cover all the most important parts that critical for the correct contract execution, such as:

- correct was to add a new owner, only via internal \_addOwner.
- private equity (ERC20 tokens) can only be transferred between owners
- public grantRole from Access Control contract has to be blocked
- factory contract test to make sure that the new instance can be created
- test every type of multisig transaction
- test circuit breaker functionality

## Run the app

**This project is required to have Metamask connected to the browser.**

Client-side is connected to the contract deployed to Rinkeby Testnet Network, address `0x8e8ce40A2304031090A7f0BEd887cbEFf9EA9E4C`

1. Navigate to `/client` folder
2. Run `yarn install` to install all client-side dependencies.
3. Run `yarn start` to start the server, it will automatically open browser page.

## Compile and test Solidity contracts locally

1. Navigate to the root directory
2. Run `yarn install` for Open Zepplin dependencies
3. Run `truffle compile`
4. Run `truffle test`

## Product Description

This Web 3.0 application allows creating a multisig based private company with a set of founders, private equity, and a vesting schedule with a 4-year duration. Every company action is transaction-based means that each founder has to accept it before execution. Currently, there are 4 types of transactions: add new founder, launch equity schedule, external transaction, destroy the contract.

**User strories:**

- First founder created the private company contract with a certain name and the ticker. This contract will have its internal ERC20 token which can circulate only between founders.
- Founder added couple more founders to the company.
- After all, founders agreed and launched a vesting schedule. 90% of all internal tocken supply(equity) is distributed equally between founders on the schedule with the 4-year duration.
- After the vesting schedule launch, 10% of equity will stay in the Equity pool for future company needs.
- Anyone can send ETH to the company contract as an investment.
- Founders can agree and send the external transaction with ETH to pay for any company needs.
- Founder can release equity at any time, the contract will calculate the releasable amount based on block timestamp, launch date, and duration.
- Founder can stop/resume the contract.
- Founders can agree to destroy the private company.

### Multisig Transactions types

#### Add new founder

Click `Add new founder` and provide Ethereum external account address and submit. If already multiple founders exist, when adding a new one - every founder has to confirm this transaction before changes will apply.

#### Launch vesting schedule

When all founders onboard, any of the founders can create a new transaction to launch the vesting schedule. When every founder confirmed this transaction, 2 things will happen:

- 90% of the total supply of private equity will be split evenly between all founders with the simple 4-year vesting schedule.
- 10% of the total supply will go to the Equity Pool for the future company needs.

As soon as the vesting schedule has been launched, the founder can navigate to the Founder section and release equity at any time. It will calculate how much equity to mint based on the current block time from the launch date.

#### External transaction

The company has its ETH balance, the potential use case is that it will hold all money from investors. In that case, it will reflect how much money the company costs. To send ETH from the company address - the transaction has to be confirmed by each founder in a multisig manner.

#### Destroy company

Founders can decide to destroy the company contract. One of the founders has to create Destroy Company transactions and the rest of the founders has to confirm it.

## Pages

### Create a Company

To create a new company navigate to [https://morning-term-8658.on.fleek.co/](https://morning-term-8658.on.fleek.co/) (demo app) and submit the form with the desired company name and the ticker.

### Company Dashboard

The dashboard has left side navigation with 3 separate pages: Home, Founder, Contract.

#### Home

Home page has everything related to the company, such as company balance, founders, total supply, equity pool and transactions.

- **Company balance tile | View:** ETH balance | **Actions:** Show/Hide balance, Send ETH (External transaction)
- **Founders tile | View:** Number of founders | **Actions:** Add new founder
- **Equity tile | View:** Equity pool/Total supply | **Actions:** Show/Hide balances, Launch vesting schedule
- **Transactions tile | View:** Last transaction with type, status and confirmation button | **Actions:** Load previous transaction(if any), Confirm transaction

#### Founder

Founder page shows current state of the equity balance.

- **Equity balance tile | View:** Schedule launch date, duration, amount of released and locked equity(pie chart) | **Actions:** Release equity

#### Contract

This page contains set of the contract related actions.

- **Stop the contract(not multisig)**
- **Destroy the contract(multisig)**

## Solidity Contracts

### ERC20Private

This contract is a child of ERC20 and AccessControl with extra logic.

- Contract does not have addresses with DEFAULT_ADMIN role
- OWNER role is the admin role
- `grantRole` and `revokeRole` overwritten to prevent public calls
- `_addOwner` internal function used to add new founder from the parent multisig contract
- extending `_beforeTokenTransfer` to allow send ERC20 only between Owners (aka Private equity)

### PrivateCompany

- uses library `SafeMath` for math calculations
- uses library `BokkyPooBahsDateTimeLibrary` to handle unix timestamp calculations such as `addYears`

### PrivateCompanyFactory

This contract is handling cloning of the PrivateCompany.sol.
