import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../../BasePage';

export class CancelDeleteAppType extends BasePage {

  SearchBox: Locator;

  constructor(page: Page) {

    super(page);

    this.SearchBox =
      page.getByPlaceholder('Search...').first();
  }

  async searchAppType(
    appTypeName: string
  ) {

    await this.SearchBox.waitFor({
      state: 'visible'
    });

    await this.SearchBox.fill('');

    await this.SearchBox.fill(
      appTypeName
    );

    await this.page.waitForTimeout(1500);

    const row =
      this.page.locator('table tbody tr')
        .filter({
          has: this.page.locator('td').filter({
            hasText: appTypeName
          })
        });

    await expect(
      row.first()
    ).toBeVisible();

    console.log(
      `✅ AppType Found : ${appTypeName}`
    );
  }

  async clickCancelDelete(
    appTypeName: string
  ) {

    const targetRow =
      this.page.locator('table tbody tr')
        .filter({
          has: this.page.locator('td', {
            hasText: appTypeName
          })
        });

    const actionsCell =
      targetRow.locator('td').last();

    const deleteIcon =
      actionsCell.locator('button').nth(1);

    await deleteIcon.click();

    console.log(
      `✅ Delete icon clicked for ${appTypeName}`
    );

    const cancelButton =
      this.page.getByRole(
        'button',
        {
          name: /cancel/i
        }
      ).last();

    await expect(
      cancelButton
    ).toBeVisible();

    await cancelButton.click();

    console.log(
      '✅ Delete cancelled'
    );

    await this.page.waitForTimeout(
      1000
    );
  }

  async validateAppTypeStillExists(
    appTypeName: string
  ): Promise<boolean> {

    await this.SearchBox.fill('');

    await this.SearchBox.fill(
      appTypeName
    );

    await this.page.waitForTimeout(
      1500
    );

    const row =
      this.page.locator('table tbody tr')
        .filter({
          has: this.page.locator('td')
            .filter({
              hasText: appTypeName
            })
        });

    const exists =
      await row.count() > 0;

    console.log(
      exists
        ? `✅ AppType still exists : ${appTypeName}`
        : `❌ AppType not found : ${appTypeName}`
    );

    return exists;
  }

  async CancelDeleteAppType(
    appTypeName: string
  ): Promise<boolean> {

    try {

      await this.searchAppType(
        appTypeName
      );

      await this.clickCancelDelete(
        appTypeName
      );

      return await this.validateAppTypeStillExists(
        appTypeName
      );

    } catch (error) {

      console.log(
        `❌ Cancel Delete Failed : ${error}`
      );

      return false;
    }
  }
}