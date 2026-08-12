import { Locator, Page, TestInfo, test, expect } from '@playwright/test';
import { BasePage } from '../../../BasePage';
import { searchbyName } from '../../../utils/Searchnew';

export class NavigatetoTrim extends BasePage {
  addTrimButton: Locator;
  TrimNameInput: Locator;
  activeCheckbox: Locator;
  cancelButton: Locator;
  saveTrimButton: Locator;
  addTrimHeading: Locator;
  searchInput: Locator;

  protected expectedTrimName: string = '';
  protected makeName: string = 'Ford';
  protected parentModelName: string = 'Explorer';

  constructor(page: Page) {
    super(page);

    this.addTrimButton = page.locator('[class="flex items-center gap-2"]');
    this.TrimNameInput = page.locator('#admin-trim-create-trimName');
    this.activeCheckbox = page.locator('svg.lucide-check');
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.saveTrimButton = page.getByRole('button', { name: 'Save Trim' });

    this.addTrimHeading = page.locator('h2').filter({
      hasText: 'Add Trim'
    });

    this.searchInput = page.getByPlaceholder('Search');
  }

  // Navigate from Make page to Model page
  async clickOnMakeName(testInfo: TestInfo): Promise<void> {
    await test.step(`Click on Make: ${this.makeName}`, async () => {

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

      const makeRow = this.page
        .locator('table tbody tr')
        .filter({ hasText: this.makeName })
        .first();

      await expect(makeRow).toBeVisible({
        timeout: 10000
      });

      const makeLink = makeRow.getByText(this.makeName, {
        exact: true
      });

      await expect(makeLink).toBeVisible({
        timeout: 10000
      });

      await testInfo.attach('Before Clicking Make Name', {
        body: await this.page.screenshot(),
        contentType: 'image/png'
      });

      await makeLink.click();

      await this.page.waitForLoadState('networkidle');

      await testInfo.attach('After Clicking Make Name', {
        body: await this.page.screenshot(),
        contentType: 'image/png'
      });

      console.log(`
====================================
MAKE SELECTED
====================================
Make : ${this.makeName}
URL  : ${await this.page.url()}
====================================
`);
    });
  }

  // Navigate from Model page to Trim page
  async clickOnModelName(testInfo: TestInfo): Promise<void> {
    await test.step(`Click on Model: ${this.parentModelName}`, async () => {

      const modelFound = await searchbyName(
        this.page,
        this.searchInput,
        this.parentModelName,
        'button:has-text("Next ›")',
        'table tbody tr',
        1
      );

      if (!modelFound) {
        throw new Error(`Model "${this.parentModelName}" not found in the table`);
      }

      const modelRow = this.page
        .locator('table tbody tr')
        .filter({ hasText: this.parentModelName })
        .first();

      await expect(modelRow).toBeVisible({
        timeout: 10000
      });

      const modelLink = modelRow.getByText(this.parentModelName, {
        exact: true
      });

      await expect(modelLink).toBeVisible({
        timeout: 10000
      });

      await testInfo.attach('Before Clicking Model Name', {
        body: await this.page.screenshot(),
        contentType: 'image/png'
      });

      await modelLink.click();

      await this.page.waitForLoadState('networkidle');

      await testInfo.attach('After Clicking Model Name', {
        body: await this.page.screenshot(),
        contentType: 'image/png'
      });

      console.log(`
====================================
MODEL SELECTED
====================================
Model : ${this.parentModelName}
URL   : ${await this.page.url()}
====================================
`);
    });
  }
}