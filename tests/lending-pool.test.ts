
import path from "path";
import { Cl, ClarityType, cvToValue } from "@stacks/transactions";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const faucet = accounts.get("faucet")!;
const updater = deployer;

const lender = accounts.get("wallet_2")!;
const borrower = accounts.get("wallet_3")!;
const liquidator = accounts.get("wallet_4")!;

describe("Lending Pool Tests", () => {
   
 beforeAll(() => {
const oraclePath = path.resolve(__dirname, "../contracts/mock-oracle.clar");
const lendingPath = path.resolve(__dirname, "../contracts/lending-pool.clar");
 

  // Use filePath; do NOT read files manually
simnet.deployContract({ name: "mock-oracle", filePath: oraclePath, sender: deployer });
simnet.deployContract({ name: "lending-pool", filePath: lendingPath, sender: deployer });

  initializeOracle();
  ensureOracleUpdater();
  updateOracle(10);
});
 
  beforeEach(() => {
    mintSTX(100_000_000, lender);
    updateOracle(10); // always refresh oracle before borrowing
  });

  it("allows lenders to deposit STX", () => {
    const { result } = simnet.callPublicFn(
      "lending-pool",
      "deposit-stx",
      [Cl.uint(100_000_000)],
      lender
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("allows borrowing STX within LTV ratio", () => {
    simnet.callPublicFn("lending-pool", "deposit-stx", [Cl.uint(100_000_000)], lender);

    const { result } = simnet.callPublicFn(
      "lending-pool",
      "borrow-stx",
      [Cl.uint(1), Cl.uint(7)], // make sure this is within LTV
      borrower
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("rejects borrowing STX beyond LTV ratio", () => {
    simnet.callPublicFn("lending-pool", "deposit-stx", [Cl.uint(100_000_000)], lender);

    const { result } = simnet.callPublicFn(
      "lending-pool",
      "borrow-stx",
      [Cl.uint(1), Cl.uint(10)], // beyond LTV
      borrower
    );
    expect(result).toBeErr(Cl.uint(101)); // expected error code
  });
});

/* -------------------------- Helpers -------------------------- */

function ensureOracleUpdater() {
  const value = simnet.getDataVar("mock-oracle", "oracle-updater");
  const current = value ? cvToValue(value) : null;

  if (current === updater) return;

  const { result } = simnet.callPublicFn(
    "mock-oracle",
    "initialize",
    [Cl.principal(updater)],
    deployer
  );

  expect(result).toBeOk(Cl.bool(true));
}

function initializeOracle() {
  const { result } = simnet.callPublicFn(
    "mock-oracle",
    "initialize",
    [Cl.principal(updater)],
    deployer
  );

  if (result.type === ClarityType.ResponseErr) {
    console.warn("Oracle already initialized — skipping");
  } else {
    expect(result).toBeOk(Cl.bool(true));
  }
}

function updateOracle(price: number) {
  const { result } = simnet.callPublicFn(
    "mock-oracle",
    "update-price",
    [Cl.uint(price)],
    updater
  );
  expect(result).toBeOk(Cl.bool(true));
}

function mintSTX(amount: number, recipient: string) {
  const { result } = simnet.transferSTX(amount, recipient, faucet);
  expect(result).toBeOk(Cl.bool(true));
}
