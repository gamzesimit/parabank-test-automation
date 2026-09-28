import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  constructor(page: Page) { super(page); }

  async goto() { await this.gotoStable('index.htm'); }

  async login(username: string, password: string) {
    await this.page.fill('input[name="username"]', username);
    await this.page.fill('input[name="password"]', password);
    await this.page.locator('input[value="Log In"]').click();
  }

  async expectSignedIn() {
    await expect(this.page.locator('#leftPanel')).toContainText('Log Out');
  }

  async logout() { await this.openMenu('Log Out'); }
}
