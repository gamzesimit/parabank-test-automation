import { test, expect } from '@playwright/test';
import { RegisterPage } from '../pages/RegisterPage';
import { AccountsOverviewPage } from '../pages/AccountsOverviewPage';
import { OpenAccountPage } from '../pages/OpenAccountPage';
import { buildUser } from '../fixtures/user';

test.describe('Opening accounts', () => {
  test('opening a savings account moves the required deposit out of the funding account', async ({
    page,
  }) => {
    const user = buildUser();
    const register = new RegisterPage(page);
    await register.goto();
    await register.register(user);

    const overview = new AccountsOverviewPage(page);
    await overview.goto();
    const [funding] = await overview.accountIds();
    const before = await overview.balanceOf(funding);

    const open = new OpenAccountPage(page);
    await open.goto();
    const newAccount = await open.open('SAVINGS');

    await overview.goto();
    const after = await overview.balanceOf(funding);
    const opened = await overview.balanceOf(newAccount);

    // ParaBank funds a new account with a 100.00 minimum deposit
    expect(opened).toBe(100);
    expect(Number((before - after).toFixed(2))).toBe(100);
  });

  test('the overview total equals the sum of the account balances', async ({ page }) => {
    const user = buildUser();
    const register = new RegisterPage(page);
    await register.goto();
    await register.register(user);

    const open = new OpenAccountPage(page);
    await open.goto();
    await open.open('CHECKING');

    const overview = new AccountsOverviewPage(page);
    await overview.goto();
    const ids = await overview.accountIds();
    let sum = 0;
    for (const id of ids) sum += await overview.balanceOf(id);
    const shown = await overview.totalShown();
    expect(Number(shown.toFixed(2))).toBe(Number(sum.toFixed(2)));
  });
});
