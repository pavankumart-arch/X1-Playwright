import { expect, Locator, Page, TestInfo, test } from '@playwright/test';
import { BasePage } from '../../../BasePage';
import { Reporter } from '../../../utils/NewReport';
import { searchbyName } from '../../../utils/Searchnew';

export class UpdateMake extends BasePage {
  editButton: Locator;
  makeNameInput: Locator;
  EditMakeHeading: Locator;
  updateMakeButton: Locator;
  searchInput: Locator;
  cancelButton: Locator;
  private originalMakeName: string = '';
  private retrievedMakeName: string = '';

  constructor(page: Page) {
    super(page);
    this.editButton = page.locator('[class="lucide lucide-square-pen"]');
    this.makeNameInput = page.locator('#admin-make-edit-makeName');
    this.EditMakeHeading = page.getByRole('heading', { name: 'Edit Make' });
    this.updateMakeButton = page.getByRole('button', { name: 'Update Make' });
    this.searchInput = page.getByPlaceholder('Search');
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
  }

  async verifyMakeByEditing(addedMakeName: string, testInfo: TestInfo): Promise<boolean> {
    let isVerified = false;
    await test.step('Verify Added Make By Editing', async () => {
        // Step 1: Search for the added make
        const makeFound = await searchbyName(this.page, this.searchInput, addedMakeName, 'button:has-text("Next ›")', 'table tbody tr', 1);
        if (!makeFound) {
            console.log(`\nOriginal Make Name (from AddMake): ${addedMakeName}\nRetrieved Make Name: Not Found\nStatus: FAIL - Make not found in table\n`);
            await testInfo.attach('Make Not Found', { body: await this.page.screenshot(), contentType: 'image/png' });
            expect(makeFound).toBeTruthy();
            return false;
        }
        
        // Step 2: Find the row containing the make and click its edit button
        const row = this.page.locator('table tbody tr').filter({ hasText: addedMakeName }).first();
        await row.waitFor({ state: 'visible', timeout: 5000 });
        
        // Find and click the edit button in that specific row
        const editButtonInRow = row.locator('[class="lucide lucide-square-pen"]');
        await editButtonInRow.waitFor({ state: 'visible', timeout: 5000 });
        await editButtonInRow.click();
        
        // Step 3: Wait for Update Make form to appear
        await this.EditMakeHeading.waitFor({ state: 'visible', timeout: 10000 });
        
        // Step 4: Get the make name from the input field
        await this.makeNameInput.waitFor({ state: 'visible', timeout: 10000 });
        this.retrievedMakeName = await this.makeNameInput.inputValue();
        this.originalMakeName = addedMakeName;
        
        await testInfo.attach('Edit Form Data', { body: await this.page.screenshot(), contentType: 'image/png' });
        
        // Step 5: Compare the retrieved make name with the original added make name
        const isMatching = this.retrievedMakeName === this.originalMakeName;
        
        // Log the comparison results
        console.log(`\n========================================`);
        console.log(`EDIT VERIFICATION: Make Name Comparison`);
        console.log(`========================================`);
        console.log(`Expected (from AddMake): ${this.originalMakeName}`);
        console.log(`Actual (from Edit field): ${this.retrievedMakeName}`);
        console.log(`Status: ${isMatching ? 'PASS ✅' : 'FAIL ❌'}`);
        console.log(`========================================\n`);
        
        // Report validation
        Reporter.validateData(
            this.originalMakeName, 
            this.retrievedMakeName, 
            'Verify make name in edit form matches the added make name', 
            testInfo
        );
        
        expect(isMatching).toBeTruthy();
        isVerified = isMatching;
        
        // Step 6: Click Cancel button to close the form (NOT Update Make)
        await this.cancelButton.click();
        
        // Wait for the form to close
        await this.EditMakeHeading.waitFor({ state: 'hidden', timeout: 5000 });
        console.log('Edit form closed using Cancel button');
    });
    return isVerified;
}

// // This method is for actual update functionality (if needed later)
// async updateAndVerifyMake(originalMakeName: string, updatedMakeName: string, testInfo: TestInfo): Promise<boolean> {
//     let isUpdated = false;
//     await test.step('Update Make And Verify', async () => {
//         const makeFound = await searchbyName(this.page, this.searchInput, originalMakeName, 'button:has-text("Next ›")', 'table tbody tr', 1);
//         if (!makeFound) {
//             console.log(`Make "${originalMakeName}" not found for update`);
//             expect(makeFound).toBeTruthy();
//             return false;
//         }
        
//         const row = this.page.locator('table tbody tr').filter({ hasText: originalMakeName }).first();
//         await row.waitFor({ state: 'visible', timeout: 5000 });
        
//         const editButtonInRow = row.locator('[class="lucide lucide-square-pen"]');
//         await editButtonInRow.waitFor({ state: 'visible', timeout: 5000 });
//         await editButtonInRow.click();
        
//         await this.EditMakeHeading.waitFor({ state: 'visible', timeout: 10000 });
//         await this.makeNameInput.waitFor({ state: 'visible', timeout: 10000 });
        
//         const currentName = await this.makeNameInput.inputValue();
//         expect(currentName).toBe(originalMakeName);
        
//         await this.makeNameInput.clear();
//         await this.fillElement(this.makeNameInput, updatedMakeName);
//         await testInfo.attach('Before Update', { body: await this.page.screenshot(), contentType: 'image/png' });
        
//         await this.updateMakeButton.click();
//         await this.EditMakeHeading.waitFor({ state: 'hidden', timeout: 10000 });
        
//         await this.searchInput.clear();
        
//         const updatedMakeFound = await searchbyName(this.page, this.searchInput, updatedMakeName, 'button:has-text("Next ›")', 'table tbody tr', 1);
//         console.log(`\nUpdate Verification:\nOriginal Name: ${originalMakeName}\nUpdated Name: ${updatedMakeName}\nStatus: ${updatedMakeFound ? 'PASS - Update successful' : 'FAIL - Update failed'}\n`);
//         Reporter.validateData(updatedMakeName, updatedMakeFound ? updatedMakeName : 'Not found', 'Verify make was updated successfully', testInfo);
//         expect(updatedMakeFound).toBeTruthy();
//         isUpdated = updatedMakeFound;
//     });
//     return isUpdated;
// }

getRetrievedMakeName(): string { return this.retrievedMakeName; }
getOriginalMakeName(): string { return this.originalMakeName; }
}