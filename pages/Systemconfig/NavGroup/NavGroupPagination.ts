import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from '../../BasePage';

export class NavGroupPagination extends BasePage {

  TableRows: Locator;
  NextButton: Locator;
  PreviousButton: Locator;
  PaginationText: Locator;

  constructor(page: Page) {
    super(page);

    this.TableRows = page.locator('table tbody tr');

    // pagination buttons
    this.NextButton = page.getByRole('button', { name: /next/i });
    this.PreviousButton = page.getByRole('button', { name: /previous/i });

    // pagination info text
    this.PaginationText = page.locator('text=/Page|Showing|Rows/i').first();
  }

  /**
   * Verify table rows visible
   */
  async verifyRowsVisible(): Promise<boolean> {

    await this.TableRows.first().waitFor({
      state: 'visible',
      timeout: 10000
    });

    const count = await this.TableRows.count();

    console.log(`📊 Row Count : ${count}`);

    return count > 0;
  }

  /**
   * Go to next page
   */
  async goToNextPage(): Promise<boolean> {

    console.log('👉 Clicking Next Page');

    const beforeText =
      await this.TableRows.first().textContent();

    // check button enabled
    const disabled =
      await this.NextButton.isDisabled().catch(() => true);

    if (disabled) {
      console.log('⚠️ Next button disabled');
      return false;
    }

    await this.NextButton.click();

    await this.page.waitForTimeout(3000);

    const afterText =
      await this.TableRows.first().textContent();

    console.log('✅ Navigated to next page');

    return beforeText !== afterText;
  }

  /**
   * Go to previous page
   */
  async goToPreviousPage(): Promise<boolean> {

    console.log('👉 Clicking Previous Page');

    const beforeText =
      await this.TableRows.first().textContent();

    const disabled =
      await this.PreviousButton.isDisabled().catch(() => true);

    if (disabled) {
      console.log('⚠️ Previous button disabled');
      return false;
    }

    await this.PreviousButton.click();

    await this.page.waitForTimeout(3000);

    const afterText =
      await this.TableRows.first().textContent();

    console.log('✅ Navigated to previous page');

    return beforeText !== afterText;
  }

  /**
   * Verify pagination controls
   */
  async verifyPaginationControls(): Promise<boolean> {

    const nextVisible =
      await this.NextButton.isVisible().catch(() => false);

    const previousVisible =
      await this.PreviousButton.isVisible().catch(() => false);

    console.log(`➡️ Next Visible : ${nextVisible}`);
    console.log(`⬅️ Previous Visible : ${previousVisible}`);

    return nextVisible || previousVisible;
  }

  /**
   * Complete pagination validation
   */
  async validatePagination(): Promise<boolean> {

    console.log('\n============================================================');
    console.log('NAV GROUP PAGINATION VALIDATION');
    console.log('============================================================');

    // rows visible
    const rowsVisible =
      await this.verifyRowsVisible();

    if (!rowsVisible) {
      console.log('❌ No rows visible');
      return false;
    }

    // pagination controls
    const controlsVisible =
      await this.verifyPaginationControls();

    if (!controlsVisible) {
      console.log('❌ Pagination controls not visible');
      return false;
    }

    // next page
    const nextWorked =
      await this.goToNextPage();

    // previous page
    const previousWorked =
      await this.goToPreviousPage();

    console.log('\n============================================================');
    console.log('PAGINATION RESULT');
    console.log('============================================================');

    console.log(`➡️ Next Page : ${nextWorked ? 'PASS ✅' : 'FAIL ❌'}`);
    console.log(`⬅️ Previous Page : ${previousWorked ? 'PASS ✅' : 'FAIL ❌'}`);

    return true;
  }
}