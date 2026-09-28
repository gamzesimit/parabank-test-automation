import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class RequestLoanPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.gotoStable('requestloan.htm');
  }

  async request(amount: string, downPayment: string, fromAccount: string) {
    await this.page.fill('#amount', amount);
    await this.page.fill('#downPayment', downPayment);
    await this.page.selectOption('#fromAccountId', fromAccount);
    await this.page.locator('input[value="Apply Now"]').click();
  }

  async decision(): Promise<string> {
    return (await this.page.locator('#loanStatus, #loanRequestApproved, #loanRequestDenied').first().innerText()).trim();
  }

  async resultText(): Promise<string> {
    return (await this.page.locator('#rightPanel').innerText()).trim();
  }
}
