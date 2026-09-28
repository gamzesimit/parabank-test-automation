import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { TestUser } from '../fixtures/user';

export class RegisterPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.gotoStable('register.htm');
  }

  async register(u: TestUser) {
    const f = async (name: string, value: string) =>
      this.page.fill(`input[id="customer.${name}"]`, value);
    await f('firstName', u.firstName);
    await f('lastName', u.lastName);
    await f('address.street', u.address);
    await f('address.city', u.city);
    await f('address.state', u.state);
    await f('address.zipCode', u.zipCode);
    await f('phoneNumber', u.phone);
    await f('ssn', u.ssn);
    await this.page.fill('input[id="customer.username"]', u.username);
    await this.page.fill('input[id="customer.password"]', u.password);
    await this.page.fill('input[id="repeatedPassword"]', u.password);
    await this.page.locator('input[value="Register"]').click();
  }

  async expectRegistered(username: string) {
    await expect(this.page.locator('#rightPanel')).toContainText(`Welcome ${username}`);
  }
}
