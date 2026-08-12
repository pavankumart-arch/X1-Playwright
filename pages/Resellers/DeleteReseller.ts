import { Page, Locator, TestInfo } from '@playwright/test';
import { BasePage } from '../BasePage';
import { Reporter } from '../utils/NewReport';
import { AddReseller } from './AddReseller';

export class DeleteReseller extends BasePage {

  searchInput: Locator;
  rows: Locator;
  noDataMessage: Locator;
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

  async addAndDeleteReseller(testInfo: TestInfo): Promise<{ 
    createdName: string; 
    deletedSuccess: boolean; 
    message: string;
  }> {
    Reporter.startTest();

    // Add reseller
    const addReseller = new AddReseller(this.page);
    const createdName = await addReseller.AddReseller(testInfo);
    
    // Delete reseller
    const deleteResult = await this.deleteResellerAndVerify(createdName, testInfo);
    
    const summary = Reporter.endTest(testInfo);
    console.log(`\n📊 Final Results - Pass Rate: ${summary.passRate}`);
    
    return {
      createdName,
      deletedSuccess: deleteResult.success,
      message: deleteResult.message
    };
  }

  async deleteResellerAndVerify(resellerName: string, testInfo: TestInfo): Promise<{ success: boolean; message: string }> {
    console.log('\n' + '='.repeat(80));
    console.log(`DELETE RESELLER: ${resellerName}`);
    console.log('='.repeat(80));

    try {
      // Step 1: Search for the reseller
      const searchSuccess = await this.searchForReseller(resellerName, testInfo);
      if (!searchSuccess) {
        return { success: false, message: `Reseller "${resellerName}" not found for deletion` };
      }

      // Step 2: Find the reseller row
      const targetRow = await this.findResellerRow(resellerName);
      if (!targetRow) {
        return { success: false, message: `Cannot locate row for reseller "${resellerName}"` };
      }

      // Step 3: Click delete button
      const deleteClicked = await this.clickDeleteButton(targetRow, testInfo);
      if (!deleteClicked) {
        return { success: false, message: `Failed to click delete button for "${resellerName}"` };
      }

      // Step 4: Confirm deletion in popup
      const deletionConfirmed = await this.confirmDeletion(testInfo);
      if (!deletionConfirmed) {
        return { success: false, message: `Failed to confirm deletion for "${resellerName}"` };
      }

      // Step 5: Verify deletion was successful
      const deletionVerified = await this.verifyDeletionSuccess(resellerName, testInfo);
      
      if (deletionVerified) {
        Reporter.validateDelete(resellerName, true, testInfo);
        return { success: true, message: `Reseller "${resellerName}" deleted successfully` };
      } else {
        Reporter.validateDelete(resellerName, false, testInfo);
        return { success: false, message: `Reseller "${resellerName}" still exists after deletion attempt` };
      }

    } catch (error) {
      console.error(`❌ Delete failed: ${error}`);
      return { success: false, message: `Error during deletion: ${error}` };
    }
  }

  private async searchForReseller(resellerName: string, testInfo: TestInfo): Promise<boolean> {
    console.log(`🔍 Searching for reseller: ${resellerName}`);
    
    await this.searchInput.fill(resellerName);
    await this.searchInput.press('Enter');
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);
    
    // Find how many results are returned
    const rows = this.page.locator('table tbody tr');
    const rowCount = await rows.count();
    
    // Use validateSearch method
    Reporter.validateSearch(resellerName, rowCount, 1, testInfo);
    
    const searchSuccess = rowCount >= 1;
    console.log(`  Search ${searchSuccess ? '✅' : '❌'} - Found ${rowCount} result(s)`);
    
    return searchSuccess;
  }

  private async findResellerRow(resellerName: string): Promise<Locator | null> {
    const rows = this.page.locator('table tbody tr');
    const rowCount = await rows.count();

    for (let i = 0; i < rowCount; i++) {
      const nameCell = await rows.nth(i).locator('td').nth(1).textContent();
      if (nameCell?.trim() === resellerName) {
        console.log(`  ✅ Found reseller row at index ${i}`);
        return rows.nth(i);
      }
    }

    console.log(`  ❌ Reseller row not found for: ${resellerName}`);
    return null;
  }

  private async clickDeleteButton(targetRow: Locator, testInfo: TestInfo): Promise<boolean> {
    try {
      const actionsColumn = targetRow.locator('td').last();
      const deleteButton = actionsColumn.locator('button').filter({ has: this.page.locator('svg') }).last();

      await deleteButton.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(800);
      await deleteButton.click({ force: true });
      await this.page.waitForTimeout(1500);
      
      Reporter.validateData('Delete button clicked', 'Delete button clicked', 'Click delete button', testInfo);
      console.log(`  ✅ Clicked delete button`);
      return true;
      
    } catch (error) {
      console.log(`  ❌ Failed to click delete button: ${error}`);
      return false;
    }
  }

  private async confirmDeletion(testInfo: TestInfo): Promise<boolean> {
    try {
      await this.page.waitForTimeout(500);
      const dialogVisible = await this.popup.isVisible({ timeout: 5000 }).catch(() => false);

      if (!dialogVisible) {
        console.log(`  ❌ Delete confirmation dialog not visible`);
        return false;
      }

      console.log(`  ✅ Delete dialog visible`);
      
      await this.confirmDeleteBtn.click();
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(2000);
      
      Reporter.validateData('Deletion confirmed', 'Deletion confirmed', 'Confirm delete action', testInfo);
      console.log(`  ✅ Confirmed deletion`);
      return true;
      
    } catch (error) {
      console.log(`  ❌ Failed to confirm deletion: ${error}`);
      return false;
    }
  }

  private async verifyDeletionSuccess(resellerName: string, testInfo: TestInfo): Promise<boolean> {
    console.log(`🔍 Verifying deletion for: ${resellerName}`);
    
    try {
      // Clear search
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
        console.log(`  ✅ Verified: No data message shown - Reseller deleted`);
        Reporter.validateData('Reseller not found', 'Reseller not found', `Verify deletion: ${resellerName}`, testInfo);
        return true;
      }

      // Check if table has no rows
      const rows = this.page.locator('table tbody tr');
      const rowCount = await rows.count();

      if (rowCount === 0) {
        console.log(`  ✅ Verified: Table has no rows - Reseller deleted`);
        Reporter.validateData('Reseller not found', 'Reseller not found', `Verify deletion: ${resellerName}`, testInfo);
        return true;
      }

      // Check if any row contains the reseller name
      for (let i = 0; i < rowCount; i++) {
        const nameCell = await rows.nth(i).locator('td').nth(1).textContent({ timeout: 3000 }).catch(() => null);
        if (nameCell?.trim() === resellerName) {
          console.log(`  ❌ Verification failed: Reseller still found in table`);
          Reporter.validateData('Reseller not found', `Reseller found: ${resellerName}`, `Verify deletion: ${resellerName}`, testInfo);
          return false;
        }
      }

      console.log(`  ✅ Verified: Reseller not found in any row - Deleted successfully`);
      Reporter.validateData('Reseller not found', 'Reseller not found', `Verify deletion: ${resellerName}`, testInfo);
      return true;

    } catch (error) {
      console.log(`  ❌ Verification error: ${error}`);
      return false;
    }
  }
}