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
    await this.page.fill('#criteria\\.amount', amount);
    await this.page.locator('#findByAmount').click();
  }

  async resultAmounts(): Promise<number[]> {
    const cells = await this.page.locator('#transactionTable tbody tr td:nth-child(4)').allInnerTexts();
    return cells.map(parseMoney).filter((n) => !Number.isNaN(n));
  }

  async resultCount(): Promise<number> {
    return this.page.locator('#transactionTable tbody tr').count();
  }
}
