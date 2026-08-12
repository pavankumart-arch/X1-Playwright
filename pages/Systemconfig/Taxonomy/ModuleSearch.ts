import { Page, Locator, TestInfo, expect } from '@playwright/test';
import { logAndValidate } from '../../utils/reportUtil';

export class ModuleSearch {

  page: Page;
  testInfo: TestInfo;

  appSearchInput: Locator;
  moduleSearchInput: Locator;
  noDataMessage: Locator;

  failures: string[] = [];

  constructor(page: Page, testInfo: TestInfo) {

    this.page = page;
    this.testInfo = testInfo;

    this.appSearchInput =
      page.getByPlaceholder('Search...').first();

    this.moduleSearchInput =
      page.getByPlaceholder('Search...').first();

    this.noDataMessage =
      page.locator('text=No data available');
  }

  // =========================================
  // OPEN ADMIN MODULE LIST
  // =========================================

  async openAdminModules() {

  await this.appSearchInput.fill('');
  await this.appSearchInput.fill('Admin');
  await this.appSearchInput.press('Enter');

  // Wait until only one row is displayed
  await expect(this.page.locator('table tbody tr')).toHaveCount(1);

  // Locate the Admin hyperlink
  const adminLink = this.page.locator(
    'table tbody tr td:nth-child(2) a',
    { hasText: 'Admin' }
  );

  await expect(adminLink).toBeVisible();

  // Scroll into view if needed
  await adminLink.scrollIntoViewIfNeeded();

  // Click the hyperlink
  await adminLink.click();

  // Wait for navigation/load
  await this.page.waitForLoadState('networkidle');

  // Wait until the Modules page is displayed
  await expect(
    this.page.locator('th', { hasText: 'Module Type' })
  ).toBeVisible({ timeout: 10000 });

  // Wait until at least one module row is loaded
  await expect(
    this.page.locator('table tbody tr').first()
  ).toBeVisible({ timeout: 10000 });

  // Small delay if data is populated asynchronously
  await this.page.waitForTimeout(1000);
}
  // =========================================
  // SEARCH
  // =========================================

  async performSearch(value: string) {

    await this.moduleSearchInput.fill('');

    await this.moduleSearchInput.fill(value);

    await this.moduleSearchInput.press('Enter');

    await this.page.waitForTimeout(1000);
  }

  async resetSearch() {

    await this.moduleSearchInput.fill('');

    await this.moduleSearchInput.press('Enter');

    await this.page.waitForTimeout(500);
  }

  private getRows() {

    return this.page.locator('table tbody tr');
  }

  async waitForResults() {

    await Promise.race([

      this.getRows().first().waitFor({
        state: 'visible',
        timeout: 5000
      }),

      this.noDataMessage.waitFor({
        state: 'visible',
        timeout: 5000
      })

    ]).catch(() => {});
  }

  // =========================================
  // FIRST RECORD
  // =========================================

  async getFirstRecordData() {

  await this.resetSearch();

  const row = this.getRows().first();

  await row.waitFor();

  const cells = row.locator('td');

  const count = await cells.count();

  for (let i = 0; i < count; i++) {
    console.log(
      `Column ${i}:`,
      (await cells.nth(i).textContent())?.trim()
    );
  }

  return {

    id: (await cells.nth(0).textContent())?.trim() || '',

    app: (await cells.nth(1).textContent())?.trim() || '',

    moduleName: (await cells.nth(2).textContent())?.trim() || '',

    moduleType: (await cells.nth(3).textContent())?.trim() || ''

  };
}
  // =========================================
  // COMMON SEARCH
  // =========================================

  async searchAndValidate(value: string, testName: string) {

    await this.performSearch(value);

    await this.waitForResults();

    const rows = this.getRows();

    let found = false;

    const count = await rows.count();

    for (let i = 0; i < count; i++) {

      const text = await rows.nth(i).textContent();

      if (text?.includes(value)) {

        found = true;

        break;
      }
    }

    logAndValidate({

      step: testName,

      expected: value,

      actual: found ? value : 'Not Found',

      isSummary: false

    }, this.testInfo);

    if (!found) {

      this.fail(`${testName} failed`);
    }

    await this.resetSearch();
  }

  // =========================================
  // NO DATA
  // =========================================

  async verifyNoData(value: string, testName: string) {

    await this.performSearch(value);

    await this.waitForResults();

    const noData = await this.noDataMessage
      .isVisible()
      .catch(() => false);

    logAndValidate({

      step: testName,

      expected: 'No Data',

      actual: noData ? 'No Data' : 'Data Found',

      isSummary: false

    }, this.testInfo);

    if (!noData) {

      this.fail(`${testName} failed`);
    }

    await this.resetSearch();
  }

  // =========================================
  // POSITIVE TESTS
  // =========================================

  async searchByID() {

    const { id } = await this.getFirstRecordData();

    await this.searchAndValidate(id, 'ID Search');
  }

  async searchByModuleName() {

    const { moduleName } = await this.getFirstRecordData();

    await this.searchAndValidate(moduleName, 'Module Name Search');
  }

  async searchByModuleType() {

    const { moduleType } = await this.getFirstRecordData();

    await this.searchAndValidate(moduleType, 'Module Type Search');
  }

  // =========================================
  // NEGATIVE TESTS
  // =========================================

  async invalidSearch() {

    await this.verifyNoData(
      'invalid_module_12345',
      'Invalid Search'
    );
  }

  async nonExistentModuleName() {

    await this.verifyNoData(
      'NoModuleXYZ',
      'Non-existent Module Search'
    );
  }

  async nonExistentID() {

    await this.verifyNoData(
      '999999',
      'Non-existent ID Search'
    );
  }

  // =========================================

  fail(message: string) {

    this.failures.push(message);

    console.log(`❌ ${message}`);
  }

  hasFailures() {

    return this.failures.length > 0;
  }

  getFailures() {

    return this.failures;
  }

}