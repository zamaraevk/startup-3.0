# Avoiding Common Attacks

## PrivateCompany.sol

### Reentrancy

This contract has `mutex` mechanism to prevent reentrancy attack for `releaseVestedEquity` method. Because vested equity calculations depend on the block timestamp, it's possible that two transactions can be submitting in the same block. To prevent double minting we are guarding release vested equity code block.

### Multisig nature

This contract is designed to use by a specific set of addresses only and all important transactions happen in a multisig fashion.
