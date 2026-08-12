import { Page, Locator, expect } from '@playwright/test';

export class AppTypeColumns {

  readonly page: Page;
  readonly columnsButton: Locator;

  constructor(page: Page) {

    this.page = page;

    this.columnsButton = page.getByRole('button', {
      name: /columns/i
    });
  }

  // =========================================
  // OPEN COLUMNS POPUP
  // =========================================

  async openColumnsDropdown() {

    const idOption =
      this.page.getByText('ID', {
        exact: true
      }).last();

    const isAlreadyOpen =
      await idOption.isVisible()
        .catch(() => false);

    if (!isAlreadyOpen) {

      await this.columnsButton.click();

      await expect(idOption).toBeVisible({
        timeout: 10000
      });
    }

    console.log('✅ Columns Dropdown Opened');
  }

  // =========================================
  // CLOSE COLUMNS POPUP
  // =========================================

  async closeColumnsDropdown() {

    await this.page.mouse.click(20, 20);

    await this.page.waitForTimeout(500);

    console.log('✅ Dropdown Closed');
  }

  // =========================================
  // TOGGLE COLUMN
  // =========================================

  async toggleColumn(columnName: string) {

    await this.openColumnsDropdown();

    const label =
      this.page.getByText(
        columnName,
        {
          exact: true
        }
      ).last();

    await expect(label).toBeVisible({
      timeout: 10000
    });

    console.log(
      `Found Column Option: ${columnName}`
    );

    const row =
      label.locator(
        'xpath=ancestor::*[self::div or self::li][1]'
      );

    const checkbox =
      row.locator(
        'input[type="checkbox"], button[role="checkbox"]'
      ).first();

    const checkboxExists =
      await checkbox.count();

    if (checkboxExists > 0) {

      await checkbox.click({
        force: true
      });

    } else {

      await row.click({
        force: true
      });
    }

    console.log(
      `✅ Toggled Column: ${columnName}`
    );

    await this.page.waitForLoadState(
      'networkidle'
    );

    await this.page.waitForTimeout(1000);

    await this.closeColumnsDropdown();
  }

  // =========================================
  // HIDE COLUMN
  // =========================================

  async hideColumn(columnName: string) {

    await this.toggleColumn(columnName);

    console.log(
      `✅ Column Hidden: ${columnName}`
    );
  }

  // =========================================
  // SHOW COLUMN
  // =========================================

  async showColumn(columnName: string) {

    await this.toggleColumn(columnName);

    console.log(
      `✅ Column Visible Again: ${columnName}`
    );
  }

  // =========================================
  // VERIFY COLUMN VISIBLE
  // =========================================

  async verifyColumnVisible(columnName: string) {

    const column =
      this.page
        .locator('table thead th')
        .filter({
          hasText: columnName
        })
        .first();

    await expect(column).toBeVisible({
      timeout: 10000
    });

    console.log(
      `✅ Verified Visible: ${columnName}`
    );
  }

  // =========================================
  // VERIFY COLUMN HIDDEN
  // =========================================

  async verifyColumnHidden(columnName: string) {

    await this.page.waitForTimeout(2000);

    const column =
      this.page
        .locator('table thead th')
        .filter({
          hasText: columnName
        })
        .first();

    const visible =
      await column.isVisible()
        .catch(() => false);

    expect(
      visible,
      `${columnName} column should be hidden`
    ).toBeFalsy();

    console.log(
      `✅ Verified Hidden: ${columnName}`
    );
  }

  // =========================================
  // VERIFY ALL COLUMN COMBINATIONS
  // =========================================

  async verifyAllColumnCombinations() {

    const columns = [
      'ID',
      'App Title',
      'App Type',
      'Created',
      'Updated',
      'Status'
    ];

    for (const columnName of columns) {

      console.log('\n==============================');
      console.log(
        `🔍 Testing Column: ${columnName}`
      );
      console.log('==============================');

      await this.verifyColumnVisible(
        columnName
      );

      await this.hideColumn(
        columnName
      );

      await this.verifyColumnHidden(
        columnName
      );

      await this.showColumn(
        columnName
      );

      await this.verifyColumnVisible(
        columnName
      );
    }
  }
}