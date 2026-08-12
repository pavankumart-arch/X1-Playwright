import { Locator, Page, TestInfo } from '@playwright/test';
import { BasePage } from '../BasePage';
import { Reporter } from '../utils/NewReport';


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

  async searchRooftopInSummary(rooftopName: string, testInfo: TestInfo): Promise<boolean> {
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

  async clickDeleteButton(rooftopName: string, testInfo: TestInfo): Promise<boolean> {
    try {
      const targetRow = this.page.locator('table tbody tr').filter({ hasText: rooftopName });
      const actionsCell = targetRow.locator('td').last();
      const allButtons = actionsCell.locator('button');
      const buttonCount = await allButtons.count();
      
      console.log(`\n🔍 Found ${buttonCount} button(s) in Actions column`);
      
      if (buttonCount >= 2) {
        const deleteButton = actionsCell.locator('button svg.lucide-trash-2, button svg[class*="trash"]').locator('..');
        
        if (await deleteButton.count() > 0) {
          console.log(`✅ Found Delete button with trash icon`);
          await deleteButton.click();
          console.log(`✅ Delete button clicked`);
          Reporter.validateData('Delete button clicked', 'Delete button clicked', 'Click Delete Button', testInfo);
          return true;
        }
        
        const lastButton = allButtons.last();
        console.log(`✅ Clicking last button in Actions column (Delete button)`);
        await lastButton.click();
        console.log(`✅ Delete button clicked`);
        Reporter.validateData('Delete button clicked', 'Delete button clicked', 'Click Delete Button', testInfo);
        return true;
      }
      
      console.log(`❌ Delete button not found`);
      Reporter.validateData('Delete button found', 'Delete button NOT found', 'Click Delete Button', testInfo);
      return false;
      
    } catch (error) {
      console.log(`❌ Error clicking delete: ${error}`);
      Reporter.validateData('Delete button clicked', `Error: ${error}`, 'Click Delete Button', testInfo);
      return false;
    }
  }

  async confirmDeletion(testInfo: TestInfo): Promise<boolean> {
    try {
      await this.page.waitForTimeout(500);
      
      if (await this.ConfirmDeleteDialog.isVisible({ timeout: 3000 })) {
        console.log(`✅ Confirmation dialog appeared`);
        Reporter.validateData(true, true, 'Confirmation Dialog Visible', testInfo);
        
        console.log(`👉 Clicking Delete button on confirmation dialog`);
        await this.ConfirmDeleteButton.click();
        console.log(`✅ Confirmation Delete button clicked`);
        Reporter.validateData('Delete confirmed', 'Delete confirmed', 'Confirm Deletion', testInfo);
        
        await this.page.waitForTimeout(2000);
        await this.page.waitForLoadState('networkidle');
        return true;
      } else {
        console.log(`⚠️ Confirmation dialog not found`);
        Reporter.validateData(true, false, 'Confirmation Dialog Visible', testInfo);
        return false;
      }
    } catch (error) {
      console.log(`❌ Error confirming deletion: ${error}`);
      Reporter.validateData('Deletion confirmed', `Error: ${error}`, 'Confirm Deletion', testInfo);
      return false;
    }
  }

  async verifyRooftopDeleted(rooftopName: string, testInfo: TestInfo): Promise<boolean> {
    try {
      console.log(`\n🔍 Verifying deletion of: "${rooftopName}"`);
      
      // Clear search box
      await this.SearchBox.click();
      await this.SearchBox.fill('');
      await this.page.waitForTimeout(500);
      
      // Search for the deleted rooftop
      await this.SearchBox.fill(rooftopName);
      await this.page.waitForTimeout(1000);
      
      // Wait for table to update
      await this.page.waitForTimeout(1000);
      
      // Check if "No data available" message appears
      const noDataVisible = await this.NoDataMessage.isVisible({ timeout: 3000 }).catch(() => false);
      
      if (noDataVisible) {
        console.log(`✅ "No data available" - Rooftop successfully deleted`);
        Reporter.validateData(true, true, 'Verify Deletion', testInfo);
        return true;
      }
      
      // Check table rows
      const tableRows = this.page.locator('table tbody tr');
      const rowCount = await tableRows.count();
      
      console.log(`📊 Table has ${rowCount} row(s) after search`);
      
      if (rowCount === 0) {
        console.log(`✅ Table has no rows - Rooftop successfully deleted`);
        Reporter.validateData(true, true, 'Verify Deletion', testInfo);
        return true;
      }
      
      // Check if any row contains the rooftop name
      let found = false;
      for (let i = 0; i < rowCount; i++) {
        const nameCell = await tableRows.nth(i).locator('td').nth(1).textContent();
        console.log(`Row ${i + 1}: "${nameCell?.trim()}"`);
        if (nameCell?.trim() === rooftopName) {
          found = true;
          break;
        }
      }
      
      if (!found) {
        console.log(`✅ Rooftop "${rooftopName}" not found in table - Deleted successfully`);
        Reporter.validateData(true, true, 'Verify Deletion', testInfo);
        return true;
      }
      
      console.log(`❌ Rooftop "${rooftopName}" still exists in table - Deletion failed`);
      Reporter.validateData(true, false, 'Verify Deletion', testInfo);
      return false;
      
    } catch (error) {
      console.log(`❌ Error verifying deletion: ${error}`);
      Reporter.validateData(true, false, 'Verify Deletion', testInfo);
      return false;
    }
  }

  async DeleteRooftop(rooftopName: string, testInfo: TestInfo): Promise<{
    deletePassed: boolean;
    verificationPassed: boolean;
  }> {
    Reporter.startTest();

    try {
      console.log(`\n${"=".repeat(80)}`);
      console.log(`🗑️ DELETING ROOFTOP: "${rooftopName}"`);
      console.log(`${"=".repeat(80)}`);

      // STEP 1: Search for the rooftop
      console.log('\n📍 Step 1: Searching for rooftop');
      const rooftopFound = await this.searchRooftopInSummary(rooftopName, testInfo);
      
      if (!rooftopFound) {
        console.log(`❌ Rooftop not found: ${rooftopName}`);
        Reporter.endTest(testInfo);
        return { deletePassed: false, verificationPassed: false };
      }

      // STEP 2: Click Delete button
      console.log('\n📍 Step 2: Clicking Delete button');
      const deleteClicked = await this.clickDeleteButton(rooftopName, testInfo);
      
      if (!deleteClicked) {
        Reporter.endTest(testInfo);
        return { deletePassed: false, verificationPassed: false };
      }

      // STEP 3: Confirm deletion in popup
      console.log('\n📍 Step 3: Confirming deletion');
      const confirmed = await this.confirmDeletion(testInfo);
      
      if (!confirmed) {
        Reporter.endTest(testInfo);
        return { deletePassed: false, verificationPassed: false };
      }

      // STEP 4: Verify deletion
      console.log('\n📍 Step 4: Verifying deletion');
      const verificationPassed = await this.verifyRooftopDeleted(rooftopName, testInfo);

      // Final validation
      const finalSuccess = deleteClicked && confirmed && verificationPassed;
      
      Reporter.validateData(
        true,
        finalSuccess,
        'Delete Rooftop Functionality',
        testInfo
      );

      // Print Summary
      console.log(`\n${"=".repeat(80)}`);
      console.log(`SUMMARY - Delete Rooftop Functionality`);
      console.log(`${"=".repeat(80)}`);
      console.log(`Rooftop: ${rooftopName}`);
      console.log(`Delete Clicked: ${deleteClicked ? '✅' : '❌'}`);
      console.log(`Deletion Confirmed: ${confirmed ? '✅' : '❌'}`);
      console.log(`Verification Passed: ${verificationPassed ? '✅' : '❌'}`);
      console.log(`Final Status: ${finalSuccess ? 'PASS ✅' : 'FAIL ❌'}`);
      console.log(`${"=".repeat(80)}`);

      const summary = Reporter.endTest(testInfo);
      console.log(`\n📊 Delete Rooftop Completed - Pass Rate: ${summary.passRate}`);

      return {
        deletePassed: deleteClicked && confirmed,
        verificationPassed: verificationPassed
      };

    } catch (error) {
      console.log(`❌ Deletion error: ${error}`);
      Reporter.validateData('Delete Success', `Error: ${error}`, 'Delete Rooftop', testInfo);
      Reporter.endTest(testInfo);
      return {
        deletePassed: false,
        verificationPassed: false
      };
    }
  }
}