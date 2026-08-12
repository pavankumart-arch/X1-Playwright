import { Locator, Page, TestInfo } from '@playwright/test';
import { BasePage } from '../../BasePage';
import { Reporter } from '../../utils/NewReport';

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
  // Search User In Summary (Helper)
  // =========================================================

  private async searchUserInSummary(username: string): Promise<boolean> {
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
  // Click Delete Button (Helper)
  // =========================================================

  private async clickDeleteButton(username: string): Promise<boolean> {
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
  // Confirm Deletion (Helper)
  // =========================================================

  private async confirmDeletion(): Promise<boolean> {
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
  // Verify User Deleted (Helper)
  // =========================================================

  private async verifyUserDeleted(username: string): Promise<boolean> {
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
  // MAIN FUNCTION: Verify Delete User Process
  // =========================================================

  async VerifyDeleteUserProcess(
    username: string, 
    testInfo?: TestInfo,
    options?: {
      skipSearch?: boolean;
      skipConfirmation?: boolean;
      customTimeout?: number;
      useReporter?: boolean;
      detailedReporting?: boolean;
    }
  ): Promise<{
    success: boolean;
    deletePassed: boolean;
    verificationPassed: boolean;
    steps?: {
      searchFound: boolean;
      deleteClicked: boolean;
      confirmed: boolean;
      verified: boolean;
    };
    validationResults?: any[];
    validationResult?: any;
  }> {

    const defaultOptions = {
      skipSearch: false,
      skipConfirmation: false,
      customTimeout: 5000,
      useReporter: false,
      detailedReporting: false,
      ...options
    };

    // For detailed reporting mode
    if (defaultOptions.detailedReporting && testInfo) {
      const steps = {
        searchFound: false,
        deleteClicked: false,
        confirmed: false,
        verified: false
      };
      
      const validationResults = [];
      
      console.log(`\n${"=".repeat(50)}`);
      console.log(`Delete User Flow: ${username}`);
      console.log(`${"=".repeat(50)}`);

      try {
        // Step 1: Search for user
        if (!defaultOptions.skipSearch) {
          steps.searchFound = await this.searchUserInSummary(username);
          
          if (defaultOptions.useReporter) {
            const searchValidation = Reporter.validateDelete(
              username, 
              steps.searchFound, 
              testInfo
            );
            validationResults.push(searchValidation);
          }
          
          if (!steps.searchFound) {
            console.log(`❌ User "${username}" not found in search results`);
            return { 
              success: false, 
              deletePassed: false, 
              verificationPassed: false,
              steps, 
              validationResults 
            };
          }
          console.log(`✅ User "${username}" found`);
        } else {
          steps.searchFound = true;
        }

        await this.page.waitForTimeout(defaultOptions.customTimeout);

        // Step 2: Click delete button
        steps.deleteClicked = await this.clickDeleteButton(username);
        
        if (defaultOptions.useReporter) {
          const clickValidation = Reporter.validateDelete(
            username, 
            steps.deleteClicked, 
            testInfo
          );
          validationResults.push(clickValidation);
        }
        
        if (!steps.deleteClicked) {
          console.log(`❌ Failed to click delete button for "${username}"`);
          return { 
            success: false, 
            deletePassed: false, 
            verificationPassed: false,
            steps, 
            validationResults 
          };
        }
        console.log(`✅ Delete button clicked`);

        // Step 3: Confirm deletion
        if (!defaultOptions.skipConfirmation) {
          steps.confirmed = await this.confirmDeletion();
          
          if (defaultOptions.useReporter) {
            const confirmValidation = Reporter.validateDelete(
              username, 
              steps.confirmed, 
              testInfo
            );
            validationResults.push(confirmValidation);
          }
          
          if (!steps.confirmed) {
            console.log(`❌ Failed to confirm deletion`);
            return { 
              success: false, 
              deletePassed: false, 
              verificationPassed: false,
              steps, 
              validationResults 
            };
          }
          console.log(`✅ Deletion confirmed`);
        } else {
          steps.confirmed = true;
        }

        // Step 4: Verify deletion
        steps.verified = await this.verifyUserDeleted(username);
        
        if (defaultOptions.useReporter) {
          const verifyValidation = Reporter.validateDelete(
            username, 
            steps.verified, 
            testInfo
          );
          validationResults.push(verifyValidation);
        }
        
        if (!steps.verified) {
          console.log(`❌ User "${username}" still exists after deletion`);
        } else {
          console.log(`✅ User "${username}" successfully deleted`);
        }

        const success = steps.searchFound && steps.deleteClicked && steps.confirmed && steps.verified;
        
        console.log(`\n${"=".repeat(50)}`);
        console.log(`Delete Flow Result: ${success ? 'PASS ✅' : 'FAIL ❌'}`);
        console.log(`${"=".repeat(50)}`);

        return { 
          success, 
          deletePassed: steps.deleteClicked && steps.confirmed,
          verificationPassed: steps.verified,
          steps, 
          validationResults 
        };
        
      } catch (error) {
        console.log(`❌ Exception in delete flow: ${error}`);
        return { 
          success: false, 
          deletePassed: false, 
          verificationPassed: false,
          steps, 
          validationResults 
        };
      }
    }

    // Original workflow mode (backward compatible)
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
        
        if (defaultOptions.useReporter && testInfo) {
          const validationResult = Reporter.validateDelete(
            username, 
            false, 
            testInfo
          );
          return { 
            success: false,
            deletePassed: false, 
            verificationPassed: false,
            validationResult 
          };
        }
        
        return { 
          success: false,
          deletePassed: false, 
          verificationPassed: false 
        };
      }

      await this.page.waitForTimeout(defaultOptions.customTimeout);

      const deleteClicked = await this.clickDeleteButton(username);

      if (!deleteClicked) {
        console.log(`Actual: Delete button click failed`);
        console.log(`Status: FAIL ❌`);
        console.log(`${"=".repeat(50)}`);
        
        if (defaultOptions.useReporter && testInfo) {
          const validationResult = Reporter.validateDelete(
            username, 
            false, 
            testInfo
          );
          return { 
            success: false,
            deletePassed: false, 
            verificationPassed: false,
            validationResult 
          };
        }
        
        return { 
          success: false,
          deletePassed: false, 
          verificationPassed: false 
        };
      }

      const confirmed = await this.confirmDeletion();

      if (!confirmed) {
        console.log(`Actual: Confirmation failed`);
        console.log(`Status: FAIL ❌`);
        console.log(`${"=".repeat(50)}`);
        
        if (defaultOptions.useReporter && testInfo) {
          const validationResult = Reporter.validateDelete(
            username, 
            false, 
            testInfo
          );
          return { 
            success: false,
            deletePassed: false, 
            verificationPassed: false,
            validationResult 
          };
        }
        
        return { 
          success: false,
          deletePassed: false, 
          verificationPassed: false 
        };
      }

      const verificationPassed = await this.verifyUserDeleted(username);

      console.log(`Actual: ${verificationPassed ? 'User deleted successfully' : 'Deletion failed'}`);
      console.log(`Status: ${verificationPassed ? 'PASS ✅' : 'FAIL ❌'}`);
      console.log(`${"=".repeat(50)}`);

      let validationResult = null;
      if (defaultOptions.useReporter && testInfo) {
        validationResult = Reporter.validateDelete(
          username, 
          verificationPassed, 
          testInfo
        );
      }

      const deletePassed = deleteClicked && confirmed;

      return { 
        success: deletePassed && verificationPassed,
        deletePassed, 
        verificationPassed,
        validationResult 
      };
      
    } catch (error) {
      console.log(`Actual: Exception occurred - ${error}`);
      console.log(`Status: FAIL ❌`);
      console.log(`${"=".repeat(50)}`);
      
      if (defaultOptions.useReporter && testInfo) {
        const validationResult = Reporter.validateDelete(
          username, 
          false, 
          testInfo
        );
        return { 
          success: false,
          deletePassed: false, 
          verificationPassed: false,
          validationResult 
        };
      }
      
      return { 
        success: false,
        deletePassed: false, 
        verificationPassed: false 
      };
    }
  }

  // =========================================================
  // BACKWARD COMPATIBILITY: Original methods preserved
  // =========================================================

  async DeleteUser(username: string): Promise<{ deletePassed: boolean; verificationPassed: boolean; }> {
    const result = await this.VerifyDeleteUserProcess(username);
    return {
      deletePassed: result.deletePassed,
      verificationPassed: result.verificationPassed
    };
  }

  async DeleteUserWithReport(username: string, testInfo: TestInfo): Promise<{ 
    deletePassed: boolean; 
    verificationPassed: boolean;
    validationResult: any;
  }> {
    const result = await this.VerifyDeleteUserProcess(username, testInfo, { 
      useReporter: true 
    });
    return {
      deletePassed: result.deletePassed,
      verificationPassed: result.verificationPassed,
      validationResult: result.validationResult
    };
  }

  async DeleteUserWithDetailedReport(
    username: string, 
    testInfo: TestInfo,
    options?: {
      skipSearch?: boolean;
      skipConfirmation?: boolean;
      customTimeout?: number;
    }
  ): Promise<{
    success: boolean;
    steps: {
      searchFound: boolean;
      deleteClicked: boolean;
      confirmed: boolean;
      verified: boolean;
    };
    validationResults: any[];
  }> {
    const result = await this.VerifyDeleteUserProcess(username, testInfo, { 
      detailedReporting: true,
      useReporter: true,
      ...options 
    });
    
    return {
      success: result.success,
      steps: result.steps!,
      validationResults: result.validationResults!
    };
  }
}