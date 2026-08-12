import { expect, Locator, Page, TestInfo, test } from '@playwright/test';
import { BasePage } from '../../../BasePage';
import { Reporter } from '../../../utils/NewReport';
import { AddModel } from './AddModel';

export class Addandverification extends BasePage {

  modelNameInput: Locator;
  editModelHeading: Locator;

  constructor(page: Page) {
    super(page);

    // Edit Model Input Field
    this.modelNameInput = page.locator('#admin-model-edit-modelName');

    // Edit Popup Heading
    this.editModelHeading = page.locator('h2').filter({
      hasText: 'Edit Model'
    });
  }

  async verifyAddedModelInEditPage(
    testInfo: TestInfo
  ): Promise<void> {

    await test.step(
      'Verify Added Model In Edit Page',
      async () => {

        const addModel = new AddModel(this.page);

        // Create Model
        const expectedModelName =
          await addModel.addModel(testInfo);

        // Verify Model in Summary Table
        await addModel.verifyAddedModelIsDisplayed(
          testInfo
        );

        // Locate Created Model Row
        const modelRow =
          this.page.locator('table tbody tr').filter({
            has: this.page.locator(
              `td:has-text("${expectedModelName}")`
            )
          }).first();

        await modelRow.waitFor({
          state: 'visible',
          timeout: 10000
        });

        await testInfo.attach(
          'Before Clicking Edit',
          {
            body: await this.page.screenshot(),
            contentType: 'image/png'
          }
        );

        // Click Edit Button
        const editButton =
          modelRow.locator('button').first();

        await editButton.click();

        // Wait for Edit Popup
        await this.editModelHeading.waitFor({
          state: 'visible',
          timeout: 10000
        });

        // Wait for Input Field
        await this.modelNameInput.waitFor({
          state: 'visible',
          timeout: 10000
        });

        await testInfo.attach(
          'Edit Popup Opened',
          {
            body: await this.page.screenshot(),
            contentType: 'image/png'
          }
        );

        // Get Model Name from Edit Page
        const actualModelName =
          (await this.modelNameInput.inputValue()).trim();

        console.log(`
=================================
Expected Model : ${expectedModelName}
Actual Model   : ${actualModelName}
=================================
`);

        // Report Validation
        Reporter.validateData(
          expectedModelName,
          actualModelName,
          'Verify Model Name in Edit Page',
          testInfo
        );

        // Final Assertion
        expect(actualModelName)
          .toBe(expectedModelName);

        console.log(`
=================================
Status : PASS ✅
=================================
`);
      }
    );
  }
}

