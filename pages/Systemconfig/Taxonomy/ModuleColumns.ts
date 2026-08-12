import { Page, Locator, expect } from '@playwright/test';

export class ModuleColumns {

  page: Page;
  searchBox: Locator;
  table: Locator;
  headers: Locator;

  constructor(page: Page) {

    this.page = page;

    this.searchBox =
      page.getByPlaceholder('Search...').first();

    this.table =
      page.locator('table');

    this.headers =
      page.locator('table thead th');
  }

  // =========================================
  // OPEN APP (ADMIN)
  // =========================================

  async openApp(appName: string) {

    await this.searchBox.waitFor({
      state: 'visible'
    });

    await this.searchBox.clear();

    await this.searchBox.fill(appName);

    await this.page.waitForTimeout(2000);

    const appLink =
      this.page.getByRole('link', {
        name: appName,
        exact: true
      });

    await appLink.waitFor({
      state: 'visible'
    });

    await appLink.click();

    await this.page.waitForLoadState(
      'networkidle'
    );
await expect(
    this.page.locator('table thead th').filter({ hasText: 'Module Name' })
  ).toBeVisible({ timeout: 15000 });
    console.log(`✅ Opened App : ${appName}`);
  }

  // =========================================
  // VERIFY MODULE COLUMNS
  // =========================================

 // =========================================
// VERIFY MODULE COLUMNS
// =========================================
async verifyModuleColumns() {

  await expect(
    this.page.locator('table thead th').filter({ hasText: 'Module Name' })
  ).toBeVisible({ timeout: 15000 });

  const expectedColumns = [
    'ID',
    'App',
    'Module Name',
    'Module Type',
    'Created',
    'Updated',
    'Status',
    'Actions'
  ];

  const actualHeaders = (
    await this.headers.allTextContents()
  ).map(header =>
    header.replace(/\s+/g, ' ').trim()
  );

  return {
    expectedColumns,
    actualHeaders
  };
}
}