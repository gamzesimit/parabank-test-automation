import { Page, expect } from '@playwright/test';

/** Text the application shows when a request fails on the server. */
export const INTERNAL_ERROR = /An internal error has occurred/i;

export class BasePage {
  constructor(protected readonly page: Page) {}

  /**
   * Navigate to a page and retry while the server answers with its internal
   * error page. The environment returns that page intermittently, which is
   * recorded in docs/defect-reports.md as PB-001.
   */
  async gotoStable(path: string, attempts = 5) {
    for (let i = 0; i < attempts; i++) {
      await this.page.goto(path, { waitUntil: 'domcontentloaded' });
      const body = await this.page
        .locator('#rightPanel')
        .innerText()
        .catch(() => '');
      if (!INTERNAL_ERROR.test(body)) return;
    }
    throw new Error(`${path} returned the internal error page ${attempts} times in a row`);
  }

  async openMenu(linkText: string) {
    await this.page.locator('#leftPanel a', { hasText: linkText }).first().click();
  }

  async rightPanelText(): Promise<string> {
    return (await this.page.locator('#rightPanel').innerText()).trim();
  }

  async expectNoInternalError() {
    await expect(this.page.locator('#rightPanel')).not.toContainText(INTERNAL_ERROR);
  }
}
