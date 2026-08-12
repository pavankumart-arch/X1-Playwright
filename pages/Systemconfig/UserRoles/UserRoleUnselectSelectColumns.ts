import { Page, Locator, expect } from '@playwright/test';

export class UserRoleColumns {

  readonly page: Page;

  // Column Button
  readonly columnsButton: Locator;

  // Table Headers
  readonly tableHeaders: Locator;

  constructor(page: Page) {

    this.page = page;

    this.columnsButton = page.locator('button:has-text("Columns")');

    this.tableHeaders = page.locator('table thead th');
  }

  // =========================================
  // ✅ HIDE COLUMN
  // =========================================
  async hideColumn(columnName: string) {

    // Open Columns Dropdown
    await this.columnsButton.click();

    await this.page.waitForTimeout(1000);

    // Locate row by aria-label
    const row = this.page.locator(
      `[aria-label="${columnName}"]`
    );

    // Click checkbox area
    const checkboxArea = row.locator('div').nth(1);

    await checkboxArea.click({ force: true });

    console.log(`✅ Unchecked Column: ${columnName}`);

    // Wait for UI update
    await this.page.waitForTimeout(1000);

    // Close Dropdown
    await this.page.keyboard.press('Escape');
  }

  // =========================================
  // ✅ VERIFY COLUMN HIDDEN
  // =========================================
  async verifyColumnHidden(columnName: string) {

    const hiddenColumn = this.page.locator(
      `table thead th:has-text("${columnName}")`
    );

    await expect(hiddenColumn).toHaveCount(0);

    console.log(`✅ Column Hidden Successfully: ${columnName}`);
  }

  // =========================================
  // ✅ VERIFY COLUMN VISIBLE
  // =========================================
  async verifyColumnVisible(columnName: string) {

    const visibleColumn = this.page.locator(
      `table thead th:has-text("${columnName}")`
    );

    await expect(visibleColumn).toBeVisible();

    console.log(`✅ Column Visible: ${columnName}`);
  }
}