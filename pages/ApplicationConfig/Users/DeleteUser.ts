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

  /**
   * Search for a specific username in the summary table
   * @param username - Username to search for
   * @returns true if found, false otherwise
   */
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
        // Username is usually the 2nd column (index 1)
        const firstRowNameCell = tableRows.nth(0).locator('td').nth(1);
        const cellText = (await firstRowNameCell.textContent())?.trim() || '';
        
        if (cellText.toLowerCase().includes(username.toLowerCase())) {
          console.log(`✅ User found: "${username}"`);
          return true;
        }
      }
      
      console.log(`❌ User not found: "${username}"`);
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Click the delete button for the target user row
   * @param username - Username of the user to delete
   * @returns true if delete button clicked successfully
   */
  async clickDeleteButton(username: string): Promise<boolean> {
    try {
      const targetRow = this.page.locator('table tbody tr').filter({ hasText: username });
      const actionsCell = targetRow.locator('td').last();
      const allButtons = actionsCell.locator('button');
      const buttonCount = await allButtons.count();
      
      console.log(`\n🔍 Found ${buttonCount} button(s) in Actions column`);
      
      if (buttonCount >= 2) {
        // Look for delete button by trash icon (lucide-trash-2)
        const deleteButton = actionsCell.locator('button svg.lucide-trash-2, button svg[class*="trash"]').locator('..');
        
        if (await deleteButton.count() > 0) {
          console.log(`✅ Found Delete button with trash icon`);
          await deleteButton.click();
          console.log(`✅ Delete button clicked`);
          return true;
        }
        
        // Fallback: last button is usually Delete
        const lastButton = allButtons.last();
        console.log(`✅ Clicking last button in Actions column (Delete button)`);
        await lastButton.click();
        console.log(`✅ Delete button clicked`);
        return true;
      }
      
      console.log(`❌ Delete button not found`);
      return false;
      
    } catch (error) {
      console.log(`❌ Error clicking delete: ${error}`);
      return false;
    }
  }

  /**
   * Confirm the deletion in the confirmation dialog
   * @returns true if confirmed successfully
   */
  async confirmDeletion(): Promise<boolean> {
    try {
      await this.page.waitForTimeout(500);
      
      if (await this.ConfirmDeleteDialog.isVisible({ timeout: 3000 })) {
        console.log(`✅ Confirmation dialog appeared`);
        console.log(`👉 Clicking Delete button on confirmation dialog`);
        await this.ConfirmDeleteButton.click();
        console.log(`✅ Confirmation Delete button clicked`);
        
        await this.page.waitForTimeout(2000);
        await this.page.waitForLoadState('networkidle');
        return true;
      } else {
        console.log(`⚠️ Confirmation dialog not found`);
        return false;
      }
    } catch (error) {
      console.log(`❌ Error confirming deletion: ${error}`);
      return false;
    }
  }

  /**
   * Verify that the user has been deleted by searching again
   * @param username - Username that should no longer exist
   * @returns true if deletion verified
   */
  async verifyUserDeleted(username: string): Promise<boolean> {
    try {
      console.log(`\n🔍 Verifying deletion of: "${username}"`);
      
      // Clear and search again
      await this.SearchBox.click();
      await this.SearchBox.fill('');
      await this.page.waitForTimeout(300);
      await this.SearchBox.fill(username);
      await this.page.waitForTimeout(800);
      
      if (await this.NoDataMessage.isVisible({ timeout: 2000 })) {
        console.log(`✅ "No data available" - User successfully deleted`);
        return true;
      }
      
      const tableRows = this.page.locator('table tbody tr');
      const rowCount = await tableRows.count();
      
      if (rowCount === 0) {
        console.log(`✅ Table has no rows - User successfully deleted`);
        return true;
      }
      
      console.log(`❌ User still exists after deletion`);
      return false;
      
    } catch (error) {
      console.log(`❌ Error verifying deletion: ${error}`);
      return false;
    }
  }

  /**
   * Complete delete user workflow
   * @param username - Username to delete
   * @returns Object containing deletePassed and verificationPassed flags
   */
  async DeleteUser(username: string): Promise<{
    deletePassed: boolean;
    verificationPassed: boolean;
  }> {
    try {
      console.log(`\n${"=".repeat(50)}`);
      console.log(`🗑️ DELETING USER: "${username}"`);
      console.log(`${"=".repeat(50)}`);

      const userFound = await this.searchUserInSummary(username);
      if (!userFound) {
        return { deletePassed: false, verificationPassed: false };
      }

      const deleteClicked = await this.clickDeleteButton(username);
      if (!deleteClicked) {
        return { deletePassed: false, verificationPassed: false };
      }

      const confirmed = await this.confirmDeletion();
      if (!confirmed) {
        return { deletePassed: false, verificationPassed: false };
      }

      const verificationPassed = await this.verifyUserDeleted(username);

      console.log(`\n${"=".repeat(50)}`);
      console.log(`SUMMARY - Delete User Functionality`);
      console.log(`${"=".repeat(50)}`);
      console.log(`Expected: User should be deleted successfully`);
      console.log(`Actual: ${verificationPassed ? 'User deleted successfully' : 'Deletion failed'}`);
      console.log(`Status: ${verificationPassed ? 'PASS ✅' : 'FAIL ❌'}`);
      console.log(`${"=".repeat(50)}`);

      return {
        deletePassed: deleteClicked && confirmed,
        verificationPassed: verificationPassed
      };

    } catch (error) {
      console.log(`❌ Deletion error: ${error}`);
      return {
        deletePassed: false,
        verificationPassed: false
      };
    }
  }
}