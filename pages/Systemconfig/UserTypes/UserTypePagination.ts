import { Page, Locator } from '@playwright/test';
import { BasePage } from '../../BasePage';

export class UserTypePagination extends BasePage {

  SearchBox: Locator;
  PaginationDropdown: Locator;
  TableRows: Locator;
  PaginationText: Locator;

  constructor(page: Page) {

    super(page);

    // SEARCH
    this.SearchBox = page.getByPlaceholder('Search...');

    // PAGINATION DROPDOWN
    this.PaginationDropdown = page.locator('select');

    // TABLE ROWS
    this.TableRows = page.locator('table tbody tr');

    // PAGINATION TEXT
    this.PaginationText = page.locator(
      'text=/Showing \\d+-\\d+ of \\d+/'
    );
  }

  // ---------------- WAIT FOR TABLE ----------------

  async waitForTable(): Promise<void> {

    await this.TableRows.first().waitFor({
      state: 'visible',
      timeout: 30000
    });
  }

  // ---------------- VERIFY PAGINATION ----------------

  async verifyPagination(): Promise<void> {

    await this.waitForTable();

    const options = ['10', '20', '50', '100'];

    console.log(`\n${'='.repeat(60)}`);
    console.log(`SUMMARY - USER TYPE PAGINATION`);
    console.log(`${'='.repeat(60)}`);

    for (const optionValue of options) {

      // SELECT PAGINATION VALUE
      await this.PaginationDropdown.selectOption(optionValue);

      // WAIT FOR TABLE REFRESH
      await this.page.waitForLoadState('networkidle');

      await this.page.waitForTimeout(2000);

      // GET PAGINATION TEXT
      const text =
        await this.PaginationText.textContent();

      // EXTRACT TOTAL RECORDS
      const totalMatch = text?.match(/of (\d+)/);

      const totalRecords =
        totalMatch ? Number(totalMatch[1]) : 0;

      // COUNT ROWS
      const rows = await this.TableRows.count();

      // VALIDATION
      const status =
        rows <= parseInt(optionValue) &&
        totalRecords > 0
          ? 'PASS ✅'
          : 'FAIL ❌';

      console.log(
        `Show: ${optionValue} → Total Records: ${totalRecords} | Current Rows: ${rows} | ${status}`
      );
    }

    console.log(`${'='.repeat(60)}`);
  }
}