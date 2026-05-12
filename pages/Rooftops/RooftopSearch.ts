import { Page, Locator, TestInfo } from '@playwright/test';
import { logAndValidate } from '../../utils/reportUtil';

export class RooftopSearch {

  page: Page;
  searchInput: Locator;
  noDataMessage: Locator;
  nextButton: Locator;
  testInfo: TestInfo;
  failures: string[] = [];

  constructor(page: Page, testInfo: TestInfo) {
    this.page = page;
    this.testInfo = testInfo;
    this.searchInput = page.getByPlaceholder('Search...');
    this.noDataMessage = page.locator('text=No data available');
    this.nextButton = page.getByRole('button', { name: 'Next' });
  }

  async performSearch(value: string) {
    if (!value) return;
    try {
      await this.searchInput.waitFor({ state: 'visible', timeout: 5000 });
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
        this.getRows().first().waitFor({ state: 'visible', timeout: 5000 }),
        this.noDataMessage.waitFor({ state: 'visible', timeout: 5000 })
      ]);
    } catch (error) {}
  }

  async resetSearch() {
    try {
      await this.searchInput.waitFor({ state: 'visible', timeout: 3000 });
      await this.searchInput.fill('');
      await this.searchInput.press('Enter');
      await this.page.waitForTimeout(1000);
    } catch (error) {}
  }

  private async getFirstRecordData(): Promise<{ id: string; name: string; description: string; created: string; status: string }> {
    try {
      await this.resetSearch();
      const rows = this.getRows();
      await rows.first().waitFor({ state: 'visible', timeout: 5000 });
      const firstRow = rows.first();
      const cells = firstRow.locator('td');
      
      const id = (await cells.nth(0).textContent())?.trim() || '';
      const name = (await cells.nth(1).textContent())?.trim() || '';
      const description = (await cells.nth(2).textContent())?.trim() || '';
      const created = (await cells.nth(3).textContent())?.trim() || '';
      const status = (await cells.nth(4).textContent())?.trim() || '';
      
      return { id, name, description, created, status };
    } catch (error) {
      console.log(`⚠️ Could not get first record data: ${error}`);
      return { id: '', name: '', description: '', created: '', status: '' };
    }
  }

  private async searchAndValidate(searchValue: string, columnName: string, expectedValue: string) {
    try {
      if (!searchValue || !expectedValue) {
        logAndValidate({
          step: `${columnName} Search`,
          expected: expectedValue || 'Value',
          actual: 'No data to search',
          isSummary: false
        }, this.testInfo);
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
      
      logAndValidate({
        step: `${columnName} Search`,
        expected: expectedValue,
        actual: found ? expectedValue : 'Not Found',
        isSummary: false
      }, this.testInfo);
      
      if (!found) {
        this.fail(`${columnName} Search: Expected "${expectedValue}" not found`);
      } else {
        console.log(`✅ ${columnName} Search: "${expectedValue}" - Found`);
      }
      
      await this.resetSearch();
    } catch (error) {
      logAndValidate({
        step: `${columnName} Search`,
        expected: expectedValue,
        actual: `Error: ${error}`,
        isSummary: false
      }, this.testInfo);
      this.fail(`${columnName} Search failed: ${error}`);
      await this.resetSearch();
    }
  }

  private async searchAndVerifyNoData(searchValue: string, testName: string) {
    try {
      await this.performSearch(searchValue);
      await this.waitForResults();
      
      const rows = this.getRows();
      const rowCount = await rows.count();
      const isNoData = await this.noDataMessage.isVisible().catch(() => false);
      const passed = rowCount === 0 || isNoData;
      
      logAndValidate({
        step: testName,
        expected: 'No Data Found',
        actual: passed ? 'No Data Found ✓' : `Found ${rowCount} row(s) ✗`,
        isSummary: false
      }, this.testInfo);
      
      if (!passed) {
        this.fail(`${testName}: Expected no data, but found ${rowCount} row(s)`);
      } else {
        console.log(`✅ ${testName}: "${searchValue}" - No data found`);
      }
      
      await this.resetSearch();
    } catch (error) {
      logAndValidate({
        step: testName,
        expected: 'No Data Found',
        actual: `Error: ${error}`,
        isSummary: false
      }, this.testInfo);
      this.fail(`${testName} failed: ${error}`);
      await this.resetSearch();
    }
  }

  async searchByID() {
    const { id } = await this.getFirstRecordData();
    if (!id) {
      logAndValidate({
        step: 'ID Search',
        expected: 'ID value',
        actual: 'No data found',
        isSummary: false
      }, this.testInfo);
      this.fail('ID Search: No data found');
      return;
    }
    await this.searchAndValidate(id, 'ID', id);
  }

  async searchByName() {
    const { name } = await this.getFirstRecordData();
    if (!name) {
      logAndValidate({
        step: 'Name Search',
        expected: 'Name value',
        actual: 'No data found',
        isSummary: false
      }, this.testInfo);
      this.fail('Name Search: No data found');
      return;
    }
    await this.searchAndValidate(name, 'Name', name);
  }

  async searchByDescription() {
    const { description } = await this.getFirstRecordData();
    if (!description) {
      logAndValidate({
        step: 'Description Search',
        expected: 'Description value',
        actual: 'No data found',
        isSummary: false
      }, this.testInfo);
      this.fail('Description Search: No data found');
      return;
    }
    await this.searchAndValidate(description, 'Description', description);
  }

  async searchByCreated() {
    const { created } = await this.getFirstRecordData();
    if (!created) {
      logAndValidate({
        step: 'Created Date Search',
        expected: 'Created Date value',
        actual: 'No data found',
        isSummary: false
      }, this.testInfo);
      this.fail('Created Date Search: No data found');
      return;
    }
    await this.searchAndValidate(created, 'Created Date', created);
  }

  async searchByStatus() {
    const { status } = await this.getFirstRecordData();
    if (!status) {
      logAndValidate({
        step: 'Status Search',
        expected: 'Status value',
        actual: 'No data found',
        isSummary: false
      }, this.testInfo);
      this.fail('Status Search: No data found');
      return;
    }
    await this.searchAndValidate(status, 'Status', status);
  }

  async invalidSearch() { 
    await this.searchAndVerifyNoData('random_invalid_value_123', 'Invalid Search'); 
  }
  
  async searchByNonExistentName() { 
    await this.searchAndVerifyNoData('NonExistentRooftopNameXYZ', 'Non-existent Name Search'); 
  }
  
  async searchByNonExistentID() { 
    await this.searchAndVerifyNoData('ID_999999', 'Non-existent ID Search'); 
  }

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