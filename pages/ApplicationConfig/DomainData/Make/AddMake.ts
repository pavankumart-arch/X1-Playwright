import { expect, Locator, Page, TestInfo } from '@playwright/test';
import { BasePage } from '../../../BasePage';
import MakeData from '../../../../testdata/DomainData.json';
import { logAndValidate } from '../../../utils/reportUtil';

export class AddMake extends BasePage {

  addMakeButton: Locator;
  makeNameInput: Locator;
  activeCheckbox: Locator;
  cancelButton: Locator;
  saveMakeButton: Locator;
  addMakeHeading: Locator;
  searchInput: Locator;

  constructor(page: Page) {

    super(page);

    this.addMakeButton = page.locator('[class="flex items-center gap-2"]');

    this.makeNameInput = page.locator('#admin-make-create-make');

    this.activeCheckbox = page.locator('svg.lucide-check');

    this.cancelButton = page.getByRole('button', { name: 'Cancel' });

    this.saveMakeButton = page.getByRole('button', { name: 'Save Make' });

    this.addMakeHeading = page.getByRole('heading', { name: 'Add Make' });

    this.searchInput = page.locator('input[placeholder*="Search"]');
  }

  async addMake(testInfo: TestInfo): Promise<string> {

    const uniqueMake = `${MakeData.Make}_${Date.now()}`;

    try {

      await this.addMakeButton.click();

      await expect(this.addMakeHeading).toBeVisible();

      logAndValidate({ step: 'Open Add Make popup', expected: 'Popup opened', actual: 'Popup opened' }, testInfo);

    } catch (error) {

      const errorMessage = error instanceof Error ? error.message : String(error);

      logAndValidate({ step: 'Open Add Make popup', expected: 'Popup opened', actual: `Failed: ${errorMessage}` }, testInfo);

      throw error;
    }

    try {

      await this.makeNameInput.fill(uniqueMake);

      const enteredValue = await this.makeNameInput.inputValue();

      logAndValidate({ step: 'Fill Make Name', expected: uniqueMake, actual: enteredValue }, testInfo);

      expect.soft(enteredValue).toBe(uniqueMake);

    } catch (error) {

      const errorMessage = error instanceof Error ? error.message : String(error);

      logAndValidate({ step: 'Fill Make Name', expected: uniqueMake, actual: `Failed: ${errorMessage}` }, testInfo);

      throw error;
    }

    try {

      await Promise.all([this.page.waitForLoadState('networkidle'), this.saveMakeButton.click()]);

      logAndValidate({ step: 'Click Save Make', expected: 'Make saved successfully', actual: 'Make saved successfully' }, testInfo);

    } catch (error) {

      const errorMessage = error instanceof Error ? error.message : String(error);

      logAndValidate({ step: 'Click Save Make', expected: 'Make saved successfully', actual: `Failed: ${errorMessage}` }, testInfo);

      throw error;
    }

    await this.page.waitForTimeout(3000);

    const foundMake = await this.searchMakeAcrossPages(uniqueMake, testInfo);

    logAndValidate({ step: 'Verify added Make', expected: uniqueMake, actual: foundMake ?? 'Not Found' }, testInfo);

    expect.soft(foundMake).toBe(uniqueMake);

    return uniqueMake;
  }

  async searchMakeAcrossPages(targetMake: string, testInfo: TestInfo): Promise<string | null> {

    try {

      await this.searchInput.fill('');

      await this.searchInput.fill(targetMake);

      await this.searchInput.press('Enter');

      await this.page.waitForLoadState('networkidle');

      await this.page.waitForTimeout(2000);

      let currentPage = 1;

      while (true) {

        const rows = this.page.locator('table tbody tr');

        const rowCount = await rows.count();

        for (let i = 0; i < rowCount; i++) {

          const makeCell = rows.nth(i).locator('td').nth(0);

          const makeText = await makeCell.textContent();

          if (makeText?.trim() === targetMake) {

            logAndValidate({ step: `Search Make Page ${currentPage}`, expected: targetMake, actual: targetMake }, testInfo);

            return makeText.trim();
          }
        }

        const nextButton = this.page.locator('button:has-text("Next")');

        const isNextEnabled = await nextButton.isEnabled().catch(() => false);

        if (!isNextEnabled) break;

        await nextButton.click();

        await this.page.waitForLoadState('networkidle');

        currentPage++;
      }

      logAndValidate({ step: 'Search Make', expected: targetMake, actual: 'Not Found' }, testInfo);

      return null;

    } catch (error) {

      const errorMessage = error instanceof Error ? error.message : String(error);

      logAndValidate({ step: 'Search Make', expected: targetMake, actual: `Error: ${errorMessage}` }, testInfo);

      return null;
    }
  }
}