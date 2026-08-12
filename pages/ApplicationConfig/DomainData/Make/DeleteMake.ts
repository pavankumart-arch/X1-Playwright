import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../../../BasePage';
import { Reporter } from '../../../utils/NewReport';

export class DeleteMake extends BasePage {
  searchInput: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.getByPlaceholder('Search');
  }

  async deleteExistingMake(makeName: string): Promise<boolean> {
    try {
      console.log(`🔍 Searching for: ${makeName}`);
      
      // Search for the make
      await this.searchInput.clear();
      await this.searchInput.fill(makeName);
      await this.page.keyboard.press('Enter');
      await this.page.waitForTimeout(3000);

      // Find the row
      const row = this.page
        .locator('table tbody tr')
        .filter({ hasText: makeName })
        .first();

      if (await row.count() === 0) {
        console.log(`❌ Make "${makeName}" not found`);
        return true; // Already deleted, so return true
      }
      console.log('✅ Make found');

      // Click delete button in the row
      console.log('🗑️ Clicking delete button...');
      await row.locator('button').last().click();
      console.log('✅ Delete button clicked');

      // Wait for popup
      await this.page.waitForTimeout(2000);

      // Click Delete on popup
      console.log('🔄 Clicking Delete on popup...');
      
      // Wait for popup
      await this.page.waitForSelector('.modal-content, .modal-dialog, [role="dialog"]', { 
        timeout: 5000 
      });
      console.log('✅ Popup appeared');

      // Click the Delete button on popup
      await this.page.click('button:has-text("Delete")');
      console.log('✅ Delete confirmed on popup');

      // Wait for deletion
      await this.page.waitForTimeout(3000);
      await this.page.waitForLoadState('networkidle');

      // Verify deletion
      console.log('🔍 Verifying deletion...');
      await this.searchInput.clear();
      await this.searchInput.fill(makeName);
      await this.page.keyboard.press('Enter');
      await this.page.waitForTimeout(3000);

      const deletedRow = this.page
        .locator('table tbody tr')
        .filter({ hasText: makeName });

      const stillExists = await deletedRow.count() > 0;
      
      if (stillExists) {
        console.log('❌ Make still exists - deletion failed');
        return false;
      }

      console.log('✅ Make deleted successfully!');
      return true;

    } catch (error) {
      console.error(`❌ Error deleting make: ${error}`);
      
      // Check if it was actually deleted despite error
      try {
        await this.searchInput.clear();
        await this.searchInput.fill(makeName);
        await this.page.keyboard.press('Enter');
        await this.page.waitForTimeout(2000);
        
        const checkRow = this.page
          .locator('table tbody tr')
          .filter({ hasText: makeName });
        
        if (await checkRow.count() === 0) {
          console.log('✅ Make was deleted successfully (despite error)');
          return true;
        }
      } catch (e) {
        // Ignore
      }
      
      return false;
    }
  }
}