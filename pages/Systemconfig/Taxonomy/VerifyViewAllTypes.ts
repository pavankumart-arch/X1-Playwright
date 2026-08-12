
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../BasePage';

export class VerifyViewAllTypes extends BasePage {

  ViewAllTypesButton: Locator;
  SearchBox: Locator;

  constructor(page: Page) {

    super(page);

    this.ViewAllTypesButton =
      page.getByRole('button', {
        name: /View all Types/i
      });

    this.SearchBox =
      page.getByPlaceholder('Search...');
  }

  async verifyViewAllTypesPage(): Promise<boolean> {

    try {

      // ==========================
      // CLICK VIEW ALL TYPES
      // ==========================

      await expect(
        this.ViewAllTypesButton
      ).toBeVisible();

      console.log(
        '✅ View all Types button visible'
      );

      await this.ViewAllTypesButton.click();

      // Wait for navigation / API calls
      await this.page.waitForLoadState('domcontentloaded');

      // ==========================
      // WAIT FOR MODULE LIST
      // ==========================

      console.log(
        '⏳ Waiting for Module List page...'
      );

      /*
       * Do NOT use:
       * page.locator('thead th')
       *
       * That reads the first table on the page,
       * which can be the App List.
       *
       * Instead, find the table containing the
       * "Module" header and read headers only
       * from that table.
       */

      const moduleTable = this.page
        .locator('table')
        .filter({
          has: this.page
            .locator('thead th')
            .filter({
              hasText: /^Module$/i
            })
        })
        .first();

      await expect(
        moduleTable,
        'Module List table should be visible'
      ).toBeVisible({
        timeout: 15000
      });

      console.log(
        '✅ Module List table loaded'
      );

      // ==========================
      // SEARCH BOX
      // ==========================

      await expect(
        this.SearchBox
      ).toBeVisible();

      console.log(
        '✅ Search box visible'
      );

      // ==========================
      // SCROLL MODULE TABLE
      // ==========================

      await moduleTable.evaluate(
        (table: HTMLElement) => {

          const scrollable =
            Array.from(
              table.querySelectorAll('*')
            ).find(
              (el: any) =>
                el.scrollWidth > el.clientWidth
            ) as HTMLElement;

          if (scrollable) {
            scrollable.scrollLeft =
              scrollable.scrollWidth;
          }
        }
      );

      await this.page.waitForTimeout(500);

      // ==========================
      // GET MODULE TABLE HEADERS
      // ==========================

      const headers =
        (
          await moduleTable
            .locator('thead th')
            .allTextContents()
        )
          .map(h => h.trim())
          .filter(Boolean);

      console.log(
        'MODULE TABLE HEADERS =>',
        headers
      );

      // ==========================
      // VALIDATE HEADERS
      // ==========================

      const expectedColumns = [
        'ID',
        'App',
        'Module',
        'Title',
        'Runtype',
        'Class',
        'Method',
        'Created',
        'Status',
        'Actions'
      ];

      for (const column of expectedColumns) {

        const exists =
          headers.some(
            h =>
              h.trim().toLowerCase() ===
              column.trim().toLowerCase()
          );

        expect(
          exists,
          `Column not found in Module List: ${column}`
        ).toBeTruthy();

        console.log(
          `✅ Column Present : ${column}`
        );
      }

      console.log(
        '✅ View All Types / Module List Validation Passed'
      );

      return true;

    } catch (error) {

      console.log(
        `❌ View All Types Validation Failed : ${error}`
      );

      return false;
    }
  }
}