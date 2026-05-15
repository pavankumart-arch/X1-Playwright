import { Page, Locator } from '@playwright/test';

export class RooftopColumns {

  page: Page;

  headers: Locator;

  table: Locator;

  constructor(page: Page) {

    this.page = page;

    this.table =
      this.page.locator('table');

    this.headers =
      this.page.locator(
        'table thead th'
      );
  }

  async verifyRooftopColumns() {

    // =====================================
    // WAIT FOR TABLE
    // =====================================

    await this.table.waitFor({
      state: 'visible'
    });

    await this.page.waitForLoadState(
      'networkidle'
    );

    await this.headers.first().waitFor();

    // =====================================
    // EXPECTED COLUMNS
    // =====================================

    const expectedColumns = [
      'ID',
      'Rooftop Name',
      'Description',
      'Created',
      'Status',
      'Actions'
    ];

    // =====================================
    // GET ACTUAL HEADERS
    // =====================================

    const actualHeaders =
      (await this.headers.allTextContents())
        .map(header =>
          header
            .replace(/\s+/g, ' ')
            .trim()
        );

    // =====================================
    // HANDLE APPLICATION HEADER DIFFERENCE
    // =====================================

    const normalizedHeaders =
      actualHeaders.map(header => {

        // Application shows "Name"
        // but framework expects
        // "Rooftop Name"

        if (
          header.toLowerCase() ===
          'name'
        ) {

          return 'Rooftop Name';
        }

        return header;
      });

    // =====================================
    // RETURN DATA
    // =====================================

    return {
      expectedColumns,
      actualHeaders:
        normalizedHeaders
    };
  }
}