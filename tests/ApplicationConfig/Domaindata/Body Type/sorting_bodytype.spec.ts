import { test, Page } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { Reporter } from '../../../../pages/utils/NewReport';
import { BodyTypeSortingWithPagination } from '../../../../pages/ApplicationConfig/DomainData/Body Types/sorting_bodytype';

test.setTimeout(180000); // allow longer runs

// helper: navigate to Body Type page and perform login/navigation
async function prepareAndNavigate(page: Page) {
  const login = new Login(page);
  const navigation = new LeftsideNavigation(page);

  await login.navigateToURL();
  await login.loginToApplication();

  await navigation.gotoApplicationConfig();
  await navigation.goToDomainData();
  await navigation.goTobodytype();
}

// helper: click header up to N times until the visible ordering or aria-sort matches desired order
// returns the column index
async function setColumnOrderInstance(page: Page, helper: BodyTypeSortingWithPagination, columnName: string, desired: 'ASC' | 'DESC') {
  const columnIndex = await helper.getColumnIndex(columnName);
  const headerSelector = `table thead th:nth-child(${columnIndex + 1})`;
  const desiredAttr = desired === 'ASC' ? 'ascending' : 'descending';

  // try up to 5 clicks
  for (let attempt = 0; attempt < 5; attempt++) {
    // check aria-sort if present
    let attr = '';
    try {
      attr = await page.$eval(headerSelector, (el: Element) => el.getAttribute('aria-sort') || '').catch(() => '');
    } catch {
      attr = '';
    }

    if (attr === desiredAttr) return columnIndex;

    // click to toggle
    try {
      await page.click(headerSelector).catch(() => {});
      await page.waitForTimeout(300).catch(() => {});
    } catch {
      // ignore
    }

    // if aria-sort not present, infer ordering from first page values
    try {
      const vals = await helper.getColumnValues(columnIndex, columnName);
      const detected = helper.detectOrder(vals, columnName);
      if (detected === desired) return columnIndex;
    } catch {
      // ignore and continue attempts
    }
  }

  // return index even if we couldn't deterministically set order
  return columnIndex;
}

test.describe('BodyType sorting (all pages per direction)', () => {
  const columns = ['ID', 'Body Type', 'Created', 'Updated', 'Status'] as const;

  for (const col of columns) {
    test(`${col} — ascending (all pages)`, async ({ page }, testInfo) => {
      Reporter.startTest();
      const helper = new BodyTypeSortingWithPagination(page);

      await prepareAndNavigate(page);
      await helper.ensureAllColumnsVisible();
      await helper.selectShow100Entries();

      const colIndex = await setColumnOrderInstance(page, helper, col, 'ASC');
      // no maxPagesOverride -> validateAllPages will run all available pages
      const passed = await helper.validateAllPages(colIndex, col, 'ASC', testInfo);

      Reporter.endTest(testInfo);
      if (!passed) throw new Error(`${col} ascending validation failed (see logs)`);
    });

    test(`${col} — descending (all pages)`, async ({ page }, testInfo) => {
      Reporter.startTest();
      const helper = new BodyTypeSortingWithPagination(page);

      await prepareAndNavigate(page);
      await helper.ensureAllColumnsVisible();
      await helper.selectShow100Entries();

      const colIndex = await setColumnOrderInstance(page, helper, col, 'DESC');
      // no maxPagesOverride -> validateAllPages will run all available pages
      const passed = await helper.validateAllPages(colIndex, col, 'DESC', testInfo);

      Reporter.endTest(testInfo);
      if (!passed) throw new Error(`${col} descending validation failed (see logs)`);
    });
  }
});
