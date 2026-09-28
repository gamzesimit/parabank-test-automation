import { test, expect } from '@playwright/test';
import { RegisterPage } from '../pages/RegisterPage';
import { AccountsOverviewPage } from '../pages/AccountsOverviewPage';
import { RequestLoanPage } from '../pages/RequestLoanPage';
import { buildUser } from '../fixtures/user';

async function newCustomer(page: any) {
  const register = new RegisterPage(page);
  await register.goto();
  await register.register(buildUser());
  const overview = new AccountsOverviewPage(page);
  await overview.goto();
  const [account] = await overview.accountIds();
  return { overview, account };
}

test.describe('Requesting a loan', () => {
  test('an affordable loan is decided and the answer is shown', async ({ page }) => {
    const { account } = await newCustomer(page);
    const loan = new RequestLoanPage(page);
    await loan.goto();
    await loan.request('1000', '100', account);
    const result = await loan.resultText();
    expect(result, 'the page must state a decision').toMatch(/approved|denied/i);
  });

  test('an approved loan opens a new account and the down payment leaves the funding account', async ({
    page,
  }) => {
    const { overview, account } = await newCustomer(page);
    const before = await overview.balanceOf(account);
    const accountsBefore = (await overview.accountIds()).length;

    const loan = new RequestLoanPage(page);
    await loan.goto();
    await loan.request('1000', '100', account);
    const result = await loan.resultText();
    test.skip(/denied/i.test(result), 'the application denied this loan, nothing to verify');

    await overview.goto();
    const after = await overview.balanceOf(account);
    const accountsAfter = (await overview.accountIds()).length;

    expect(
      Number((before - after).toFixed(2)),
      'the down payment must leave the funding account',
    ).toBe(100);
    expect(accountsAfter, 'an approved loan must open one new account').toBe(accountsBefore + 1);
  });

  test('a down payment larger than the balance is refused', async ({ page }) => {
    const { overview, account } = await newCustomer(page);
    const available = await overview.balanceOf(account);

    const loan = new RequestLoanPage(page);
    await loan.goto();
    await loan.request('1000', (available + 500).toFixed(2), account);
    const result = await loan.resultText();
    expect(result, 'a down payment the customer cannot fund must not be approved').not.toMatch(
      /approved/i,
    );
  });

  test('a negative loan amount is refused', async ({ page }) => {
    const { account } = await newCustomer(page);
    const loan = new RequestLoanPage(page);
    await loan.goto();
    await loan.request('-5000', '100', account);
    const result = await loan.resultText();
    expect(result, 'a negative loan must not be approved').not.toMatch(/approved/i);
  });
});
