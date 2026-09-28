import { test, expect } from '@playwright/test';
import { RegisterPage } from '../pages/RegisterPage';
import { AccountsOverviewPage } from '../pages/AccountsOverviewPage';
import { BillPayPage } from '../pages/BillPayPage';
import { TransferFundsPage } from '../pages/TransferFundsPage';
import { buildUser } from '../fixtures/user';

/**
 * These tests state the rules a banking application is expected to keep.
 * The ones marked test.fail() are the rules this build breaks; each one
 * carries the defect id it belongs to in docs/defect-reports.md.
 */

async function newCustomer(page: any) {
  const register = new RegisterPage(page);
  await register.goto();
  await register.register(buildUser());
  const overview = new AccountsOverviewPage(page);
  await overview.goto();
  const [account] = await overview.accountIds();
  return { overview, account };
}

test.describe('Rules that protect the balance', () => {
  test.fail(); // PB-002
  test('a bill payment above the available balance must be refused', async ({ page }) => {
    const { overview, account } = await newCustomer(page);
    const before = await overview.balanceOf(account);

    const billpay = new BillPayPage(page);
    await billpay.goto();
    await billpay.pay((before + 1000).toFixed(2), account);

    await overview.goto();
    const after = await overview.balanceOf(account);
    expect(after, 'the balance must not be driven negative by a payment').toBeGreaterThanOrEqual(0);
  });
});

test.describe('Rules about the sign of an amount', () => {
  test.fail(); // PB-003
  test('a bill payment with a negative amount must be refused, not credited', async ({ page }) => {
    const { overview, account } = await newCustomer(page);
    const before = await overview.balanceOf(account);

    const billpay = new BillPayPage(page);
    await billpay.goto();
    await billpay.pay('-250.00', account);

    await overview.goto();
    const after = await overview.balanceOf(account);
    expect(after, 'a negative payment must never increase the balance').toBeLessThanOrEqual(before);
  });

  test.fail(); // PB-004
  test('a transfer with a negative amount must show an error', async ({ page }) => {
    const { account } = await newCustomer(page);
    const transfer = new TransferFundsPage(page);
    await transfer.goto();
    await transfer.transfer('-250.00', account, account);
    const result = await transfer.resultText();
    expect(result, 'the form must tell the customer why nothing happened')
      .toMatch(/invalid|must be|error|greater than/i);
  });
});

test.describe('Rules that already hold', () => {
  test('a payment inside the balance leaves the account by exactly that amount', async ({ page }) => {
    const { overview, account } = await newCustomer(page);
    const before = await overview.balanceOf(account);

    const billpay = new BillPayPage(page);
    await billpay.goto();
    await billpay.pay('37.45', account);

    await overview.goto();
    const after = await overview.balanceOf(account);
    expect(Number((before - after).toFixed(2))).toBe(37.45);
  });
});
