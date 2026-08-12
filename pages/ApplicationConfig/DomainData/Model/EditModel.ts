import { expect, Locator, Page, TestInfo, test } from '@playwright/test';
import { BasePage } from '../../../BasePage';
import ModelData from '../../../../testdata/DomainData.json';
import { Reporter } from '../../../utils/NewReport';
import { searchbyName } from '../../../utils/Searchnew';
import { AddModel } from './AddModel';

export class EditModel extends BasePage {

  addModelButton: Locator;
  modelNameInput: Locator;
  activeCheckbox: Locator;
  cancelButton: Locator;
  saveModelButton: Locator;
  addModelHeading: Locator;
  searchInput: Locator;
  editButton: Locator;
  updateModelButton: Locator;
  editModelHeading: Locator;

  public expectedModelName: string = '';

  constructor(page: Page) {
    super(page);

    this.addModelButton = page.locator('[class="flex items-center gap-2"]');
    // TEMPORARY locator - verify on Edit page
    this.modelNameInput = page.locator('input[type="text"]').first();
    this.activeCheckbox = page.locator('svg.lucide-check');
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.saveModelButton = page.getByRole('button', { name: 'Save Model' });
    this.addModelHeading = page.getByRole('heading', { name: 'Add Model' });
    this.searchInput = page.getByPlaceholder('Search');
    this.editButton = page.locator('svg.lucide-square-pen').first();
    this.updateModelButton = page.getByRole('button', { name: 'Update Model' });
    this.editModelHeading = page.getByRole('heading', { name: 'Edit Model' });
  }

  async editAndVerifyModel(testInfo: TestInfo): Promise<void> {

    const addModel = new AddModel(this.page);

    await addModel.createAndVerifyMake(testInfo);
    await addModel.clickOnMakeName(testInfo);
    await addModel.verifyAddModelButtonIsVisible(testInfo);
    await addModel.addModel(testInfo);
    await addModel.verifyAddedModelIsDisplayed(testInfo);

   const updatedModelName = `${ModelData.EditModelname}_${Date.now()}`;

    await test.step('Click Edit Model Button', async () => {

      await this.editButton.click();

      await expect(this.editModelHeading).toBeVisible({
        timeout: 10000
      });

      await testInfo.attach('Edit Model Page', {
        body: await this.page.screenshot(),
        contentType: 'image/png'
      });

      console.log('Edit Model page displayed');
    });

    await test.step('Update Model Name', async () => {

      await expect(this.editModelHeading).toBeVisible();

      await expect(this.modelNameInput).toBeVisible({
        timeout: 10000
      });

      const existingValue = await this.modelNameInput.inputValue();

      console.log(`Existing Model Name: ${existingValue}`);

      await this.modelNameInput.clear();

      await this.modelNameInput.fill(updatedModelName);

      await this.updateModelButton.click();

      await expect(this.searchInput).toBeVisible({
        timeout: 10000
      });

      await testInfo.attach('After Update Model', {
        body: await this.page.screenshot(),
        contentType: 'image/png'
      });

      console.log(`Model updated to ${updatedModelName}`);
    });

    await test.step('Verify Edited Model Displayed', async () => {

      const modelFound = await searchbyName(
        this.page,
        this.searchInput,
        updatedModelName,
        'button:has-text("Next ›")',
        'table tbody tr',
        1
      );

      Reporter.validateData(
        updatedModelName,
        modelFound ? updatedModelName : 'Not Found',
        'Verify Edited Model',
        testInfo
      );

      expect(modelFound).toBeTruthy();
    });

    await test.step('Open Edit Page Again', async () => {

      await this.searchInput.fill(updatedModelName);

      await this.page.waitForTimeout(1000);

      await this.editButton.click();

      await expect(this.editModelHeading).toBeVisible({
        timeout: 10000
      });

      await testInfo.attach('Reopen Edit Page', {
        body: await this.page.screenshot(),
        contentType: 'image/png'
      });
    });

    await test.step('Verify Updated Value In Input Field', async () => {

      await expect(this.modelNameInput).toBeVisible({
        timeout: 10000
      });

      const actualValue = await this.modelNameInput.inputValue();

      Reporter.validateData(
        updatedModelName,
        actualValue,
        'Verify Edited Model Value',
        testInfo
      );

      expect(actualValue).toBe(updatedModelName);

      await testInfo.attach('Verify Input Value', {
        body: await this.page.screenshot(),
        contentType: 'image/png'
      });
    });

    await test.step('Click Cancel Button', async () => {

      await this.cancelButton.click();

      await expect(this.searchInput).toBeVisible({
        timeout: 10000
      });

      await testInfo.attach('After Cancel', {
        body: await this.page.screenshot(),
        contentType: 'image/png'
      });

      console.log('Cancel button clicked successfully');
    });
  }
}