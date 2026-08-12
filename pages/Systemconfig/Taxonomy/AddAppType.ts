import { Locator, Page } from '@playwright/test';
import { BasePage } from '../../BasePage';

export class AddAppType extends BasePage {

  AddAppTypebutton: Locator;
  Title: Locator;
  TypeIdentifier: Locator;
  ActiveCheckbox: Locator;
  SaveAppTypeButton: Locator;
  SearchBox: Locator;

  private addedAppTypeData: any = null;

  constructor(page: Page) {

    super(page);

    this.AddAppTypebutton =
  page.locator('text=Add AppType');

    this.Title =
  page.getByRole('textbox', {
    name: 'Title'
  });

    this.TypeIdentifier =
  page.getByRole('textbox', {
    name: 'Type (Identifier)'
  });

    this.ActiveCheckbox =
      page.locator(
        'input[type="checkbox"]'
      ).first();

    this.SaveAppTypeButton =
      page.getByRole('button', {
        name: 'Save Apptype'
      });

    this.SearchBox =
      page.getByPlaceholder(
        'Search...'
      ).first();
  }

  async AddAppType(
  title: string,
  typeIdentifier: string
): Promise<string> {

  // Open Add AppType form first
  await this.AddAppTypebutton.click();

  console.log('✅ Add AppType page opened');

  await this.Title.waitFor({
    state: 'visible',
    timeout: 10000
  });

  // Fill Title
  await this.fillElement(
    this.Title,
    title
  );

  // Fill Identifier
  await this.fillElement(
    this.TypeIdentifier,
    typeIdentifier
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

  this.addedAppTypeData = {
    title,
    identifier: typeIdentifier,
    active: activeStatus
  };

  await this.SaveAppTypeButton.click();

  await this.page.waitForLoadState(
    'networkidle'
  );

  console.log(
    '✅ App Type saved successfully'
  );

  return title;
}

  async searchAppTypeInSummary(
    appTypeName: string
  ): Promise<string | null> {

    try {

      await this.SearchBox.waitFor({
        state: 'visible',
        timeout: 5000
      });

      await this.SearchBox.fill('');

      await this.SearchBox.fill(
        appTypeName
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
              .nth(1)
              .textContent()
          )?.trim() || '';

        if (
          text
            .toLowerCase()
            .includes(
              appTypeName.toLowerCase()
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

  getAddedAppTypeData(): any {

    return this.addedAppTypeData;
  }
}