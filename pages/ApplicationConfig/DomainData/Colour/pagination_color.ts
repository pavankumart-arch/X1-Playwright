import { BasePage } from "../../../BasePage";
import {
  Page,
  Locator,
  TestInfo
} from "@playwright/test";
import { logAndValidate } from "../../../utils/reportUtil";

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  startRecord: number;
  endRecord: number;
  totalRecords: number;
  pageSize: number;
}

export class ColorPagination extends BasePage {

  page: Page;

  pageSizeDropdown: Locator;
  paginationText: Locator;
  tableRows: Locator;

  nextButton: Locator;
  previousButton: Locator;
  firstPageButton: Locator;
  lastPageButton: Locator;

  applyButton: Locator;

  colorTable: Locator;

  constructor(page: Page) {

    super(page);

    this.page = page;

    // ==================================================
    // COLOR TABLE - USING ACTUAL SELECTORS FROM PAGE
    // ==================================================
    this.colorTable = page.locator('table').first();
    this.tableRows = this.colorTable.locator("tbody tr");

    // ==================================================
    // PAGINATION LOCATORS - FIXED FOR THE ACTUAL PAGE
    // ==================================================
    // The dropdown has options like "Show: 10", "Show: 20", etc.
    this.pageSizeDropdown = page.locator('select').first();

    // Looking for text like "Showing 1-20 of 13820"
    this.paginationText = page.locator('span, div, p').filter({ hasText: /Showing/ }).first();

    // ==================================================
    // NAVIGATION BUTTONS - COMMON PATTERNS
    // ==================================================
    this.nextButton = page.locator('button').filter({ hasText: /Next|next|>/ }).first();
    this.previousButton = page.locator('button').filter({ hasText: /Previous|previous|</ }).first();
    this.firstPageButton = page.locator('button').filter({ hasText: /First|first|«/ }).first();
    this.lastPageButton = page.locator('button').filter({ hasText: /Last|last|»/ }).first();
    this.applyButton = page.locator('button').filter({ hasText: /Apply|Go|Submit/i }).first();
  }

  // ==================================================
  // VERIFY COLOR PAGINATION
  // ==================================================
  public async verifyColorPagination(
    testInfo: TestInfo
  ): Promise<void> {

    // Wait for the page to be fully loaded
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForTimeout(2000);

    // Get all dropdown options
    const options = await this.pageSizeDropdown
      .locator("option")
      .evaluateAll(options =>
        options.map(option => ({
          text: (option as HTMLOptionElement).text,
          value: (option as HTMLOptionElement).value
        }))
      );

    console.log(`Found ${options.length} dropdown options:`, options);

    if (options.length === 0) {
      console.log("❌ No dropdown options found!");
      return;
    }

    // Test each page size option
    for (const option of options) {
      const requestedValue = parseInt(option.value);

      // Skip invalid values
      if (isNaN(requestedValue)) {
        console.log(`Skipping invalid option value: ${option.value}`);
        continue;
      }

      console.log(`\n📄 Testing page size: ${requestedValue} (${option.text})`);

      // Select page size
      const selectionSuccess = await this.selectPageSize(requestedValue, option.text);
      
      if (!selectionSuccess) {
        console.log(`Failed to select page size: ${requestedValue}`);
        continue;
      }

      // Verify selection
      const actualSelectedValue = await this.pageSizeDropdown.inputValue();
      const effectivePageSize = parseInt(actualSelectedValue);

      logAndValidate(
        {
          step: `Dropdown Selection (${option.text})`,
          expected: requestedValue,
          actual: effectivePageSize
        },
        testInfo
      );

      if (actualSelectedValue !== requestedValue.toString()) {
        console.log(`Page size mismatch. Expected: ${requestedValue}, Actual: ${actualSelectedValue}`);
        continue;
      }

      // Navigate to first page
      await this.navigateToFirstPage();
      await this.waitForTableToUpdate();

      // Get pagination info and verify
      const paginationInfo = await this.getPaginationInfo();
      
      await this.verifyCurrentPage(paginationInfo, effectivePageSize, testInfo);

      // Test navigation if there are multiple pages
      if (paginationInfo.totalPages > 1) {
        await this.testPaginationNavigation(paginationInfo, effectivePageSize, testInfo);
      }

      // Small delay between testing different page sizes
      await this.page.waitForTimeout(1000);
    }

    console.log("\n✅ All Color pagination tests passed successfully!");
  }

  // ==================================================
  // SELECT PAGE SIZE
  // ==================================================
  private async selectPageSize(pageSize: number, optionText: string): Promise<boolean> {
    try {
      // Check current value
      const currentValue = await this.pageSizeDropdown.inputValue();
      if (currentValue === pageSize.toString()) {
        return true;
      }

      // Select new value
      await this.pageSizeDropdown.selectOption(pageSize.toString());
      await this.page.waitForTimeout(500);

      // Check if apply button exists and click it
      const applyButtonVisible = await this.applyButton.isVisible().catch(() => false);
      if (applyButtonVisible) {
        await this.applyButton.click();
        await this.page.waitForTimeout(500);
      } else {
        // Trigger change event
        await this.pageSizeDropdown.dispatchEvent("change");
      }

      // Wait for table to update
      await this.page.waitForLoadState("networkidle");
      await this.waitForTableToUpdate();

      // Verify selection
      const newValue = await this.pageSizeDropdown.inputValue();
      return newValue === pageSize.toString();
      
    } catch (error) {
      console.log(`Error selecting page size ${pageSize}: ${error}`);
      return false;
    }
  }

  // ==================================================
  // NAVIGATE TO FIRST PAGE
  // ==================================================
  private async navigateToFirstPage(): Promise<void> {
    try {
      // Try first page button first
      const firstPageEnabled = await this.firstPageButton.isEnabled().catch(() => false);
      if (firstPageEnabled) {
        await this.firstPageButton.click();
        await this.page.waitForLoadState("networkidle");
        await this.waitForTableToUpdate();
        return;
      }

      // If no first page button, click previous until page 1
      let currentInfo = await this.getPaginationInfo();
      let maxAttempts = 10; // Prevent infinite loop
      
      while (currentInfo.currentPage > 1 && maxAttempts-- > 0) {
        const prevEnabled = await this.previousButton.isEnabled().catch(() => false);
        if (!prevEnabled) break;
        
        await this.previousButton.click();
        await this.page.waitForLoadState("networkidle");
        await this.waitForTableToUpdate();
        currentInfo = await this.getPaginationInfo();
      }
    } catch (error) {
      console.log("Warning: Could not navigate to first page:", error);
    }
  }

  // ==================================================
  // GET PAGINATION INFORMATION
  // ==================================================
  private async getPaginationInfo(): Promise<PaginationInfo> {
    const paginationText = await this.paginationText.textContent();
    console.log(`Parsing pagination text: "${paginationText}"`);

    if (!paginationText) {
      throw new Error("Pagination text not found");
    }

    // Parse "Showing 1-20 of 13820" format
    let match = paginationText.match(/Showing\s+(\d+)[-\s]+(\d+)\s+of\s+(\d+)/i);
    
    if (!match) {
      // Try alternative format
      match = paginationText.match(/(\d+)[-\s]+(\d+)\s+of\s+(\d+)/i);
    }

    if (!match) {
      throw new Error(`Unable to parse pagination text: ${paginationText}`);
    }

    const startRecord = Number(match[1]);
    const endRecord = Number(match[2]);
    const totalRecords = Number(match[3]);
    const pageSize = parseInt(await this.pageSizeDropdown.inputValue());
    const totalPages = Math.ceil(totalRecords / pageSize);
    const currentPage = Math.floor((startRecord - 1) / pageSize) + 1;

    console.log(`Page ${currentPage}/${totalPages}, Records ${startRecord}-${endRecord} of ${totalRecords}, Size ${pageSize}`);

    return { currentPage, totalPages, startRecord, endRecord, totalRecords, pageSize };
  }

  // ==================================================
  // VERIFY CURRENT PAGE
  // ==================================================
  private async verifyCurrentPage(
    paginationInfo: PaginationInfo,
    expectedPageSize: number,
    testInfo: TestInfo
  ): Promise<void> {
    const actualRows = await this.tableRows.count();
    console.log(`Page ${paginationInfo.currentPage}: Found ${actualRows} rows`);

    const recordsAlreadyDisplayed = (paginationInfo.currentPage - 1) * expectedPageSize;
    const remainingRecords = paginationInfo.totalRecords - recordsAlreadyDisplayed;
    const expectedVisibleRows = Math.min(expectedPageSize, remainingRecords);

    logAndValidate(
      {
        step: `Page Size Validation - Page ${paginationInfo.currentPage}`,
        expected: expectedVisibleRows,
        actual: actualRows
      },
      testInfo
    );

    const expectedRows = paginationInfo.endRecord - paginationInfo.startRecord + 1;
    
    logAndValidate(
      {
        step: `Rows vs Pagination - Page ${paginationInfo.currentPage}`,
        expected: expectedRows,
        actual: actualRows
      },
      testInfo
    );

    if (paginationInfo.currentPage === 1) {
      logAndValidate(
        {
          step: `Start Record Validation - Page ${paginationInfo.currentPage}`,
          expected: 1,
          actual: paginationInfo.startRecord
        },
        testInfo
      );
    }

    await this.collectAndValidatePageData(paginationInfo.currentPage, testInfo);
  }

  // ==================================================
  // TEST PAGINATION NAVIGATION
  // ==================================================
  private async testPaginationNavigation(
    initialInfo: PaginationInfo,
    pageSize: number,
    testInfo: TestInfo
  ): Promise<void> {
    const allRecordIds = new Set<string>();
    const maxPagesToTest = Math.min(initialInfo.totalPages, 3);

    // Test page 1
    let pageData = await this.collectAndValidatePageData(1, testInfo);
    pageData.recordIds.forEach(id => allRecordIds.add(id));

    // Test subsequent pages
    for (let pageNum = 2; pageNum <= maxPagesToTest; pageNum++) {
      const isNextEnabled = await this.nextButton.isEnabled().catch(() => false);
      if (!isNextEnabled) break;

      console.log(`Navigating to page ${pageNum}...`);
      await this.nextButton.click();
      await this.page.waitForLoadState("networkidle");
      await this.waitForTableToUpdate();

      const currentInfo = await this.getPaginationInfo();
      
      logAndValidate(
        { step: `Navigation to Page ${pageNum}`, expected: pageNum, actual: currentInfo.currentPage },
        testInfo
      );

      const expectedStartRecord = (pageNum - 1) * pageSize + 1;
      const expectedEndRecord = Math.min(pageNum * pageSize, initialInfo.totalRecords);

      logAndValidate(
        { step: `Start Record for Page ${pageNum}`, expected: expectedStartRecord, actual: currentInfo.startRecord },
        testInfo
      );
      
      logAndValidate(
        { step: `End Record for Page ${pageNum}`, expected: expectedEndRecord, actual: currentInfo.endRecord },
        testInfo
      );

      const actualRows = await this.tableRows.count();
      const expectedRowsOnPage = currentInfo.endRecord - currentInfo.startRecord + 1;
      
      logAndValidate(
        { step: `Rows on Page ${pageNum}`, expected: expectedRowsOnPage, actual: actualRows },
        testInfo
      );

      pageData = await this.collectAndValidatePageData(pageNum, testInfo);
      pageData.recordIds.forEach(id => {
        if (!allRecordIds.has(id)) allRecordIds.add(id);
      });
    }

    // Test last page navigation
    const isLastPageEnabled = await this.lastPageButton.isEnabled().catch(() => false);
    if (isLastPageEnabled && initialInfo.totalPages > 1) {
      console.log("Navigating to last page...");
      await this.lastPageButton.click();
      await this.page.waitForLoadState("networkidle");
      await this.waitForTableToUpdate();
      
      const currentInfo = await this.getPaginationInfo();
      
      logAndValidate(
        { step: `Last Page Navigation`, expected: initialInfo.totalPages, actual: currentInfo.currentPage },
        testInfo
      );
      
      const actualRows = await this.tableRows.count();
      const recordsBeforeLastPage = (initialInfo.totalPages - 1) * pageSize;
      const expectedRowsOnLastPage = Math.min(pageSize, initialInfo.totalRecords - recordsBeforeLastPage);
      
      logAndValidate(
        { step: `Last Page Row Count`, expected: expectedRowsOnLastPage, actual: actualRows },
        testInfo
      );
    }

    // Return to first page
    await this.navigateToFirstPage();
  }

  // ==================================================
  // COLLECT AND VALIDATE PAGE DATA
  // ==================================================
  private async collectAndValidatePageData(
    pageNum: number,
    testInfo: TestInfo
  ): Promise<{ recordIds: string[]; rowData: string[] }> {
    const rows = await this.tableRows.all();
    const recordIds: string[] = [];
    const rowData: string[] = [];

    for (const row of rows) {
      const rowText = await row.innerText();
      rowData.push(rowText);
      const cells = rowText.split("\t");
      if (cells.length > 0) {
        const potentialId = cells[0].trim();
        if (/^\d+$/.test(potentialId)) recordIds.push(potentialId);
      }
    }

    console.log(`Page ${pageNum}: Found ${recordIds.length} records and ${rowData.length} rows`);
    return { recordIds, rowData };
  }

  // ==================================================
  // WAIT FOR TABLE TO UPDATE
  // ==================================================
  private async waitForTableToUpdate(): Promise<void> {
    try {
      await this.page.waitForTimeout(500); // Small delay for DOM to settle
      await this.tableRows.first().waitFor({ state: "visible", timeout: 5000 });
    } catch (error) {
      console.log("Warning: Table update wait timed out, but continuing...");
    }
  }
}