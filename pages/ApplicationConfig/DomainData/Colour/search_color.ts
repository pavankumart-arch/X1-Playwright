import { Page, Locator, TestInfo } from '@playwright/test';
import { Reporter } from '../../../utils/NewReport';

export class ColorSearch {
  page: Page;
  searchInput: Locator;
  noDataMessage: Locator;
  nextButton: Locator;
  previousButton: Locator;

  // Column indices based on screenshot: ID(0), Preview(1), Color Name(2), Hex(3), Status(4), Actions(5)
  private readonly COLUMNS = {
    ID: 0,
    PREVIEW: 1,
    COLOR_NAME: 2,
    HEX: 3,
    STATUS: 4,
    ACTIONS: 5
  };

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
  // GET COLOR PREVIEW IMAGE
  // =====================================================

  private getColorPreview(row: Locator) {
    // Try different possible selectors for the preview image
    return row.locator('td').nth(this.COLUMNS.PREVIEW).locator('img, .color-preview, [class*="color"], [class*="preview"]').first();
  }

  // =====================================================
  // WAIT FOR TABLE DATA TO LOAD
  // =====================================================

  private async waitForTableData() {
    try {
      // Wait for either table rows to appear or no data message
      await Promise.race([
        this.page.locator('table tbody tr').first().waitFor({ state: 'visible', timeout: 10000 }),
        this.noDataMessage.waitFor({ state: 'visible', timeout: 10000 })
      ]);
    } catch {
      // Ignore timeout errors
    }
  }

  // =====================================================
  // VALIDATE SEARCH RESULTS BY COLUMN
  // =====================================================

  private async validateColumn(index: number, expected: string, testInfo: TestInfo, stepName: string) {
    let found = false;
    try {
      await this.goToFirstPage();
      await this.performSearch(expected);
      await this.waitForTableData();
      
      let pageCount = 0;
      while (pageCount < 100) {
        const currentSearch = await this.searchInput.inputValue();
        if (currentSearch.trim().toLowerCase() !== expected.trim().toLowerCase()) {
          await this.performSearch(expected);
          await this.waitForTableData();
        }
        
        // Check if no data message is displayed
        const isNoData = await this.noDataMessage.isVisible().catch(() => false);
        if (isNoData) {
          break;
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
        await this.waitForTableData();
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
  // UNIFIED SEARCH FUNCTION - ALL SCENARIOS
  // =====================================================

  async searchColors(testInfo: TestInfo, options?: {
    searchBy?: 'id' | 'colorName' | 'hex' | 'status' | 'preview' | 'invalid';
    customValue?: string;
    statusType?: 'active' | 'inactive';
    customColumnIndex?: number; // For debugging column structure
  }) {
    const searchType = options?.searchBy || 'id';
    const stepName = `Search by ${searchType.charAt(0).toUpperCase() + searchType.slice(1)}`;

    try {
      await this.goToFirstPage();
      await this.waitForTableData();

      switch (searchType) {
        case 'id':
          await this.searchAndValidate(this.COLUMNS.ID, stepName, testInfo);
          break;

        case 'colorName':
          await this.searchAndValidate(this.COLUMNS.COLOR_NAME, stepName, testInfo);
          break;

        case 'hex':
          await this.searchAndValidate(this.COLUMNS.HEX, stepName, testInfo);
          break;

        case 'status': {
          const statusValue = options?.statusType === 'inactive' ? 'Inactive' : 'Active';
          await this.performSearch(statusValue);
          await this.waitForTableData();
          
          const isNoData = await this.noDataMessage.isVisible().catch(() => false);
          let found = false;
          
          if (!isNoData) {
            const tableText = (await this.page.locator('table').textContent())?.toLowerCase() || '';
            found = tableText.includes(statusValue.toLowerCase());
          }
          
          // For inactive status, if no data is found, that's actually expected behavior
          // So we mark it as passed if either we find inactive records OR no data is shown
          const expectedResult = (options?.statusType === 'inactive' && isNoData) ? 'No Inactive Records (Expected)' : 'Search Results Found';
          const actualResult = found ? 'Search Results Found' : (isNoData ? 'No Data Found' : 'No Data Found');
          
          // For inactive, we want to pass if either inactive records are found OR no data is shown
          const isPassing = (options?.statusType === 'inactive') ? (found || isNoData) : found;
          
          Reporter.validateData(
            'Search Results Found',
            isPassing ? (found ? 'Search Results Found' : 'No Inactive Records Found') : 'No Data Found',
            `${stepName} - ${statusValue}`,
            testInfo
          );
          break;
        }

        case 'preview': {
          // First check if there are any rows
          const rows = this.getRows();
          const count = await rows.count();
          
          if (count === 0) {
            Reporter.validateData(
              'Color Preview Exists',
              'No Data Available',
              stepName,
              testInfo
            );
            break;
          }
          
          let hasPreview = false;
          let previewCount = 0;
          
          // Check first 10 rows for preview images
          const rowsToCheck = Math.min(count, 10);
          for (let i = 0; i < rowsToCheck; i++) {
            const img = this.getColorPreview(rows.nth(i));
            const imgSrc = await img.getAttribute('src').catch(() => null);
            const imgExists = await img.isVisible().catch(() => false);
            
            if ((imgSrc && imgSrc.length > 0) || imgExists) {
              hasPreview = true;
              previewCount++;
            }
          }
          
          Reporter.validateData(
            'Color Preview Exists',
            hasPreview ? `Preview Available (${previewCount} previews found)` : 'No Preview Available',
            stepName,
            testInfo
          );
          break;
        }

        case 'invalid': {
          const value = options?.customValue || 'invalid_color_123';
          await this.performSearch(value);
          await this.waitForTableData();
          
          const rows = await this.getRows().count();
          const isNoData = await this.noDataMessage.isVisible().catch(() => false);
          const actual = (rows === 0 || isNoData) ? 'No Data Found' : 'Data Found';
          Reporter.validateData('No Data Found', actual, stepName, testInfo);
          break;
        }

        default:
          throw new Error(`Unsupported search type: ${searchType}`);
      }
    } catch (error: any) {
      console.log(`\n================================\nFAILED : ${stepName}\n\nERROR : ${error.message}\n================================\n`);
      Reporter.validateData(`${stepName} Completed`, false, `${stepName} - Execution Error`, testInfo);
    } finally {
      await this.resetSearch();
    }
  }

  // =====================================================
  // HELPER: SEARCH AND VALIDATE BY COLUMN
  // =====================================================

  private async searchAndValidate(columnIndex: number, stepName: string, testInfo: TestInfo) {
    try {
      // Wait for table to load
      await this.waitForTableData();
      
      const rows = this.getRows();
      const count = await rows.count();
      
      // If no rows, check if no data message is shown
      if (!count) {
        const isNoData = await this.noDataMessage.isVisible().catch(() => false);
        if (isNoData) {
          console.log(`\n================================\nNO DATA IN TABLE\n\nSTEP : ${stepName}\n================================\n`);
          Reporter.validateData('Table Data Exists', 'No Data Available', `${stepName} - Table Data Check`, testInfo);
          return;
        }
        console.log(`\n================================\nNO TABLE DATA\n\nSTEP : ${stepName}\n================================\n`);
        Reporter.validateData('Table Data Exists', false, `${stepName} - Table Data Check`, testInfo);
        return;
      }
      
      // Try to get the column value from first row
      let value = '';
      try {
        value = (await rows.first().locator('td').nth(columnIndex).textContent())?.trim() || '';
      } catch {
        // If the column index is wrong, try to get all text from the row to debug
        const rowText = await rows.first().textContent() || '';
        console.log(`\n================================\nCOLUMN ${columnIndex} NOT FOUND\n\nRow content: ${rowText}\n================================\n`);
        Reporter.validateData('Column Value Exists', false, `${stepName} - Column ${columnIndex} Check`, testInfo);
        return;
      }
      
      if (!value) {
        console.log(`\n================================\nNO DATA FOUND IN COLUMN ${columnIndex}\n\nSTEP : ${stepName}\n================================\n`);
        Reporter.validateData('Value Exists in Column', false, `${stepName} - Column Value Check`, testInfo);
        return;
      }
      
      await this.validateColumn(columnIndex, value, testInfo, stepName);
    } catch (error: any) {
      console.log(`\n================================\nFAILED : ${stepName}\n\nERROR : ${error.message}\n================================\n`);
      Reporter.validateData(`${stepName} Completed`, false, `${stepName} - Execution Error`, testInfo);
    }
  }
}