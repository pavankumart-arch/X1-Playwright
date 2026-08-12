import { test, expect} from '@playwright/test';
import { Login } from '../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';
import { ResellerColumns } from '../../../pages/Resellers/ResellerColumns';
import { ResellerValidation } from '../../../pages/Resellers/AddResellerValidation';
import { VerifyCancelbutton } from '../../../pages/Resellers/ResellerCancelbutton';
import { AddReseller } from '../../../pages/Resellers/AddReseller';
import { ViewReseller } from '../../../pages/Resellers/View Reseller';
import { UpdatedReseller } from '../../../pages/Resellers/VerifyUpdatedReseller';
import { EditReseller } from '../../../pages/Resellers/EditReseller';
import { DeleteReseller } from '../../../pages/Resellers/DeleteReseller';
import { ResellerSearch } from '../../../pages/Resellers/ResellerSearch';
import { TableSorting } from '../../../pages/Resellers/ResellerSorting';
import { ResellerPagination } from '../../../pages/Resellers/ResellerPagination';

// Default test data used when verifying created reseller details
const AddResellerdata = {
  Description: '',
  BillingName: '',
  SalesPerson: '',
  TTOptions: '',
  AppID: '',
  PlayerSize: '',
};

test.describe.configure({
  mode: 'parallel',
});

async function loginAndNavigate(page: any) {
  const login = new Login(page);
  const nav = new LeftsideNavigation(page);

  await login.navigateToURL();
  await login.loginByRole("Super_Admin" as any);
  await nav.goToDashboard();
  await nav.goToResellers();
}

//
// 1. COLUMN VALIDATION
//
test('Verify Reseller Columns', async ({ page }, testInfo) => {
  await loginAndNavigate(page);

  const resellerColumns = new ResellerColumns(page);

  const expectedColumns = [
    'ID',
    'Name',
    'Description',
    'Created',
    'Status',
    'Actions',
  ];

  await resellerColumns.verifyHeaders(expectedColumns, testInfo);
});

//
// 2. FORM VALIDATION
//
test('Verify Reseller Validation', async ({ page }, testInfo) => {
  await loginAndNavigate(page);

  const validation = new ResellerValidation(page);
  await validation.validateResellerForm(testInfo);
});

//
// 3. CANCEL BUTTON
//
test('Verify Reseller Cancel Button', async ({ page }, testInfo) => {
  await loginAndNavigate(page);

  const cancel = new VerifyCancelbutton(page);
  await cancel.VerifyResellerCancelbutton(testInfo);
});

//
// 4. ADD RESELLER
//
test('Verify Add Reseller', async ({ page }, testInfo) => {
  await loginAndNavigate(page);

  const add = new AddReseller(page);
  await add.AddReseller(testInfo);
});

//
// 5. ADD + VIEW
//
test('Verify Add + View Reseller', async ({ page }, testInfo) => {
  test.setTimeout(120000);

  await loginAndNavigate(page);

  const add = new AddReseller(page);
  const view = new ViewReseller(page, testInfo);

  const createdName = await add.AddReseller(testInfo);

  if (!createdName)
    throw new Error('Created reseller not found');

  await view.openResellerDetails(createdName);

  const expectedData = {
    Name: createdName,
    Description: AddResellerdata.Description,
    BillingName: AddResellerdata.BillingName,
    SalesPerson: AddResellerdata.SalesPerson,
    TTOptions: AddResellerdata.TTOptions,
    AppID: AddResellerdata.AppID,
    PlayerSize: AddResellerdata.PlayerSize,
    ShowControls: false,
    ShowMap: false,
    ShowRelated: false,
    ShowForm: false,
    AutoPlay: false,
    ShowSharing: false,
    ShowCC: false,
    Active: true,
  };

  const result = await view.verifyResellerFromJson(expectedData, testInfo);

  expect(result).toBeTruthy();
});

//
// 6. UPDATE
//
test('Verify Update Reseller', async ({ page }) => {
  await loginAndNavigate(page);

  const update = new UpdatedReseller(page);

  await page.locator('table tbody tr').first().waitFor();

  await update.UpdateResellerView();
  await update.VerifyResellerDetails();
});

//
// 7. ADD + EDIT + DELETE
//
test('Add Edit Delete Reseller', async ({ page }, testInfo) => {
  test.setTimeout(180000);

  await loginAndNavigate(page);

  const edit = new EditReseller(page);

  let editedName = '';

  try {
    const result = await edit.addAndEditReseller(testInfo);

    editedName = result.editedName;

    expect(result.editSuccess).toBeTruthy();
  } finally {
    if (editedName) {
      await edit.deleteReseller(editedName);
    }
  }
});

//
// 8. ADD + DELETE
//
test('Add Delete Reseller', async ({ page }, testInfo) => {
  await loginAndNavigate(page);

  const add = new AddReseller(page);
  const del = new DeleteReseller(page);

  const created = await add.AddReseller(testInfo);

  const result = await del.deleteResellerAndVerify(created, testInfo);

  expect(result.success).toBeTruthy();
});

//
// 9. SEARCH
//
test('Verify Reseller Search', async ({ page }, testInfo) => {
  test.setTimeout(300000);

  await loginAndNavigate(page);

  const search = new ResellerSearch(page);

  await search.searchByID(testInfo);
  await search.searchByName(testInfo);
  await search.searchByDescription(testInfo);
  await search.searchByCreated(testInfo);
  await search.searchByStatus(testInfo);
  await search.searchByBillingName(testInfo);
  await search.searchBySalesPerson(testInfo);
  await search.searchByTTOptions(testInfo);
  await search.searchByAppID(testInfo);
  await search.searchByPlayerSize(testInfo);
  await search.invalidSearch(testInfo);
});

//
// 10. SORTING
//
test('Verify Reseller Sorting', async ({ page }, testInfo) => {
  test.setTimeout(300000);

  await loginAndNavigate(page);

  const sorting = new TableSorting(page);

  const columns = [
    'ID',
    'NAME',
    'DESCRIPTION',
    'CREATED',
    'STATUS',
  ];

  for (const column of columns) {
    await sorting.validateColumnSorting(column, testInfo);
  }
});

//
// 11. PAGINATION
//
test('Verify Reseller Pagination', async ({ page }, testInfo) => {
  await loginAndNavigate(page);

  const pagination = new ResellerPagination(page);

  await pagination.verifyAllPagination(testInfo);
});