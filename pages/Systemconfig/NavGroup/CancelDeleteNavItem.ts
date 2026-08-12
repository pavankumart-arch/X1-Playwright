import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../../BasePage';

export class CancelDeleteNavItem extends BasePage {

  SearchBox: Locator;

  constructor(page: Page) {

    super(page);

    this.SearchBox =
      page.getByPlaceholder('Search...')
        .first();
  }

  async searchNavItem(
    navItemName: string
  ): Promise<void> {

    await this.SearchBox.waitFor({
      state: 'visible'
    });

    await this.SearchBox.fill('');

    await this.SearchBox.fill(
      navItemName
    );

    await this.page.waitForTimeout(1500);

    const row =
      this.page.locator('table tbody tr')
        .filter({
          has: this.page.locator('td')
            .filter({
              hasText: navItemName
            })
        });

    await expect(
      row.first()
    ).toBeVisible();

    console.log(
      `✅ Nav Item Found : ${navItemName}`
    );
  }

  async clickCancelDelete(
    navItemName: string
  ): Promise<void> {

    const row =
      this.page.locator('table tbody tr')
        .filter({
          has: this.page.locator('td')
            .filter({
              hasText: navItemName
            })
        });

    const deleteButton =
      row.locator('button')
        .last();

    await expect(
      deleteButton
    ).toBeVisible();

    await deleteButton.click();

    console.log(
      `✅ Delete icon clicked for ${navItemName}`
    );

    const cancelButton =
      this.page.getByRole(
        'button',
        {
          name: /cancel/i
        }
      );

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

  async verifyNavItemStillExists(
    navItemName: string
  ): Promise<boolean> {

    await this.SearchBox.fill('');

    await this.SearchBox.fill(
      navItemName
    );

    await this.page.waitForTimeout(
      1500
    );

    const row =
      this.page.locator('table tbody tr')
        .filter({
          has: this.page.locator('td')
            .filter({
              hasText: navItemName
            })
        });

    const exists =
      await row.count() > 0;

    console.log(
      exists
        ? `✅ Nav Item still exists : ${navItemName}`
        : `❌ Nav Item missing : ${navItemName}`
    );

    return exists;
  }

  async CancelDeleteNavItem(
    navItemName: string
  ): Promise<boolean> {

    try {

      await this.searchNavItem(
        navItemName
      );

      await this.clickCancelDelete(
        navItemName
      );

      return await this.verifyNavItemStillExists(
        navItemName
      );

    } catch (error) {

      console.log(
        `❌ Cancel Delete Failed : ${error}`
      );

      return false;
    }
  }
}