import { Page, TestInfo, Locator } from '@playwright/test';
import { logAndValidate } from '../../utils/reportUtil';

export class UsersPagination {
  readonly page: Page;
  readonly showCountDropdown: Locator;
  readonly rows: Locator;
  readonly nextButton: Locator;
  readonly paginationText: Locator;

  constructor(page: Page) {
    this.page = page;
    // 👇 Adjust selector if needed – e.g. use .nth(0) if multiple selects exist
    this.showCountDropdown = page.locator('select').first();
    this.rows = page.locator('table tbody tr');
    this.nextButton = page.getByRole('button', { name: 'Next' });
    this.paginationText = page.locator('text=/Showing \\d+-\\d+ of \\d+/');
  }

  // =====================================
  // WAIT FOR TABLE LOAD
  // =====================================
  async waitForTableLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.rows.first().waitFor({ state: 'visible' });
  }

  // =====================================
  // GET TOTAL FROM UI (e.g., "Showing 1-10 of 250")
  // =====================================
  async getTotalFromUI(): Promise<number> {
    const text = await this.paginationText.textContent();
    console.log(`📊 Pagination Text: ${text}`);
    return Number(text?.match(/of (\d+)/)?.[1]);
  }

  // =====================================
  // GO TO FIRST PAGE
  // =====================================
  async goToFirstPage() {
    const firstPageBtn = this.page.locator('button[aria-label="Page 1"]');
    if (await firstPageBtn.isVisible()) {
      await firstPageBtn.click();
      await this.page.waitForFunction(() =>
        document.body.innerText.includes('Showing 1-')
      );
    }
  }

  // =====================================
  // COUNT ALL ROWS BY CLICKING NEXT BUTTON
  // =====================================
  async countAllPages(): Promise<{ total: number; nextWorked: boolean }> {
    let total = 0;
    let nextWorked = true;
    let pageNo = 1;

    await this.goToFirstPage();

    while (true) {
      const count = await this.rows.count();
      total += count;
      console.log(`\n📄 PAGE ${pageNo}\nRows Found: ${count}`);

      if (await this.nextButton.isVisible() && await this.nextButton.isEnabled()) {
        const before = await this.rows.first().textContent();

        // Click Next button
        await this.nextButton.click();

        // Small wait for UI update
        await this.page.waitForTimeout(1000);

        // Wait until the first row content changes (avoids duplicate page detection)
        await this.page.waitForFunction(
          (oldVal) => {
            const el = document.querySelector('table tbody tr:first-child');
            return el && el.textContent !== oldVal;
          },
          before
        );

        const after = await this.rows.first().textContent();

        if (before === after) {
          nextWorked = false;
          break;
        }

        pageNo++;
      } else {
        break;
      }
    }

    console.log(`\n📊 TOTAL RECORDS COUNTED: ${total}`);
    return { total, nextWorked };
  }

  // =====================================
  // MAIN VALIDATION METHOD
  // =====================================
  async verifyUsersPagination(testInfo: TestInfo) {
    // Read all dropdown options (records per page)
    const options = await this.showCountDropdown.locator('option').allTextContents();
    console.log(`\n📌 AVAILABLE DROPDOWN OPTIONS:\n${options.join(', ')}`);

    for (const option of options) {
      const value = option.trim();
      if (!value) continue;

      console.log(`\n==================================================
🔍 TESTING PAGINATION FOR: ${value} RECORDS PER PAGE
==================================================`);

      // Select the option
      await this.showCountDropdown.selectOption({ label: value });
      await this.waitForTableLoad();
      await this.goToFirstPage();

      // Expected total from UI pagination text
      const expectedTotal = await this.getTotalFromUI();

      // Actual total by iterating all pages (clicking Next)
      const { total: actualTotal, nextWorked } = await this.countAllPages();

      // Validate Next button behaviour
      logAndValidate(
        {
          step: `Next Button Validation (${value})`,
          expected: true,
          actual: nextWorked,
        },
        testInfo
      );

      // Validate total record count
      logAndValidate(
        {
          step: `Total Records Validation (${value})`,
          expected: expectedTotal,
          actual: actualTotal,
        },
        testInfo
      );
    }
  }
}