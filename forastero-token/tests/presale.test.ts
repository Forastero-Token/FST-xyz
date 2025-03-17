import { test, expect } from "vitest";
import { Clarinet, Tx, Chain, Account } from "@hirosystems/clarinet-sdk";

// Initialize Clarinet test environment
test("Ensure presale contract allows buying tokens", async () => {
  await Clarinet.test({
    name: "Ensure presale contract allows buying tokens",
    async fn(chain: Chain, accounts) {
      let buyer = accounts.get("wallet_1")!;
      
      let block = chain.mineBlock([
        Tx.contractCall("forastero-sale", "buy-tokens", ["u100"], buyer.address),
      ]);

      expect(block.receipts[0].result).toBeOk();
    },
  });
});

test("Ensure buyer balance updates after token purchase", async () => {
  await Clarinet.test({
    name: "Ensure buyer balance updates after token purchase",
    async fn(chain: Chain, accounts) {
      let buyer = accounts.get("wallet_1")!;

      chain.mineBlock([
        Tx.contractCall("forastero-sale", "buy-tokens", ["u100"], buyer.address),
      ]);

      let balanceCheck = chain.callReadOnlyFn(
        "forastero-sale",
        "get-balance",
        [buyer.address],
        buyer.address
      );

      expect(balanceCheck.result).toEqual("(ok u100)");
    },
  });
});

test("Ensure only the contract owner can withdraw funds", async () => {
  await Clarinet.test({
    name: "Ensure only the contract owner can withdraw funds",
    async fn(chain: Chain, accounts) {
      let deployer = accounts.get("deployer")!;
      let buyer = accounts.get("wallet_1")!;

      // Unauthorized withdrawal (should fail)
      let failedWithdrawal = chain.mineBlock([
        Tx.contractCall("forastero-sale", "withdraw", [], buyer.address),
      ]);

      expect(failedWithdrawal.receipts[0].result).toContain("(err u1)");

      // Owner withdrawal (should succeed)
      let successfulWithdrawal = chain.mineBlock([
        Tx.contractCall("forastero-sale", "withdraw", [], deployer.address),
      ]);

      expect(successfulWithdrawal.receipts[0].result).toBeOk();
    },
  });
});

