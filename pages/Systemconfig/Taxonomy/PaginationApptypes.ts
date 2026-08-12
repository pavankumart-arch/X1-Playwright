import { Page, Locator } from '@playwright/test';

export class AppTypePagination {

  readonly page: Page;
  readonly showCountDropdown: Locator;
  readonly rows: Locator;
  readonly nextButton: Locator;
  readonly paginationText: Locator;

  constructor(page: Page) {

    this.page = page;

    // Pagination Controls
    this.showCountDropdown = page.locator('select');

    // Table Rows
    this.rows = page.locator('table tbody tr');

    // Next Button
    this.nextButton = page.locator('button[aria-label="Next"]');

    // Showing Text
    this.paginationText = page.locator('text=/Showing \\d+-\\d+ of \\d+/');
  }

  // =========================================
  // ✅ REPORT METHOD
  // =========================================
  async report(step: string, expected: any, actual: any) {

    const status = expected === actual
      ? 'PASS ✅'
      : 'FAIL ❌';

    console.log(
      `🔍 ${step} → Expected: ${expected} | Actual: ${actual} | ${status}`
    );
  }

  // =========================================
  // ✅ GET TOTAL RECORDS FROM UI
  // =========================================
  async getTotalFromUI(): Promise<number> {

    const text = await this.paginationText.textContent();

    console.log(`📊 Pagination Text: ${text}`);

    return Number(
      text?.match(/of (\d+)/)?.[1]
    );
  }

  // =========================================
  // ✅ GO TO FIRST PAGE
  // =========================================
  async goToFirstPage() {

    const firstPageBtn = this.page.locator(
      'button[aria-label="Page 1"]'
    );

    if (await firstPageBtn.isVisible().catch(() => false)) {

      await firstPageBtn.click();

      // Wait until page resets
      await this.page.waitForFunction(() =>
        document.body.innerText.includes('Showing 1-')
      );
    }
  }

  // =========================================
  // ✅ COUNT ALL PAGES
  // =========================================
  async countAllPages(): Promise<{
    total: number;
    nextWorked: boolean;
  }> {

    let total = 0;
    let nextWorked = true;
    let pageNo = 1;

    await this.goToFirstPage();

    while (true) {

      const count = await this.rows.count();

      total += count;

      console.log(`📄 Page ${pageNo} → Rows: ${count}`);

      // Check Next Button
      const isVisible = await this.nextButton
        .isVisible()
        .catch(() => false);

      const isEnabled = isVisible
        ? await this.nextButton.isEnabled()
        : false;

      if (isVisible && isEnabled) {

        // Store first row before clicking
        const before = await this.rows
          .first()
          .textContent();

        await this.nextButton.click();

        // Wait until page changes
        await this.page.waitForFunction(
          (oldVal) => {

            const el = document.querySelector(
              'table tbody tr:first-child'
            );

            return el && el.textContent !== oldVal;

          },
          before
        );

        const after = await this.rows
          .first()
          .textContent();

        // Prevent duplicate page issue
        if (before === after) {

          nextWorked = false;
          break;
        }

        pageNo++;

      } else {

        break;
      }
    }

    console.log(`📊 Total Rows Counted: ${total}`);

    return {
      total,
      nextWorked
    };
  }

  // =========================================
  // ✅ VERIFY APP TYPE PAGINATION
  // =========================================
  async verifyAllPagination(): Promise<
  { step: string; expected: any; actual: any }[]
> {

  // Get dropdown options dynamically
  const counts = await this.showCountDropdown.locator('option')
    .evaluateAll(options =>
      options.map(option => (option as HTMLOptionElement).value)
    );

  console.log('📌 Available Dropdown Values:', counts);

  const results: {
    step: string;
    expected: any;
    actual: any;
  }[] = [];

  for (const value of counts) {

    console.log(`\n====================================`);
    console.log(`🔍 Testing AppType Pagination: ${value}`);
    console.log(`====================================`);

    // Select dropdown value
    await this.showCountDropdown.selectOption(value);

    await this.page.waitForTimeout(1500);

    // Go to first page
    await this.goToFirstPage();

    // Expected Total
    const expectedTotal = await this.getTotalFromUI();

    // Actual Total
    const {
      total: actualTotal,
      nextWorked
    } = await this.countAllPages();

    // Logs
    await this.report(
      `Next Button (${value})`,
      true,
      nextWorked
    );

    await this.report(
      `Total Records (${value})`,
      expectedTotal,
      actualTotal
    );

    results.push({
      step: `Next Button (${value})`,
      expected: true,
      actual: nextWorked
    });

    results.push({
      step: `Total Records (${value})`,
      expected: expectedTotal,
      actual: actualTotal
    });
  }

  return results;
}}