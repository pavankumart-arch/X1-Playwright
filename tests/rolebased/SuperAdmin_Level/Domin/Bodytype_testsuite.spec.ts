import { test, Page, expect } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { Reporter } from '../../../../pages/utils/NewReport';
import { EditBodyType } from '../../../../pages/ApplicationConfig/DomainData/Body Types/edit_bodytype';
import { BodyTypeColumns } from '../../../../pages/ApplicationConfig/DomainData/Body Types/column_bodytype';
import { bodytypevalidation } from '../../../../pages/ApplicationConfig/DomainData/Body Types/validation_bodytype';
import { CancelBodyType } from '../../../../pages/ApplicationConfig/DomainData/Body Types/cancel_bodytype';
import { AddBodyType } from '../../../../pages/ApplicationConfig/DomainData/Body Types/add-bodytype';
import { DeleteBodyType } from '../../../../pages/ApplicationConfig/DomainData/Body Types/delete_bodytype';
import { BodyTypeSearch } from '../../../../pages/ApplicationConfig/DomainData/Body Types/search_bodytype';
import { bodytypePagination } from '../../../../pages/ApplicationConfig/DomainData/Body Types/pagination_bodytype';
import { BodyTypeSortingWithPagination } from '../../../../pages/ApplicationConfig/DomainData/Body Types/sorting_bodytype';
import { updateBodyType } from '../../../../pages/ApplicationConfig/DomainData/Body Types/update_bodytype';

// Helper: Login & Navigate
async function prepareAndNavigate(page: Page) {
  const login = new Login(page);
  const navigation = new LeftsideNavigation(page);

  await login.navigateToURL();
  await login.loginByRole("Super_Admin" as any);

  await navigation.gotoApplicationConfig();
  await navigation.goToDomainData();
  await navigation.goTobodytype();
}

// Helper: Set Column Sort Order
async function setColumnOrderInstance(
  page: Page,
  helper: BodyTypeSortingWithPagination,
  columnName: string,
  desired: 'ASC' | 'DESC'
) {
  const columnIndex = await helper.getColumnIndex(columnName);
  const headerSelector = `table thead th:nth-child(${columnIndex + 1})`;
  const desiredAttr = desired === 'ASC' ? 'ascending' : 'descending';

  for (let attempt = 0; attempt < 5; attempt++) {
    let attr = '';

    try {
      attr = await page
        .$eval(headerSelector, (el: Element) => el.getAttribute('aria-sort') || '')
        .catch(() => '');
    } catch {
      attr = '';
    }

    if (attr === desiredAttr) return columnIndex;

    try {
      await page.click(headerSelector).catch(() => {});
      await page.waitForTimeout(300);
    } catch {}

    try {
      const values = await helper.getColumnValues(columnIndex, columnName);
      const detected = helper.detectOrder(values, columnName);

      if (detected === desired) return columnIndex;
    } catch {}
  }

  return columnIndex;
}

test.describe('Body Type Test Suite - Complete Functionality Testing', () => {

  test.beforeEach(async ({ page }) => {
    await prepareAndNavigate(page);
  });

  test('TC01: Verify Column Headers in Body Type Summary Page', async ({ page }, testInfo) => {
    Reporter.startTest();

    const bodyTypeColumns = new BodyTypeColumns(page);
    await bodyTypeColumns.verifyBodyTypeColumnHeaders(testInfo);

    Reporter.endTest(testInfo);
  });

  test('TC02: Verify Validation Rules for Body Type Fields', async ({ page }, testInfo) => {
    Reporter.startTest();

    const validation = new bodytypevalidation(page);
    await validation.bodytypevalidation(testInfo);

    Reporter.endTest(testInfo);
  });

  test('TC03: Verify Cancel Button Functionality on Add Body Type Page', async ({ page }, testInfo) => {
    Reporter.startTest();

    const cancel = new CancelBodyType(page);
    await cancel.VerifyBodyTypeCancelbutton(testInfo);

    Reporter.endTest(testInfo);
  });

  test('TC04: Verify Add and Create Body Type Functionality', async ({ page }, testInfo) => {
    Reporter.startTest();

    const addBodyType = new AddBodyType(page);
    await addBodyType.createAndVerifyBodyType(testInfo);

    Reporter.endTest(testInfo);
  });

  test('TC05: Verify Edit and Update Body Type Functionality', async ({ page }, testInfo) => {
    Reporter.startTest();

    const editBodyType = new EditBodyType(page);
    await editBodyType.editAndVerifyBodyType(testInfo);

    Reporter.endTest(testInfo);
  });

  test('TC06: Verify Delete and Remove Body Type Functionality', async ({ page }, testInfo) => {
    Reporter.startTest();

    const deleteBodyType = new DeleteBodyType(page);
    await deleteBodyType.completeAddDeleteBodyTypeFlow(testInfo);

    Reporter.endTest(testInfo);
  });

  test('TC07: Verify Pagination Functionality in Body Type Summary Page', async ({ page }, testInfo) => {
    Reporter.startTest();

    const pagination = new bodytypePagination(page);
    await pagination.verifyBodytypeDataPagination(testInfo);

    Reporter.endTest(testInfo);
  });

  test('TC08: Verify Search Functionality in Body Type Summary Page', async ({ page }, testInfo) => {
    Reporter.startTest();

    const search = new BodyTypeSearch(page);
    await search.verifyBodyTypeSearch(testInfo);

    Reporter.endTest(testInfo);
  });

  test('TC09: Verify Added Body Type Displayed Correctly in Edit Page', async ({ page }, testInfo) => {
    Reporter.startTest();

    const update = new updateBodyType(page);

    const createdBodyType = await update.createAndVerifyBodyType(testInfo);
    await update.verifyAddedBodyType(createdBodyType, testInfo);

    Reporter.endTest(testInfo);
  });

});

test.describe('Body Type Test Suite - Sorting Functionality (All Pages)', () => {

  test.setTimeout(180000);

  test.beforeEach(async ({ page }) => {
    await prepareAndNavigate(page);
  });

  const columns = ['ID', 'Body Type', 'Created', 'Updated', 'Status'] as const;

  for (const column of columns) {

    test(`TC10: Verify ${column} Column Sorting - Ascending Order (All Pages)`, async ({ page }, testInfo) => {
      Reporter.startTest();

      const helper = new BodyTypeSortingWithPagination(page);

      await helper.ensureAllColumnsVisible();
      await helper.selectShow100Entries();

      const columnIndex = await setColumnOrderInstance(page, helper, column, 'ASC');
      const passed = await helper.validateAllPages(columnIndex, column, 'ASC', testInfo);

      Reporter.endTest(testInfo);

      expect(passed).toBeTruthy();
    });

    test(`TC11: Verify ${column} Column Sorting - Descending Order (All Pages)`, async ({ page }, testInfo) => {
      Reporter.startTest();

      const helper = new BodyTypeSortingWithPagination(page);

      await helper.ensureAllColumnsVisible();
      await helper.selectShow100Entries();

      const columnIndex = await setColumnOrderInstance(page, helper, column, 'DESC');
      const passed = await helper.validateAllPages(columnIndex, column, 'DESC', testInfo);

      Reporter.endTest(testInfo);

      expect(passed).toBeTruthy();
    });

  }

});