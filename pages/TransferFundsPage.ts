import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class TransferFundsPage extends BasePage {
  constructor(page: Page) { super(page); }

  async goto() { await this.gotoStable('transfer.htm'); }

  async transfer(amount: string, fromAccount: string, toAccount: string) {
    await this.page.fill('#amount', amount);
    await this.page.selectOption('#fromAccountId', fromAccount);
    await this.page.selectOption('#toAccountId', toAccount);
    await this.page.locator('input[value="Transfer"]').click();
  }

  async resultText(): Promise<string> {
    return (await this.page.locator('#rightPanel').innerText()).trim();
  }
}
