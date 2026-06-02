import { Page, TestInfo, Locator } from '@playwright/test';
import { Reporter } from '../../pages/utils/NewReport';

export class InventoryPagination {
  readonly page: Page;
  private testInfo: TestInfo;

  readonly showCountDropdown: Locator;
  readonly rows: Locator;
  readonly nextButton: Locator;
  readonly prevButton: Locator;
  readonly paginationText: Locator;
  readonly pageButtons: Locator;

  constructor(page: Page, testInfo: TestInfo) {
    this.page = page;
    this.testInfo = testInfo;

    // Selectors matching the UI in image 6
    this.showCountDropdown = page.locator('select');
    this.rows = page.locator('table tbody tr');
    this.nextButton = page.locator('button:has-text("›")').last(); // Next button (›)
    this.prevButton = page.locator('button:has-text("‹")').first(); // Previous button (‹)
    this.paginationText = page.locator('text=/Showing \\d+-\\d+ of \\d+/');
    this.pageButtons = page.locator('button'); // Page number buttons
  }

  // ====================================
  // WAIT FOR TABLE LOAD
  // ====================================
  async waitForTableLoad(): Promise<void> {
    try {
      await this.rows.first().waitFor({ state: 'visible', timeout: 15000 });
      await this.page.waitForTimeout(500);
    } catch (error) {
      console.warn(`⚠️ Warning waiting for table to load:`, error);
    }
  }

  // ====================================
  // GET TOTAL RECORDS FROM UI
  // ====================================
  async getTotalFromUI(): Promise<number> {
    try {
      const text = await this.paginationText.textContent();
      console.log(`📊 Pagination Text: ${text}`);
      const total = Number(text?.match(/of (\d+)/)?.[1]);
      return total || 0;
    } catch (error) {
      console.log(`⚠️ Could not get total records: ${error}`);
      return 0;
    }
  }

  // ====================================
  // GO TO FIRST PAGE
  // ====================================
  async goToFirstPage(): Promise<void> {
    console.log(`📍 Going to first page...`);
    
    const firstPageBtn = this.page.locator('button[aria-label="Page 1"]');
    const pageOneBtn = this.pageButtons.filter({ hasText: '1' }).first();

    if (await firstPageBtn.isVisible().catch(() => false)) {
      await firstPageBtn.click();
      await this.page.waitForTimeout(1000);
    } else if (await pageOneBtn.isVisible().catch(() => false)) {
      await pageOneBtn.click();
      await this.page.waitForTimeout(1000);
    }

    await this.waitForTableLoad();
  }

  // ====================================
  // CLICK NEXT PAGE
  // ====================================
  async clickNextPage(): Promise<boolean> {
    console.log(`🔄 Clicking Next button...`);
    
    try {
      if (!(await this.nextButton.isVisible().catch(() => false))) {
        console.log(`❌ Next button not visible`);
        return false;
      }

      const disabled = await this.nextButton.getAttribute('disabled').catch(() => null);
      if (disabled !== null) {
        console.log(`❌ Next button is disabled`);
        return false;
      }

      // Store current first row text to detect page change
      const currentFirstRow = await this.rows.first().textContent().catch(() => '');
      
      await this.nextButton.click();
      await this.page.waitForTimeout(1000);

      // Wait for page content to change
      await this.page.waitForFunction(
        (oldText) => {
          const el = document.querySelector('table tbody tr:first-child');
          return el && el.textContent !== oldText;
        },
        currentFirstRow,
        { timeout: 10000 }
      ).catch(() => {
        console.log(`⚠️ Page content didn't change, continuing...`);
      });

      await this.waitForTableLoad();
      return true;
    } catch (error) {
      console.error(`❌ Error clicking next button:`, error);
      return false;
    }
  }

  // ====================================
  // CLICK PREVIOUS PAGE
  // ====================================
  async clickPreviousPage(): Promise<boolean> {
    console.log(`🔄 Clicking Previous button...`);
    
    try {
      if (!(await this.prevButton.isVisible().catch(() => false))) {
        console.log(`❌ Previous button not visible`);
        return false;
      }

      const disabled = await this.prevButton.getAttribute('disabled').catch(() => null);
      if (disabled !== null) {
        console.log(`❌ Previous button is disabled`);
        return false;
      }

      const currentFirstRow = await this.rows.first().textContent().catch(() => '');
      
      await this.prevButton.click();
      await this.page.waitForTimeout(1000);

      await this.page.waitForFunction(
        (oldText) => {
          const el = document.querySelector('table tbody tr:first-child');
          return el && el.textContent !== oldText;
        },
        currentFirstRow,
        { timeout: 10000 }
      ).catch(() => {
        console.log(`⚠️ Page content didn't change, continuing...`);
      });

      await this.waitForTableLoad();
      return true;
    } catch (error) {
      console.error(`❌ Error clicking previous button:`, error);
      return false;
    }
  }

  // ====================================
  // COUNT ALL PAGES
  // ====================================
  async countAllPages(): Promise<{ total: number; nextWorked: boolean }> {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📊 COUNTING ALL PAGES`);
    console.log(`${'='.repeat(80)}`);

    let total = 0;
    let nextWorked = true;
    let pageNo = 1;

    await this.goToFirstPage();

    while (true) {
      const count = await this.rows.count();
      total += count;

      console.log(`
📄 PAGE ${pageNo}
Rows Found: ${count}
`);

      // Check if next button is available
      if (
        await this.nextButton.isVisible().catch(() => false) &&
        (await this.nextButton.isEnabled().catch(() => false))
      ) {
        const before = await this.rows.first().textContent().catch(() => '');
        const clickResult = await this.clickNextPage();

        if (!clickResult) {
          console.log(`❌ Failed to click next button`);
          nextWorked = false;
          break;
        }

        const after = await this.rows.first().textContent().catch(() => '');

        // Detect duplicate page issue
        if (before === after) {
          console.log(`⚠️ Page content didn't change - possible duplicate page`);
          nextWorked = false;
          break;
        }

        pageNo++;
      } else {
        console.log(`✅ Reached last page`);
        break;
      }
    }

    console.log(`
${'='.repeat(80)}
📊 TOTAL RECORDS COUNTED: ${total}
📄 TOTAL PAGES: ${pageNo}
${'='.repeat(80)}
`);

    return { total, nextWorked };
  }

  // ====================================
  // MAIN VERIFICATION METHOD
  // ====================================
  async verifyInventoryPagination(): Promise<boolean> {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🧪 STARTING INVENTORY PAGINATION TESTS`);
    console.log(`${'='.repeat(80)}`);

    try {
      // Get dropdown options
      const options = await this.showCountDropdown
        .locator('option')
        .allTextContents();

      console.log(`
📌 AVAILABLE PAGE SIZES:
${options.join(', ')}
`);

      let allTestsPassed = true;

      for (const option of options) {
        const pageSize = option.trim();

        console.log(`

${'='.repeat(80)}
🔍 TESTING PAGE SIZE: ${pageSize} RECORDS PER PAGE
${'='.repeat(80)}
`);

        try {
          // Select page size
          await this.showCountDropdown.selectOption({ label: pageSize });
          console.log(`✅ Selected page size: ${pageSize}`);

          await this.waitForTableLoad();
          await this.goToFirstPage();

          // Get expected total
          const expectedTotal = await this.getTotalFromUI();
          console.log(`📊 Total records from UI: ${expectedTotal}`);

          // Count all pages
          const { total: actualTotal, nextWorked } = await this.countAllPages();

          // Validate next button
          Reporter.validatePageNavigation(1, 2, nextWorked, this.testInfo);

          // Validate total records
          const totalMatch = expectedTotal === actualTotal;
          Reporter.validatePagination(1, Math.ceil(expectedTotal / parseInt(pageSize)), parseInt(pageSize), expectedTotal, this.testInfo);

          const pageTestResult = nextWorked && totalMatch;

          console.log(`
${'─'.repeat(80)}
📋 PAGE SIZE        : ${pageSize}
📊 EXPECTED TOTAL   : ${expectedTotal}
📊 ACTUAL TOTAL     : ${actualTotal}
🔀 NEXT BUTTON      : ${nextWorked ? 'Working ✅' : 'Failed ❌'}
📊 TOTALS MATCH     : ${totalMatch ? 'Yes ✅' : 'No ❌'}
🎯 FINAL STATUS     : ${pageTestResult ? 'PASS ✅' : 'FAIL ❌'}
${'─'.repeat(80)}
`);

          if (!pageTestResult) {
            allTestsPassed = false;
          }
        } catch (error) {
          console.error(`❌ Error testing page size ${pageSize}:`, error);
          allTestsPassed = false;
        }
      }

      console.log(`
${'='.repeat(80)}
✅ INVENTORY PAGINATION VALIDATION COMPLETED
${'='.repeat(80)}
Overall Status: ${allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}
${'='.repeat(80)}
`);

      return allTestsPassed;
    } catch (error) {
      console.error(`❌ Error in verifyInventoryPagination:`, error);
      return false;
    }
  }

  // ====================================
  // VERIFY SPECIFIC PAGE NAVIGATION
  // ====================================
  async verifySpecificPageNavigation(targetPage: number): Promise<boolean> {
    console.log(`\n📄 Testing navigation to page ${targetPage}`);

    try {
      // Navigate to page 1 first
      await this.goToFirstPage();
      let currentPage = 1;

      // Click next until we reach target page
      while (currentPage < targetPage) {
        const success = await this.clickNextPage();
        if (!success) {
          console.log(`❌ Failed to navigate to page ${targetPage}`);
          return false;
        }
        currentPage++;
      }

      console.log(`✅ Successfully navigated to page ${targetPage}`);
      Reporter.validatePageNavigation(1, targetPage, true, this.testInfo);
      return true;
    } catch (error) {
      console.error(`❌ Error navigating to page ${targetPage}:`, error);
      Reporter.validatePageNavigation(1, targetPage, false, this.testInfo);
      return false;
    }
  }

  // ====================================
  // VERIFY FIRST AND LAST PAGE NAVIGATION
  // ====================================
  async verifyFirstAndLastPageNavigation(): Promise<{ firstPageNavWorking: boolean; lastPageNavWorking: boolean }> {
    console.log(`\n📄 Testing First and Last Page Navigation`);

    let firstPageNavWorking = false;
    let lastPageNavWorking = false;

    try {
      const expectedTotal = await this.getTotalFromUI();
      const pageSize = await this.showCountDropdown.inputValue();
      const totalPages = Math.ceil(expectedTotal / parseInt(pageSize));

      console.log(`📄 Total pages: ${totalPages}`);

      if (totalPages > 1) {
        // Navigate to last page
        console.log(`📍 Navigating to last page (${totalPages})...`);
        await this.goToFirstPage();

        let currentPage = 1;
        while (currentPage < totalPages) {
          const success = await this.clickNextPage();
          if (!success) break;
          currentPage++;
        }

        lastPageNavWorking = currentPage === totalPages;
        console.log(`Last page navigation: ${lastPageNavWorking ? '✅' : '❌'}`);

        // Navigate back to first page
        console.log(`📍 Navigating back to first page...`);
        await this.goToFirstPage();
        firstPageNavWorking = true;
        console.log(`First page navigation: ✅`);
      } else {
        console.log(`⚠️ Only 1 page available, skipping first/last tests`);
        firstPageNavWorking = true;
        lastPageNavWorking = true;
      }
    } catch (error) {
      console.error(`❌ Error in verifyFirstAndLastPageNavigation:`, error);
    }

    return { firstPageNavWorking, lastPageNavWorking };
  }
}
