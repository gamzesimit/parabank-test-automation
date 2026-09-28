import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class OpenAccountPage extends BasePage {
  constructor(page: Page) { super(page); }

  async goto() { await this.gotoStable('openaccount.htm'); }

  async open(type: 'CHECKING' | 'SAVINGS', fromAccountIndex = 0): Promise<string> {
    await this.page.selectOption('#type', { label: type === 'CHECKING' ? 'CHECKING' : 'SAVINGS' });
    const from = this.page.locator('#fromAccountId');
    await expect(from).toBeVisible();
    // the funding account list is filled by an ajax call after the page renders
    await expect.poll(async () => from.locator('option').count(), { timeout: 20_000 }).toBeGreaterThan(0);
    await from.selectOption({ index: fromAccountIndex });
    await this.page.locator('input[value="Open New Account"]').click();
    await expect(this.page.locator('#newAccountId')).toBeVisible();
    return (await this.page.locator('#newAccountId').innerText()).trim();
  }
}
