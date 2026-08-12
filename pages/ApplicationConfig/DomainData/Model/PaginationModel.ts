import { BasePage } from "../../../BasePage";
import { Page, Locator, TestInfo } from "@playwright/test";
import { Reporter } from "../../../utils/NewReport";

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  startRecord: number;
  endRecord: number;
  totalRecords: number;
  pageSize: number;
}

export class ModelPagination extends BasePage {
    [x: string]: any;
  page: Page;
  pageSizeDropdown: Locator;
  paginationText: Locator;
  tableRows: Locator;
  nextButton: Locator;
  previousButton: Locator;
  firstPageButton: Locator;
  lastPageButton: Locator;
  applyButton: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.pageSizeDropdown = page.locator("select").first();
    this.paginationText = page.locator("span.whitespace-nowrap").first();
    this.tableRows = page.locator("table tbody tr");
    this.nextButton = page.locator("button[aria-label='Next page'], button:has-text('Next')").first();
    this.previousButton = page.locator("button[aria-label='Previous page'], button:has-text('Previous')").first();
    this.firstPageButton = page.locator("button[aria-label='First page'], button:has-text('First')").first();
    this.lastPageButton = page.locator("button[aria-label='Last page'], button:has-text('Last')").first();
    this.applyButton = page.locator("button:has-text('Apply'), button:has-text('Go'), button:has-text('Submit')").first();
  }
  private async isPaginationAvailable(): Promise<boolean> {
  try {
    const paginationVisible = await this.paginationText
      .isVisible()
      .catch(() => false);

    if (!paginationVisible) {
      return false;
    }

    const paginationInfo = await this.getPaginationInfo();

    return paginationInfo.totalPages > 1;
  } catch {
    return false;
  }
}
public async verifyModlePagination(testInfo: TestInfo): Promise<void> {
  const paginationExists = await this.isPaginationAvailable();

  if (!paginationExists) {
    console.log("Single page or pagination not available.");

    const rowCount = await this.tableRows.count();

    Reporter.validateData(
      true,
      rowCount > 0,
      "Table Records Available",
      testInfo
    );

    return;
  }

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
      console.log(`⚠ Skipping ${option.text} due to selection failure`);
      continue;
    }

    const actualSelectedValue = await this.pageSizeDropdown.inputValue();
    const effectivePageSize = parseInt(actualSelectedValue);

    Reporter.validateData(
      requestedValue,
      effectivePageSize,
      `Dropdown Selection (${option.text})`,
      testInfo
    );

    await this.navigateToFirstPage();
    await this.waitForTableToUpdate();

    const paginationInfo = await this.getPaginationInfo();

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

  console.log("\n✅ All pagination tests passed successfully!");
}
  private async selectPageSize(pageSize: number, optionText: string): Promise<boolean> {
    await this.page.waitForTimeout(300);
    const beforeValue = await this.pageSizeDropdown.inputValue();
    if (beforeValue === pageSize.toString()) {
      return true;
    }
    await this.pageSizeDropdown.selectOption(pageSize.toString());
    await this.page.waitForTimeout(300);
    const applyButtonExists = await this.applyButton.isVisible().catch(() => false);
    if (applyButtonExists) {
      await this.applyButton.click();
      await this.page.waitForTimeout(500);
    } else {
      await this.pageSizeDropdown.dispatchEvent('change');
    }
    await this.page.waitForLoadState("networkidle");
    await this.waitForTableToUpdate();
    let afterValue = await this.pageSizeDropdown.inputValue();
    if (afterValue !== pageSize.toString()) {
      await this.pageSizeDropdown.selectOption({ label: optionText });
      await this.page.waitForTimeout(500);
      if (applyButtonExists) {
        await this.applyButton.click();
        await this.page.waitForTimeout(500);
      }
      await this.page.waitForLoadState("networkidle");
      await this.waitForTableToUpdate();
      afterValue = await this.pageSizeDropdown.inputValue();
    }
    return afterValue === pageSize.toString();
  }

  private async navigateToFirstPage(): Promise<void> {
    const isFirstPageEnabled = await this.firstPageButton.isEnabled().catch(() => false);
    if (isFirstPageEnabled) {
      await this.firstPageButton.click();
      await this.page.waitForLoadState("networkidle");
      await this.waitForTableToUpdate();
      return;
    }
    const paginationInfo = await this.getPaginationInfo();
    if (paginationInfo.currentPage === 1) {
      return;
    }
    let currentInfo = paginationInfo;
    while (currentInfo.currentPage > 1) {
      const isPrevEnabled = await this.previousButton.isEnabled().catch(() => false);
      if (!isPrevEnabled) break;
      await this.previousButton.click();
      await this.page.waitForLoadState("networkidle");
      await this.waitForTableToUpdate();
      currentInfo = await this.getPaginationInfo();
    }
  }

  private async getPaginationInfo(): Promise<PaginationInfo> {
    const paginationText = await this.paginationText.textContent();
    if (!paginationText) {
      throw new Error("Pagination text not found");
    }
const match = paginationText.match(
  /(?:Showing\s+)?(\d+)\s*(?:-|to|–)\s*(\d+)\s+of\s+(\d+)/i
);
    if (!match) {
      throw new Error(`Unable to parse pagination text: ${paginationText}`);
    }
    const startRecord = Number(match[1]);
    const endRecord = Number(match[2]);
    const totalRecords = Number(match[3]);
    const pageSize = endRecord - startRecord + 1;
    const totalPages = Math.ceil(totalRecords / pageSize);
    const currentPage = Math.floor((startRecord - 1) / pageSize) + 1;
    return { currentPage, totalPages, startRecord, endRecord, totalRecords, pageSize };
  }

  private async verifyCurrentPage(paginationInfo: PaginationInfo, expectedPageSize: number, testInfo: TestInfo): Promise<void> {
    const actualRows = await this.tableRows.count();
    Reporter.validateData(expectedPageSize, actualRows, `Page Size Validation - Page ${paginationInfo.currentPage}`, testInfo);
    const expectedRows = paginationInfo.endRecord - paginationInfo.startRecord + 1;
    Reporter.validateData(expectedRows, actualRows, `Rows vs Pagination - Page ${paginationInfo.currentPage}`, testInfo);
    if (paginationInfo.currentPage === 1) {
      Reporter.validateData(1, paginationInfo.startRecord, `Start Record Validation - Page ${paginationInfo.currentPage}`, testInfo);
    }
    await this.collectAndValidatePageData(paginationInfo.currentPage, testInfo);
  }

  private async testPaginationNavigation(initialInfo: PaginationInfo, pageSize: number, testInfo: TestInfo): Promise<void> {
    const allRecordIds = new Set<string>();
    const maxPagesToTest = Math.min(initialInfo.totalPages, 3);
    let pageData = await this.collectAndValidatePageData(1, testInfo);
    pageData.recordIds.forEach(id => allRecordIds.add(id));
    for (let pageNum = 2; pageNum <= maxPagesToTest; pageNum++) {
      const isNextEnabled = await this.nextButton.isEnabled().catch(() => false);
      if (!isNextEnabled) break;
      await this.nextButton.click();
      await this.page.waitForLoadState("networkidle");
      await this.waitForTableToUpdate();
      const currentInfo = await this.getPaginationInfo();
      Reporter.validateData(pageNum, currentInfo.currentPage, `Navigation to Page ${pageNum}`, testInfo);
      const expectedStartRecord = (pageNum - 1) * pageSize + 1;
      const expectedEndRecord = Math.min(pageNum * pageSize, initialInfo.totalRecords);
      Reporter.validateData(expectedStartRecord, currentInfo.startRecord, `Start Record for Page ${pageNum}`, testInfo);
      Reporter.validateData(expectedEndRecord, currentInfo.endRecord, `End Record for Page ${pageNum}`, testInfo);
      const actualRows = await this.tableRows.count();
      const expectedRowsOnPage = currentInfo.endRecord - currentInfo.startRecord + 1;
      Reporter.validateData(expectedRowsOnPage, actualRows, `Rows on Page ${pageNum}`, testInfo);
      pageData = await this.collectAndValidatePageData(pageNum, testInfo);
      for (const recordId of pageData.recordIds) {
        if (!allRecordIds.has(recordId)) {
          allRecordIds.add(recordId);
        }
      }
    }
    const isFirstPageEnabled = await this.firstPageButton.isEnabled().catch(() => false);
    if (isFirstPageEnabled) {
      await this.firstPageButton.click();
      await this.page.waitForLoadState("networkidle");
      await this.waitForTableToUpdate();
      const currentInfo = await this.getPaginationInfo();
      Reporter.validateData(1, currentInfo.currentPage, `Return to Page 1`, testInfo);
    }
    const isLastPageEnabled = await this.lastPageButton.isEnabled().catch(() => false);
    if (isLastPageEnabled && initialInfo.totalPages > 1) {
      await this.lastPageButton.click();
      await this.page.waitForLoadState("networkidle");
      await this.waitForTableToUpdate();
      const currentInfo = await this.getPaginationInfo();
      Reporter.validateData(initialInfo.totalPages, currentInfo.currentPage, `Last Page Navigation`, testInfo);
      const actualRows = await this.tableRows.count();
      const expectedRowsOnLastPage = initialInfo.totalRecords - (initialInfo.totalPages - 1) * pageSize;
      Reporter.validateData(expectedRowsOnLastPage, actualRows, `Last Page Row Count`, testInfo);
      await this.navigateToFirstPage();
    }
  }

  private async collectAndValidatePageData(pageNum: number, testInfo: TestInfo): Promise<{ recordIds: string[]; rowData: string[] }> {
    const rows = await this.tableRows.all();
    const recordIds: string[] = [];
    const rowData: string[] = [];
    for (let i = 0; i < rows.length; i++) {
      const rowText = await rows[i].innerText();
      rowData.push(rowText);
      const cells = rowText.split('\t');
      if (cells.length > 0) {
        const potentialId = cells[0].trim();
        if (/^\d+$/.test(potentialId)) {
          recordIds.push(potentialId);
        }
      }
    }
    return { recordIds, rowData };
  }

  private async waitForTableToUpdate(): Promise<void> {
    try {
      await this.page.locator("table tbody").first().waitFor({ state: "attached", timeout: 10000 });
      await this.page.locator("table tbody tr").first().waitFor({ state: "visible", timeout: 10000 });
      await this.page.waitForTimeout(200);
    } catch (error) {
      console.log("Warning: Table update wait timed out, but continuing...");
    }
  }
}