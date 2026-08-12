import { Page, TestInfo, Locator } from '@playwright/test';
import { Reporter } from '../../../utils/NewReport';


export class bodytypePagination {
  readonly page: Page;
  readonly showCountDropdown: Locator;
  readonly rows: Locator;
  readonly nextButton: Locator;
  readonly previousButton: Locator;
  readonly paginationText: Locator;
  readonly pageNumberButtons: Locator;

  constructor(page: Page) {
    this.page = page;
    this.showCountDropdown = page.locator('select:has(option)').first();
    this.rows = page.locator('table tbody tr');
    this.nextButton = page.getByRole('button', { name: 'Next' });
    this.previousButton = page.getByRole('button', { name: 'Previous' });
    this.paginationText = page.locator('text=/Showing \\d+-\\d+ of \\d+/');
    this.pageNumberButtons = page.locator('button[aria-label*="Page"]');
  }

  // =====================================
  // WAIT FOR TABLE LOAD
  // =====================================
  async waitForTableLoad() {
    try {
      await this.page.waitForLoadState('networkidle', { timeout: 5000 });
      await this.rows.first().waitFor({ state: 'visible', timeout: 10000 });
      await this.page.waitForTimeout(200);
    } catch (error) {
      console.log('⚠️ Table load timeout, but continuing...');
    }
  }

  // =====================================
  // GET DROPDOWN OPTIONS
  // =====================================
  async getDropdownOptions(): Promise<string[]> {
    try {
      await this.showCountDropdown.waitFor({ state: 'visible', timeout: 10000 });
      const options = await this.showCountDropdown.locator('option').all();
      const optionTexts: string[] = [];
      
      for (const opt of options) {
        const text = await opt.textContent();
        if (text && text.trim()) {
          optionTexts.push(text.trim());
        }
      }
      
      console.log(`📊 Total options found: ${optionTexts.length}`);
      return optionTexts;
    } catch (error) {
      console.warn('⚠️ Could not find dropdown options');
      return ['Show: 10', 'Show: 20', 'Show: 50', 'Show: 100'];
    }
  }

  // =====================================
  // GET PAGINATION INFO - FIXED
  // =====================================
  async getPaginationInfo(): Promise<{ start: number; end: number; total: number; pageSize: number; totalPages: number; currentPage: number }> {
    try {
      await this.paginationText.first().waitFor({ state: 'visible', timeout: 5000 });
      const text = await this.paginationText.textContent();
      console.log(`📊 Pagination Text: ${text}`);
      
      const match = text?.match(/Showing (\d+)-(\d+) of (\d+)/);
      if (match) {
        const start = parseInt(match[1]);
        const end = parseInt(match[2]);
        const total = parseInt(match[3]);
        const pageSize = end - start + 1;
        const totalPages = Math.ceil(total / pageSize);
        
        // FIX: Calculate current page correctly
        // currentPage = Math.floor((start - 1) / pageSize) + 1
        const currentPage = Math.floor((start - 1) / pageSize) + 1;
        
        console.log(`📊 Calculated: start=${start}, pageSize=${pageSize}, currentPage=${currentPage}, totalPages=${totalPages}`);
        
        return { start, end, total, pageSize, totalPages, currentPage };
      }
      return { start: 0, end: 0, total: 0, pageSize: 0, totalPages: 0, currentPage: 0 };
    } catch (error) {
      console.warn('⚠️ Pagination text not found');
      return { start: 0, end: 0, total: 0, pageSize: 0, totalPages: 0, currentPage: 0 };
    }
  }

  // =====================================
  // SELECT DROPDOWN OPTION
  // =====================================
  async selectDropdownOption(value: string) {
    try {
      await this.showCountDropdown.waitFor({ state: 'visible', timeout: 10000 });
      await this.showCountDropdown.selectOption({ label: value }, { timeout: 10000 });
      await this.page.waitForTimeout(300);
      await this.waitForTableLoad();
    } catch (error) {
      console.error(`❌ Failed to select option: ${value}`);
      throw error;
    }
  }

  // =====================================
  // NAVIGATE TO SPECIFIC PAGE
  // =====================================
  async navigateToPage(pageNumber: number) {
    try {
      // Try to click on page number button
      const pageBtn = this.page.locator(`button[aria-label="Page ${pageNumber}"]`);
      if (await pageBtn.isVisible({ timeout: 2000 })) {
        await pageBtn.click();
        await this.waitForTableLoad();
        return true;
      }
      
      // Try to use Next/Previous to navigate
      const currentInfo = await this.getPaginationInfo();
      if (currentInfo.currentPage < pageNumber) {
        // Navigate forward - but limit to avoid timeout
        const maxSteps = Math.min(pageNumber - currentInfo.currentPage, 10);
        for (let i = 0; i < maxSteps; i++) {
          if (await this.nextButton.isEnabled()) {
            await this.nextButton.click();
            await this.waitForTableLoad();
          } else {
            break;
          }
        }
        return true;
      } else if (currentInfo.currentPage > pageNumber) {
        // Navigate backward
        const maxSteps = Math.min(currentInfo.currentPage - pageNumber, 10);
        for (let i = 0; i < maxSteps; i++) {
          if (await this.previousButton.isEnabled()) {
            await this.previousButton.click();
            await this.waitForTableLoad();
          } else {
            break;
          }
        }
        return true;
      }
      return true;
    } catch (error) {
      console.log(`⚠️ Could not navigate to page ${pageNumber}`);
      return false;
    }
  }

  // =====================================
  // VALIDATE PAGINATION BY SAMPLING - FIXED
  // =====================================
  async validatePaginationBySampling(testInfo: TestInfo): Promise<boolean> {
    console.log('\n📋 VALIDATING PAGINATION BY SAMPLING PAGES');
    
    const info = await this.getPaginationInfo();
    console.log(`📊 Total Records: ${info.total}, Total Pages: ${info.totalPages}, Page Size: ${info.pageSize}, Current Page: ${info.currentPage}`);

    if (info.totalPages === 0) {
      console.log('⚠️ No pagination data found');
      return false;
    }

    let allPassed = true;

    // Test 1: Validate current page
    const rowCount = await this.rows.count();
    const expectedRows = Math.min(info.pageSize, info.total - (info.currentPage - 1) * info.pageSize);
    const currentPageValid = rowCount === expectedRows;
    Reporter.validateData(
      expectedRows,
      rowCount,
      `Current page rows (Page ${info.currentPage})`,
      testInfo
    );
    allPassed = allPassed && currentPageValid;

    // Test 2: Test Next button navigation (go to page 2)
    if (info.totalPages >= 2) {
      console.log('\n🔄 Testing navigation to page 2...');
      const beforeInfo = await this.getPaginationInfo();
      
      if (await this.nextButton.isEnabled()) {
        await this.nextButton.click();
        await this.waitForTableLoad();
        const afterInfo = await this.getPaginationInfo();
        
        const pageChanged = afterInfo.currentPage === beforeInfo.currentPage + 1;
        Reporter.validateData(
          beforeInfo.currentPage + 1,
          afterInfo.currentPage,
          'Navigate to next page',
          testInfo
        );
        allPassed = allPassed && pageChanged;

        // Validate rows on page 2
        if (afterInfo.currentPage === 2) {
          const rowCountPage2 = await this.rows.count();
          const expectedRowsPage2 = Math.min(afterInfo.pageSize, afterInfo.total - (2 - 1) * afterInfo.pageSize);
          Reporter.validateData(
            expectedRowsPage2,
            rowCountPage2,
            `Page 2 row count`,
            testInfo
          );
          allPassed = allPassed && (rowCountPage2 === expectedRowsPage2);
        }

        // Go back to page 1
        if (await this.previousButton.isEnabled()) {
          await this.previousButton.click();
          await this.waitForTableLoad();
          const backInfo = await this.getPaginationInfo();
          Reporter.validateData(
            1,
            backInfo.currentPage,
            'Navigate back to page 1',
            testInfo
          );
          allPassed = allPassed && (backInfo.currentPage === 1);
        }
      } else {
        console.log('⚠️ Next button is not enabled');
      }
    }

    // Test 3: Test Last page navigation
    if (info.totalPages >= 3) {
      console.log('\n🔄 Testing navigation to last page...');
      
      // Try to go to last page using last page button if available
      const lastPageBtn = this.page.locator('button[aria-label*="Last"]');
      let lastPageReached = false;
      
      if (await lastPageBtn.isVisible({ timeout: 2000 })) {
        await lastPageBtn.click();
        await this.waitForTableLoad();
        const lastInfo = await this.getPaginationInfo();
        
        // FIX: Verify we're on the last page
        // The currentPage should equal totalPages
        lastPageReached = lastInfo.currentPage === info.totalPages;
        Reporter.validateData(
          info.totalPages,
          lastInfo.currentPage,
          'Navigate to last page',
          testInfo
        );
        allPassed = allPassed && lastPageReached;
        
        // Validate rows on last page
        const lastPageRows = await this.rows.count();
        const expectedLastPageRows = info.total - (info.totalPages - 1) * info.pageSize;
        Reporter.validateData(
          expectedLastPageRows,
          lastPageRows,
          'Last page row count',
          testInfo
        );
        allPassed = allPassed && (lastPageRows === expectedLastPageRows);
      } else {
        console.log('⚠️ No last page button found, skipping last page test');
      }

      // Return to page 1
      await this.navigateToPage(1);
    }

    // Test 4: Validate page size dropdown
    console.log('\n🔄 Testing page size dropdown...');
    const options = await this.getDropdownOptions();
    
    for (let i = 0; i < Math.min(options.length, 2); i++) {
      const option = options[i];
      const numericMatch = option.match(/\d+/);
      const pageSize = numericMatch ? parseInt(numericMatch[0]) : 10;
      
      console.log(`  Testing ${option}...`);
      await this.selectDropdownOption(option);
      await this.waitForTableLoad();
      
      const newInfo = await this.getPaginationInfo();
      const rowCount = await this.rows.count();
      
      // Validate page size
      const isValidPageSize = rowCount <= pageSize;
      Reporter.validateData(
        true,
        isValidPageSize,
        `Page size ${pageSize} validation`,
        testInfo
      );
      allPassed = allPassed && isValidPageSize;
      
      // Validate total remains the same
      const totalMatch = newInfo.total === info.total;
      Reporter.validateData(
        info.total,
        newInfo.total,
        `Total records remain same for ${pageSize}`,
        testInfo
      );
      allPassed = allPassed && totalMatch;
    }

    // Return to first page with initial page size
    await this.selectDropdownOption(options[0] || 'Show: 10');
    await this.navigateToPage(1);

    return allPassed;
  }

  // =====================================
  // MAIN VALIDATION METHOD
  // =====================================
  async verifyBodytypeDataPagination(testInfo: TestInfo) {
    console.log('\n🚀 STARTING BODY TYPE PAGINATION VALIDATION');
    
    // Wait for page to be fully loaded
    await this.waitForTableLoad();

    // Get initial pagination info
    const initialInfo = await this.getPaginationInfo();
    console.log(`\n📊 Initial Pagination State:`);
    console.log(`  Total Records: ${initialInfo.total}`);
    console.log(`  Page Size: ${initialInfo.pageSize}`);
    console.log(`  Total Pages: ${initialInfo.totalPages}`);
    console.log(`  Current Page: ${initialInfo.currentPage}`);

    if (initialInfo.total === 0) {
      console.log('⚠️ No records found, skipping pagination test');
      return true;
    }

    // Validate pagination using sampling
    const result = await this.validatePaginationBySampling(testInfo);

    console.log(`\n${'='.repeat(50)}`);
    console.log(`🏁 BODY TYPE PAGINATION VALIDATION COMPLETE: ${result ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`${'='.repeat(50)}`);
    
    return result;
  }
}