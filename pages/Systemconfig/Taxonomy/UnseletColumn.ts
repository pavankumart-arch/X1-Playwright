import { Page, Locator, expect } from '@playwright/test';

export class AppTypeColumns {
  readonly page: Page;
  readonly columnsButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.columnsButton = page.locator('button:has-text("Columns")');

    console.log('✅ AppTypeColumns Loaded');
  }

  // =========================================
  // ✅ HIDE COLUMN (FIXED - NAVGROUP STYLE)
  // =========================================
  async hideColumn(columnName: string) {
    await expect(this.columnsButton).toBeVisible({ timeout: 10000 });
    await this.columnsButton.click();

    console.log(`👉 Trying to unselect: ${columnName}`);

    // 🔥 Use ROLE-based locator (same as working NavGroup)
    const checkbox = this.page.getByRole('checkbox', {
      name: new RegExp(columnName, 'i')
    });

    await expect(checkbox).toBeVisible({ timeout: 10000 });

    const before = await checkbox.isChecked();
    console.log(`Before Click Checked: ${before}`);

    // Click checkbox (real UI interaction)
    await checkbox.click({ force: true });

    await this.page.waitForTimeout(1000);

    const after = await checkbox.isChecked();
    console.log(`After Click Checked: ${after}`);

    if (after === before) {
      console.warn(
        `⚠️ Checkbox state did not change for ${columnName}`
      );
    }

    await this.page.keyboard.press('Escape');
  }

  // =========================================
  // ✅ SHOW COLUMN
  // =========================================
  async showColumn(columnName: string) {
    await expect(this.columnsButton).toBeVisible({ timeout: 10000 });
    await this.columnsButton.click();

    console.log(`👉 Trying to select: ${columnName}`);

    const checkbox = this.page.getByRole('checkbox', {
      name: new RegExp(columnName, 'i')
    });

    await expect(checkbox).toBeVisible({ timeout: 10000 });

    const checked = await checkbox.isChecked();

    if (!checked) {
      await checkbox.click({ force: true });
    }

    console.log(`✅ Column Selected: ${columnName}`);

    await this.page.keyboard.press('Escape');
  }

  // =========================================
  // ✅ VERIFY COLUMN HIDDEN (FIXED)
  // =========================================
  async verifyColumnHidden(columnName: string) {
    const column = this.page.locator(
      `table thead th:has-text("${columnName}")`
    );

    await this.page.waitForTimeout(1000);

    const count = await column.count();
    console.log(`🔎 Column count: ${count}`);

    if (count > 0) {
      await expect(column.first()).not.toBeVisible();
    } else {
      await expect(column).toHaveCount(0);
    }

    console.log(`✅ Column Hidden: ${columnName}`);
  }

  // =========================================
  // ✅ VERIFY COLUMN VISIBLE
  // =========================================
  async verifyColumnVisible(columnName: string) {
    const column = this.page.locator(
      `table thead th:has-text("${columnName}")`
    );

    await expect(column.first()).toBeVisible({ timeout: 10000 });

    console.log(`✅ Column Visible: ${columnName}`);
  }
}