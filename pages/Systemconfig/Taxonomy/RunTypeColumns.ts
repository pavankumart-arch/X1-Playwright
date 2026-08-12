import { Page, Locator, expect } from '@playwright/test';

export class RunTypeColumns {

  readonly page: Page;
  readonly searchBox: Locator;
  readonly headers: Locator;

  constructor(page: Page) {

    this.page = page;

    this.searchBox =
      page.getByPlaceholder('Search...').first();

    this.headers =
      page.locator('table thead th');
  }

  // =====================================
  // OPEN APP (ADMIN)
  // =====================================

  async openApp(appName: string) {

    await this.searchBox.waitFor({
      state: 'visible'
    });

    await this.searchBox.fill(appName);

    await this.page.waitForTimeout(2000);

    const appLink =
      this.page.getByRole('link', {
        name: appName,
        exact: true
      });

    await expect(appLink).toBeVisible();

    await appLink.click();

    await this.page.waitForLoadState('networkidle');

    // Wait until Modules table loads
    await expect(
      this.page.locator('table tbody tr')
    ).toHaveCount(
      await this.page.locator('table tbody tr').count(),
      { timeout: 15000 }
    );

    await this.page.waitForTimeout(3000);

    console.log(`✅ Opened App : ${appName}`);
  }

  // =====================================
  // OPEN MODULE
  // =====================================

  async openModule(moduleName: string) {

    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(3000);

    // Search (ignore if application clears it)
    try {

      await this.searchBox.click();

      await this.searchBox.fill(moduleName);

      await this.page.waitForTimeout(2000);

    } catch {}

    // Find the module row
    const row =
      this.page.locator('table tbody tr').filter({
        hasText: moduleName
      });

    await expect(
      row.first()
    ).toBeVisible({
      timeout: 20000
    });

    console.log(`✅ Module Found : ${moduleName}`);

    // Click the Module link
    await row
      .locator('a')
      .first()
      .click();

    await this.page.waitForLoadState('networkidle');

    // Wait until RunType page opens
    await expect(
      this.page.locator('table thead')
    ).toContainText(
      'Title',
      {
        timeout: 15000
      }
    );

    console.log('✅ RunType page opened');
  }

  // =====================================
  // VERIFY RUNTYPE COLUMNS
  // =====================================

  async verifyRunTypeColumns() {

    const expectedColumns = [
      'ID',
      'App',
      'Module',
      'Title',
      'Runtype',
      'Class',
      'Method',
      'Created',
      'Status',
      'Actions'
    ];

    const actualHeaders =
      (await this.headers.allTextContents())
        .map(header =>
          header.replace(/\s+/g, ' ').trim()
        );

    return {
      expectedColumns,
      actualHeaders
    };
  }
}