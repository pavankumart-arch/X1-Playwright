import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../../BasePage';

export class EditNavItem extends BasePage {

  SearchBox: Locator;
  Label: Locator;
  SaveNavItemButton: Locator;

  constructor(page: Page) {

    super(page);

    this.SearchBox =
      page.getByPlaceholder('Search...')
        .first();

    this.Label =
      page.getByLabel('Label');

    this.SaveNavItemButton =
  page.locator('button').filter({
    hasText: /save|update/i
  }).first();
  }

  async clickEditButton(
    navItemName: string
  ) {

    const targetRow =
      this.page.locator('table tbody tr')
        .filter({
          has: this.page.locator('td')
            .filter({
              hasText: navItemName
            })
        });

    await expect(
      targetRow.first()
    ).toBeVisible();

    const actionsCell =
      targetRow.locator('td').last();

    const editButton =
      actionsCell.locator('button').first();

    await editButton.click();

    console.log(
      `✅ Edit button clicked for ${navItemName}`
    );
  }

 async EditNavItem(
  navItemName: string,
  updatedNavItemName: string
): Promise<string> {

  await this.SearchBox.waitFor({
    state: 'visible'
  });

  await this.SearchBox.clear();

  await this.SearchBox.fill(
    navItemName
  );

  await this.page.waitForTimeout(
    1000
  );

  await this.clickEditButton(
    navItemName
  );

  await this.Label.waitFor({
    state: 'visible',
    timeout: 10000
  });

  await this.Label.clear();

  await this.Label.fill(
    updatedNavItemName
  );

  console.log(
    'Updated Label:',
    await this.Label.inputValue()
  );

  await this.SaveNavItemButton.waitFor({
    state: 'visible'
  });

  await this.SaveNavItemButton.click();

await this.page.waitForTimeout(3000);

// If app stays on update page, navigate manually
if (this.page.url().includes('/admin/navItems/update')) {

  await this.page.goto(
    'https://x1consolefe-staging.atamai.in/admin/navItems/list'
  );

  await this.page.waitForLoadState('networkidle');
}

console.log(
  'URL after update:',
  this.page.url()
);

console.log(
  `✅ Nav Item updated to ${updatedNavItemName}`
);

return updatedNavItemName;
}
  async searchNavItemInSummary(
    navItemName: string
  ): Promise<string | null> {

    try {

      await this.SearchBox.waitFor({
        state: 'visible',
        timeout: 5000
      });

      await this.SearchBox.fill('');

      await this.SearchBox.fill(
        navItemName
      );

      await this.page.waitForTimeout(
        1000
      );

      const rows =
        this.page.locator(
          'table tbody tr'
        );

      const count =
        await rows.count();

      if (count > 0) {

        const text =
          (
            await rows
              .first()
              .locator('td')
              .first()
              .textContent()
          )?.trim() || '';

        if (
          text
            .toLowerCase()
            .includes(
              navItemName.toLowerCase()
            )
        ) {

          return text;
        }
      }

      return null;

    } catch (error) {

      console.log(
        `❌ Search Error: ${error}`
      );

      return null;
    }
  }
}