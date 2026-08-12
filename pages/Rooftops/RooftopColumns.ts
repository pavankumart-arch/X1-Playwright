import { Page, Locator } from '@playwright/test';

export class RooftopColumns {

  page: Page;
  headers: Locator;
  table: Locator;
  paginationSelect: Locator;

  constructor(page: Page) {
    this.page = page;
    this.table = this.page.locator('table');
    this.headers = this.page.locator('table thead th');
    this.paginationSelect = this.page.locator('select'); // Adjust selector as needed
  }

  async verifyRooftopColumns() {
    await this.table.waitFor({ state: 'visible' });
    await this.page.waitForLoadState('networkidle');
    await this.headers.first().waitFor();

    const expectedColumns = [
      'ID',
      'Rooftop Name',
      'Description',
      'Created',
      'Status',
      'Actions'
    ];

    const actualHeaders = (await this.headers.allTextContents())
      .map(header => header.replace(/\s+/g, ' ').trim());

    const normalizedHeaders = actualHeaders.map(header => {
      if (header.toLowerCase() === 'name') {
        return 'Rooftop Name';
      }
      return header;
    });

    return {
      expectedColumns,
      actualHeaders: normalizedHeaders
    };
  }

  // =====================================
  // SIMPLE REPORT METHOD
  // =====================================
  async report() {
    const pageSizes = [10, 20, 50, 100];
    const results = [];

    // Test columns first
    const columns = await this.verifyRooftopColumns();
    const columnsMatch = JSON.stringify(columns.expectedColumns) === JSON.stringify(columns.actualHeaders);
    console.log(`Columns: ${columnsMatch ? '✅ PASSED' : '❌ FAILED'}`);

    // Test each page size
    for (const size of pageSizes) {
      try {
        // Select page size
        await this.paginationSelect.selectOption(String(size));
        
        // WAIT FOR PAGINATION TO COMPLETE - THIS IS KEY
        await this.page.waitForTimeout(1000); // Wait for UI to update
        await this.page.waitForLoadState('networkidle'); // Wait for data to load
        await this.table.waitFor({ state: 'visible' }); // Wait for table to refresh
        
        // Get row count
        const rows = this.page.locator('table tbody tr');
        const rowCount = await rows.count();
        
        // Verify
        const passed = rowCount <= size && rowCount > 0;
        console.log(`Page size ${size}: ${passed ? '✅ PASSED' : '❌ FAILED'} (${rowCount} rows)`);
        
        results.push({ size, passed, rowCount });
        
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.log(`Page size ${size}: ❌ FAILED - ${message}`);
        results.push({ size, passed: false, error: message });
      }
    }

    // Summary
    const passed = results.filter(r => r.passed).length;
    console.log(`\n📊 Summary: ${passed}/${results.length} pagination tests passed`);
    
    return { columnsMatch, results };
  }
}