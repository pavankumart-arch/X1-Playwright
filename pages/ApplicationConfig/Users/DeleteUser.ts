import { Locator, Page } from '@playwright/test';
import { BasePage } from '../../BasePage';

export class DeleteUser extends BasePage {

  SearchBox: Locator;
  ConfirmDeleteDialog: Locator;
  ConfirmDeleteButton: Locator;
  CancelButton: Locator;
  NoDataMessage: Locator;

  constructor(page: Page) {

    super(page);

    this.SearchBox = page.getByPlaceholder('Search...');
    this.ConfirmDeleteDialog = page.locator('text=Confirm Delete');
    this.ConfirmDeleteButton = page.locator('button:has-text("Delete")').last();
    this.CancelButton = page.locator('button:has-text("Cancel")');
    this.NoDataMessage = page.locator('text=No data available');

  }

  // =========================================================
  // Search User In Summary
  // =========================================================

  async searchUserInSummary(username: string): Promise<boolean> {

    try {

      await this.SearchBox.waitFor({ state: 'visible', timeout: 3000 });
      await this.SearchBox.click({ timeout: 2000 });
      await this.SearchBox.fill('');
      await this.page.waitForTimeout(300);
      await this.SearchBox.fill(username);
      await this.page.waitForTimeout(800);

      const tableRows = this.page.locator('table tbody tr');
      const rowCount = await tableRows.count();

      if (rowCount > 0) {

        const firstRowNameCell = tableRows.nth(0).locator('td').nth(1);
        const cellText = (await firstRowNameCell.textContent())?.trim() || '';

        if (cellText.toLowerCase().includes(username.toLowerCase())) {

          return true;

        }

      }

      return false;

    } catch (error) {

      return false;

    }

  }

  // =========================================================
  // Click Delete Button
  // =========================================================

  async clickDeleteButton(username: string): Promise<boolean> {

    try {

      const targetRow = this.page.locator('table tbody tr').filter({ hasText: username });
      const actionsCell = targetRow.locator('td').last();
      const allButtons = actionsCell.locator('button');
      const buttonCount = await allButtons.count();

      if (buttonCount >= 2) {

        const deleteButton = actionsCell.locator('button svg.lucide-trash-2, button svg[class*="trash"]').locator('..');

        if (await deleteButton.count() > 0) {

          await deleteButton.click();
          return true;

        }

        const lastButton = allButtons.last();

        await lastButton.click();

        return true;

      }

      return false;

    } catch (error) {

      return false;

    }

  }

  // =========================================================
  // Confirm Deletion
  // =========================================================

  async confirmDeletion(): Promise<boolean> {

    try {

      await this.page.waitForTimeout(500);

      if (await this.ConfirmDeleteDialog.isVisible({ timeout: 3000 })) {

        await this.ConfirmDeleteButton.click();
        await this.page.waitForTimeout(2000);
        await this.page.waitForLoadState('networkidle');

        return true;

      }

      return false;

    } catch (error) {

      return false;

    }

  }

  // =========================================================
  // Verify User Deleted
  // =========================================================

  async verifyUserDeleted(username: string): Promise<boolean> {

    try {

      await this.SearchBox.click();
      await this.SearchBox.fill('');
      await this.page.waitForTimeout(300);
      await this.SearchBox.fill(username);
      await this.page.waitForTimeout(800);

      if (await this.NoDataMessage.isVisible({ timeout: 2000 })) {

        return true;

      }

      const tableRows = this.page.locator('table tbody tr');
      const rowCount = await tableRows.count();

      if (rowCount === 0) {

        return true;

      }

      return false;

    } catch (error) {

      return false;

    }

  }

  // =========================================================
  // Delete User Workflow
  // =========================================================

  async DeleteUser(username: string): Promise<{ deletePassed: boolean; verificationPassed: boolean; }> {

    console.log(`\n${"=".repeat(50)}`);
    console.log(`SUMMARY - Delete User Functionality`);
    console.log(`${"=".repeat(50)}`);
    console.log(`Expected: User should be deleted successfully`);

    try {

      const userFound = await this.searchUserInSummary(username);

      if (!userFound) {

        console.log(`Actual: User not found`);
        console.log(`Status: FAIL ❌`);
        console.log(`${"=".repeat(50)}`);

        return { deletePassed: false, verificationPassed: false };

      }

      await this.page.waitForTimeout(5000);

      const deleteClicked = await this.clickDeleteButton(username);

      if (!deleteClicked) {

        console.log(`Actual: Delete button click failed`);
        console.log(`Status: FAIL ❌`);
        console.log(`${"=".repeat(50)}`);

        return { deletePassed: false, verificationPassed: false };

      }

      const confirmed = await this.confirmDeletion();

      if (!confirmed) {

        console.log(`Actual: Confirmation failed`);
        console.log(`Status: FAIL ❌`);
        console.log(`${"=".repeat(50)}`);

        return { deletePassed: false, verificationPassed: false };

      }

      const verificationPassed = await this.verifyUserDeleted(username);

      console.log(`Actual: ${verificationPassed ? 'User deleted successfully' : 'Deletion failed'}`);
      console.log(`Status: ${verificationPassed ? 'PASS ✅' : 'FAIL ❌'}`);
      console.log(`${"=".repeat(50)}`);

      return { deletePassed: deleteClicked && confirmed, verificationPassed: verificationPassed };

    } catch (error) {

      console.log(`Actual: Exception occurred`);
      console.log(`Status: FAIL ❌`);
      console.log(`${"=".repeat(50)}`);

      return { deletePassed: false, verificationPassed: false };

    }

  }

}