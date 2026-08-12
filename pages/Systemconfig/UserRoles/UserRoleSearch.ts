import { Page, Locator, TestInfo } from '@playwright/test';
import { Reporter } from '../../../pages/utils/NewReport';

export class UserRoleSearch {

  page: Page;
  searchInput: Locator;
  noDataMessage: Locator;
  testInfo: TestInfo;
  failures: string[] = [];

  constructor(page: Page, testInfo: TestInfo) {

    this.page = page;
    this.testInfo = testInfo;

    this.searchInput = page.getByPlaceholder('Search...');
    this.noDataMessage = page.locator('text=No data available');
  }

  async performSearch(value: string) {

    if (!value) return;

    try {

      await this.searchInput.waitFor({
        state: 'visible',
        timeout: 5000
      });

      await this.searchInput.fill('');
      await this.searchInput.fill(value);
      await this.searchInput.press('Enter');

      await this.page.waitForTimeout(1500);

    } catch (error) {

      this.fail(`Search failed: ${error}`);
    }
  }

  private getRows() {
    return this.page.locator('table tbody tr');
  }

  async waitForResults() {

    try {

      await Promise.race([

        this.getRows().first().waitFor({
          state: 'visible',
          timeout: 5000
        }),

        this.noDataMessage.waitFor({
          state: 'visible',
          timeout: 5000
        })

      ]);

    } catch {}
  }

  async resetSearch() {

    try {

      await this.searchInput.fill('');
      await this.searchInput.press('Enter');

      await this.page.waitForTimeout(1000);

    } catch {}
  }

  private async getFirstRecordData(): Promise<{
    id: string;
    roleName: string;
    created: string;
    updated: string;
    status: string;
  }> {

    try {

      await this.resetSearch();

      const rows = this.getRows();

      await rows.first().waitFor({
        state: 'visible',
        timeout: 5000
      });

      const cells = rows.first().locator('td');

      return {
        id: (await cells.nth(0).textContent())?.trim() || '',
        roleName: (await cells.nth(1).textContent())?.trim() || '',
        created: (await cells.nth(2).textContent())?.trim() || '',
        updated: (await cells.nth(3).textContent())?.trim() || '',
        status: (await cells.nth(4).textContent())?.trim() || ''
      };

    } catch (error) {

      console.log(`⚠️ Could not get first record data: ${error}`);

      return {
        id: '',
        roleName: '',
        created: '',
        updated: '',
        status: ''
      };
    }
  }

  // =========================================
  // SEARCH VALIDATION (NEW REPORT FIX)
  // =========================================
  private async searchAndValidate(
    searchValue: string,
    columnName: string,
    expectedValue: string
  ) {

    try {

      if (!searchValue || !expectedValue) {

        Reporter.validateData(
          true,
          false,
          `${columnName} Search`,
          this.testInfo
        );

        this.fail(`${columnName} Search: No data available`);
        return;
      }

      await this.performSearch(searchValue);
      await this.waitForResults();

      const rows = this.getRows();
      const rowCount = await rows.count();

      let found = false;

      for (let i = 0; i < rowCount; i++) {

        const rowText = await rows.nth(i).textContent() || '';

        if (rowText.includes(expectedValue)) {
          found = true;
          break;
        }
      }

      Reporter.validateData(
        true,
        found,
        `${columnName} Search`,
        this.testInfo
      );

      if (!found) {
        this.fail(`${columnName} Search: "${expectedValue}" not found`);
      } else {
        console.log(`✅ ${columnName} Search: "${expectedValue}" Found`);
      }

      await this.resetSearch();

    } catch (error) {

      Reporter.validateData(
        true,
        false,
        `${columnName} Search`,
        this.testInfo
      );

      this.fail(`${columnName} Search failed: ${error}`);
      await this.resetSearch();
    }
  }

  // =========================================
  // NO DATA VALIDATION (NEW REPORT FIX)
  // =========================================
  private async searchAndVerifyNoData(
    searchValue: string,
    testName: string
  ) {

    try {

      await this.performSearch(searchValue);
      await this.waitForResults();

      const rows = this.getRows();
      const rowCount = await rows.count();

      const isNoData =
        await this.noDataMessage.isVisible().catch(() => false);

      const passed = rowCount === 0 || isNoData;

      Reporter.validateData(
        true,
        passed,
        testName,
        this.testInfo
      );

      if (!passed) {
        this.fail(`${testName}: Expected no data, but found ${rowCount}`);
      } else {
        console.log(`✅ ${testName}: No data found`);
      }

      await this.resetSearch();

    } catch (error) {

      Reporter.validateData(
        true,
        false,
        testName,
        this.testInfo
      );

      this.fail(`${testName} failed: ${error}`);
      await this.resetSearch();
    }
  }

  // =========================================
  // PUBLIC METHODS (UNCHANGED)
  // =========================================
  async searchByID() {
    const { id } = await this.getFirstRecordData();
    await this.searchAndValidate(id, 'ID', id);
  }

  async searchByRoleName() {
    const { roleName } = await this.getFirstRecordData();
    await this.searchAndValidate(roleName, 'Role Name', roleName);
  }

  async searchByCreatedDate() {
    const { created } = await this.getFirstRecordData();
    await this.searchAndValidate(created, 'Created Date', created);
  }

  async searchByUpdatedDate() {
    const { updated } = await this.getFirstRecordData();
    await this.searchAndValidate(updated, 'Updated Date', updated);
  }

  async searchByStatus() {
    const { status } = await this.getFirstRecordData();
    await this.searchAndValidate(status, 'Status', status);
  }

  async invalidSearch() {
    await this.searchAndVerifyNoData(
      'random_invalid_role_123',
      'Invalid Search'
    );
  }

  async searchByNonExistentRole() {
    await this.searchAndVerifyNoData(
      'NonExistentRoleXYZ',
      'Non-existent Role Search'
    );
  }

  // =========================================
  // FAILURE TRACKING
  // =========================================
  private fail(message: string) {
    this.failures.push(message);
    console.log(`❌ ${message}`);
  }

  hasFailures(): boolean {
    return this.failures.length > 0;
  }

  getFailures(): string[] {
    return this.failures;
  }
}