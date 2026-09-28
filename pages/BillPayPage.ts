import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class BillPayPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.gotoStable('billpay.htm');
  }

  async pay(amount: string, fromAccount: string, payeeAccount = '54321') {
    await this.page.fill('input[name="payee.name"]', 'City Utilities');
    await this.page.fill('input[name="payee.address.street"]', '1 Main St');
    await this.page.fill('input[name="payee.address.city"]', 'Austin');
    await this.page.fill('input[name="payee.address.state"]', 'TX');
    await this.page.fill('input[name="payee.address.zipCode"]', '78701');
    await this.page.fill('input[name="payee.phoneNumber"]', '5125550111');
    await this.page.fill('input[name="payee.accountNumber"]', payeeAccount);
    await this.page.fill('input[name="verifyAccount"]', payeeAccount);
    await this.page.fill('input[name="amount"]', amount);
    await this.page.selectOption('select[name="fromAccountId"]', fromAccount);
    await this.page.locator('input[value="Send Payment"]').click();
  }

  async resultText(): Promise<string> {
    return (await this.page.locator('#rightPanel').innerText()).trim();
  }
}
