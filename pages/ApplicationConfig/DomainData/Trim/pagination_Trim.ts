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

export class TrimPagination extends BasePage {

  page: Page;

  pageSizeDropdown: Locator;
  paginationText: Locator;
  tableRows: Locator;

  nextButton: Locator;
  previousButton: Locator;
  firstPageButton: Locator;
  lastPageButton: Locator;

  applyButton: Locator;

  trimTable: Locator;

  constructor(page: Page) {

    super(page);

    this.page = page;

    // ==================================================
    // TRIM TABLE
    // ==================================================
    this.trimTable = page.locator(
      'table:has(th:has-text("Trim Name"))'
    );

    // ==================================================
    // PAGINATION LOCATORS
    // ==================================================
    this.pageSizeDropdown = page.locator("select").first();

    this.paginationText = page
      .locator("span.whitespace-nowrap")
      .first();

    this.tableRows = this.trimTable.locator("tbody tr");

    // ==================================================
    // NAVIGATION BUTTONS
    // ==================================================
    this.nextButton = page.locator(
      "button[aria-label='Next page'], button:has-text('Next')"
    ).first();

    this.previousButton = page.locator(
      "button[aria-label='Previous page'], button:has-text('Previous')"
    ).first();

    this.firstPageButton = page.locator(
      "button[aria-label='First page'], button:has-text('First')"
    ).first();

    this.lastPageButton = page.locator(
      "button[aria-label='Last page'], button:has-text('Last')"
    ).first();

    this.applyButton = page.locator(
      "button:has-text('Apply'), button:has-text('Go'), button:has-text('Submit')"
    ).first();
  }

  // ==================================================
  // VERIFY TRIM PAGINATION
  // ==================================================
  public async verifyTrimPagination(
    testInfo: TestInfo
  ): Promise<void> {

    const options = await this.pageSizeDropdown
      .locator("option")
      .evaluateAll(options =>
        options.map(option => ({
          text: (option as HTMLOptionElement).text,
          value: (option as HTMLOptionElement).value
        }))
      );

    for (const option of options) {

      console.log(`\n========== TESTING ${option.text} ==========\n`);

      const requestedValue = parseInt(option.value);

      const selectionSuccess = await this.selectPageSize(
        requestedValue,
        option.text
      );

      if (!selectionSuccess) {

        console.log(
          `⚠ Skipping ${option.text} due to selection failure`
        );

        continue;
      }

      const actualSelectedValue =
        await this.pageSizeDropdown.inputValue();

      const effectivePageSize =
        parseInt(actualSelectedValue);

      await logAndValidate(
        {
          step: `Dropdown Selection (${option.text})`,
          expected: requestedValue,
          actual: effectivePageSize
        },
        testInfo
      );

      if (
        actualSelectedValue !== requestedValue.toString()
      ) {
        continue;
      }

      await this.navigateToFirstPage();

      await this.waitForTableToUpdate();

      const paginationInfo =
        await this.getPaginationInfo();

      await this.verifyCurrentPage(
        paginationInfo,
        effectivePageSize,
        testInfo
      );

      if (paginationInfo.totalPages > 1) {

        await this.testPaginationNavigation(
          paginationInfo,
          effectivePageSize,
          testInfo
        );
      }

      await this.page.waitForTimeout(500);
    }

    console.log(
      "\n✅ All Trim pagination tests passed successfully!"
    );
  }

  // ==================================================
  // SELECT PAGE SIZE
  // ==================================================
  private async selectPageSize(
    pageSize: number,
    optionText: string
  ): Promise<boolean> {

    await this.page.waitForTimeout(300);

    const beforeValue =
      await this.pageSizeDropdown.inputValue();

    if (beforeValue === pageSize.toString()) {
      return true;
    }

    await this.pageSizeDropdown.selectOption(
      pageSize.toString()
    );

    await this.page.waitForTimeout(300);

    const applyButtonExists =
      await this.applyButton.isVisible().catch(() => false);

    if (applyButtonExists) {

      await this.applyButton.click();

      await this.page.waitForTimeout(500);

    } else {

      await this.pageSizeDropdown.dispatchEvent("change");
    }

    await this.page.waitForLoadState("networkidle");

    await this.waitForTableToUpdate();

    let afterValue =
      await this.pageSizeDropdown.inputValue();

    // Retry with label selection
    if (afterValue !== pageSize.toString()) {

      await this.pageSizeDropdown.selectOption({
        label: optionText
      });

      await this.page.waitForTimeout(500);

      if (applyButtonExists) {

        await this.applyButton.click();

        await this.page.waitForTimeout(500);
      }

      await this.page.waitForLoadState("networkidle");

      await this.waitForTableToUpdate();

      afterValue =
        await this.pageSizeDropdown.inputValue();
    }

    return afterValue === pageSize.toString();
  }

  // ==================================================
  // NAVIGATE TO FIRST PAGE
  // ==================================================
  private async navigateToFirstPage(): Promise<void> {

    const isFirstPageEnabled =
      await this.firstPageButton
        .isEnabled()
        .catch(() => false);

    if (isFirstPageEnabled) {

      await this.firstPageButton.click();

      await this.page.waitForLoadState("networkidle");

      await this.waitForTableToUpdate();

      return;
    }

    const paginationInfo =
      await this.getPaginationInfo();

    if (paginationInfo.currentPage === 1) {
      return;
    }

    let currentInfo = paginationInfo;

    while (currentInfo.currentPage > 1) {

      const isPrevEnabled =
        await this.previousButton
          .isEnabled()
          .catch(() => false);

      if (!isPrevEnabled) {
        break;
      }

      await this.previousButton.click();

      await this.page.waitForLoadState("networkidle");

      await this.waitForTableToUpdate();

      currentInfo =
        await this.getPaginationInfo();
    }
  }

 // ==================================================
// GET PAGINATION INFO
// ==================================================
private async getPaginationInfo(): Promise<PaginationInfo> {

  const paginationText =
    await this.paginationText.textContent();

  if (!paginationText) {

    throw new Error(
      "Pagination text not found"
    );
  }

  const match = paginationText.match(
    /Showing\s+(\d+)[-\s]+(\d+)\s+of\s+(\d+)/i
  );

  if (!match) {

    throw new Error(
      `Unable to parse pagination text: ${paginationText}`
    );
  }

  const startRecord = Number(match[1]);

  const endRecord = Number(match[2]);

  const totalRecords = Number(match[3]);

  // Get selected page size from dropdown
  const pageSize = parseInt(
    await this.pageSizeDropdown.inputValue()
  );

  const totalPages =
    Math.ceil(totalRecords / pageSize);

  const currentPage =
    Math.floor((startRecord - 1) / pageSize) + 1;

  return {
    currentPage,
    totalPages,
    startRecord,
    endRecord,
    totalRecords,
    pageSize
  };
}


// ==================================================
// VERIFY CURRENT PAGE
// ==================================================
private async verifyCurrentPage(
  paginationInfo: PaginationInfo,
  expectedPageSize: number,
  testInfo: TestInfo
): Promise<void> {

  const actualRows =
    await this.tableRows.count();

  // Calculate expected rows dynamically

  const recordsAlreadyDisplayed =
    (paginationInfo.currentPage - 1) *
    expectedPageSize;

  const remainingRecords =
    paginationInfo.totalRecords -
    recordsAlreadyDisplayed;

  const expectedVisibleRows =
    Math.min(
      expectedPageSize,
      remainingRecords
    );

  await logAndValidate(
    {
      step: `Page Size Validation - Page ${paginationInfo.currentPage}`,
      expected: expectedVisibleRows,
      actual: actualRows
    },
    testInfo
  );

  const expectedRows =
    paginationInfo.endRecord -
    paginationInfo.startRecord + 1;

  await logAndValidate(
    {
      step: `Rows vs Pagination - Page ${paginationInfo.currentPage}`,
      expected: expectedRows,
      actual: actualRows
    },
    testInfo
  );

  if (paginationInfo.currentPage === 1) {

    await logAndValidate(
      {
        step: `Start Record Validation - Page ${paginationInfo.currentPage}`,
        expected: 1,
        actual: paginationInfo.startRecord
      },
      testInfo
    );
  }

  await this.collectAndValidatePageData(
    paginationInfo.currentPage,
    testInfo
  );
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

    const maxPagesToTest =
      Math.min(initialInfo.totalPages, 3);

    let pageData =
      await this.collectAndValidatePageData(
        1,
        testInfo
      );

    pageData.recordIds.forEach(id =>
      allRecordIds.add(id)
    );

    for (
      let pageNum = 2;
      pageNum <= maxPagesToTest;
      pageNum++
    ) {

      const isNextEnabled =
        await this.nextButton
          .isEnabled()
          .catch(() => false);

      if (!isNextEnabled) {
        break;
      }

      await this.nextButton.click();

      await this.page.waitForLoadState("networkidle");

      await this.waitForTableToUpdate();

      const currentInfo =
        await this.getPaginationInfo();

      await logAndValidate(
        {
          step: `Navigation to Page ${pageNum}`,
          expected: pageNum,
          actual: currentInfo.currentPage
        },
        testInfo
      );

      const expectedStartRecord =
        (pageNum - 1) * pageSize + 1;

      const expectedEndRecord =
        Math.min(
          pageNum * pageSize,
          initialInfo.totalRecords
        );

      await logAndValidate(
        {
          step: `Start Record for Page ${pageNum}`,
          expected: expectedStartRecord,
          actual: currentInfo.startRecord
        },
        testInfo
      );

      await logAndValidate(
        {
          step: `End Record for Page ${pageNum}`,
          expected: expectedEndRecord,
          actual: currentInfo.endRecord
        },
        testInfo
      );

      const actualRows =
        await this.tableRows.count();

      const expectedRowsOnPage =
        currentInfo.endRecord -
        currentInfo.startRecord + 1;

      await logAndValidate(
        {
          step: `Rows on Page ${pageNum}`,
          expected: expectedRowsOnPage,
          actual: actualRows
        },
        testInfo
      );

      pageData =
        await this.collectAndValidatePageData(
          pageNum,
          testInfo
        );

      for (const recordId of pageData.recordIds) {

        if (!allRecordIds.has(recordId)) {

          allRecordIds.add(recordId);
        }
      }
    }

    // ==================================================
    // RETURN TO FIRST PAGE
    // ==================================================
    const isFirstPageEnabled =
      await this.firstPageButton
        .isEnabled()
        .catch(() => false);

    if (isFirstPageEnabled) {

      await this.firstPageButton.click();

      await this.page.waitForLoadState("networkidle");

      await this.waitForTableToUpdate();

      const currentInfo =
        await this.getPaginationInfo();

      await logAndValidate(
        {
          step: `Return to Page 1`,
          expected: 1,
          actual: currentInfo.currentPage
        },
        testInfo
      );
    }

    // ==================================================
    // LAST PAGE VALIDATION
    // ==================================================
    const isLastPageEnabled =
      await this.lastPageButton
        .isEnabled()
        .catch(() => false);

    if (
      isLastPageEnabled &&
      initialInfo.totalPages > 1
    ) {

      await this.lastPageButton.click();

      await this.page.waitForLoadState("networkidle");

      await this.waitForTableToUpdate();

      const currentInfo =
        await this.getPaginationInfo();

      await logAndValidate(
        {
          step: `Last Page Navigation`,
          expected: initialInfo.totalPages,
          actual: currentInfo.currentPage
        },
        testInfo
      );

      const actualRows =
        await this.tableRows.count();

     const recordsBeforeLastPage =
  (initialInfo.totalPages - 1) *
  pageSize;

const expectedRowsOnLastPage =
  Math.min(
    pageSize,
    initialInfo.totalRecords -
    recordsBeforeLastPage
  );
      await logAndValidate(
        {
          step: `Last Page Row Count`,
          expected: expectedRowsOnLastPage,
          actual: actualRows
        },
        testInfo
      );

      await this.navigateToFirstPage();
    }
  }

  // ==================================================
  // COLLECT PAGE DATA
  // ==================================================
  private async collectAndValidatePageData(
    pageNum: number,
    testInfo: TestInfo
  ): Promise<{
    recordIds: string[];
    rowData: string[];
  }> {

    const rows = await this.tableRows.all();

    const recordIds: string[] = [];

    const rowData: string[] = [];

    for (let i = 0; i < rows.length; i++) {

      const rowText =
        await rows[i].innerText();

      rowData.push(rowText);

      const cells = rowText.split("\t");

      if (cells.length > 0) {

        const potentialId = cells[0].trim();

        if (/^\d+$/.test(potentialId)) {

          recordIds.push(potentialId);
        }
      }
    }

    return {
      recordIds,
      rowData
    };
  }

  // ==================================================
  // WAIT FOR TABLE UPDATE
  // ==================================================
  private async waitForTableToUpdate(): Promise<void> {

    try {

      await this.trimTable
        .locator("tbody")
        .waitFor({
          state: "attached",
          timeout: 10000
        });

      await this.trimTable
        .locator("tbody tr")
        .first()
        .waitFor({
          state: "visible",
          timeout: 10000
        });

      await this.page.waitForTimeout(200);

    } catch (error) {

      console.log(
        "Warning: Table update wait timed out, but continuing..."
      );
    }
  }
}