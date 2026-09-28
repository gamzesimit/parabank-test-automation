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
    // the decision arrives after a request, so wait for the outcome panel
    await this.page
      .locator('#loanRequestApproved, #loanRequestDenied, #requestLoanError, .error')
      .first()
      .waitFor({ state: 'visible', timeout: 20_000 })
      .catch(() => undefined);
  }

  async decision(): Promise<string> {
    return (
      await this.page
        .locator('#loanStatus, #loanRequestApproved, #loanRequestDenied')
        .first()
        .innerText()
    ).trim();
  }

  async resultText(): Promise<string> {
    return (await this.page.locator('#rightPanel').innerText()).trim();
  }
}
