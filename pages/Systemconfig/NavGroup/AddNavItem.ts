import { Locator, Page } from '@playwright/test';
import { BasePage } from '../../BasePage';

export class AddNavItem extends BasePage {

  Label: Locator;
  RunTypeId: Locator;
  ContextGroup: Locator;
  ActiveCheckbox: Locator;
  SaveNavItemButton: Locator;
  SearchBox: Locator;
  NavItemButton: Locator;

  private addedNavItemData: any = null;

  constructor(page: Page) {

    super(page);
this.NavItemButton =page.getByRole('button', { name: /nav item/i});

    this.Label =
  page.getByLabel('Label');

this.RunTypeId =
  page.getByLabel('RunType ID');

this.ContextGroup =
  page.getByLabel('Context Group');

    this.ActiveCheckbox =
      page.locator('input[type="checkbox"]');

    this.SaveNavItemButton =
      page.getByRole('button', {
        name: 'Save Nav Item'
      });

    this.SearchBox =
      page.getByPlaceholder('Search...')
        .first();
  }

  async AddNavItem(
  label: string,
  runTypeId: string,
  contextGroup: string
): Promise<string> {

  // Click + Nav Item button
  await this.NavItemButton.waitFor({
    state: 'visible',
    timeout: 10000
  });

  await this.NavItemButton.click();

  await this.page.waitForLoadState(
    'networkidle'
  );

  // Wait for Create Nav Item page
  await this.Label.waitFor({
    state: 'visible',
    timeout: 10000
  });

  await this.fillElement(
    this.Label,
    label
  );

  await this.page.locator('input').nth(1).waitFor({
  state: 'visible'
});

await this.page.locator('input').nth(1).click();

await this.page.locator('input').nth(1).fill('1');

console.log('✅ RunType ID entered');
const dropdown = this.page.locator('select').first();

await dropdown.waitFor({
  state: 'visible'
});

const options = await dropdown.locator('option').count();

console.log('Dropdown options:', options);

// Select second option (first is usually "Select an option")
await dropdown.selectOption({ index: 1 });

console.log('✅ Context Group selected');

  
  await this.SaveNavItemButton.click();

  await this.page.waitForLoadState(
    'networkidle'
  );

  return label;
}
  getAddedNavItemData(): any {

    return this.addedNavItemData;
  }
}