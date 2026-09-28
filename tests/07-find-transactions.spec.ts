import { test, expect } from '@playwright/test';
import { RegisterPage } from '../pages/RegisterPage';
import { AccountsOverviewPage } from '../pages/AccountsOverviewPage';
import { BillPayPage } from '../pages/BillPayPage';
import { FindTransactionsPage } from '../pages/FindTransactionsPage';
import { buildUser } from '../fixtures/user';

test.describe('Finding a transaction', () => {
  test('a payment can be found again by its amount', async ({ page }) => {
    const register = new RegisterPage(page);
    await register.goto();
    await register.register(buildUser());

    const overview = new AccountsOverviewPage(page);
    await overview.goto();
    const [account] = await overview.accountIds();

    const billpay = new BillPayPage(page);
    await billpay.goto();
    await billpay.pay('42.42', account);

    const find = new FindTransactionsPage(page);
    await find.goto();
    await find.selectAccount(account);
    await find.findByAmount('42.42');

    const amounts = await find.resultAmounts();
    expect(amounts.length, 'the payment must be findable by its amount').toBeGreaterThan(0);
    for (const amount of amounts) {
      expect(Math.abs(amount), 'every row returned must carry the amount that was searched').toBe(
        42.42,
      );
    }
  });

  test('an amount that was never paid returns nothing', async ({ page }) => {
    const register = new RegisterPage(page);
    await register.goto();
    await register.register(buildUser());

    const overview = new AccountsOverviewPage(page);
    await overview.goto();
    const [account] = await overview.accountIds();

    const find = new FindTransactionsPage(page);
    await find.goto();
    await find.selectAccount(account);
    await find.findByAmount('987.65');

    expect(await find.resultCount(), 'a search with no match must return no rows').toBe(0);
  });
});
