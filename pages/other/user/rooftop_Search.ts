import { Page, Locator, TestInfo } from '@playwright/test';
import { Reporter } from '../../utils/NewReport';

export class RooftopUserSearch {
  page: Page;
  searchInput: Locator;
  noDataMessage: Locator;
  nextButton: Locator;
  previousButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.locator('input.table-search__input');
    this.noDataMessage = page.locator('td.table-body__cell--empty p');
    this.nextButton = page.locator('button:has-text("Next")');
    this.previousButton = page.locator('button:has-text("Previous")');
  }

  // =====================================================
  // SEARCH
  // =====================================================

  async performSearch(value: string) {
    await this.searchInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.searchInput.fill('');
    await this.searchInput.fill(value);
    await this.searchInput.press('Enter');
    await this.page.waitForTimeout(2000);
  }

  // =====================================================
  // GO TO FIRST PAGE
  // =====================================================

  async goToFirstPage() {
    try {
      while (await this.previousButton.isVisible().catch(() => false)) {
        const disabled = await this.previousButton.isDisabled().catch(() => true);
        if (disabled) break;
        await this.previousButton.click();
        await this.page.waitForTimeout(1500);
      }
    } catch {
      // Ignore pagination errors
    }
  }

  // =====================================================
  // RESET SEARCH
  // =====================================================

  async resetSearch() {
    try {
      await this.goToFirstPage();
      await this.searchInput.fill('');
      await this.searchInput.press('Enter');
      await this.page.waitForTimeout(2000);
    } catch {
      // Ignore reset errors
    }
  }

  // =====================================================
  // GET TABLE ROWS
  // =====================================================

  private getRows() {
    return this.page.locator('table tbody tr');
  }

  // =====================================================
  // VALIDATE SEARCH RESULTS
  // =====================================================

  private async validateColumn(index: number, expected: string, testInfo: TestInfo, stepName: string) {
    let found = false;
    try {
      await this.goToFirstPage();
      await this.performSearch(expected);
      let pageCount = 0;
      while (pageCount < 100) {
        const currentSearch = await this.searchInput.inputValue();
        if (currentSearch.trim().toLowerCase() !== expected.trim().toLowerCase()) {
          await this.performSearch(expected);
        }
        const rows = this.getRows();
        const count = await rows.count();
        for (let i = 0; i < count; i++) {
          const text = (await rows.nth(i).locator('td').nth(index).textContent())?.trim() || '';
          if (text.toLowerCase().includes(expected.toLowerCase())) {
            found = true;
            break;
          }
        }
        if (found) break;
        const disabled = await this.nextButton.isDisabled().catch(() => true);
        if (disabled) break;
        await this.nextButton.click();
        await this.page.waitForTimeout(2000);
        pageCount++;
      }
      Reporter.validateData('Search Results Found', found ? 'Search Results Found' : 'No Data Found', stepName, testInfo);
    } catch (error: any) {
      console.log(`\n================================\nVALIDATION FAILED\n\nSTEP : ${stepName}\n\nERROR : ${error.message}\n================================\n`);
      Reporter.validateData('Search Results Found', 'Validation Failed', `${stepName} - Exception`, testInfo);
    } finally {
      await this.resetSearch();
    }
  }

  // =====================================================
  // COMMON SEARCH METHOD
  // =====================================================

  async searchAndValidate(columnIndex: number, stepName: string, testInfo: TestInfo) {
    try {
      await this.goToFirstPage();
      const rows = this.getRows();
      const count = await rows.count();
      if (!count) {
        console.log(`\n================================\nNO TABLE DATA\n\nSTEP : ${stepName}\n================================\n`);
        Reporter.validateData('Table Data Exists', false, `${stepName} - Table Data Check`, testInfo);
        return;
      }
      const value = (await rows.first().locator('td').nth(columnIndex).textContent())?.trim();
      if (!value) {
        console.log(`\n================================\nNO DATA FOUND\n\nSTEP : ${stepName}\n================================\n`);
        Reporter.validateData('Value Exists in Column', false, `${stepName} - Column Value Check`, testInfo);
        return;
      }
      await this.validateColumn(columnIndex, value, testInfo, stepName);
    } catch (error: any) {
      console.log(`\n================================\nFAILED : ${stepName}\n\nERROR : ${error.message}\n================================\n`);
      Reporter.validateData(`${stepName} Completed`, false, `${stepName} - Execution Error`, testInfo);
    }
  }

  // =====================================================
  // SEARCH BY ID
  // =====================================================

  async searchByID(testInfo: TestInfo) {
    await this.searchAndValidate(0, 'Search by ID', testInfo);
  }

  // =====================================================
  // SEARCH BY USERNAME
  // =====================================================

  async searchByUsername(testInfo: TestInfo) {
    await this.searchAndValidate(1, 'Search by Username', testInfo);
  }

  // =====================================================
  // SEARCH BY EMAIL
  // =====================================================

  async searchByEmail(testInfo: TestInfo) {
    await this.searchAndValidate(2, 'Search by Email', testInfo);
  }

  // =====================================================
  // SEARCH BY RESELLER
  // =====================================================

  async searchByReseller(testInfo: TestInfo) {
    await this.searchAndValidate(3, 'Search by Reseller', testInfo);
  }

  // =====================================================
  // SEARCH BY USER TYPE
  // =====================================================

  async searchByUserType(testInfo: TestInfo) {
    await this.searchAndValidate(4, 'Search by User Type', testInfo);
  }

  // =====================================================
  // SEARCH BY ACTIVE STATUS
  // =====================================================

  async searchByStatus(testInfo: TestInfo) {
    try {
      const value = 'Active';
      await this.performSearch(value);
      await this.page.waitForTimeout(2000);
      const tableText = (await this.page.locator('table').textContent())?.toLowerCase() || '';
      const found = tableText.includes('active');
      Reporter.validateData('Search Results Found', found ? 'Search Results Found' : 'No Data Found', 'Search by Active Status', testInfo);
    } catch (error: any) {
      console.log(`\n================================\nFAILED : Search by Active Status\n\nERROR : ${error.message}\n================================\n`);
      Reporter.validateData('Search by Active Status Completed', false, 'Search by Active Status - Error', testInfo);
    } finally {
      await this.resetSearch();
    }
  }

  // =====================================================
  // SEARCH BY INACTIVE STATUS
  // =====================================================

  async searchByInactiveStatus(testInfo: TestInfo) {
    try {
      const value = 'Inactive';
      await this.performSearch(value);
      await this.page.waitForTimeout(2000);
      const tableText = (await this.page.locator('table').textContent())?.toLowerCase() || '';
      const found = tableText.includes('inactive');
      Reporter.validateData('Search Results Found', found ? 'Search Results Found' : 'No Inactive Records Found', 'Search by Inactive Status', testInfo);
    } catch (error: any) {
      console.log(`\n================================\nFAILED : Search by Inactive Status\n\nERROR : ${error.message}\n================================\n`);
      Reporter.validateData('Search by Inactive Status Completed', false, 'Search by Inactive Status - Error', testInfo);
    } finally {
      await this.resetSearch();
    }
  }

  // =====================================================
  // INVALID SEARCH
  // =====================================================

  async invalidSearch(testInfo: TestInfo) {
    try {
      const value = 'invalid_user_123';
      await this.performSearch(value);
      await this.page.waitForTimeout(2000);
      const rows = await this.getRows().count();
      const isNoData = await this.noDataMessage.isVisible().catch(() => false);
      const actual = (rows === 0 || isNoData) ? 'No Data Found' : 'Data Found';
      Reporter.validateData('No Data Found', actual, 'Invalid Search', testInfo);
    } catch (error: any) {
      console.log(`\n================================\nINVALID SEARCH FAILED\n\nERROR : ${error.message}\n================================\n`);
      Reporter.validateData('Invalid Search Completed', false, 'Invalid Search - Error', testInfo);
    } finally {
      await this.resetSearch();
    }
  }
}