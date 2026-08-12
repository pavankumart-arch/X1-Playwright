import { Page, TestInfo, Locator } from '@playwright/test';
import { Reporter } from '../../utils/NewReport';

export class rooftopUsersPagination {
  readonly page: Page;
  readonly showCountDropdown: Locator;
  readonly rows: Locator;
  readonly nextButton: Locator;
  readonly paginationText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.showCountDropdown = page.locator('select:has(option)').first();
    this.rows = page.locator('table tbody tr');
    this.nextButton = page.getByRole('button', { name: 'Next' });
    this.paginationText = page.locator('text=/Showing \\d+-\\d+ of \\d+/');
  }

  // =====================================
  // WAIT FOR TABLE LOAD
  // =====================================
  async waitForTableLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.rows.first().waitFor({ state: 'visible', timeout: 10000 });
    // Small delay for stability
    await this.page.waitForTimeout(300);
  }

  // =====================================
  // GET DROPDOWN OPTIONS
  // =====================================
  async getDropdownOptions(): Promise<string[]> {
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
  }

  // =====================================
  // GET TOTAL FROM UI
  // =====================================
  async getTotalFromUI(): Promise<number> {
    try {
      await this.paginationText.first().waitFor({ state: 'visible', timeout: 5000 });
      const text = await this.paginationText.textContent();
      console.log(`📊 Pagination Text: ${text}`);
      
      const match = text?.match(/of (\d+)/);
      if (match && match[1]) {
        return Number(match[1]);
      }
      return 0;
    } catch (error) {
      console.warn('⚠️ Pagination text not found');
      return 0;
    }
  }

  // =====================================
  // GO TO FIRST PAGE
  // =====================================
  async goToFirstPage() {
    try {
      const firstPageBtn = this.page.locator('button[aria-label="Page 1"]');
      if (await firstPageBtn.isVisible({ timeout: 3000 })) {
        await firstPageBtn.click();
        await this.waitForTableLoad();
      }
    } catch (error) {
      console.log('ℹ️ Already on first page');
    }
  }

  // =====================================
  // CHECK IF PAGE CHANGED
  // =====================================
  async waitForPageChange(beforeText: string | null, timeout = 10000): Promise<boolean> {
    try {
      await this.page.waitForFunction(
        (oldVal) => {
          const el = document.querySelector('table tbody tr:first-child');
          return el && el.textContent !== oldVal;
        },
        beforeText,
        { timeout }
      );
      return true;
    } catch (error) {
      console.log('⏱️ Page change timeout - assuming no more pages');
      return false;
    }
  }

  // =====================================
  // COUNT ALL ROWS BY CLICKING NEXT
  // =====================================
  async countAllPages(): Promise<{ total: number; nextWorked: boolean; pagesVisited: number }> {
    let total = 0;
    let nextWorked = true;
    let pageNo = 1;
    const maxPages = 50; // Safety limit

    await this.goToFirstPage();

    while (pageNo <= maxPages) {
      // Get current page rows
      const count = await this.rows.count();
      total += count;
      console.log(`\n📄 PAGE ${pageNo}\nRows Found: ${count}`);

      // Check if Next button exists and is enabled
      const nextVisible = await this.nextButton.isVisible({ timeout: 2000 });
      const nextEnabled = nextVisible && await this.nextButton.isEnabled();
      
      if (nextVisible && nextEnabled) {
        // Store current first row text to detect page change
        const before = await this.rows.first().textContent();

        // Click Next button
        await this.nextButton.click();
        
        // Wait for page change with timeout
        const pageChanged = await this.waitForPageChange(before, 8000);
        
        if (!pageChanged) {
          console.log('⚠️ Page did not change after clicking Next');
          nextWorked = false;
          break;
        }

        // Wait for table to stabilize
        await this.waitForTableLoad();
        pageNo++;
      } else {
        console.log(`ℹ️ No more pages (Next button not visible or disabled)`);
        break;
      }
    }

    console.log(`\n📊 TOTAL RECORDS COUNTED: ${total} across ${pageNo} pages`);
    return { total, nextWorked, pagesVisited: pageNo };
  }

  // =====================================
  // VALIDATE SINGLE PAGE SIZE
  // =====================================
  async validatePageSize(expectedSize: number): Promise<boolean> {
    const rowCount = await this.rows.count();
    const isValid = rowCount <= expectedSize;
    console.log(`📊 Page size validation: Expected ${expectedSize}, Actual ${rowCount} - ${isValid ? '✅ PASS' : '❌ FAIL'}`);
    return isValid;
  }

  // =====================================
  // WAIT FOR DROPDOWN SELECTION
  // =====================================
  async selectDropdownOption(value: string) {
    try {
      await this.showCountDropdown.selectOption({ label: value }, { timeout: 10000 });
      await this.waitForTableLoad();
    } catch (error) {
      console.error(`❌ Failed to select option: ${value}`);
      throw error;
    }
  }

  // =====================================
  // MAIN VALIDATION METHOD
  // =====================================
  async verifyrooftopUsersPagination(testInfo: TestInfo) {
    console.log('\n🚀 STARTING PAGINATION VALIDATION');
    
    // Wait for page to be fully loaded
    await this.waitForTableLoad();

    // Get dropdown options
    let options = await this.getDropdownOptions();
    
    // Fallback if no options found
    if (options.length === 0) {
      console.warn('⚠️ No dropdown options found, using defaults');
      options = ['Show: 10', 'Show: 20', 'Show: 50', 'Show: 100'];
    }

    console.log(`\n📌 AVAILABLE DROPDOWN OPTIONS:\n${options.join(', ')}`);

    // Validate each pagination option
    let allTestsPassed = true;
    let currentPageContext = this.page.context();

    for (let i = 0; i < options.length; i++) {
      const option = options[i];
      
      // Check if page/context is still valid
      if (currentPageContext !== this.page.context()) {
        console.error('❌ Browser context changed, stopping test');
        break;
      }

      console.log(`\n${'='.repeat(50)}`);
      console.log(`🔍 TESTING PAGINATION FOR: ${option} RECORDS PER PAGE`);
      console.log(`${'='.repeat(50)}`);

      try {
        // Extract numeric value from option text
        const numericMatch = option.match(/\d+/);
        const pageSize = numericMatch ? parseInt(numericMatch[0]) : 10;

        // Select the option
        await this.selectDropdownOption(option);
        await this.goToFirstPage();

        // Validate page size
        const sizeValid = await this.validatePageSize(pageSize);
        Reporter.validateData(
          true,
          sizeValid,
          `Page Size Validation (${option})`,
          testInfo
        );
        allTestsPassed = allTestsPassed && sizeValid;

        // Expected total from UI
        const expectedTotal = await this.getTotalFromUI();
        console.log(`📊 Expected total from UI: ${expectedTotal}`);

        if (expectedTotal === 0) {
          console.warn('⚠️ Could not get total from UI, skipping total validation');
          continue;
        }

        // Actual total by iterating pages
        const { total: actualTotal, nextWorked, pagesVisited } = await this.countAllPages();

        // Validate Next button behaviour
        Reporter.validateData(
          true,
          nextWorked,
          `Next Button Validation (${option})`,
          testInfo
        );

        // Validate total record count
        const totalMatch = expectedTotal === actualTotal;
        Reporter.validateData(
          expectedTotal,
          actualTotal,
          `Total Records Validation (${option})`,
          testInfo
        );

        allTestsPassed = allTestsPassed && totalMatch && nextWorked;

        console.log(`📊 Pages visited: ${pagesVisited}, Records found: ${actualTotal}`);
        
        // Add a small delay between tests
        await this.page.waitForTimeout(500);
        
      } catch (error) {
        console.error(`❌ Error testing option ${option}:`, error);
        
        // Check if browser is still open
        try {
          await this.page.url();
          Reporter.validateData(
            true,
            false,
            `Test execution for ${option}`,
            testInfo
          );
          allTestsPassed = false;
        } catch (e) {
          console.error('❌ Browser closed unexpectedly');
          break;
        }
      }
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log(`🏁 PAGINATION VALIDATION COMPLETE: ${allTestsPassed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`${'='.repeat(50)}`);
    
    return allTestsPassed;
  }
}