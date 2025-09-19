# Stacks Lending Pool

A decentralized lending pool smart contract system built on the Stacks blockchain, allowing users to deposit STX, borrow within LTV ratios, and interact with a mock oracle for price updates.

## Features

- Deposit and withdraw STX
- Borrow STX within Loan-to-Value (LTV) ratios
- Mock Oracle integration for testing price feeds
- Liquidation support (optional)
- Fully tested with Vitest and Clarinet SDK

## Contracts

- `mock-oracle.clar` — Simulates price updates for assets
- `lending-pool.clar` — Core lending pool logic

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/syed-ghufran-hassan/dual-asset-lending.git
cd stacks-lending-pool
```

2. Install dependencies:

```bash
npm install
```

3. Run tests

```bash
npm run test
```



