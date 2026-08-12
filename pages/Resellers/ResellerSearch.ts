import { Page, Locator, TestInfo } from '@playwright/test';
import AddResellerdata from '../../testdata/AddResellerData.json';
import { Reporter } from '../utils/NewReport';

export class ResellerSearch {

  page: Page;
  searchInput: Locator;
  noDataMessage: Locator;
  nextButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.locator('input.table-search__input');
    this.noDataMessage = page.locator('td.table-body__cell--empty p');
    this.nextButton = page.getByRole('button', { name: 'Next' });
  }

  // =====================================================
  // SEARCH FUNCTION
  // =====================================================

  async performSearch(value: string) {
    try {
      if (!value) {
        console.log('❌ Search value is empty');
        return;
      }

      await this.searchInput.waitFor({
        state: 'visible',
        timeout: 10000
      });

      await this.searchInput.fill('');
      await this.searchInput.fill(value);
      await this.searchInput.press('Enter');
      await this.page.waitForTimeout(2000);

    } catch (error: any) {
      console.log(`
========================================
SEARCH FAILED
VALUE  : ${value}
ERROR  : ${error.message}
========================================
`);
    }
  }

  // =====================================================
  // GET ROWS
  // =====================================================

  private getRows() {
    return this.page.locator('table tbody tr');
  }

  // =====================================================
  // WAIT FOR RESULTS
  // =====================================================

  async waitForResults() {
    try {
      await Promise.race([
        this.getRows().first().waitFor({
          state: 'visible',
          timeout: 5000
        }),
        this.noDataMessage.waitFor({
          state: 'visible',
          timeout: 5000
        })
      ]);
    } catch {
      // Ignore timeout
    }
  }

  // =====================================================
  // RESET SEARCH
  // =====================================================

  async resetSearch() {
    try {
      await this.searchInput.fill('');
      await this.searchInput.press('Enter');
      await this.page.waitForTimeout(2000);
    } catch {
      // Ignore reset failure
    }
  }

  // =====================================================
  // GET COLUMN DATA
  // =====================================================

  private async getColumnData(index: number): Promise<string[]> {
    const values: string[] = [];

    try {
      while (true) {
        const rows = this.getRows();
        const count = await rows.count();

        for (let i = 0; i < count; i++) {
          try {
            const text = (await rows.nth(i).locator('td').nth(index).textContent())?.trim();
            if (text) values.push(text);
          } catch {
            // Ignore row errors
          }
        }

        const disabled = await this.nextButton.isDisabled().catch(() => true);
        if (disabled) break;

        await this.nextButton.click();
        await this.page.waitForTimeout(2000);
      }
    } catch {
      // Ignore pagination errors
    }

    await this.resetSearch();
    return values;
  }

  // =====================================================
  // VALIDATE COLUMN
  // =====================================================

  private async validateColumn(
    index: number,
    expected: string,
    testInfo: TestInfo,
    stepName: string,
    exact = false
  ) {
    try {
      await this.waitForResults();
      const rows = this.getRows();
      const count = await rows.count();

      let found = false;
      let actual = 'No Data Found';

      for (let i = 0; i < count; i++) {
        try {
          const row = rows.nth(i);
          const cells = row.locator('td');
          const cellCount = await cells.count();

          if (index >= cellCount) continue;

          const text = (await cells.nth(index).textContent())?.trim() || '';
          const matched = exact ? text === expected : text.toLowerCase().includes(expected.toLowerCase());

          if (matched) {
            found = true;
            actual = text;
            break;
          }
        } catch {
          // Ignore row validation errors
        }
      }

      // Use Reporter.validateData
      Reporter.validateData(
        expected,
        found ? actual : 'No Data Found',
        stepName,
        testInfo
      );

      if (!found) {
        console.log(`
========================================
VALIDATION FAILED
STEP     : ${stepName}
EXPECTED : ${expected}
ACTUAL   : ${actual}
========================================
`);

        testInfo.annotations.push({
          type: 'VALIDATION FAILED',
          description: `
STEP     : ${stepName}
EXPECTED : ${expected}
ACTUAL   : ${actual}
`
        });
      }

    } catch (error: any) {
      console.log(`
========================================
VALIDATION FAILED
STEP   : ${stepName}
ERROR  : ${error.message}
========================================
`);
    } finally {
      await this.resetSearch();
    }
  }

  // =====================================================
  // NEGATIVE SEARCH VALIDATION
  // =====================================================

  private async verifyNoData(
    value: string,
    testInfo: TestInfo,
    stepName: string
  ) {
    try {
      await this.performSearch(value);
      await this.waitForResults();

      const rows = await this.getRows().count();
      const isNoData = await this.noDataMessage.isVisible().catch(() => false);
      const passed = rows === 0 || isNoData;

      // Use Reporter.validateData for negative search
      Reporter.validateData(
        'No Data Found',
        passed ? 'No Data Found' : `${rows} Rows Found`,
        stepName,
        testInfo
      );

      if (!passed) {
        console.log(`
========================================
NEGATIVE SEARCH FAILED
STEP     : ${stepName}
EXPECTED : No Data Found
ACTUAL   : ${rows} Rows Found
========================================
`);
      }

    } catch (error: any) {
      console.log(`
========================================
NEGATIVE SEARCH FAILED
STEP   : ${stepName}
ERROR  : ${error.message}
========================================
`);
    } finally {
      await this.resetSearch();
    }
  }

  // =====================================================
  // POSITIVE SEARCH TESTS
  // =====================================================

  async searchByID(testInfo: TestInfo) {
    try {
      const data = await this.getColumnData(0);
      if (!data.length) {
        console.log('❌ No ID data found');
        return;
      }

      await this.performSearch(data[0]);
      await this.validateColumn(0, data[0], testInfo, 'Search by ID', true);
    } catch (error: any) {
      console.log(`FAILED : Search by ID\nERROR  : ${error.message}`);
    }
  }

  async searchByName(testInfo: TestInfo, name?: string) {
    try {
      const value = name ?? (await this.getColumnData(1))[0];
      if (!value) {
        console.log('❌ No Name data found');
        return;
      }

      await this.performSearch(value);
      await this.validateColumn(1, value, testInfo, 'Search by Name');
    } catch (error: any) {
      console.log(`FAILED : Search by Name\nERROR  : ${error.message}`);
    }
  }

  async searchByDescription(testInfo: TestInfo) {
    try {
      const data = await this.getColumnData(2);
      if (!data.length) {
        console.log('❌ No Description data found');
        return;
      }

      await this.performSearch(data[0]);
      await this.validateColumn(2, data[0], testInfo, 'Search by Description');
    } catch (error: any) {
      console.log(`FAILED : Search by Description\nERROR  : ${error.message}`);
    }
  }

  async searchByCreated(testInfo: TestInfo) {
    try {
      const data = await this.getColumnData(3);
      if (!data.length) {
        console.log('❌ No Created data found');
        return;
      }

      const createdValue = data[0]?.trim();
      if (!createdValue) {
        console.log('❌ Created Date value empty');
        return;
      }

      console.log(`
========================================
SEARCHING CREATED DATE
VALUE : ${createdValue}
========================================
`);

      await this.performSearch(createdValue);
      await this.validateColumn(3, createdValue, testInfo, 'Search by Created', true);
    } catch (error: any) {
      console.log(`FAILED : Search by Created\nERROR  : ${error.message}`);
    } finally {
      await this.resetSearch();
    }
  }

  async searchByStatus(testInfo: TestInfo) {
    try {
      const data = await this.getColumnData(4);
      if (!data.length) {
        console.log('❌ No Status data found');
        return;
      }

      await this.performSearch(data[0]);
      await this.validateColumn(4, data[0], testInfo, 'Search by Status', true);
    } catch (error: any) {
      console.log(`FAILED : Search by Status\nERROR  : ${error.message}`);
    }
  }

  // =====================================================
  // NEGATIVE SEARCH TESTS
  // =====================================================

  async searchByBillingName(testInfo: TestInfo) {
    await this.verifyNoData(AddResellerdata.BillingName, testInfo, 'Search by Billing Name');
  }

  async searchBySalesPerson(testInfo: TestInfo) {
    await this.verifyNoData(AddResellerdata.SalesPerson, testInfo, 'Search by Sales Person');
  }

  async searchByTTOptions(testInfo: TestInfo) {
    await this.verifyNoData(AddResellerdata.TTOptions, testInfo, 'Search by TT Options');
  }

  async searchByAppID(testInfo: TestInfo) {
    await this.verifyNoData(AddResellerdata.AppID, testInfo, 'Search by App ID');
  }

  async searchByPlayerSize(testInfo: TestInfo) {
    await this.verifyNoData(AddResellerdata.PlayerSize.toString(), testInfo, 'Search by Player Size');
  }

  async invalidSearch(testInfo: TestInfo) {
    await this.verifyNoData('random_invalid_value_123', testInfo, 'Invalid Search');
  }

  // =====================================================
  // RUN ALL SEARCH TESTS
  // =====================================================

  async runAllSearchTests(testInfo: TestInfo) {
    Reporter.startTest();

    console.log('\n' + '='.repeat(80));
    console.log('RESELLER SEARCH TESTS');
    console.log('='.repeat(80));

    // Positive Tests
    await this.searchByID(testInfo);
    await this.searchByName(testInfo);
    await this.searchByDescription(testInfo);
    await this.searchByCreated(testInfo);
    await this.searchByStatus(testInfo);

    // Negative Tests
    await this.searchByBillingName(testInfo);
    await this.searchBySalesPerson(testInfo);
    await this.searchByTTOptions(testInfo);
    await this.searchByAppID(testInfo);
    await this.searchByPlayerSize(testInfo);
    await this.invalidSearch(testInfo);

    const summary = Reporter.endTest(testInfo);
    console.log(`\n📊 Search Tests Completed - Pass Rate: ${summary.passRate}`);
  }
}