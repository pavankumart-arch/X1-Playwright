import { Page, Locator } from '@playwright/test';

export class ResellerPagination {
  readonly page: Page;
  readonly showCountDropdown: Locator;
  readonly rows: Locator;
  readonly nextButton: Locator;
  readonly paginationText: Locator;

  constructor(page: Page) {
    this.page = page;

    this.showCountDropdown = page.locator('select');
    this.rows = page.locator('table tbody tr');
    this.nextButton = page.getByRole('button', { name: 'Next' });
    this.paginationText = page.locator('text=/Showing \\d+-\\d+ of \\d+/');
  }

  // =========================
  // ✅ FINAL REPORT FUNCTION (FIXED UI ISSUE)
  // =========================
  async report(step: string, expected: any, actual: any) {
    const status = expected === actual ? 'PASS ✅' : 'FAIL ❌';
    console.log(`🔍 ${step} → Expected: ${expected} | Actual: ${actual} | ${status}`);
  }

  // =========================
  // ✅ GET TOTAL FROM UI
  // =========================
  async getTotalFromUI(): Promise<number> {
    const text = await this.paginationText.textContent();
    console.log(`📊 Pagination Text: ${text}`);

    return Number(text?.match(/of (\d+)/)?.[1]);
  }

  // =========================
  // ✅ GO TO FIRST PAGE (IMPORTANT FIX)
  // =========================
  async goToFirstPage() {

    const firstPageBtn = this.page.locator('button[aria-label="Page 1"]');

    if (await firstPageBtn.isVisible()) {
      await firstPageBtn.click();

      // ✅ wait until page resets to 1
      await this.page.waitForFunction(() =>
        document.body.innerText.includes('Showing 1-')
      );
    }
  }

  // =========================
  // ✅ COUNT ALL PAGES (FIXED LOGIC)
  // =========================
  async countAllPages(): Promise<{ total: number; nextWorked: boolean }> {

    let total = 0;
    let nextWorked = true;
    let pageNo = 1;

    await this.goToFirstPage();

    while (true) {

      const count = await this.rows.count();
      total += count;

      console.log(`📄 Page ${pageNo} → Rows: ${count}`);

      if (await this.nextButton.isVisible() && await this.nextButton.isEnabled()) {

        const before = await this.rows.first().textContent();

        await this.nextButton.click();

        await this.page.waitForFunction(
          (oldVal) => {
            const el = document.querySelector('table tbody tr:first-child');
            return el && el.textContent !== oldVal;
          },
          before
        );

        const after = await this.rows.first().textContent();

        // ❗ Prevent duplicate page issue (your earlier bug)
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

    return { total, nextWorked };
  }

  // =========================
  // ✅ MAIN METHOD (FINAL)
  // =========================
  async verifyAllPagination(): Promise<{ step: string; expected: any; actual: any }[]> {

    const counts = ['5', '10', '20', '50', '100'];
    const results: { step: string; expected: any; actual: any }[] = [];

    for (const value of counts) {

      console.log(`\n==============================`);
      console.log(`🔍 Testing for dropdown: ${value}`);
      console.log(`==============================`);

      await this.showCountDropdown.selectOption(value);
      await this.goToFirstPage();

      const expectedTotal = await this.getTotalFromUI();
      const { total: actualTotal, nextWorked } = await this.countAllPages();

      this.report(`Next Button (${value})`, true, nextWorked);
      this.report(`Total Records (${value})`, expectedTotal, actualTotal);

      results.push({ step: `Next Button (${value})`, expected: true, actual: nextWorked });
      results.push({ step: `Total Records (${value})`, expected: expectedTotal, actual: actualTotal });
    }

    return results;
  }
}