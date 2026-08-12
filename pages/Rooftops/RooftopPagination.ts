import { Page, TestInfo, test, expect } from '@playwright/test';
import { Reporter } from '../utils/NewReport';

export class RooftopPagination {

  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async verifyAllPagination(testInfo: TestInfo) {
    Reporter.startTest();

    const dropdown = this.page.locator('select');
    const options = ['10', '20', '50', '100'];

    let allTestsPassed = true;

    for (const optionValue of options) {
      await test.step(`Verify pagination with Show ${optionValue}`, async () => {
        
        // Select the option
        await dropdown.selectOption(optionValue);
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(2000);

        // Get pagination info
        const paginationText = this.page.locator('text=/Showing \\d+-\\d+ of \\d+/');
        const text = await paginationText.textContent();
        const totalMatch = text?.match(/of (\d+)/);
        const totalRecords = totalMatch ? Number(totalMatch[1]) : 0;
        
        // Get current rows displayed
        const rows = await this.page.locator('table tbody tr').count();
        
        // Calculate expected pages
        const rowsPerPage = parseInt(optionValue);
        const expectedPages = Math.ceil(totalRecords / rowsPerPage);
        
        // Get actual page count by checking pagination info or page numbers
        let actualPages = 1;
        
        // Method 1: Try to get page count from pagination controls
        const pageInfo = this.page.locator('text=/Page \\d+ of \\d+/');
        if (await pageInfo.count() > 0) {
          const pageText = await pageInfo.textContent();
          const pageMatch = pageText?.match(/Page \d+ of (\d+)/);
          if (pageMatch) {
            actualPages = Number(pageMatch[1]);
          }
        } else {
          // Method 2: Count available page buttons
          const pageButtons = this.page.locator('button[aria-label*="Page"]:not([disabled])');
          const buttonCount = await pageButtons.count();
          
          // If there are page number buttons, count them
          if (buttonCount > 0) {
            // Get the last page number from visible page buttons
            const lastPageButton = this.page.locator('button[aria-label*="Page"]').last();
            const lastPageText = await lastPageButton.textContent();
            if (lastPageText) {
              const lastPageNum = parseInt(lastPageText);
              if (!isNaN(lastPageNum)) {
                actualPages = lastPageNum;
              }
            }
          } else {
            // Method 3: Navigate through pages and count
            let currentPage = 1;
            let canGoNext = true;
            
            while (canGoNext) {
              const nextButton = this.page.getByRole('button', { name: 'Next' });
              const isNextEnabled = await nextButton.isEnabled().catch(() => false);
              
              if (isNextEnabled) {
                // Store first row data before clicking
                const beforeRows = await this.page.locator('table tbody tr td:first-child').allTextContents();
                
                await nextButton.click();
                await this.page.waitForLoadState('networkidle');
                await this.page.waitForTimeout(1000);
                
                // Check if rows changed
                const afterRows = await this.page.locator('table tbody tr td:first-child').allTextContents();
                
                // If rows changed, we navigated successfully
                if (JSON.stringify(beforeRows) !== JSON.stringify(afterRows)) {
                  currentPage++;
                  actualPages = currentPage;
                } else {
                  canGoNext = false;
                }
              } else {
                canGoNext = false;
              }
            }
          }
        }

        // Validate row count (should not exceed the selected page size)
        const rowCountValid = rows <= parseInt(optionValue);
        
        // Validate page count
        const pageCountValid = actualPages === expectedPages;
        
        // Total records should be greater than 0
        const hasRecords = totalRecords > 0;
        
        const testPassed = pageCountValid && rowCountValid && hasRecords;
        if (!testPassed) allTestsPassed = false;

        // Report results
        Reporter.validateData(
          expectedPages,
          actualPages,
          `Show: ${optionValue} - Page count (Expected ${expectedPages}, Got ${actualPages})`,
          testInfo
        );

        Reporter.validateData(
          true,
          rowCountValid,
          `Show: ${optionValue} - Row validation (${rows} <= ${optionValue})`,
          testInfo
        );

        Reporter.validateData(
          true,
          hasRecords,
          `Show: ${optionValue} - Total records > 0 (${totalRecords} records)`,
          testInfo
        );

        // Summary for this option
        console.log(`
--------------------------------------------------
SHOW VALUE     : ${optionValue}
TOTAL RECORDS  : ${totalRecords}
ROWS DISPLAYED : ${rows}
EXPECTED PAGES : ${expectedPages}
ACTUAL PAGES   : ${actualPages}
STATUS         : ${testPassed ? 'PASS ✅' : 'FAIL ❌'}
--------------------------------------------------
`);
      });
    }

    // Final summary
    Reporter.validateData(
      true,
      allTestsPassed,
      'SUMMARY - Reseller Pagination Verification',
      testInfo
    );

    const summary = Reporter.endTest(testInfo);
    console.log(`\n📊 Reseller Pagination Completed - Pass Rate: ${summary.passRate}`);
    
    return allTestsPassed;
  }
}