import { Page, Locator, TestInfo } from '@playwright/test';
import { logAndValidate } from '../../utils/reportUtil';

export class AppTypeSearch {

  page: Page;
  searchInput: Locator;
  noDataMessage: Locator;
  testInfo: TestInfo;
  failures: string[] = [];

  constructor(page: Page, testInfo: TestInfo) {

    this.page = page;
    this.testInfo = testInfo;

    this.searchInput =
      page.getByPlaceholder('Search...');

    this.noDataMessage =
      page.locator('text=No data available');
  }

  // =========================================
  // ✅ SEARCH
  // =========================================
  async performSearch(value: string) {

    await this.searchInput.waitFor({
      state: 'visible'
    });

    await this.searchInput.fill('');

    await this.searchInput.fill(value);

    await this.searchInput.press('Enter');

    await this.page.waitForTimeout(1500);
  }

  // =========================================
  // ✅ RESET SEARCH
  // =========================================
  async resetSearch() {

    await this.searchInput.fill('');

    await this.searchInput.press('Enter');

    
  }

  // =========================================
  // ✅ GET ROWS
  // =========================================
  private getRows() {

    return this.page.locator(
      'table tbody tr'
    );
  }

  // =========================================
  // ✅ WAIT FOR RESULTS
  // =========================================
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
  // ✅ GET FIRST RECORD
  // =========================================
  async getFirstRecordData() {

    await this.resetSearch();

    const firstRow =
      this.getRows().first();

    await firstRow.waitFor({
      state: 'visible'
    });

    const cells =
      firstRow.locator('td');

    const id =
      (await cells.nth(0).textContent())?.trim() || '';

    const appTitle =
      (await cells.nth(1).textContent())?.trim() || '';

    const appType =
      (await cells.nth(2).textContent())?.trim() || '';

    return {
      id,
      appTitle,
      appType
    };
  }

  // =========================================
  // ✅ COMMON SEARCH VALIDATION
  // =========================================
  async searchAndValidate(
    searchValue: string,
    testName: string
  ) {

    await this.performSearch(searchValue);

    await this.waitForResults();

    const rows =
      this.getRows();

    const rowCount =
      await rows.count();

    let found = false;

    for (let i = 0; i < rowCount; i++) {

      const text =
        await rows.nth(i).textContent();

      if (text?.includes(searchValue)) {

        found = true;

        break;
      }
    }

    logAndValidate({
      step: testName,
      expected: searchValue,
      actual: found
        ? searchValue
        : 'Not Found',
      isSummary: false
    }, this.testInfo);

    if (found) {

      console.log(
        `✅ ${testName}: ${searchValue}`
      );

    } else {

      this.fail(
        `${testName} failed`
      );
    }

    await this.resetSearch();
  }

  // =========================================
  // ✅ VERIFY NO DATA
  // =========================================
  async verifyNoData(
    searchValue: string,
    testName: string
  ) {

    await this.performSearch(searchValue);

    await this.waitForResults();

    const rows =
      this.getRows();

    const rowCount =
      await rows.count();

    const noData =
      await this.noDataMessage
        .isVisible()
        .catch(() => false);

    const passed =
      rowCount === 0 || noData;

    logAndValidate({
      step: testName,
      expected: 'No Data',
      actual: passed
        ? 'No Data'
        : `${rowCount} row(s) found`,
      isSummary: false
    }, this.testInfo);

    if (passed) {

      console.log(
        `✅ ${testName}: No data found`
      );

    } else {

      this.fail(
        `${testName} failed`
      );
    }

    await this.resetSearch();
  }

  // =========================================
  // ✅ SEARCH BY ID
  // =========================================
  async searchByID() {

    const { id } =
      await this.getFirstRecordData();

    await this.searchAndValidate(
      id,
      'ID Search'
    );
  }

  // =========================================
  // ✅ SEARCH BY APP TITLE
  // =========================================
  async searchByAppTitle() {

    const { appTitle } =
      await this.getFirstRecordData();

    await this.searchAndValidate(
      appTitle,
      'App Title Search'
    );
  }

  // =========================================
  // ✅ SEARCH BY APP TYPE
  // =========================================
  async searchByAppType() {

    const { appType } =
      await this.getFirstRecordData();

    await this.searchAndValidate(
      appType,
      'App Type Search'
    );
  }

  // =========================================
  // ✅ NEGATIVE TESTS
  // =========================================
  async invalidSearch() {

    await this.verifyNoData(
      'invalid_random_value_123',
      'Invalid Search'
    );
  }

  async nonExistentAppTitle() {

    await this.verifyNoData(
      'NoAppTitleXYZ',
      'Non-existent App Title Search'
    );
  }

  async nonExistentID() {

    await this.verifyNoData(
      '999999999',
      'Non-existent ID Search'
    );
  }

  // =========================================
  // ✅ FAIL METHOD
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