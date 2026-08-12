import { Locator, Page } from '@playwright/test';
import { BasePage } from '../../BasePage';

export class AddNavGroup extends BasePage {

  AddNavGroupButton: Locator;
  Label: Locator;
  Icon: Locator;
  ActiveCheckbox: Locator;
  SaveNavGroupButton: Locator;
  SearchBox: Locator;

  private addedNavGroupData: any = null;

  constructor(page: Page) {

    super(page);

    this.AddNavGroupButton =
  this.page.locator('button').filter({
    hasText: 'Nav Group'
  }).last();

    this.Label =
      page.locator('input[placeholder*="Vehicles"]');

    this.Icon =
      page.locator('input[placeholder*="tabler:car"]');

    this.ActiveCheckbox =
      page.locator('input[type="checkbox"]').nth(1);

    this.SaveNavGroupButton =
      page.getByRole('button', {
        name: 'Save Nav Group'
      });

    this.SearchBox =
      page.getByPlaceholder('Search...')
        .first();
  }

  async AddNavGroup(
    label: string,
    icon: string
  ): Promise<string> {

    await this.AddNavGroupButton.click();

    console.log(
      '✅ Add Nav Group page opened'
    );

    await this.Label.waitFor({
      state: 'visible',
      timeout: 10000
    });

    await this.fillElement(
      this.Label,
      label
    );

    await this.fillElement(
      this.Icon,
      icon
    );

    let activeStatus = 'Checked';

    try {

      const checked =
        await this.ActiveCheckbox.isChecked();

      activeStatus =
        checked
          ? 'Checked'
          : 'Unchecked';

    } catch {

      activeStatus = 'Checked';
    }

    this.addedNavGroupData = {
      label,
      icon,
      active: activeStatus
    };
     await this.page.screenshot({
  path: 'before-save-navgroup.png',
  fullPage: true
});
console.log('Opening Parent Group dropdown...');

await this.page.getByLabel('Parent Group').click();                    // Opens the dropdown

// Select the option
await this.page.getByRole('option', { name: 'Domain Data' }).click();

// console.log(
//   'Dropdown visible:',
//   await this.page.locator('text=Domain Data').count()
// );
//     const option =
//   this.page.getByRole('option', {
//     name: 'Domain Data'
//   });

// await option.waitFor({
//   state: 'visible'
// });

// await option.click();

    await this.SaveNavGroupButton.click();

    await this.page.waitForTimeout(3000);

console.log(
  'Current URL after Save:',
  await this.page.url()
);

console.log(
  'Page Title:',
  await this.page.title()
);

    return label;
  }

  async searchNavGroupInSummary(
    navGroupName: string
  ): Promise<string | null> {

    try {

      await this.SearchBox.waitFor({
        state: 'visible',
        timeout: 5000
      });

      await this.SearchBox.fill('');

      await this.SearchBox.fill(
        navGroupName
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
              navGroupName.toLowerCase()
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

  getAddedNavGroupData(): any {

    return this.addedNavGroupData;
  }
}