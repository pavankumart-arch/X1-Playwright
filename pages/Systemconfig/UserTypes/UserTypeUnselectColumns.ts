import { Page, Locator, expect } from '@playwright/test';

export class UserTypeColumns {

  readonly page: Page;

  readonly columnsButton: Locator;
  readonly tableHeaders: Locator;

  constructor(page: Page) {

    this.page = page;

    this.columnsButton = page.locator('button:has-text("Columns")');

    this.tableHeaders = page.locator('table thead th');
  }

  // =========================================
  // ✅ HIDE COLUMN (UNSELECT)
  // =========================================
  async hideColumn(columnName: string) {

  // Open Columns dropdown
  await this.columnsButton.click();

  await this.page.waitForTimeout(1000);

  // ✅ CORRECT LOCATOR (same pattern as AppType)
  const row = this.page.locator(
    `[aria-label="${columnName}"]`
  );

  await row.waitFor({ state: 'visible', timeout: 10000 });

  const checkbox = row.locator('div').nth(1);

  await checkbox.click({ force: true });

  console.log(`✅ Column Unselected: ${columnName}`);

  await this.page.waitForTimeout(1000);

  await this.page.keyboard.press('Escape');
}
  // =========================================
  // ✅ VERIFY COLUMN HIDDEN
  // =========================================
  async verifyColumnHidden(columnName: string) {

    const column = this.page.locator(
      `table thead th:has-text("${columnName}")`
    );

    await expect(column).toHaveCount(0);

    console.log(`✅ Column Hidden: ${columnName}`);
  }

  // =========================================
  // ✅ VERIFY COLUMN VISIBLE
  // =========================================
  async verifyColumnVisible(columnName: string) {

    const column = this.page.locator(
      `table thead th:has-text("${columnName}")`
    );

    await expect(column).toBeVisible();

    console.log(`✅ Column Visible: ${columnName}`);
  }
}