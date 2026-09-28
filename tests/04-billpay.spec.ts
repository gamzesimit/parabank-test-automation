import { test, expect } from '@playwright/test';
import { RegisterPage } from '../pages/RegisterPage';
import { AccountsOverviewPage } from '../pages/AccountsOverviewPage';
import { BillPayPage } from '../pages/BillPayPage';
import { buildUser } from '../fixtures/user';

test.describe('Paying a bill', () => {
  test('a payment leaves the account by exactly the amount entered', async ({ page }) => {
    const register = new RegisterPage(page);
    await register.goto();
    await register.register(buildUser());

    const overview = new AccountsOverviewPage(page);
    await overview.goto();
    const [account] = await overview.accountIds();
    const before = await overview.balanceOf(account);

    const billpay = new BillPayPage(page);
    await billpay.goto();
    await billpay.pay('37.45', account);
    await expect(page.locator('#rightPanel')).toContainText(/Bill Payment .* Complete|Bill Payment to/i);

    await overview.goto();
    const after = await overview.balanceOf(account);
    expect(Number((before - after).toFixed(2))).toBe(37.45);
  });
});
