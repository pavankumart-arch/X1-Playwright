import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class DeleteReseller extends BasePage {

  searchInput: Locator;
  rows: Locator;
  noDataMessage: Locator;

  // 🔹 Popup Locators
  popup: Locator;
  popupMessage: Locator;
  cancelBtn: Locator;
  confirmDeleteBtn: Locator;

  constructor(page: Page) {
    super(page);

    this.searchInput = page.locator('input.table-search__input');
    this.rows = page.locator('table tbody tr');
    this.noDataMessage = page.locator('text=No data available');

    this.popup = page.locator('div.dialog, [role="dialog"]');
    this.popupMessage = this.popup.locator('p');
    this.cancelBtn = this.popup.getByRole('button', { name: /Cancel/i });
    this.confirmDeleteBtn = this.popup.getByRole('button', { name: /Delete|Confirm/i });
  }

  async delete(resellerName: string): Promise<boolean> {
    try {
      // Search for the reseller
      await this.searchInput.fill(resellerName);
      await this.searchInput.press('Enter');
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(1000);

      const rows = this.page.locator('table tbody tr');
      let targetRow: Locator | null = null;
      const rowCount = await rows.count();

      // Find the reseller row
      for (let i = 0; i < rowCount; i++) {
        const nameCell = await rows.nth(i).locator('td').nth(1).textContent();
        if (nameCell?.trim() === resellerName) {
          targetRow = rows.nth(i);
          break;
        }
      }

      if (!targetRow) {
        return false;
      }

      // Click Delete Button (Trash Icon)
      const actionsColumn = targetRow.locator('td').last();
      const deleteButton = actionsColumn.locator('button').filter({ has: this.page.locator('svg') }).last();

      await deleteButton.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(800);
      await deleteButton.click({ force: true });
      await this.page.waitForTimeout(1500);

      // Confirm Delete Dialog
      await this.page.waitForTimeout(500);
      const dialogVisible = await this.popup.isVisible({ timeout: 5000 }).catch(() => false);

      if (!dialogVisible) {
        return false;
      }

      await this.confirmDeleteBtn.click();
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(2000);

      return true;

    } catch (error) {
      return false;
    }
  }

  async verifyDeletionSuccess(resellerName: string): Promise<boolean> {
    try {
      await this.page.waitForTimeout(1500);

      // Clear search using Ctrl+A and Delete
      await this.searchInput.click();
      await this.page.keyboard.press('Control+A');
      await this.page.keyboard.press('Delete');
      await this.page.waitForTimeout(1000);

      // Search for the reseller again
      await this.searchInput.fill(resellerName);
      await this.searchInput.press('Enter');
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(2000);

      // Check for "No data available" message
      const noDataVisible = await this.noDataMessage.isVisible({ timeout: 5000 }).catch(() => false);

      if (noDataVisible) {
        return true;
      }

      // Check if table has no rows
      const rows = this.page.locator('table tbody tr');
      const rowCount = await rows.count();

      if (rowCount === 0) {
        return true;
      }

      // Check if any row contains the reseller name
      for (let i = 0; i < rowCount; i++) {
        const nameCell = await rows.nth(i).locator('td').nth(1).textContent({ timeout: 3000 }).catch(() => null);
        if (nameCell?.trim() === resellerName) {
          return false;
        }
      }

      return true;

    } catch (error) {
      return false;
    }
  }
}