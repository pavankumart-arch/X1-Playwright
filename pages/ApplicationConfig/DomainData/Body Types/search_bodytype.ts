import {
  Page,
  Locator,
  TestInfo
} from '@playwright/test';

import { logAndValidate } from '../../../../utils/reportUtil';

export class BodyTypeSearch {

  page: Page;
  searchInput: Locator;
  noDataMessage: Locator;
  nextButton: Locator;
  previousButton: Locator;

  private readonly tableRowsSelector = 'table tbody tr';
  private readonly nextButtonSelector = 'button:has-text("Next")';
  private readonly previousButtonSelector = 'button:has-text("Previous")';

  // Configuration for timeouts - easy to tune
  private readonly WAIT_TIMEOUTS = {
    SEARCH_WAIT: 1000,        // Reduced from 2000ms
    RESET_WAIT: 800,          // Reduced from 1500ms
    PAGE_NAVIGATION: 800,     // Reduced from 1500ms
    FIRST_PAGE_NAV: 500,      // Reduced from 1000ms
    TABLE_UPDATE: 1000,       // Wait for table to update after search
    ELEMENT_VISIBLE: 5000,    // Max time to wait for element visibility
    ELEMENT_CHECK: 500,       // Quick check for elements
  };

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.locator('input.table-search__input');
    this.noDataMessage = page.locator('td.table-body__cell--empty p');
    this.nextButton = page.locator(this.nextButtonSelector);
    this.previousButton = page.locator(this.previousButtonSelector);
  }

  // =====================================================
  // BROWSER CONTEXT CHECK
  // =====================================================

  private async isBrowserContextValid(): Promise<boolean> {
    try {
      // Check if page is still accessible
      await this.page.evaluate(() => document.title);
      return true;
    } catch (error) {
      console.log("⚠️ Browser context lost or page closed");
      return false;
    }
  }

  // =====================================================
  // SEARCH
  // =====================================================

  async performSearch(value: string): Promise<void> {
    try {
      // Check browser context before performing search
      if (!await this.isBrowserContextValid()) {
        console.log("❌ Cannot perform search - browser context invalid");
        return;
      }

      await this.searchInput.waitFor({
        state: 'visible',
        timeout: this.WAIT_TIMEOUTS.ELEMENT_VISIBLE
      });

      await this.searchInput.fill('');
      await this.searchInput.fill(value);
      await this.searchInput.press('Enter');
      
      // Reduced wait time
      await this.page.waitForTimeout(this.WAIT_TIMEOUTS.SEARCH_WAIT);
    } catch (error: any) {
      console.log(`⚠️ Perform search failed: ${error.message}`);
      throw error;
    }
  }

  // =====================================================
  // RESET SEARCH
  // =====================================================

  async resetSearch(): Promise<void> {
    try {
      if (!await this.isBrowserContextValid()) {
        return;
      }

      await this.searchInput.fill('');
      await this.searchInput.press('Enter');
      await this.page.waitForTimeout(this.WAIT_TIMEOUTS.RESET_WAIT);
    } catch (error: any) {
      console.log(`⚠️ Reset search failed: ${error.message}`);
    }
  }

  // =====================================================
  // GO TO FIRST PAGE
  // =====================================================

  async goToFirstPage(): Promise<void> {
    try {
      if (!await this.isBrowserContextValid()) {
        return;
      }

      let maxAttempts = 10;
      let attempts = 0;

      while (attempts < maxAttempts) {
        attempts++;
        
        const isVisible = await this.previousButton
          .isVisible({ timeout: this.WAIT_TIMEOUTS.ELEMENT_CHECK })
          .catch(() => false);

        if (!isVisible) break;

        const isDisabled = await this.previousButton
          .isDisabled()
          .catch(() => true);

        if (isDisabled) break;

        await this.previousButton.click();
        await this.page.waitForTimeout(this.WAIT_TIMEOUTS.FIRST_PAGE_NAV);
      }
    } catch (error) {
      // Ignore pagination issues
      console.log("⚠️ Pagination navigation issue");
    }
  }

  // =====================================================
  // GET TABLE ROWS
  // =====================================================

  private getRows(): Locator {
    return this.page.locator(this.tableRowsSelector);
  }

  // =====================================================
  // SEARCH AND FIND RECORD (OPTIMIZED)
  // =====================================================

  private async searchAndFindRecord(
    searchValue: string,
    columnIndex: number
  ): Promise<boolean> {
    try {
      // Check browser context
      if (!await this.isBrowserContextValid()) {
        console.log(`❌ Browser context invalid for search: ${searchValue}`);
        return false;
      }

      await this.performSearch(searchValue);

      // Wait for table to update
      await this.page.waitForTimeout(this.WAIT_TIMEOUTS.TABLE_UPDATE);

      let currentPage = 1;
      const maxPages = 50;

      while (currentPage <= maxPages) {
        // Check browser context on each iteration
        if (!await this.isBrowserContextValid()) {
          console.log(`❌ Browser context lost during search: ${searchValue}`);
          return false;
        }

        // Quick check for no data message
        const isNoData = await this.noDataMessage
          .isVisible({ timeout: this.WAIT_TIMEOUTS.ELEMENT_CHECK })
          .catch(() => false);

        if (isNoData) {
          console.log(`❌ No results found for ${searchValue}`);
          return false;
        }

        const rows = this.getRows();
        const rowCount = await rows.count();

        if (rowCount === 0) {
          console.log(`❌ No results found for ${searchValue}`);
          return false;
        }

        // Search through current page rows
        for (let i = 0; i < rowCount; i++) {
          const cell = rows.nth(i).locator('td').nth(columnIndex);
          const text = (await cell.textContent())?.trim() || '';

          if (text.toLowerCase().includes(searchValue.toLowerCase())) {
            console.log(`✅ Record found: ${searchValue}`);
            return true;
          }
        }

        // Check for next page with quick timeout
        const isNextVisible = await this.nextButton
          .isVisible({ timeout: this.WAIT_TIMEOUTS.ELEMENT_CHECK })
          .catch(() => false);

        if (!isNextVisible) break;

        const isNextDisabled = await this.nextButton
          .isDisabled()
          .catch(() => true);

        if (isNextDisabled) break;

        // Navigate to next page
        await this.nextButton.click();
        await this.page.waitForTimeout(this.WAIT_TIMEOUTS.PAGE_NAVIGATION);
        currentPage++;
      }

      return false;

    } catch (error: any) {
      console.log(`⚠️ Search failed for ${searchValue}: ${error.message}`);
      return false;
    }
  }

  // =====================================================
  // COMMON SEARCH VALIDATION (OPTIMIZED)
  // =====================================================

  private async searchAndValidate(
    columnIndex: number,
    fieldName: string,
    testInfo: TestInfo
  ): Promise<boolean> {
    try {
      // Check browser context
      if (!await this.isBrowserContextValid()) {
        logAndValidate(
          {
            step: `Search by ${fieldName}`,
            expected: 'Search Results Found',
            actual: 'Browser Context Lost'
          },
          testInfo
        );
        return false;
      }

      await this.goToFirstPage();

      const rows = this.getRows();
      const count = await rows.count();

      if (count === 0) {
        logAndValidate(
          {
            step: `Search by ${fieldName}`,
            expected: 'Search Results Found',
            actual: 'No Data Available'
          },
          testInfo
        );
        return false;
      }

      const value = (
        await rows
          .first()
          .locator('td')
          .nth(columnIndex)
          .textContent()
      )?.trim();

      if (!value) {
        logAndValidate(
          {
            step: `Search by ${fieldName}`,
            expected: 'Search Results Found',
            actual: 'No Value Found'
          },
          testInfo
        );
        return false;
      }

      console.log(`🔍 Searching ${fieldName}: ${value}`);

      const found = await this.searchAndFindRecord(value, columnIndex);

      const actual = found ? 'Search Results Found' : 'No Data Found';

      logAndValidate(
        {
          step: `Search by ${fieldName}`,
          expected: 'Search Results Found',
          actual
        },
        testInfo
      );

      await this.resetSearch();

      return found;

    } catch (error: any) {
      // Don't let errors crash the test - log and continue
      const errorMessage = error.message || 'Unknown error';
      console.log(`⚠️ Error in ${fieldName} search: ${errorMessage}`);
      
      logAndValidate(
        {
          step: `Search by ${fieldName}`,
          expected: 'Search Results Found',
          actual: `Error: ${errorMessage}`
        },
        testInfo
      );
      
      // Try to reset search to clean up
      try {
        await this.resetSearch();
      } catch (resetError) {
        // Ignore reset errors
      }
      
      return false;
    }
  }

  // =====================================================
  // SEARCH BY ID
  // =====================================================

  async searchByID(testInfo: TestInfo): Promise<boolean> {
    return await this.searchAndValidate(0, 'ID', testInfo);
  }

  // =====================================================
  // SEARCH BY BODY TYPE
  // =====================================================

  async searchByBodyType(testInfo: TestInfo): Promise<boolean> {
    return await this.searchAndValidate(1, 'Body Type', testInfo);
  }

  // =====================================================
  // SEARCH BY CREATED DATE
  // =====================================================

  async searchByCreatedDate(testInfo: TestInfo): Promise<boolean> {
    return await this.searchAndValidate(2, 'Created', testInfo);
  }

  // =====================================================
  // SEARCH BY UPDATED DATE
  // =====================================================

  async searchByUpdatedDate(testInfo: TestInfo): Promise<boolean> {
    return await this.searchAndValidate(3, 'Updated', testInfo);
  }

  // =====================================================
  // SEARCH BY STATUS (OPTIMIZED)
  // =====================================================

  async searchByStatus(testInfo: TestInfo): Promise<boolean> {
    try {
      if (!await this.isBrowserContextValid()) {
        logAndValidate(
          {
            step: 'Search by Status',
            expected: 'Search Results Found',
            actual: 'Browser Context Lost'
          },
          testInfo
        );
        return false;
      }

      const statuses = ['Active', 'Inactive'];
      let anyStatusFound = false;

      for (const status of statuses) {
        // Check browser context before each search
        if (!await this.isBrowserContextValid()) {
          console.log(`⚠️ Browser context lost while searching status: ${status}`);
          break;
        }

        console.log(`🔍 Searching Status: ${status}`);

        const found = await this.searchAndFindRecord(status, 4);

        const actual = found ? 'Search Results Found' : 'No Data Found';

        logAndValidate(
          {
            step: `Search Status: ${status}`,
            expected: 'Search Results Found',
            actual
          },
          testInfo
        );

        await this.resetSearch();

        if (found) {
          anyStatusFound = true;
        }
      }

      return anyStatusFound;

    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error';
      console.log(`⚠️ Status search error: ${errorMessage}`);
      
      logAndValidate(
        {
          step: 'Search by Status',
          expected: 'Search Results Found',
          actual: `Error: ${errorMessage}`
        },
        testInfo
      );
      
      try {
        await this.resetSearch();
      } catch (resetError) {
        // Ignore reset errors
      }
      
      return false;
    }
  }

  // =====================================================
  // INVALID SEARCH (OPTIMIZED)
  // =====================================================

  async invalidBodyTypeSearch(testInfo: TestInfo): Promise<boolean> {
    try {
      if (!await this.isBrowserContextValid()) {
        logAndValidate(
          {
            step: 'Invalid Body Type Search',
            expected: 'No Data Found',
            actual: 'Browser Context Lost'
          },
          testInfo
        );
        return false;
      }

      const invalidData = 'invalid_bodytype_123456';

      await this.performSearch(invalidData);
      await this.page.waitForTimeout(this.WAIT_TIMEOUTS.TABLE_UPDATE);

      // Quick check for no data message
      const isNoData = await this.noDataMessage
        .isVisible({ timeout: this.WAIT_TIMEOUTS.ELEMENT_CHECK })
        .catch(() => false);

      const rows = await this.getRows().count();

      const actual = rows === 0 || isNoData ? 'No Data Found' : 'Data Found';

      logAndValidate(
        {
          step: 'Invalid Body Type Search',
          expected: 'No Data Found',
          actual
        },
        testInfo
      );

      await this.resetSearch();

      return actual === 'No Data Found';

    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error';
      console.log(`⚠️ Invalid search error: ${errorMessage}`);
      
      logAndValidate(
        {
          step: 'Invalid Body Type Search',
          expected: 'No Data Found',
          actual: `Error: ${errorMessage}`
        },
        testInfo
      );
      
      try {
        await this.resetSearch();
      } catch (resetError) {
        // Ignore reset errors
      }
      
      return false;
    }
  }

  // =====================================================
  // VERIFY ALL SEARCH SCENARIOS (OPTIMIZED)
  // =====================================================

  public async verifyBodyTypeSearch(testInfo: TestInfo): Promise<void> {
    console.log("\n====================================");
    console.log("BODY TYPE SEARCH VALIDATION STARTED");
    console.log("====================================\n");

    // Execute searches sequentially with proper error handling
    // Each search handles its own errors and won't crash the test
    const searches = [
      { name: 'ID', fn: () => this.searchByID(testInfo) },
      { name: 'Body Type', fn: () => this.searchByBodyType(testInfo) },
      { name: 'Created Date', fn: () => this.searchByCreatedDate(testInfo) },
      { name: 'Updated Date', fn: () => this.searchByUpdatedDate(testInfo) },
      { name: 'Status', fn: () => this.searchByStatus(testInfo) },
      { name: 'Invalid Search', fn: () => this.invalidBodyTypeSearch(testInfo) }
    ];

    for (const search of searches) {
      if (!await this.isBrowserContextValid()) {
        console.log(`⚠️ Browser context lost, stopping further searches`);
        break;
      }
      
      try {
        await search.fn();
      } catch (error: any) {
        console.log(`⚠️ Search "${search.name}" failed with error: ${error.message}`);
        // Continue with next search
      }
    }

    console.log("\n====================================");
    console.log("BODY TYPE SEARCH VALIDATION COMPLETED");
    console.log("====================================\n");
  }
}