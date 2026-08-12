import { expect, Locator, Page, TestInfo, test } from '@playwright/test';
import { BasePage } from '../../../BasePage';
import MakeData from '../../../../testdata/DomainData.json';
import { logAndValidate } from '../../../utils/reportUtil';
import { searchbyName } from '../../../utils/Searchnew';
import { Reporter } from '../../../utils/NewReport';

export class AddMake extends BasePage {
  addMakeButton: Locator;
  makeNameInput: Locator;
  activeCheckbox: Locator;
  cancelButton: Locator;
  saveMakeButton: Locator;
  addMakeHeading: Locator;
  searchInput: Locator;
  private expectedMakeName: string = '';

  constructor(page: Page) {
    super(page);
    this.addMakeButton = page.locator('[class="flex items-center gap-2"]');
    this.makeNameInput = page.locator('#admin-make-create-makeName');
    this.activeCheckbox = page.locator('svg.lucide-check');
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.saveMakeButton = page.getByRole('button', { name: 'Save Make' });
    this.addMakeHeading = page.getByRole('heading', { name: 'Add Make' });
    this.searchInput = page.getByPlaceholder('Search');
  }

  async addMake(testInfo: TestInfo): Promise<string> {
    await test.step('Add New Make', async () => {
      await this.addMakeButton.click();
      await this.makeNameInput.waitFor({ state: 'visible' });
      const headingText = await this.addMakeHeading.textContent();
      Reporter.validateData('Add Make', headingText, 'Add Make Heading', testInfo);
      await expect(this.addMakeHeading).toHaveText('Add Make');
      const uniqueMakeName = `${MakeData.Make}_${Date.now()}`;
      this.expectedMakeName = uniqueMakeName;
      await this.fillElement(this.makeNameInput, uniqueMakeName);
      const enteredValue = await this.makeNameInput.inputValue();
      Reporter.validateData(uniqueMakeName, enteredValue, 'Make Name Input', testInfo);
      await testInfo.attach('Before Save Make', { body: await this.page.screenshot(), contentType: 'image/png' });
      await this.clickOnElement(this.saveMakeButton);
      await this.addMakeButton.waitFor({ state: 'visible' });
      Reporter.validateEdit('', this.expectedMakeName, this.expectedMakeName, 'Make Creation', testInfo);
      console.log(`\n========== MAKE CREATED ==========\nCreated Make : ${this.expectedMakeName}\n==================================\n`);
    });
    return this.expectedMakeName;
  }

  async verifyAddedMakeIsDisplayed(testInfo: TestInfo): Promise<boolean> {
    let makeFound = false;
    const makeNameToVerify = this.expectedMakeName;
    let actualValue = 'No record found';
    await test.step('Verify Added Make In Summary Table', async () => {
      makeFound = await searchbyName(this.page, this.searchInput, makeNameToVerify, 'button:has-text("Next ›")', 'table tbody tr', 1);
      actualValue = makeFound ? makeNameToVerify : 'No record found';
      await testInfo.attach('After Search Make', { body: await this.page.screenshot(), contentType: 'image/png' });
      Reporter.validateSearch(makeNameToVerify, makeFound ? 1 : 0, 1, testInfo);
      Reporter.validateData(makeNameToVerify, actualValue, 'Make Display in Summary Table', testInfo);
      logAndValidate({ step: 'Verify make appears in summary table', expected: makeNameToVerify, actual: actualValue }, testInfo);
      console.log(`\nExpected: ${makeNameToVerify}\nActual: ${actualValue}\nStatus: ${makeFound ? 'PASS' : 'FAIL'}\n`);
      expect(makeFound).toBeTruthy();
      const validationStatus = makeFound ? 'PASS' : 'FAIL';
    });
    return makeFound;
  }
  
  async validateMakeTableColumns(expectedColumns: string[], testInfo: TestInfo): Promise<void> {
    await test.step('Validate Make Table Columns', async () => {
      const columnHeaders = await this.page.locator('table thead th').allTextContents();
      const actualColumns = columnHeaders.map(header => header.trim()).filter(header => header.length > 0);
      await Reporter.validateColumns(expectedColumns, actualColumns, testInfo, 'Make Table Columns');
    });
  }
}