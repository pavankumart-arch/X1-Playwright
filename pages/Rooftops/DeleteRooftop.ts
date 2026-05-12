import { Locator, Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class DeleteRooftop extends BasePage {

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

  async searchRooftopInSummary(rooftopName: string): Promise<boolean> {
    try {
      await this.SearchBox.waitFor({ state: 'visible', timeout: 3000 });
      await this.SearchBox.click({ timeout: 2000 });
      await this.SearchBox.fill('');
      await this.page.waitForTimeout(300);
      await this.SearchBox.fill(rooftopName);
      await this.page.waitForTimeout(800);

      const tableRows = this.page.locator('table tbody tr');
      const rowCount = await tableRows.count();

      if (rowCount > 0) {
        const firstRowNameCell = tableRows.nth(0).locator('td').nth(1);
        const cellText = (await firstRowNameCell.textContent())?.trim() || '';
        
        if (cellText.toLowerCase().includes(rooftopName.toLowerCase())) {
          console.log(`✅ Rooftop found: "${rooftopName}"`);
          return true;
        }
      }
      
      console.log(`❌ Rooftop not found: "${rooftopName}"`);
      return false;
    } catch (error) {
      return false;
    }
  }

  async clickDeleteButton(rooftopName: string): Promise<boolean> {
    try {
      // Find the row containing the rooftop name
      const targetRow = this.page.locator('table tbody tr').filter({ hasText: rooftopName });
      
      // Get all buttons in the Actions column (last column)
      const actionsCell = targetRow.locator('td').last();
      const allButtons = actionsCell.locator('button');
      const buttonCount = await allButtons.count();
      
      console.log(`\n🔍 Found ${buttonCount} button(s) in Actions column`);
      
      // The Delete button is usually the second button (index 1) or last button
      // Click the delete button (trash icon button)
      if (buttonCount >= 2) {
        // Try to find by trash icon first
        const deleteButton = actionsCell.locator('button svg.lucide-trash-2, button svg[class*="trash"]').locator('..');
        
        if (await deleteButton.count() > 0) {
          console.log(`✅ Found Delete button with trash icon`);
          await deleteButton.click();
          console.log(`✅ Delete button clicked`);
          return true;
        }
        
        // If trash icon not found, click the last button (usually Delete)
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

  async confirmDeletion(): Promise<boolean> {
    try {
      // Wait for confirmation dialog
      await this.page.waitForTimeout(500);
      
      // Check if confirmation dialog appears
      if (await this.ConfirmDeleteDialog.isVisible({ timeout: 3000 })) {
        console.log(`✅ Confirmation dialog appeared`);
        console.log(`👉 Clicking Delete button on confirmation dialog`);
        await this.ConfirmDeleteButton.click();
        console.log(`✅ Confirmation Delete button clicked`);
        
        // Wait for deletion to complete
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

  async verifyRooftopDeleted(rooftopName: string): Promise<boolean> {
    try {
      console.log(`\n🔍 Verifying deletion of: "${rooftopName}"`);
      
      // Clear search box
      await this.SearchBox.click();
      await this.SearchBox.fill('');
      await this.page.waitForTimeout(300);
      
      // Search for the deleted rooftop
      await this.SearchBox.fill(rooftopName);
      await this.page.waitForTimeout(800);
      
      // Check if "No data available" message appears
      if (await this.NoDataMessage.isVisible({ timeout: 2000 })) {
        console.log(`✅ "No data available" - Rooftop successfully deleted`);
        return true;
      }
      
      // Check if table has no rows
      const tableRows = this.page.locator('table tbody tr');
      const rowCount = await tableRows.count();
      
      if (rowCount === 0) {
        console.log(`✅ Table has no rows - Rooftop successfully deleted`);
        return true;
      }
      
      console.log(`❌ Rooftop still exists after deletion`);
      return false;
      
    } catch (error) {
      console.log(`❌ Error verifying deletion: ${error}`);
      return false;
    }
  }

  async DeleteRooftop(rooftopName: string): Promise<{
    deletePassed: boolean;
    verificationPassed: boolean;
  }> {
    try {
      console.log(`\n${"=".repeat(50)}`);
      console.log(`🗑️ DELETING ROOFTOP: "${rooftopName}"`);
      console.log(`${"=".repeat(50)}`);

      // STEP 1: Search for the rooftop
      const rooftopFound = await this.searchRooftopInSummary(rooftopName);
      
      if (!rooftopFound) {
        return { deletePassed: false, verificationPassed: false };
      }

      // STEP 2: Click Delete button
      const deleteClicked = await this.clickDeleteButton(rooftopName);
      
      if (!deleteClicked) {
        return { deletePassed: false, verificationPassed: false };
      }

      // STEP 3: Confirm deletion in popup
      const confirmed = await this.confirmDeletion();
      
      if (!confirmed) {
        return { deletePassed: false, verificationPassed: false };
      }

      // STEP 4: Verify deletion
      const verificationPassed = await this.verifyRooftopDeleted(rooftopName);

      // Print Summary
      console.log(`\n${"=".repeat(50)}`);
      console.log(`SUMMARY - Delete Rooftop Functionality`);
      console.log(`${"=".repeat(50)}`);
      console.log(`Expected: Rooftop should be deleted successfully`);
      console.log(`Actual: ${verificationPassed ? 'Rooftop deleted successfully' : 'Deletion failed'}`);
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