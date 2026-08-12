import { test, expect, Page } from '@playwright/test';
import { LeftsideNavigation } from '../../../../../pages/Navigations/LeftSideNavigation';
import { Login } from '../../../../../pages/Login/Loginpage';
import { AddModel } from '../../../../../pages/ApplicationConfig/DomainData/Model/AddModel';
import { Reporter } from '../../../../../pages/utils/NewReport';
import { ModelColumns } from '../../../../../pages/ApplicationConfig/DomainData/Model/ColumnsModel';
import { modelvalidation } from '../../../../../pages/ApplicationConfig/DomainData/Model/ModelValidation';
import { Cancelbutton } from '../../../../../pages/ApplicationConfig/DomainData/Make/CancelMake';
import { EditModel } from '../../../../../pages/ApplicationConfig/DomainData/Model/EditModel';
import { DeleteModel } from '../../../../../pages/ApplicationConfig/DomainData/Model/DeleteModel';
import { ModelPagination } from '../../../../../pages/ApplicationConfig/DomainData/Model/PaginationModel';
import { UserSortingWithPagination } from '../../../../../pages/ApplicationConfig/Users/UserSorting';
import { ModelSearch } from '../../../../../pages/ApplicationConfig/DomainData/Model/SearchModel';
import { Addandverification } from '../../../../../pages/ApplicationConfig/DomainData/Model/UpdateModel';

async function prepareAndNavigate(page: Page) {
  const login = new Login(page);
  const navigation = new LeftsideNavigation(page);

  await login.navigateToURL();
await login.loginByRole("Super_Admin" as any);
  await navigation.gotoApplicationConfig();
  await navigation.goToDomainData();
}

async function prepareModelPage(page: Page, testInfo: any) {
  const addModel = new AddModel(page);
  await prepareAndNavigate(page);
  await addModel.createAndVerifyMake(testInfo);
  await addModel.clickOnMakeName(testInfo);
  await addModel.verifyAddModelButtonIsVisible(testInfo);
}

test.describe('Model Test Suite - Complete Functionality Testing', () => {
  test('TC01: Verify Column Headers in Model Summary Page', async ({ page }, testInfo) => {
    Reporter.startTest();
    const modelColumns = new ModelColumns(page);

    await prepareModelPage(page, testInfo);
    await modelColumns.verifyModleColumnHeaders(testInfo);

    Reporter.endTest(testInfo);
  });

  test('TC02: Verify Validation Rules for Model Fields', async ({ page }, testInfo) => {
    Reporter.startTest();
    const modelValidation = new modelvalidation(page);

    await prepareModelPage(page, testInfo);
    await modelValidation.modelvalidation(testInfo);

    Reporter.endTest(testInfo);
  });

  test('TC03: Verify Cancel Button Functionality on Add Model Page', async ({ page }, testInfo) => {
    Reporter.startTest();
    const addModel = new AddModel(page);
    const cancelButton = new Cancelbutton(page);

    await prepareModelPage(page, testInfo);
    await cancelButton.VerifyMakeCancelbutton(testInfo);

    Reporter.endTest(testInfo);
  });

  test('TC04: Verify Add and Create Model Functionality', async ({ page }, testInfo) => {
    Reporter.startTest();
    const addModel = new AddModel(page);

    await prepareModelPage(page, testInfo);
    await addModel.addModel(testInfo);
    await addModel.verifyAddedModelIsDisplayed(testInfo);

    Reporter.endTest(testInfo);
  });

  test('TC05: Verify Edit and Update Model Functionality', async ({ page }, testInfo) => {
    Reporter.startTest();
    const editModel = new EditModel(page);

    await prepareAndNavigate(page);
    await editModel.editAndVerifyModel(testInfo);

    Reporter.endTest(testInfo);
  });

  test('TC06: Verify Delete and Remove Model Functionality', async ({ page }, testInfo) => {
    Reporter.startTest();
    const deleteModel = new DeleteModel(page);

    await prepareAndNavigate(page);
    await deleteModel.completeAddDeleteModelFlow(testInfo);

    Reporter.endTest(testInfo);
  });

  test('TC07: Verify Pagination Functionality in Model Summary Page', async ({ page }, testInfo) => {
    Reporter.startTest();
    const modelPagination = new ModelPagination(page);

    await prepareModelPage(page, testInfo);
    await modelPagination.verifyAllPages(testInfo);

    Reporter.endTest(testInfo);
  });

  test('TC08: Verify Sorting Functionality in Model Summary Page', async ({ page }, testInfo) => {
    Reporter.startTest();
    const userSortingWithPagination = new UserSortingWithPagination(page);

    await prepareModelPage(page, testInfo);
    await userSortingWithPagination.verifyAllColumnsSorting(testInfo);

    Reporter.endTest(testInfo);
  });
});

test.describe('Model Search Functionality', () => {
  test.setTimeout(180000);

  test.beforeEach(async ({ page }) => {
    await prepareAndNavigate(page);
  });

  test('TC09-01: Verify search by ID', async ({ page }, testInfo) => {
    Reporter.startTest();
    const modelSearch = new ModelSearch(page);
    await modelSearch.searchByID(testInfo);
    Reporter.endTest(testInfo);
  });

  test('TC09-02: Verify search by Model Name', async ({ page }, testInfo) => {
    Reporter.startTest();
    const modelSearch = new ModelSearch(page);
    await modelSearch.searchByModelName(testInfo);
    Reporter.endTest(testInfo);
  });

  test('TC09-03: Verify search by Created Date', async ({ page }, testInfo) => {
    Reporter.startTest();
    const modelSearch = new ModelSearch(page);
    await modelSearch.searchByCreatedDate(testInfo);
    Reporter.endTest(testInfo);
  });

  test('TC09-04: Verify search by Status', async ({ page }, testInfo) => {
    Reporter.startTest();
    const modelSearch = new ModelSearch(page);
    await modelSearch.searchByStatus(testInfo);
    Reporter.endTest(testInfo);
  });

  test('TC09-05: Verify invalid search shows no data', async ({ page }, testInfo) => {
    Reporter.startTest();
    const modelSearch = new ModelSearch(page);
    await modelSearch.invalidNameSearch(testInfo);
    Reporter.endTest(testInfo);
  });
});

test.describe('Verify Added Model Functionality', () => {
  test('TC10: Verify Added Model in Edit Page', async ({ page }, testInfo) => {
    Reporter.startTest();
    const addModel = new AddModel(page);
    const addandverification = new Addandverification(page);

    await prepareModelPage(page, testInfo);
    await addandverification.verifyAddedModelInEditPage(testInfo);

    Reporter.endTest(testInfo);
  });
});
