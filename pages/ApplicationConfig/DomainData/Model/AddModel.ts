import { expect, Locator, Page, TestInfo, test } from '@playwright/test';
import { BasePage } from '../../../BasePage';
import ModelData from '../../../../testdata/DomainData.json';
import { Reporter } from '../../../utils/NewReport';
import { searchbyName } from '../../../utils/Searchnew';
import { AddMake } from '../Make/AddMake';

export class AddModel extends BasePage {
  addModelButton: Locator;
  modelNameInput: Locator;
  activeCheckbox: Locator;
  cancelButton: Locator;
  saveModelButton: Locator;
  addModelHeading: Locator;
  searchInput: Locator;

  protected expectedModelName: string = '';
  protected makeName: string = '';

  constructor(page: Page) {
    super(page);

    this.addModelButton = page.locator('[class="flex items-center gap-2"]');
    this.modelNameInput = page.locator('#admin-model-create-modelName');
    this.activeCheckbox = page.locator('svg.lucide-check');
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.saveModelButton = page.getByRole('button', { name: 'Save Model' });
    this.addModelHeading = page.locator('h2').filter({
      hasText: 'Add Model'
    });
    this.searchInput = page.getByPlaceholder('Search');
  }

  async createAndVerifyMake(testInfo: TestInfo): Promise<string> {
    const addMakePage = new AddMake(this.page);

    const makeName = await addMakePage.addMake(testInfo);
    this.makeName = makeName;

    await addMakePage.verifyAddedMakeIsDisplayed(testInfo);

    return makeName;
  }

  async clickOnMakeName(testInfo: TestInfo): Promise<void> {
    await test.step(`Click on Make: ${this.makeName}`, async () => {

      // First, search for the make
      const makeFound = await searchbyName(
        this.page,
        this.searchInput,
        this.makeName,
        'button:has-text("Next ›")',
        'table tbody tr',
        1
      );

      if (!makeFound) {
        throw new Error(`Make "${this.makeName}" not found in the table`);
      }

      await testInfo.attach('Before Clicking Make Name', {
        body: await this.page.screenshot(),
        contentType: 'image/png'
      });

      // Find the row containing the make name
      const makeRow = this.page.locator('table tbody tr').filter({
        has: this.page.locator(`td:has-text("${this.makeName}")`)
      }).first();

      // Wait for the row to be visible
      await makeRow.waitFor({ state: 'visible', timeout: 10000 });

      // The make name is in a cell, and it's likely a link
      // Find the link within the row that contains the make name
      const makeLink = makeRow.locator('a').filter({
        hasText: this.makeName
      }).first();

      // Alternative: If it's not a link but a cell with click handler
      // const makeLink = makeRow.locator('td').filter({
      //   hasText: this.makeName
      // }).first();

      // Wait for the link to be visible and clickable
      await makeLink.waitFor({ 
        state: 'visible', 
        timeout: 10000 
      });

      // Click on the make name link
      await makeLink.click();

      // Wait for navigation to Models page
      await this.page.waitForLoadState('networkidle');
      
      // Wait for the Models page to load by checking for the Add Model button
      await this.page.waitForSelector('[class="flex items-center gap-2"]', { 
        state: 'visible',
        timeout: 15000 
      });

      await testInfo.attach('After Clicking Make Name', {
        body: await this.page.screenshot(),
        contentType: 'image/png'
      });

      console.log(`
✅ Make Name Clicked: ${this.makeName}
✅ Navigated to Models page successfully
URL: ${await this.page.url()}
`);
    });
  }

  async verifyAddModelButtonIsVisible(testInfo: TestInfo): Promise<boolean> {
    let isVisible = false;

    await test.step('Verify Add Model Button Is Visible', async () => {
      await this.addModelButton.waitFor({
        state: 'visible',
        timeout: 10000
      });

      isVisible = await this.addModelButton.isVisible();

      await testInfo.attach('Add Model Button Visibility', {
        body: await this.page.screenshot(),
        contentType: 'image/png'
      });

      Reporter.validateData(
        'Visible',
        isVisible ? 'Visible' : 'Not Visible',
        'Verify Add Model button is visible on Models page',
        testInfo
      );

      console.log(`
Expected: Add Model button should be visible
Actual: ${isVisible ? 'Visible' : 'Not Visible'}
Status: ${isVisible ? 'PASS' : 'FAIL'}
`);
      expect(isVisible).toBeTruthy();
    });

    return isVisible;
  }

  async verifyAddModelButtonAfterMakeCreation(testInfo: TestInfo): Promise<void> {
    await test.step('Complete Flow: Create Make and Verify Add Model Button', async () => {
      await this.createAndVerifyMake(testInfo);
      await this.clickOnMakeName(testInfo);
      await this.verifyAddModelButtonIsVisible(testInfo);

      console.log(`
========== FLOW COMPLETED SUCCESSFULLY ==========
✓ Make Created: ${this.makeName}
✓ Make Name Clicked
✓ Add Model Button Verified
`);
    });
  }

  async addModel(testInfo: TestInfo): Promise<string> {
    await test.step('Add New Model', async () => {

      await this.addModelButton.waitFor({
        state: 'visible',
        timeout: 10000
      });

      await testInfo.attach('Before Clicking Add Model', {
        body: await this.page.screenshot(),
        contentType: 'image/png'
      });

      await this.addModelButton.click();

      // Wait for Add Model popup/page
      await this.addModelHeading.waitFor({
        state: 'visible',
        timeout: 15000
      });

      await expect(this.addModelHeading).toContainText('Add Model');

      Reporter.validateData(
        'Add Model',
        (await this.addModelHeading.textContent())?.trim() || '',
        'Verify Add Model Heading',
        testInfo
      );

      await this.modelNameInput.waitFor({
        state: 'visible',
        timeout: 15000
      });

      const uniqueModelName = `${ModelData.Modelname}_${Date.now()}`;
      this.expectedModelName = uniqueModelName;

      await this.fillElement(
        this.modelNameInput,
        uniqueModelName
      );

      Reporter.validateData(
        uniqueModelName,
        await this.modelNameInput.inputValue(),
        'Verify Model Name Input',
        testInfo
      );

      await testInfo.attach('Model Name Entered', {
        body: await this.page.screenshot(),
        contentType: 'image/png'
      });

      await this.saveModelButton.click();

      await this.searchInput.waitFor({
        state: 'visible',
        timeout: 15000
      });

      console.log(`
========== MODEL CREATED ==========
Created Model : ${uniqueModelName}
==================================
`);
    });

    return this.expectedModelName;
  }

  async verifyAddedModelIsDisplayed(testInfo: TestInfo): Promise<boolean> {
    let modelFound = false;
    let actualValue = 'No record found';

    await test.step('Verify Added Model In Summary Table', async () => {
      modelFound = await searchbyName(
        this.page,
        this.searchInput,
        this.expectedModelName,
        'button:has-text("Next ›")',
        'table tbody tr',
        1
      );

      actualValue = modelFound
        ? this.expectedModelName
        : 'No record found';

      await testInfo.attach('After Search Model', {
        body: await this.page.screenshot(),
        contentType: 'image/png'
      });

      Reporter.validateData(
        this.expectedModelName,
        actualValue,
        'Verify added model appears in summary table',
        testInfo
      );

      console.log(`
Expected: ${this.expectedModelName}
Actual: ${actualValue}
Status: ${modelFound ? 'PASS' : 'FAIL'}
`);

      expect(modelFound).toBeTruthy();
    });

    return modelFound;
  }

  async completeAddModelFlow(testInfo: TestInfo): Promise<void> {
    await test.step('Complete Add Model Flow', async () => {
      await this.verifyAddModelButtonAfterMakeCreation(testInfo);
      await this.addModel(testInfo);
      await this.verifyAddedModelIsDisplayed(testInfo);

      console.log(`
========== COMPLETE MODEL FLOW COMPLETED ==========
✓ Make Created: ${this.makeName}
✓ Add Model Button Verified
✓ Model Created: ${this.expectedModelName}
✓ Model Verified
`);
    });
  }
}