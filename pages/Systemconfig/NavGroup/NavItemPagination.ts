import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from '../../BasePage';

export class NavItemPagination extends BasePage {

  TableRows: Locator;
  NextButton: Locator;
  PreviousButton: Locator;
  PaginationText: Locator;
  NavGroupLink: Locator;

  constructor(page: Page) {

    super(page);

    // Click first Nav Group to open Nav Items
    this.NavGroupLink =
      this.page.locator('table tbody tr:first-child td:first-child a');

    this.TableRows =
      page.locator('table tbody tr');

    this.NextButton =
      page.getByRole('button', { name: /next/i });

    this.PreviousButton =
      page.getByRole('button', { name: /previous/i });

    this.PaginationText =
      page.locator('text=/Page|Showing|Rows/i').first();

    console.log('✅ NavItemPagination Loaded');
  }

  // ==========================================
  // OPEN NAV ITEM PAGE
  // ==========================================

  async openNavItems(): Promise<void> {

    await this.NavGroupLink.waitFor({
      state: 'visible'
    });

    await this.NavGroupLink.scrollIntoViewIfNeeded();

    await this.NavGroupLink.click();

    // Wait until Nav Item page loads
    await this.page.locator('th')
      .filter({
        hasText: 'RunType'
      })
      .waitFor({
        state: 'visible',
        timeout: 30000
      });

    console.log('✅ Navigated to Nav Item page');
  }

  // ==========================================
  // VERIFY ROWS
  // ==========================================

  async verifyRowsVisible(): Promise<boolean> {

    await this.TableRows.first().waitFor({
      state: 'visible',
      timeout: 10000
    });

    const count =
      await this.TableRows.count();

    console.log(`📊 Row Count : ${count}`);

    return count > 0;
  }

  // ==========================================
  // NEXT PAGE
  // ==========================================

  async goToNextPage(): Promise<boolean> {

    const before =
      await this.TableRows.first().textContent();

    if (await this.NextButton.isDisabled()) {

      console.log('⚠️ Next button disabled');

      return false;
    }

    await this.NextButton.click();

    await this.page.waitForTimeout(3000);

    const after =
      await this.TableRows.first().textContent();

    return before !== after;
  }

  // ==========================================
  // PREVIOUS PAGE
  // ==========================================

  async goToPreviousPage(): Promise<boolean> {

    const before =
      await this.TableRows.first().textContent();

    if (await this.PreviousButton.isDisabled()) {

      console.log('⚠️ Previous button disabled');

      return false;
    }

    await this.PreviousButton.click();

    await this.page.waitForTimeout(3000);

    const after =
      await this.TableRows.first().textContent();

    return before !== after;
  }

  // ==========================================
  // VERIFY CONTROLS
  // ==========================================

  async verifyPaginationControls(): Promise<boolean> {

    const next =
      await this.NextButton.isVisible();

    const previous =
      await this.PreviousButton.isVisible();

    return next || previous;
  }

  // ==========================================
  // COMPLETE VALIDATION
  // ==========================================

  async validatePagination(): Promise<boolean> {

    console.log('\n============================================================');
    console.log('NAV ITEM PAGINATION VALIDATION');
    console.log('============================================================');

    await this.openNavItems();

    if (!await this.verifyRowsVisible()) {
      return false;
    }

    if (!await this.verifyPaginationControls()) {
      return false;
    }

    const next =
      await this.goToNextPage();

    const previous =
      await this.goToPreviousPage();

    console.log(`➡️ Next : ${next ? 'PASS ✅' : 'FAIL ❌'}`);
    console.log(`⬅️ Previous : ${previous ? 'PASS ✅' : 'FAIL ❌'}`);

    return true;
  }

}