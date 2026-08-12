import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../../BasePage';

export class DeleteNavItem extends BasePage {

  SearchBox: Locator;

  constructor(page: Page) {

    super(page);

    this.SearchBox =
      page.getByPlaceholder('Search...')
        .first();
  }

  async clickDeleteButton(
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
      targetRow.locator('td')
        .last();

    const deleteButton =
      actionsCell.locator('button')
        .nth(1);

    await deleteButton.click();

    console.log(
      `✅ Delete button clicked for ${navItemName}`
    );
  }

  async DeleteNavItem(
  navItemName: string
): Promise<void> {

  await this.SearchBox.fill('');

  await this.SearchBox.fill(
    navItemName
  );

  await this.page.waitForTimeout(2000);

  const targetRow =
    this.page.locator('table tbody tr')
      .filter({
        has: this.page.locator('td', {
          hasText: navItemName
        })
      });

  await expect(
    targetRow.first()
  ).toBeVisible();

  const actionsCell =
    targetRow.locator('td').last();

  // Delete icon = second button
  const deleteButton =
    actionsCell.locator('button').nth(1);

  await deleteButton.click();

  console.log(
    `✅ Delete button clicked for ${navItemName}`
  );

  // ===== Confirmation Popup =====

  const confirmDeleteButton =
    this.page.locator('button').filter({
      hasText: /^Delete$/i
    }).last();

  await confirmDeleteButton.waitFor({
    state: 'visible',
    timeout: 10000
  });

  await confirmDeleteButton.click();

  console.log(
    '✅ Delete confirmed'
  );

  await this.page.waitForLoadState(
    'networkidle'
  );

  await this.page.waitForTimeout(
    2000
  );
}

  async verifyDeleted(
  navItemName: string
): Promise<boolean> {

  await this.SearchBox.fill('');

  await this.SearchBox.fill(
    navItemName
  );

  await this.page.waitForTimeout(
    2000
  );

  const row =
    this.page.locator('table tbody tr')
      .filter({
        has: this.page.locator('td', {
          hasText: navItemName
        })
      });

  return await row.count() === 0;
}
}