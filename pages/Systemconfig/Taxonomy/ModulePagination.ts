import { Page, Locator } from '@playwright/test';

export class ModulePagination {

  readonly page: Page;
  readonly showCountDropdown: Locator;
  readonly rows: Locator;
  readonly nextButton: Locator;
  readonly paginationText: Locator;

  constructor(page: Page) {

    this.page = page;

    this.showCountDropdown = page.locator('select');

    this.rows = page.locator('table tbody tr');

    this.nextButton = page.locator('button[aria-label="Next"]');

    this.paginationText =
      page.locator('text=/Showing \\d+-\\d+ of \\d+/');
  }

  // =========================================
  // REPORT
  // =========================================
  async report(
    step: string,
    expected: any,
    actual: any
  ) {

    const status =
      expected === actual
        ? 'PASS ✅'
        : 'FAIL ❌';

    console.log(
      `🔍 ${step} → Expected: ${expected} | Actual: ${actual} | ${status}`
    );
  }

  // =========================================
  // GET TOTAL RECORDS
  // =========================================
  async getTotalFromUI(): Promise<number> {

    const text =
      await this.paginationText.textContent();

    console.log(`📊 Pagination Text: ${text}`);

    return Number(
      text?.match(/of (\d+)/)?.[1]
    );
  }

  // =========================================
  // GO TO FIRST PAGE
  // =========================================
  async goToFirstPage() {

    const firstPageBtn =
      this.page.locator(
        'button[aria-label="Page 1"]'
      );

    if (
      await firstPageBtn
        .isVisible()
        .catch(() => false)
    ) {

      await firstPageBtn.click();

      await this.page.waitForFunction(() =>
        document.body.innerText.includes(
          'Showing 1-'
        )
      );
    }
  }

  // =========================================
  // COUNT ALL PAGES
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

      const count =
        await this.rows.count();

      total += count;

      console.log(
        `📄 Page ${pageNo} → Rows: ${count}`
      );

      const isVisible =
        await this.nextButton
          .isVisible()
          .catch(() => false);

      const isEnabled =
        isVisible
          ? await this.nextButton.isEnabled()
          : false;

      if (isVisible && isEnabled) {

        const before =
          await this.rows
            .first()
            .textContent();

        await this.nextButton.click();

        await this.page.waitForFunction(
          oldValue => {

            const row =
              document.querySelector(
                'table tbody tr:first-child'
              );

            return (
              row &&
              row.textContent !== oldValue
            );

          },
          before
        );

        const after =
          await this.rows
            .first()
            .textContent();

        if (before === after) {

          nextWorked = false;

          break;
        }

        pageNo++;

      } else {

        break;
      }
    }

    console.log(
      `📊 Total Rows Counted: ${total}`
    );

    return {
      total,
      nextWorked
    };
  }

  // =========================================
  // VERIFY PAGINATION
  // =========================================
  async verifyAllPagination() {

    const counts =
      await this.showCountDropdown
        .locator('option')
        .evaluateAll(options =>
          options.map(
            option =>
              (option as HTMLOptionElement)
                .value
          )
        );

    const results: any[] = [];

    for (const value of counts) {

      console.log(
        `\n====================================`
      );

      console.log(
        `🔍 Testing Module Pagination: ${value}`
      );

      console.log(
        `====================================`
      );

      await this.showCountDropdown
        .selectOption(value);

      await this.page.waitForTimeout(
        1500
      );

      await this.goToFirstPage();

      const expectedTotal =
        await this.getTotalFromUI();

      const {
        total: actualTotal,
        nextWorked
      } =
        await this.countAllPages();

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

        step:
          `Next Button (${value})`,

        expected: true,

        actual: nextWorked

      });

      results.push({

        step:
          `Total Records (${value})`,

        expected: expectedTotal,

        actual: actualTotal

      });
    }

    return results;
  }
}