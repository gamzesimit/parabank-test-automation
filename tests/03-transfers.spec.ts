import { test, expect } from '@playwright/test';
import { RegisterPage } from '../pages/RegisterPage';
import { AccountsOverviewPage } from '../pages/AccountsOverviewPage';
import { OpenAccountPage } from '../pages/OpenAccountPage';
import { TransferFundsPage } from '../pages/TransferFundsPage';
import { buildUser } from '../fixtures/user';

async function customerWithTwoAccounts(page: any) {
  const user = buildUser();
  const register = new RegisterPage(page);
  await register.goto();
  await register.register(user);
  const open = new OpenAccountPage(page);
  await open.goto();
  await open.open('SAVINGS');
  const overview = new AccountsOverviewPage(page);
  await overview.goto();
  const ids = (await overview.accountIds()).map((s) => s.trim()).filter(Boolean);
  if (ids.length < 2) throw new Error(`expected two accounts, found ${ids.length}`);
  return { user, first: ids[0], second: ids[1], overview };
}

test.describe('Transferring funds between own accounts', () => {
  test('@smoke a transfer moves exactly the stated amount and leaves the total unchanged', async ({
    page,
  }) => {
    const { first, second, overview } = await customerWithTwoAccounts(page);
    const fromBefore = await overview.balanceOf(first);
    const toBefore = await overview.balanceOf(second);

    const transfer = new TransferFundsPage(page);
    await transfer.goto();
    await transfer.transfer('25.00', first, second);
    await expect(page.locator('#rightPanel')).toContainText('Transfer Complete');

    await overview.goto();
    const fromAfter = await overview.balanceOf(first);
    const toAfter = await overview.balanceOf(second);

    expect(Number((fromBefore - fromAfter).toFixed(2))).toBe(25);
    expect(Number((toAfter - toBefore).toFixed(2))).toBe(25);
    // double entry: nothing is created or destroyed by a transfer
    expect(Number((fromAfter + toAfter).toFixed(2))).toBe(
      Number((fromBefore + toBefore).toFixed(2)),
    );
  });

  test('an amount with cents is applied to the cent, not rounded', async ({ page }) => {
    const { first, second, overview } = await customerWithTwoAccounts(page);
    const before = await overview.balanceOf(second);

    const transfer = new TransferFundsPage(page);
    await transfer.goto();
    await transfer.transfer('10.37', first, second);
    await expect(page.locator('#rightPanel')).toContainText('Transfer Complete');

    await overview.goto();
    const after = await overview.balanceOf(second);
    expect(Number((after - before).toFixed(2))).toBe(10.37);
  });

  test('a transfer larger than the balance is refused', async ({ page }) => {
    const { first, second, overview } = await customerWithTwoAccounts(page);
    const available = await overview.balanceOf(first);

    const transfer = new TransferFundsPage(page);
    await transfer.goto();
    await transfer.transfer((available + 1000).toFixed(2), first, second);

    const result = await transfer.resultText();
    expect(result, 'an overdrawn transfer must not report success').not.toMatch(
      /Transfer Complete/i,
    );
  });

  test('a negative amount is refused', async ({ page }) => {
    const { first, second } = await customerWithTwoAccounts(page);
    const transfer = new TransferFundsPage(page);
    await transfer.goto();
    await transfer.transfer('-50.00', first, second);
    const result = await transfer.resultText();
    expect(result, 'a negative transfer must not report success').not.toMatch(/Transfer Complete/i);
  });

  test('a zero amount is refused', async ({ page }) => {
    const { first, second } = await customerWithTwoAccounts(page);
    const transfer = new TransferFundsPage(page);
    await transfer.goto();
    await transfer.transfer('0.00', first, second);
    const result = await transfer.resultText();
    expect(result, 'a zero transfer must not report success').not.toMatch(/Transfer Complete/i);
  });
});
