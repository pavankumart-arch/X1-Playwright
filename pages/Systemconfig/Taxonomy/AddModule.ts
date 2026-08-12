import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../../BasePage';

export class AddModule extends BasePage {

  SearchBox: Locator;
  Title: Locator;
  Identifier: Locator;
  SaveModuleButton: Locator;

  constructor(page: Page) {

    super(page);

    this.SearchBox =
      page.getByPlaceholder('Search...')
        .first();

    this.Title =
      page.locator(
        'input[placeholder="e.g. Inventory, Dealerships"]'
      );

    this.Identifier =
      page.locator(
        'input[placeholder="e.g. inventory, dealerships"]'
      );

    this.SaveModuleButton =
      page.getByRole('button', {
        name: /Save Module/i
      });
  }

  // =========================
// OPEN ADMIN APP
// =========================
async openAdminApp() {

  // Wait for search box
  await this.SearchBox.waitFor({
    state: 'visible'
  });

  // Clear previous search
  await this.SearchBox.clear();

  // Search Admin
  await this.SearchBox.fill('Admin');

  // Wait for table to filter
  await this.page.waitForTimeout(2000);

  // Admin link in App column
  const adminApp = this.page.getByRole('link', {
    name: 'Admin',
    exact: true
  });

  await expect(adminApp).toBeVisible({
    timeout: 10000
  });

  await adminApp.click();

  await this.page.waitForLoadState('networkidle');

  console.log('✅ Opened App Title: Admin');
}
  // =========================
  // CLICK ADD MODULE
  // =========================

  async clickAddModule() {

  const addModuleButton =
  this.page.getByRole('button', {
    name: 'Module',
    exact: true
  });

await addModuleButton.click();
  await this.page.waitForLoadState(
    'networkidle'
  );

  console.log(
    '✅ Add Module button clicked'
  );
}
  // =========================
  // CREATE MODULE
  // =========================

  async AddModule(
    moduleTitle: string,
    moduleIdentifier: string
  ): Promise<string> {

    await this.Title.waitFor({
      state: 'visible'
    });

    await this.Title.fill(
      moduleTitle
    );

    await this.Identifier.fill(
      moduleIdentifier
    );

    console.log(
      `Module Title : ${moduleTitle}`
    );

    console.log(
      `Module Identifier : ${moduleIdentifier}`
    );

    await this.SaveModuleButton.click();

    await this.page.waitForLoadState(
      'networkidle'
    );

    await this.page.waitForTimeout(
      3000
    );

    console.log(
      `✅ Module Created : ${moduleTitle}`
    );

    return moduleTitle;
  }

  // =========================
  // SEARCH MODULE
  // =========================

  async searchModuleInSummary(
  moduleTitle: string
): Promise<string | null> {

  await this.SearchBox.waitFor({
    state: 'visible'
  });

  await this.SearchBox.clear();

  await this.SearchBox.fill(
    moduleTitle
  );

  await this.page.waitForTimeout(
    2000
  );

  const moduleCell =
    this.page.locator(
      'table tbody tr td'
    ).nth(2);

  const text =
    (await moduleCell.textContent())
      ?.trim();

  console.log(
    'Expected Module:',
    moduleTitle
  );

  console.log(
    'Found Module:',
    text
  );

  return text || null;
}
}
