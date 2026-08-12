import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../../BasePage';

export class CancelDeleteNavGroup extends BasePage {

  SearchBox: Locator;

  constructor(page: Page) {

    super(page);

    this.SearchBox =
      page.getByPlaceholder('Search...')
        .first();
  }

  async searchNavGroup(
    navGroupName: string
  ): Promise<void> {

    await this.SearchBox.waitFor({
      state: 'visible'
    });

    await this.SearchBox.fill('');

    await this.SearchBox.fill(
      navGroupName
    );

    await this.page.waitForTimeout(
      1500
    );

    const row =
      this.page.locator('table tbody tr')
        .filter({
          has: this.page.locator('td')
            .filter({
              hasText: navGroupName
            })
        });

    await expect(
      row.first()
    ).toBeVisible();

    console.log(
      `✅ Nav Group Found : ${navGroupName}`
    );
  }

  async clickCancelDelete(
    navGroupName: string
  ): Promise<void> {

    const targetRow =
      this.page.locator('table tbody tr')
        .filter({
          has: this.page.locator('td')
            .filter({
              hasText: navGroupName
            })
        });

    const actionsCell =
      targetRow.locator('td')
        .last();

    const deleteButton =
      actionsCell.locator('button')
        .nth(1);

    await expect(
      deleteButton
    ).toBeVisible();

    await deleteButton.click();

    console.log(
      `✅ Delete icon clicked for ${navGroupName}`
    );

    const cancelButton =
      this.page.getByRole(
        'button',
        { name: /^Cancel$/i }
      );

    await expect(
      cancelButton
    ).toBeVisible();

    await cancelButton.click();

    console.log(
      '✅ Delete operation cancelled'
    );

    await this.page.waitForTimeout(
      1000
    );
  }

  async validateNavGroupStillExists(
    navGroupName: string
  ): Promise<boolean> {

    await this.SearchBox.fill('');

    await this.SearchBox.fill(
      navGroupName
    );

    await this.page.waitForTimeout(
      1500
    );

    const row =
      this.page.locator('table tbody tr')
        .filter({
          has: this.page.locator('td')
            .filter({
              hasText: navGroupName
            })
        });

    const count =
      await row.count();

    const exists =
      count > 0;

    expect(
      exists
    ).toBeTruthy();

    console.log(
      exists
        ? `✅ Nav Group Still Exists : ${navGroupName}`
        : `❌ Nav Group Missing : ${navGroupName}`
    );

    return exists;
  }

  async CancelDeleteNavGroup(
    navGroupName: string
  ): Promise<boolean> {

    try {

      await this.searchNavGroup(
        navGroupName
      );

      await this.clickCancelDelete(
        navGroupName
      );

      const exists =
        await this.validateNavGroupStillExists(
          navGroupName
        );

      console.log(
        '✅ Cancel Delete Flow Completed'
      );

      return exists;

    } catch (error) {

      console.log(
        `❌ Cancel Delete Failed : ${error}`
      );

      return false;
    }
  }
}