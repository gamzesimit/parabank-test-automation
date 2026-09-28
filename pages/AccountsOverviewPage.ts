import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class AccountsOverviewPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.gotoStable('overview.htm');
  }

  async accountIds(): Promise<string[]> {
    await expect(this.page.locator('#accountTable')).toBeVisible();
    return this.page.locator('#accountTable a').allInnerTexts();
  }

  /** Balance as a number, from the row of the given account. */
  async balanceOf(accountId: string): Promise<number> {
    const row = this.page.locator('#accountTable tbody tr', { hasText: accountId }).first();
    const cells = await row.locator('td').allInnerTexts();
    return parseMoney(cells[1]);
  }

  /** The figure the page prints on its own Total row. */
  async totalShown(): Promise<number> {
    const row = this.page.locator('#accountTable tr', { hasText: 'Total' }).last();
    const cells = (await row.locator('td').allInnerTexts()).map((t) => t.trim()).filter(Boolean);
    const money = cells.map(parseMoney).filter((n) => !Number.isNaN(n));
    if (money.length === 0)
      throw new Error(`no amount found on the total row: ${cells.join(' | ')}`);
    return money[money.length - 1];
  }
}

export function parseMoney(text: string): number {
  const cleaned = (text || '').replace(/[^0-9.\-]/g, '');
  return cleaned === '' ? NaN : Number(cleaned);
}
