import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../../BasePage';

export class EditAppType extends BasePage {

  SearchBox: Locator;
  Title: Locator;
  Identifier: Locator;
  SaveButton: Locator;

  constructor(page: Page) {

    super(page);

    this.SearchBox =
      page.getByPlaceholder('Search...').first();

    this.Title =
  page.getByRole('textbox', {
    name: /title/i
  });

this.Identifier =
  page.getByRole('textbox', {
    name: /identifier|type/i
  });
    this.SaveButton =
  page.getByRole('button', {
    name: /Update Apptype/i
  });
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

    await expect(row.first())
      .toBeVisible({
        timeout: 10000
      });

    console.log(`✅ AppType Found : ${appTypeName}`);
  }

  async clickEditButton(
  appTypeName: string
) {

  const targetRow =
    this.page.locator('table tbody tr')
      .filter({
        has: this.page.locator('td').filter({
          hasText: appTypeName
        })
      });

  await expect(
    targetRow.first()
  ).toBeVisible();

  const actionsCell =
    targetRow.locator('td').last();

  const editButton =
    actionsCell.locator('button').nth(0);

  await expect(
    editButton
  ).toBeVisible();

  await editButton.click();

  console.log(
    `✅ Edit clicked for ${appTypeName}`
  );

  await this.page.waitForLoadState(
    'networkidle'
  );

  await expect(
    this.Title
  ).toBeVisible({
    timeout: 10000
  });

  console.log(
    '✅ Edit form opened'
  );
}
  async updateAppType(
    updatedTitle: string,
    updatedIdentifier: string
  ) {

    await this.Title.clear();

    await this.Title.fill(
      updatedTitle
    );

    await this.Identifier.clear();

    await this.Identifier.fill(
      updatedIdentifier
    );

    await this.SaveButton.click();

    await this.page.waitForLoadState(
      'networkidle'
    );

    console.log('✅ AppType updated');
  }

 async validateUpdatedAppType(
  updatedTitle: string
): Promise<string | null> {

  await this.SearchBox.fill('');

  await this.SearchBox.fill(
    updatedTitle
  );

  await this.page.waitForTimeout(1500);

  const row =
    this.page.locator('table tbody tr')
      .filter({
        has: this.page.locator('td', {
          hasText: updatedTitle
        })
      });

  const count =
    await row.count();

  if (count > 0) {

    console.log(
      `✅ Updated AppType Validated : ${updatedTitle}`
    );

    return updatedTitle;
  }

  return null;
}
  async EditAppType(
    existingTitle: string,
    updatedTitle: string,
    updatedIdentifier: string
  ) {

    console.log(
      'Current URL Before Edit :',
      this.page.url()
    );

    // After Add AppType application redirects to Modules page
    if (
      this.page.url().includes('app_module')
    ) {

      await this.page.goBack();

      await this.page.waitForLoadState(
        'networkidle'
      );

      console.log(
        '✅ Returned to AppType list page'
      );
    }

    await this.searchAppType(
      existingTitle
    );

    await this.clickEditButton(
      existingTitle
    );

    await this.updateAppType(
      updatedTitle,
      updatedIdentifier
    );

    await this.validateUpdatedAppType(
      updatedTitle
    );

    console.log(
      '✅ AppType Edited Successfully'
    );
  }
}