import { Page, Locator, TestInfo } from '@playwright/test';
import { Reporter } from '../../../utils/NewReport';


export class MakeSearch {
  page: Page;
  searchInput: Locator;
  noDataMessage: Locator;
  nextButton: Locator;
  previousButton: Locator;
  private readonly tableRowsSelector = 'table tbody tr';
  private readonly nextButtonSelector = 'button:has-text("Next")';
  private readonly previousButtonSelector = 'button:has-text("Previous")';

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.locator('input.table-search__input');
    this.noDataMessage = page.locator('td.table-body__cell--empty p');
    this.nextButton = page.locator(this.nextButtonSelector);
    this.previousButton = page.locator(this.previousButtonSelector);
  }

  async performSearch(value: string) {
    await this.searchInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.searchInput.fill('');
    await this.searchInput.fill(value);
    await this.searchInput.press('Enter');
    await this.page.waitForTimeout(2000);
  }

  async resetSearch() {
    await this.searchInput.fill('');
    await this.searchInput.press('Enter');
    await this.page.waitForTimeout(1500);
  }

  async goToFirstPage() {
    try {
      while (await this.previousButton.isVisible().catch(() => false)) {
        const disabled = await this.previousButton.isDisabled().catch(() => true);
        if (disabled) break;
        await this.previousButton.click();
        await this.page.waitForTimeout(1000);
      }
    } catch {
      // Ignore pagination issue
    }
  }

  private getRows() {
    return this.page.locator(this.tableRowsSelector);
  }

  private async searchAndFindRecord(searchValue: string, columnIndex: number): Promise<boolean> {
    try {
      await this.performSearch(searchValue);
      let currentPage = 1;
      const maxPages = 50;
      while (currentPage <= maxPages) {
        const rows = this.getRows();
        const rowCount = await rows.count();
        const isNoData = await this.noDataMessage.isVisible().catch(() => false);
        if (rowCount === 0 || isNoData) {
          console.log(`❌ No results found for ${searchValue}`);
          return false;
        }
        for (let i = 0; i < rowCount; i++) {
          const cell = rows.nth(i).locator('td').nth(columnIndex);
          const text = (await cell.textContent())?.trim() || '';
          if (text.toLowerCase().includes(searchValue.toLowerCase())) {
            console.log(`✅ Record found : ${searchValue}`);
            return true;
          }
        }
        const isNextVisible = await this.nextButton.isVisible().catch(() => false);
        const isNextDisabled = await this.nextButton.isDisabled().catch(() => true);
        if (!isNextVisible || isNextDisabled) break;
        await this.nextButton.click();
        await this.page.waitForTimeout(1500);
        currentPage++;
      }
      return false;
    } catch (error: any) {
      console.log(`⚠️ Search failed : ${error.message}`);
      return false;
    }
  }

  private async searchAndValidate(columnIndex: number, fieldName: string, testInfo: TestInfo): Promise<boolean> {
    try {
      await this.goToFirstPage();
      const rows = this.getRows();
      const count = await rows.count();
      if (count === 0) {
        Reporter.validateData('Search Results Found', 'No Data Available', `Search by ${fieldName}`, testInfo);
        return false;
      }
      const value = (await rows.first().locator('td').nth(columnIndex).textContent())?.trim();
      if (!value) {
        Reporter.validateData('Search Results Found', 'No Value Found', `Search by ${fieldName}`, testInfo);
        return false;
      }
      console.log(`🔍 Searching ${fieldName} : ${value}`);
      const found = await this.searchAndFindRecord(value, columnIndex);
      const actual = found ? 'Search Results Found' : 'No Data Found';
      Reporter.validateData('Search Results Found', actual, `Search by ${fieldName}`, testInfo);
      await this.resetSearch();
      return found;
    } catch (error: any) {
      Reporter.validateData('Search Results Found', `Error : ${error.message}`, `Search by ${fieldName}`, testInfo);
      return false;
    }
  }

  async searchByID(testInfo: TestInfo): Promise<boolean> {
    return await this.searchAndValidate(0, 'ID', testInfo);
  }

  async searchByMakeName(testInfo: TestInfo): Promise<boolean> {
    return await this.searchAndValidate(1, 'Make', testInfo);
  }

  async searchByCreatedDate(testInfo: TestInfo): Promise<boolean> {
    return await this.searchAndValidate(2, 'Created', testInfo);
  }

  async searchByUpdatedDate(testInfo: TestInfo): Promise<boolean> {
    return await this.searchAndValidate(3, 'Updated', testInfo);
  }

  async searchByStatus(testInfo: TestInfo): Promise<boolean> {
    try {
      const statuses = ['Active', 'Inactive'];
      let statusFound = false;
      for (const status of statuses) {
        console.log(`🔍 Searching Status : ${status}`);
        const found = await this.searchAndFindRecord(status, 4);
        const actual = found ? 'Search Results Found' : 'No Data Found';
        Reporter.validateData('Search Results Found', actual, `Search Status : ${status}`, testInfo);
        await this.resetSearch();
        if (found) {
          statusFound = true;
        }
      }
      return statusFound;
    } catch (error: any) {
      Reporter.validateData('Search Results Found', `Error : ${error.message}`, 'Search by Status', testInfo);
      return false;
    }
  }

  async invalidNameSearch(testInfo: TestInfo): Promise<boolean> {
    try {
      const invalidData = 'invalid_make_123456';
      await this.performSearch(invalidData);
      const rows = await this.getRows().count();
      const isNoData = await this.noDataMessage.isVisible().catch(() => false);
      const actual = (rows === 0 || isNoData) ? 'No Data Found' : 'Data Found';
      Reporter.validateData('No Data Found', actual, 'Invalid Data Search', testInfo);
      await this.resetSearch();
      return actual === 'No Data Found';
    } catch (error: any) {
      Reporter.validateData('No Data Found', `Error : ${error.message}`, 'Invalid Data Search', testInfo);
      return false;
    }
  }
}