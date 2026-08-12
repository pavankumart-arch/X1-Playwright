import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../../BasePage';

export class DeleteModule extends BasePage {

  SearchBox: Locator;

  constructor(page: Page) {

    super(page);

    this.SearchBox =
      page.getByPlaceholder('Search...')
        .first();
  }

  // ==========================
  // SEARCH MODULE
  // ==========================

  async searchModule(
    moduleName: string
  ) {

    await this.SearchBox.waitFor({
      state: 'visible'
    });

    await this.SearchBox.fill('');

    await this.SearchBox.fill(
      moduleName
    );

    await this.page.waitForTimeout(
      1500
    );

    const row =
      this.page.locator('table tbody tr')
        .filter({
          has: this.page.locator('td')
            .filter({
              hasText: moduleName
            })
        });

    await expect(
      row.first()
    ).toBeVisible();

    console.log(
      `✅ Module Found : ${moduleName}`
    );
  }

  // ==========================
  // CLICK DELETE
  // ==========================

  async clickDeleteButton(
    moduleName: string
  ) {

    const targetRow =
      this.page.locator('table tbody tr')
        .filter({
          has: this.page.locator('td', {
            hasText: moduleName
          })
        });

    const actionsCell =
      targetRow.locator('td').last();

    const deleteButton =
      actionsCell.locator('button').nth(1);

    await deleteButton.click();

    console.log(
      `✅ Delete icon clicked for ${moduleName}`
    );

    const confirmDelete =
      this.page.getByRole('button', {
        name: 'Delete'
      }).last();

    await expect(
      confirmDelete
    ).toBeVisible();

    await confirmDelete.click();

    await this.page.waitForLoadState(
      'networkidle'
    );

    await this.page.waitForTimeout(
      2000
    );

    console.log(
      '✅ Confirm Delete clicked'
    );
  }

  // ==========================
  // VERIFY DELETE
  // ==========================

  async validateDeletedModule(
    moduleName: string
  ): Promise<boolean> {

    try {

      await this.SearchBox.fill('');

      await this.SearchBox.fill(
        moduleName
      );

      await this.page.waitForTimeout(
        1500
      );

      const row =
        this.page.locator('table tbody tr')
          .filter({
            has: this.page.locator('td')
              .filter({
                hasText: moduleName
              })
          });

      await expect(row)
        .toHaveCount(0);

      console.log(
        `✅ Module Deleted : ${moduleName}`
      );

      return true;

    } catch (error) {

      console.log(
        `❌ Delete Failed : ${error}`
      );

      return false;
    }
  }
// ==========================
// OPEN APP TYPE
// ==========================

async openAppType(
  appTypeName: string
) {

  await this.SearchBox.waitFor({
    state: 'visible'
  });

  await this.SearchBox.fill('');

  await this.SearchBox.fill(
    appTypeName
  );

  await this.page.waitForTimeout(
    2000
  );

  const row =
    this.page.locator('table tbody tr')
      .filter({
        has: this.page.locator('td')
          .filter({
            hasText: appTypeName
          })
      });

  await expect(
    row.first()
  ).toBeVisible();

  // Click the App Type name
  await row
    .locator('td')
    .nth(1)
    .click();

  await this.page.waitForLoadState(
    'networkidle'
  );

  console.log(
    `✅ Opened App Type : ${appTypeName}`
  );
}
  // ==========================
  // DELETE MODULE
  // ==========================

  async DeleteModule(
    moduleName: string
  ) {

    await this.searchModule(
      moduleName
    );

    await this.clickDeleteButton(
      moduleName
    );

    return await this.validateDeletedModule(
      moduleName
    );
  }

}