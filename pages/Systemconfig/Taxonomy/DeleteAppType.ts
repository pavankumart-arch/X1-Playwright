import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../../BasePage';

export class DeleteAppType extends BasePage {

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

 async clickDeleteButton(appTypeName: string) {

  const targetRow = this.page
    .locator('table tbody tr')
    .filter({
      has: this.page.locator('td', {
        hasText: appTypeName
      })
    });

  const actionsCell = targetRow.locator('td').last();

  const deleteIcon = actionsCell.locator('button').nth(1);

  await deleteIcon.click();

  console.log(
    `✅ Delete icon clicked for ${appTypeName}`
  );

  // Wait for confirmation modal
  const confirmDeleteBtn = this.page
    .getByRole('button', { name: 'Delete' })
    .last();

  await expect(confirmDeleteBtn)
    .toBeVisible();

  await confirmDeleteBtn.click();

  console.log(
    `✅ Confirm Delete clicked`
  );
}
  async validateDeletedAppType(
  appTypeName: string
): Promise<boolean> {

  try {

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

    await expect(row)
      .toHaveCount(0);

    console.log(
      `✅ AppType Deleted : ${appTypeName}`
    );

    return true;

  } catch (error) {

    console.log(
      `❌ Delete Failed : ${error}`
    );

    return false;
  }
}

  async DeleteAppType(
    appTypeName: string
  ) {

    await this.searchAppType(
      appTypeName
    );

    await this.clickDeleteButton(
      appTypeName
    );

    await this.validateDeletedAppType(
      appTypeName
    );
  }
}