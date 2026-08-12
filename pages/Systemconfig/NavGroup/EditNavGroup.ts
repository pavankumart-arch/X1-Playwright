import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../../BasePage';

export class EditNavGroup extends BasePage {

  SearchBox: Locator;
  Label: Locator;
  Icon: Locator;
  SaveButton: Locator;

  constructor(page: Page) {

    super(page);

    this.SearchBox =
      page.getByPlaceholder('Search...').first();

    this.Label = page.getByRole('textbox', {
  name: 'Label'
});
this.Icon =
  page.getByRole('textbox', {
    name: /icon/i
  });

    this.SaveButton =
      page.getByRole('button', {
        name: /Save Nav Group|Update Nav Group/i
      });
  }

  async searchNavGroup(
    navGroupName: string
  ) {

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

  async clickEditButton(
    navGroupName: string
  ) {

    const targetRow =
      this.page.locator('table tbody tr')
        .filter({
          has: this.page.locator('td')
            .filter({
              hasText: navGroupName
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
      `✅ Edit clicked for ${navGroupName}`
    );

    await this.page.waitForLoadState(
      'networkidle'
    );

    await expect(
      this.Label
    ).toBeVisible();
  }

  async updateNavGroup(
    updatedLabel: string,
    updatedIcon: string
  ) {

    await this.Label.clear();

    await this.Label.fill(
      updatedLabel
    );

    await this.Icon.clear();

    await this.Icon.fill(
      updatedIcon
    );

    await this.SaveButton.click();

    await this.page.waitForLoadState(
      'networkidle'
    );

    console.log(
      '✅ Nav Group Updated'
    );
  }

  async validateUpdatedNavGroup(
    updatedLabel: string
  ) {

   await this.SearchBox.waitFor({
  state: 'visible'
});

await this.SearchBox.click();

await this.SearchBox.clear();

await this.SearchBox.press('Control+A');
await this.SearchBox.press('Backspace');
await this.SearchBox.fill(updatedLabel);

await this.page.waitForTimeout(2000);

    

    const row =
      this.page.locator('table tbody tr')
        .filter({
          has: this.page.locator('td')
            .filter({
              hasText: updatedLabel
            })
        });

    await expect(
      row.first()
    ).toBeVisible();

    console.log(
      `✅ Updated Nav Group Validated : ${updatedLabel}`
    );
  }

  async EditNavGroup(
    existingLabel: string,
    updatedLabel: string,
    updatedIcon: string
  ) {

    await this.searchNavGroup(
      existingLabel
    );

    await this.clickEditButton(
      existingLabel
    );

    await this.updateNavGroup(
      updatedLabel,
      updatedIcon
    );

    await this.validateUpdatedNavGroup(
      updatedLabel
    );

    console.log(
      '✅ Nav Group Edited Successfully'
    );
  }
}