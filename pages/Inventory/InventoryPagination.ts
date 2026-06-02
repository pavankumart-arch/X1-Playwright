import { Page, TestInfo } from '@playwright/test';
import { Reporter } from '../../pages/utils/NewReport';

export class InventoryPagination {
  readonly page: Page;
  private testInfo: TestInfo;

  constructor(page: Page, testInfo: TestInfo) {
    this.page = page;
    this.testInfo = testInfo;
    this.setupNetworkLogging();
  }

  // Setup network logging to debug API calls
  private setupNetworkLogging() {
    this.page.on('response', response => {
      if (response.url().includes('vehicle_detail') || response.url().includes('inventory')) {
        console.log(`📡 API URL: ${response.url()}`);
        console.log(`📊 Status: ${response.status()}`);
      }
    });
  }

  async verifyInventoryPagination() {
    const dropdown = this.page.locator('select');
    const options = ['10', '20', '50', '100'];
    let allResultsValid = true;

    for (const optionValue of options) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`📋 TESTING PAGE SIZE: ${optionValue}`);
      console.log(`${'='.repeat(80)}`);
      
      try {
        // Select page size
        await dropdown.selectOption(optionValue);
        console.log(`✅ Selected page size: ${optionValue}`);
        
        // Wait for table to update after page size change
        await this.page.waitForTimeout(1000);
        await this.waitForTableToLoad();
        
        const totalRecords = await this.getTotalRecords();
        const expectedPages = Math.ceil(totalRecords / parseInt(optionValue));
        
        console.log(`📊 Total Records: ${totalRecords}`);
        console.log(`📄 Expected Pages: ${expectedPages}`);
        
        // Test navigation to page 2
        console.log(`\n📍 Testing navigation from Page 1 to Page 2`);
        
        const rowsOnPage1 = await this.page.locator('table tbody tr').count();
        console.log(`📊 Rows on Page 1: ${rowsOnPage1}`);
        
        // Try to navigate to page 2
        const navigated = await this.navigateToPage(2);
        
        if (navigated) {
          console.log(`✅ Successfully navigated to Page 2`);
          
          // Wait for table to load on page 2
          await this.waitForTableToLoad();
          const rowsOnPage2 = await this.page.locator('table tbody tr').count();
          console.log(`📊 Rows on Page 2: ${rowsOnPage2}`);
          
          // Validate pagination
          Reporter.validatePagination(2, expectedPages, rowsOnPage2, totalRecords, this.testInfo);
          Reporter.validatePageNavigation(1, 2, true, this.testInfo);
          
          // Navigate back to page 1
          await this.navigateToPage(1);
          console.log(`✅ Navigated back to Page 1`);
        } else {
          console.log(`❌ Failed to navigate to Page 2`);
          Reporter.validatePageNavigation(1, 2, false, this.testInfo);
          allResultsValid = false;
        }
        
        const rowsDisplayed = await this.page.locator('table tbody tr').count();
        const rowValidation = rowsDisplayed === parseInt(optionValue) || rowsDisplayed === totalRecords;
        
        console.log(`
${'─'.repeat(60)}
📋 PAGE SIZE     : ${optionValue}
📊 TOTAL RECORDS : ${totalRecords}
📄 TOTAL PAGES   : ${expectedPages}
🔀 NAVIGATION    : ${navigated ? 'Working ✅' : 'Failed ❌'}
📈 ROWS DISPLAYED: ${rowsDisplayed} (Expected: ${optionValue})
🎯 FINAL STATUS  : ${navigated && rowValidation ? 'PASS ✅' : 'FAIL ❌'}
${'─'.repeat(60)}
`);
        
        if (!navigated || !rowValidation) allResultsValid = false;
      } catch (error) {
        console.error(`❌ Error testing page size ${optionValue}:`, error);
        allResultsValid = false;
      }
    }
    
    console.log(`
${'='.repeat(80)}
✅ INVENTORY PAGINATION VALIDATION COMPLETED
${'='.repeat(80)}
Overall Status: ${allResultsValid ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}
${'='.repeat(80)}
`);
    
    return allResultsValid;
  }

  // Wait for table to load with specific waits instead of networkidle
  private async waitForTableToLoad(): Promise<void> {
    try {
      // Wait for table body to be visible
      await this.page.locator('table tbody').waitFor({ state: 'visible', timeout: 15000 });
      
      // Wait for at least one row to appear
      await this.page.locator('table tbody tr').first().waitFor({ state: 'visible', timeout: 15000 });
      
      // Additional wait for stability
      await this.page.waitForTimeout(500);
    } catch (error) {
      console.warn(`⚠️ Warning waiting for table to load:`, error);
    }
  }

  // Navigate to a specific page number
  async navigateToPage(pageNumber: number): Promise<boolean> {
    console.log(`��� Attempting to navigate to page ${pageNumber}...`);
    
    try {
      const currentPage = await this.getCurrentPageFromUrl();
      console.log(`📍 Current page from URL: ${currentPage}`);
      
      // Method 1: Try to find and click the page number button
      const pageButton = this.page.locator(`li:has-text("${pageNumber}"), button:has-text("${pageNumber}")`).first();
      const isVisible = await pageButton.isVisible().catch(() => false);
      
      if (isVisible) {
        const isEnabled = await pageButton.isEnabled().catch(() => false);
        if (isEnabled) {
          console.log(`✅ Found page ${pageNumber} button`);
          await pageButton.click();
          
          // Wait for table to update instead of networkidle
          await this.page.waitForTimeout(1500);
          await this.waitForTableToLoad();
          
          // Verify we're on the correct page by checking URL
          const newPage = await this.getCurrentPageFromUrl();
          if (newPage === pageNumber) {
            console.log(`✅ Successfully navigated to page ${pageNumber} (verified by URL)`);
            return true;
          } else {
            console.log(`⚠️ URL shows page ${newPage}, expected ${pageNumber}`);
          }
        }
      }
      
      // Method 2: Use Next/Previous buttons
      if (pageNumber > 1 && currentPage < pageNumber) {
        console.log(`🔄 Using Next button to reach page ${pageNumber}...`);
        let currentPageNum = currentPage;
        let maxAttempts = (pageNumber - currentPageNum) * 3;
        let attempts = 0;
        
        while (currentPageNum < pageNumber && attempts < maxAttempts) {
          const clicked = await this.clickNextButton();
          if (!clicked) {
            console.log(`❌ Could not click Next button`);
            break;
          }
          await this.page.waitForTimeout(1500);
          currentPageNum = await this.getCurrentPageFromUrl();
          attempts++;
          console.log(`📍 Current page: ${currentPageNum} (attempt ${attempts}/${maxAttempts})`);
        }
        
        if (currentPageNum === pageNumber) {
          console.log(`✅ Successfully navigated to page ${pageNumber} using Next button`);
          return true;
        }
      } else if (pageNumber < currentPage) {
        console.log(`🔄 Using Previous button to reach page ${pageNumber}...`);
        let currentPageNum = currentPage;
        let maxAttempts = (currentPageNum - pageNumber) * 3;
        let attempts = 0;
        
        while (currentPageNum > pageNumber && attempts < maxAttempts) {
          const clicked = await this.clickPreviousButton();
          if (!clicked) {
            console.log(`❌ Could not click Previous button`);
            break;
          }
          await this.page.waitForTimeout(1500);
          currentPageNum = await this.getCurrentPageFromUrl();
          attempts++;
          console.log(`📍 Current page: ${currentPageNum} (attempt ${attempts}/${maxAttempts})`);
        }
        
        if (currentPageNum === pageNumber) {
          console.log(`✅ Successfully navigated to page ${pageNumber} using Previous button`);
          return true;
        }
      }
      
      // Method 3: Use URL parameter directly (as fallback)
      console.log(`🔄 Trying URL parameter method...`);
      const currentUrl = this.page.url();
      let newUrl = currentUrl;
      
      // Get current page size
      const dropdown = this.page.locator('select');
      const pageSize = await dropdown.inputValue().catch(() => '10');
      
      if (currentUrl.includes('?')) {
        if (currentUrl.includes('page=')) {
          newUrl = currentUrl.replace(/page=\d+/, `page=${pageNumber}`);
        } else {
          newUrl = currentUrl + `&page=${pageNumber}`;
        }
      } else {
        newUrl = currentUrl + `?page=${pageNumber}`;
      }
      
      console.log(`📍 Navigating to: ${newUrl}`);
      await this.page.goto(newUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      
      // Wait for table to load after navigation
      await this.page.waitForTimeout(1000);
      await this.waitForTableToLoad();
      
      const finalPage = await this.getCurrentPageFromUrl();
      if (finalPage === pageNumber) {
        console.log(`✅ Successfully navigated to page ${pageNumber} using URL method`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`❌ Error navigating to page ${pageNumber}:`, error);
      return false;
    }
  }

  async clickNextButton(): Promise<boolean> {
    const nextSelectors = [
      'li:last-child button',
      'button:has-text("»")',
      'button:has-text("Next")',
      '.pagination li:last-child button',
      'a:has-text("»")',
      '[aria-label*="Next"]'
    ];
    
    for (const selector of nextSelectors) {
      const nextButton = this.page.locator(selector).first();
      const isVisible = await nextButton.isVisible().catch(() => false);
      const isEnabled = isVisible ? await nextButton.isEnabled().catch(() => false) : false;
      
      if (isVisible && isEnabled) {
        console.log(`✅ Clicking Next button: ${selector}`);
        await nextButton.click();
        await this.page.waitForTimeout(1000);
        return true;
      }
    }
    
    console.log(`❌ Next button not found or disabled`);
    return false;
  }

  async clickPreviousButton(): Promise<boolean> {
    const prevSelectors = [
      'li:first-child button',
      'button:has-text("«")',
      'button:has-text("Previous")',
      '.pagination li:first-child button',
      'a:has-text("«")',
      '[aria-label*="Previous"]'
    ];
    
    for (const selector of prevSelectors) {
      const prevButton = this.page.locator(selector).first();
      const isVisible = await prevButton.isVisible().catch(() => false);
      const isEnabled = isVisible ? await prevButton.isEnabled().catch(() => false) : false;
      
      if (isVisible && isEnabled) {
        console.log(`✅ Clicking Previous button: ${selector}`);
        await prevButton.click();
        await this.page.waitForTimeout(1000);
        return true;
      }
    }
    
    console.log(`❌ Previous button not found or disabled`);
    return false;
  }

  async getCurrentPageFromUrl(): Promise<number> {
    const url = this.page.url();
    const pageMatch = url.match(/[?&]page=(\d+)/);
    if (pageMatch) {
      return parseInt(pageMatch[1]);
    }
    return 1;
  }

  async verifySpecificPageNavigation(pageNumber: number): Promise<boolean> {
    console.log(`\n📄 Testing navigation to page ${pageNumber}`);
    const result = await this.navigateToPage(pageNumber);
    console.log(`${result ? '✅' : '❌'} Navigation to page ${pageNumber}: ${result ? 'Successful' : 'Failed'}`);
    return result;
  }
  
  async verifyFirstAndLastPageNavigation(): Promise<{ firstPageNavWorking: boolean; lastPageNavWorking: boolean }> {
    console.log(`\n📄 Testing First and Last Page Navigation`);
    
    let firstPageNavWorking = false;
    let lastPageNavWorking = false;
    
    try {
      const totalRecords = await this.getTotalRecords();
      const dropdown = this.page.locator('select');
      const pageSize = await dropdown.inputValue().catch(() => '10');
      const totalPages = Math.ceil(totalRecords / parseInt(pageSize));
      
      console.log(`📄 Total pages: ${totalPages}`);
      
      if (totalPages > 1) {
        // Navigate to last page
        console.log(`📍 Attempting to navigate to last page (${totalPages})...`);
        lastPageNavWorking = await this.navigateToPage(totalPages);
        console.log(`Last page navigation: ${lastPageNavWorking ? '✅' : '❌'}`);
        
        // Navigate to first page
        console.log(`📍 Attempting to navigate to first page (1)...`);
        firstPageNavWorking = await this.navigateToPage(1);
        console.log(`First page navigation: ${firstPageNavWorking ? '✅' : '❌'}`);
      }
    } catch (error) {
      console.error(`❌ Error in verifyFirstAndLastPageNavigation:`, error);
    }
    
    return { firstPageNavWorking, lastPageNavWorking };
  }
  
  async getTotalRecords(): Promise<number> {
    try {
      // Try different selectors for pagination text
      const selectors = [
        'text=/Showing \\d+-\\d+ of \\d+/',
        'text=/of \\d+/',
        '.pagination-info',
        '[class*="pagination"]'
      ];
      
      for (const selector of selectors) {
        const element = this.page.locator(selector).first();
        const isVisible = await element.isVisible().catch(() => false);
        
        if (isVisible) {
          const text = await element.textContent().catch(() => '');
          const totalMatch = text?.match(/of (\d+)/);
          if (totalMatch) {
            return Number(totalMatch[1]);
          }
        }
      }
      
      console.log(`⚠️ Could not find total records text`);
      return 0;
    } catch (error) {
      console.log(`⚠️ Error getting total records: ${error}`);
      return 0;
    }
  }
}
