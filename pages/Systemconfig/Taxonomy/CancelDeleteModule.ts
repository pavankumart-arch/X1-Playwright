import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../../BasePage';

export class CancelDeleteModule extends BasePage {

  searchBox: Locator;

  constructor(page: Page) {

    super(page);

    this.searchBox =
      page.getByPlaceholder('Search...').first();
  }

  // =========================================
  // SEARCH MODULE
  // =========================================
  async searchModule(
    moduleName: string
  ) {

    await expect(
      this.searchBox
    ).toBeVisible({
      timeout: 10000
    });

    await this.searchBox.fill('');

    await this.searchBox.fill(moduleName);

    await this.page.waitForTimeout(1500);

    const row =
      this.page.locator('table tbody tr')
        .filter({
          has: this.page.locator('td').filter({
            hasText: moduleName
          })
        });

    await expect(
      row.first()
    ).toBeVisible();

    console.log(`✅ Module Found : ${moduleName}`);
  }

  // =========================================
  // CLICK DELETE -> CANCEL
  // =========================================
  async clickCancelDelete(
    moduleName: string
  ) {

    const row =
      this.page.locator('table tbody tr')
        .filter({
          has: this.page.locator('td').filter({
            hasText: moduleName
          })
        });

    const deleteButton =
      row.locator('td').last().locator('button').nth(1);

    await deleteButton.click();

    console.log(`✅ Delete clicked for ${moduleName}`);

    const cancelButton =
      this.page.getByRole(
        'button',
        {
          name: /cancel/i
        }
      ).last();

    await expect(cancelButton).toBeVisible();

    await cancelButton.click();

    console.log('✅ Delete cancelled');

    await this.page.waitForTimeout(1000);
  }

  // =========================================
  // VERIFY MODULE EXISTS
  // =========================================
  async validateModuleStillExists(
    moduleName: string
  ): Promise<boolean> {

    await this.searchBox.fill('');

    await this.searchBox.fill(moduleName);

    await this.page.waitForTimeout(1500);

    const row =
      this.page.locator('table tbody tr')
        .filter({
          has: this.page.locator('td').filter({
            hasText: moduleName
          })
        });

    const exists =
      await row.count() > 0;

    console.log(
      exists
        ? `✅ Module still exists : ${moduleName}`
        : `❌ Module not found : ${moduleName}`
    );

    return exists;
  }

  // =========================================
  // COMPLETE FLOW
  // =========================================
  async CancelDeleteModule(
    moduleName: string
  ): Promise<boolean> {

    await this.searchModule(moduleName);

    await this.clickCancelDelete(moduleName);

    return await this.validateModuleStillExists(moduleName);
  }
}