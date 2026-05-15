import {
  Page,
  Locator,
  TestInfo
} from '@playwright/test';

import { logAndValidate }
from '../../utils/reportUtil';

export class ResellerPagination {

  readonly page: Page;

  readonly showCountDropdown: Locator;

  readonly rows: Locator;

  readonly nextButton: Locator;

  readonly paginationText: Locator;

  constructor(page: Page) {

    this.page = page;

    this.showCountDropdown =
      page.locator('select');

    this.rows =
      page.locator('table tbody tr');

    this.nextButton =
      page.getByRole('button', {
        name: 'Next'
      });

    this.paginationText =
      page.locator(
        'text=/Showing \\d+-\\d+ of \\d+/'
      );
  }

  // =====================================
  // WAIT FOR TABLE LOAD
  // =====================================

  async waitForTableLoad() {

    await this.page.waitForLoadState(
      'networkidle'
    );

    await this.rows.first().waitFor({
      state: 'visible'
    });
  }

  // =====================================
  // GET TOTAL FROM UI
  // =====================================

  async getTotalFromUI(): Promise<number> {

    const text =
      await this.paginationText.textContent();

    console.log(
      `📊 Pagination Text: ${text}`
    );

    return Number(
      text?.match(/of (\d+)/)?.[1]
    );
  }

  // =====================================
  // GO TO FIRST PAGE
  // =====================================

  async goToFirstPage() {

    const firstPageBtn =
      this.page.locator(
        'button[aria-label="Page 1"]'
      );

    if (
      await firstPageBtn.isVisible()
    ) {

      await firstPageBtn.click();

      await this.page.waitForFunction(() =>
        document.body.innerText.includes(
          'Showing 1-'
        )
      );
    }
  }

  // =====================================
  // COUNT ALL PAGES
  // =====================================

  async countAllPages(): Promise<{
    total: number;
    nextWorked: boolean;
  }> {

    let total = 0;

    let nextWorked = true;

    let pageNo = 1;

    await this.goToFirstPage();

    while (true) {

      const count =
        await this.rows.count();

      total += count;

      console.log(`
📄 PAGE ${pageNo}
Rows Found: ${count}
`);

      // ===============================
      // NEXT PAGE
      // ===============================

      if (
        await this.nextButton.isVisible() &&
        await this.nextButton.isEnabled()
      ) {

        const before =
          await this.rows
            .first()
            .textContent();

        await this.nextButton.click();

        await this.page.waitForFunction(
          (oldVal) => {

            const el =
              document.querySelector(
                'table tbody tr:first-child'
              );

            return (
              el &&
              el.textContent !== oldVal
            );

          },
          before
        );

        const after =
          await this.rows
            .first()
            .textContent();

        // DUPLICATE PAGE ISSUE

        if (before === after) {

          nextWorked = false;

          break;
        }

        pageNo++;

      } else {

        break;
      }
    }

    console.log(`
📊 TOTAL RECORDS COUNTED:
${total}
`);

    return {
      total,
      nextWorked
    };
  }

  // =====================================
  // MAIN VALIDATION METHOD
  // =====================================

  async verifyAllPagination(
    testInfo?: TestInfo
  ) {

    // =====================================
    // READ DROPDOWN OPTIONS
    // =====================================

    const options =
      await this.showCountDropdown
        .locator('option')
        .allTextContents();

    console.log(`
📌 AVAILABLE DROPDOWN OPTIONS:
${options.join(', ')}
`);

    for (const option of options) {

      const value = option.trim();

      console.log(`

==================================================
🔍 TESTING PAGINATION FOR:
${value} RECORDS PER PAGE
==================================================
`);

      // =====================================
      // SELECT OPTION
      // =====================================

      await this.showCountDropdown.selectOption({
        label: value
      });

      await this.waitForTableLoad();

      await this.goToFirstPage();

      // =====================================
      // EXPECTED TOTAL
      // =====================================

      const expectedTotal =
        await this.getTotalFromUI();

      // =====================================
      // ACTUAL TOTAL
      // =====================================

      const {
        total: actualTotal,
        nextWorked
      } = await this.countAllPages();

      // =====================================
      // NEXT BUTTON VALIDATION
      // =====================================

      logAndValidate({

        step:
          `Next Button Validation (${value})`,

        expected: true,

        actual: nextWorked

      }, testInfo);

      // =====================================
      // TOTAL RECORD VALIDATION
      // =====================================

      logAndValidate({

        step:
          `Total Records Validation (${value})`,

        expected: expectedTotal,

        actual: actualTotal

      }, testInfo);
    }
  }
}