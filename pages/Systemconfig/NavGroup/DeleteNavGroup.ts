import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../../BasePage';

export class DeleteNavGroup extends BasePage {

  SearchBox: Locator;

  constructor(page: Page) {

    super(page);

    this.SearchBox =
      page.getByPlaceholder('Search...').first();
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

    await this.page.waitForTimeout(1500);

    const row =
      this.page.locator('table tbody tr')
        .filter({
          has: this.page.locator('td').filter({
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

  async clickDeleteButton(
    navGroupName: string
  ): Promise<void> {

    const targetRow =
      this.page.locator('table tbody tr')
        .filter({
          has: this.page.locator('td').filter({
            hasText: navGroupName
          })
        });

    const actionsCell =
      targetRow.locator('td').last();

    const deleteButton =
      actionsCell.locator('button').nth(1);

    await expect(
      deleteButton
    ).toBeVisible();

    await deleteButton.click();

    console.log(
      `✅ Delete icon clicked for ${navGroupName}`
    );

    const confirmDeleteBtn =
      this.page.getByRole(
        'button',
        { name: /^Delete$/ }
      ).last();

    await expect(
      confirmDeleteBtn
    ).toBeVisible();

    await confirmDeleteBtn.click();

    console.log(
      '✅ Delete confirmed'
    );

    await this.page.waitForLoadState(
      'networkidle'
    );
  }

  async validateDeletedNavGroup(
    navGroupName: string
  ): Promise<boolean> {

    await this.SearchBox.fill('');

    await this.SearchBox.fill(
      navGroupName
    );

    await this.page.waitForTimeout(2000);

    const row =
      this.page.locator('table tbody tr')
        .filter({
          has: this.page.locator('td').filter({
            hasText: navGroupName
          })
        });

    const count =
      await row.count();

    const isDeleted =
      count === 0;

    expect(
      isDeleted
    ).toBeTruthy();

    console.log(
      isDeleted
        ? `✅ Nav Group Deleted Successfully : ${navGroupName}`
        : `❌ Nav Group Still Exists : ${navGroupName}`
    );

    return isDeleted;
  }

  async DeleteNavGroup(
    navGroupName: string
  ): Promise<boolean> {

    try {

      await this.searchNavGroup(
        navGroupName
      );

      await this.clickDeleteButton(
        navGroupName
      );

      const isDeleted =
        await this.validateDeletedNavGroup(
          navGroupName
        );

      console.log(
        '✅ Nav Group Delete Flow Completed'
      );

      return isDeleted;

    } catch (error) {

      console.log(
        `❌ Delete Nav Group Failed : ${error}`
      );

      return false;
    }
  }
}