import { Locator, Page } from '@playwright/test';
import { BasePage } from '../../BasePage';

export class AddRunType extends BasePage {

  SearchBox: Locator;
  Title: Locator;
  TypeIdentifier: Locator;
  ClassName: Locator;
  MethodName: Locator;
  SaveRunTypeButton: Locator;

  constructor(page: Page) {

    super(page);

    this.SearchBox =
      page.getByPlaceholder('Search...')
        .first();

    this.Title =
      page.locator('input[name="title"]');

    this.TypeIdentifier =
  page.getByPlaceholder(
    'e.g. ADD_ROOFTOP, SYNC_INVENTORY'
  );

this.ClassName =
  page.getByPlaceholder(
    'e.g. RooftopController, InventoryService'
  );

this.MethodName =
  page.getByPlaceholder(
    'e.g. addRooftop, syncStock'
  );

    this.SaveRunTypeButton =
      page.getByRole('button', {
        name: /save runtype|save/i
      });
  }

  async clickAddRunType() {

  const modulesTab =
    this.page.getByText(
      'Modules',
      { exact: true }
    );

  await modulesTab.waitFor({
    state: 'visible',
    timeout: 10000
  });

  await modulesTab.click();

  console.log(
    'Clicked Modules tab'
  );

  await this.page.waitForTimeout(
    2000
  );

  const addRunTypeButton =
    this.page.getByRole('button', {
      name: /\+?\s*runtype|add runtype|add run type/i
    });

  await addRunTypeButton.waitFor({
    state: 'visible',
    timeout: 10000
  });

  await addRunTypeButton.click();

  console.log(
    'Clicked + RunType button'
  );
}
  async AddRunType(
    title: string,
    typeIdentifier: string,
    className: string,
    methodName: string
  ) {

    await this.Title.waitFor({
      state: 'visible'
    });

    await this.Title.fill(title);

    await this.TypeIdentifier.fill(
      typeIdentifier
    );

    await this.ClassName.fill(
      className
    );

    await this.MethodName.fill(
      methodName
    );

    console.log(
      `RunType Title : ${title}`
    );

    console.log(
      `Type Identifier : ${typeIdentifier}`
    );

    await this.assignSuperAdminRole();

    await this.SaveRunTypeButton.click();

    await this.page.waitForTimeout(
      3000
    );

    console.log(
      `✅ RunType Created : ${title}`
    );
  }

  async assignSuperAdminRole() {

  const superAdminRole =
    this.page.getByRole('option', {
      name: 'Super Admin'
    });

  await superAdminRole.waitFor({
    state: 'visible',
    timeout: 10000
  });

  await superAdminRole.click();

  console.log(
    'Selected Super Admin role'
  );

  await this.page.waitForTimeout(1000);
}

  async searchRunTypeInSummary(
    runTypeName: string
  ): Promise<string | null> {

    try {

      await this.SearchBox.waitFor({
        state: 'visible',
        timeout: 10000
      });

      await this.SearchBox.fill('');

      await this.SearchBox.fill(
        runTypeName
      );

      await this.page.waitForTimeout(
        2000
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
              .nth(2)
              .textContent()
          )?.trim() || '';

        console.log(
          'Expected RunType:',
          runTypeName
        );

        console.log(
          'Found RunType:',
          text
        );

        return text;
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