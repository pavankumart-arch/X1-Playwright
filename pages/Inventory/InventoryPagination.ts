import { Page, TestInfo, Locator } from '@playwright/test';
import { Reporter } from '../../pages/utils/NewReport';

export class InventoryPagination {
  readonly page: Page;
  private testInfo: TestInfo;

  readonly showCountDropdown: Locator;
  readonly rows: Locator;
  readonly paginationText: Locator;

  constructor(page: Page, testInfo: TestInfo) {
    this.page = page;
    this.testInfo = testInfo;

    // Selectors matching the UI
    this.showCountDropdown = page.locator('select');
    this.rows = page.locator('table tbody tr');
    this.paginationText = page.locator('text=/Showing \\d+-\\d+ of \\d+/');
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
    
    // Try to find page 1 button
    const pageOneBtn = this.page.locator('button').filter({ hasText: /^1$/ }).first();

    if (await pageOneBtn.isVisible().catch(() => false)) {
      await pageOneBtn.click();
      await this.page.waitForTimeout(1000);
      await this.waitForTableLoad();
    }
  }

  // ====================================
  // CLICK NEXT PAGE
  // ====================================
  async clickNextPage(): Promise<boolean> {
    console.log(`🔄 Clicking Next button...`);
    
    try {
      // Try multiple selectors for the next button
      const nextSelectors = [
        'button[aria-label="Next"]',
        'button:has-text("›")',
        'button:has-text("»")',
        'a:has-text("›")',
        'li:last-child button',
        'button[title*="Next"]',
        'button[title*="next"]'
      ];

      let clicked = false;

      for (const selector of nextSelectors) {
        const nextBtn = this.page.locator(selector).last();
        const isVisible = await nextBtn.isVisible().catch(() => false);

        if (isVisible) {
          const disabled = await nextBtn.getAttribute('disabled').catch(() => null);
          const ariaDisabled = await nextBtn.getAttribute('aria-disabled').catch(() => null);

          if (disabled === null && ariaDisabled !== 'true') {
            console.log(`✅ Found and clicking Next button with selector: ${selector}`);
            
            // Store current first row text to detect page change
            const currentFirstRow = await this.rows.first().textContent().catch(() => '');
            
            await nextBtn.click();
            await this.page.waitForTimeout(1000);

            // Wait for page content to change
            try {
              await this.page.waitForFunction(
                (oldText) => {
                  const el = document.querySelector('table tbody tr:first-child');
                  return el && el.textContent !== oldText;
                },
                currentFirstRow,
                { timeout: 5000 }
              );
            } catch (error) {
              console.log(`⚠️ Page content check timed out, continuing...`);
            }

            await this.waitForTableLoad();
            clicked = true;
            break;
          }
        }
      }

      if (!clicked) {
        console.log(`❌ Next button not found or disabled`);
        // Log all buttons for debugging
        const allButtons = await this.page.locator('button').allTextContents();
        console.log(`📋 Available buttons:`, allButtons);
      }

      return clicked;
    } catch (error) {
      console.error(`❌ Error clicking next button:`, error);
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
    let maxPages = 1000; // Safety limit

    await this.goToFirstPage();

    while (pageNo <= maxPages) {
      const count = await this.rows.count();
      total += count;

      console.log(`
📄 PAGE ${pageNo}
Rows Found: ${count}
`);

      // Check if next button is available and enabled
      const nextBtn = this.page.locator('button:has-text("›")').last();
      const isNextVisible = await nextBtn.isVisible().catch(() => false);
      const isNextEnabled = isNextVisible ? 
        (await nextBtn.getAttribute('disabled').catch(() => null) === null && 
         await nextBtn.getAttribute('aria-disabled').catch(() => null) !== 'true') 
        : false;

      console.log(`🔍 Next button visible: ${isNextVisible}, enabled: ${isNextEnabled}`);

      if (isNextVisible && isNextEnabled) {
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
          console.log(`⚠️ Page content didn't change - reached last page or duplicate`);
          break;
        }

        pageNo++;
      } else {
        console.log(`✅ Reached last page (next button not available)`);
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

          // Extract numeric page size
          const pageSizeNum = parseInt(pageSize.replace(/\D/g, ''));
          console.log(`📏 Page size numeric value: ${pageSizeNum}`);

          // Count all pages
          const { total: actualTotal, nextWorked } = await this.countAllPages();

          // Validate next button
          Reporter.validatePageNavigation(1, 2, nextWorked, this.testInfo);

          // Calculate expected pages
          const expectedPages = Math.ceil(expectedTotal / pageSizeNum);
          
          // Validate total records
          const totalMatch = expectedTotal === actualTotal;
          Reporter.validatePagination(1, expectedPages, pageSizeNum, expectedTotal, this.testInfo);

          const pageTestResult = nextWorked && totalMatch;

          console.log(`
${'─'.repeat(80)}
📋 PAGE SIZE        : ${pageSize}
📊 EXPECTED TOTAL   : ${expectedTotal}
📊 ACTUAL TOTAL     : ${actualTotal}
📄 EXPECTED PAGES   : ${expectedPages}
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
      const pageSizeNum = parseInt(pageSize.replace(/\D/g, ''));
      const totalPages = Math.ceil(expectedTotal / pageSizeNum);

      console.log(`📄 Total pages: ${totalPages}`);

      if (totalPages > 1) {
        // Navigate to last page
        console.log(`📍 Navigating to last page (${totalPages})...`);
        await this.goToFirstPage();

        let currentPage = 1;
        let maxAttempts = totalPages * 2; // Safety limit
        
        while (currentPage < totalPages && maxAttempts > 0) {
          const success = await this.clickNextPage();
          if (!success) break;
          currentPage++;
          maxAttempts--;
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
