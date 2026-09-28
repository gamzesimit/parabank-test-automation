import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { parseMoney } from './AccountsOverviewPage';

export class FindTransactionsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.gotoStable('findtrans.htm');
  }

  async selectAccount(accountId: string) {
    await this.page.selectOption('#accountId', accountId);
  }

  async findByAmount(amount: string) {
    await this.page.fill('#amount', amount);
    await this.page.locator('#findByAmount').click();
    await this.waitForResults();
  }

  /**
   * The results are fetched and written into the table on the same page, so
   * neither a navigation nor the presence of the table tells us the search has
   * finished. Wait until a row appears, and give up quietly when the search
   * genuinely returns nothing.
   */
  private async waitForResults(timeoutMs = 8000) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      if ((await this.page.locator('#transactionTable tbody tr').count()) > 0) return;
      await this.page.waitForTimeout(250);
    }
  }

  /** Every amount shown on a result row, taken from the debit and credit columns. */
  async resultAmounts(): Promise<number[]> {
    const rows = this.page.locator('#transactionTable tbody tr');
    const count = await rows.count();
    const amounts: number[] = [];
    for (let i = 0; i < count; i++) {
      const cells = await rows.nth(i).locator('td').allInnerTexts();
      for (const cell of cells.slice(2)) {
        const value = parseMoney(cell);
        if (!Number.isNaN(value)) amounts.push(value);
      }
    }
    return amounts;
  }

  async resultCount(): Promise<number> {
    return this.page.locator('#transactionTable tbody tr').count();
  }
}
