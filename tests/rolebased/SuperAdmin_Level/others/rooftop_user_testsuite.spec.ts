import { test, expect } from '@playwright/test';
import { Login } from '../../../../X1-Playwright/pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { rooftopUserColumns } from '../../../../pages/other/user/rooftop_UserColumns';
import { rooftopUserValidation } from '../../../../pages/other/user/rooftop_AddUserValidation';
import { VerifyrooftopUserCancelButton } from '../../../../pages/other/user/rooftop_AddUserCancelbutton';
import { RooftopAddUser } from '../../../../pages/other/user/rooftop_AddUser';
import { RooftopUpdateUserValidation } from '../../../../pages/other/user/rooftop_UpdatedUser';
import { Reporter } from '../../../../pages/utils/NewReport';
import { EditrooftopUser } from '../../../../pages/other/user/rooftop_EditUser';
import { rooftopdeleteUser } from '../../../../pages/other/user/rooftop_DeleteUser';
import { RooftopUserSortingWithPagination } from '../../../../pages/other/user/rooftop_UserSorting';
import { rooftopUsersPagination } from '../../../../pages/other/user/rooftop_Pagination';
import { RooftopUserSearch } from '../../../../pages/other/user/rooftop_Search';


test.describe('Rooftop User Complete Test Suite', () => {

  test.beforeEach(async ({ page }, testInfo) => {

    const loginPage = new Login(page);

    await loginPage.navigateToURL();
    await (loginPage as any).loginByRole('Super_Admin' as any);

    const navigation = new LeftsideNavigation(page);
    
    await navigation.goToOther();
    await page.waitForTimeout(2000);

    await navigation.goToRooftopUsers();
    await page.waitForLoadState('networkidle');
  });

  //==================================================
  // 1. COLUMN HEADERS
  //==================================================

  test('Verify Rooftop User Table Headers', async ({ page }, testInfo) => {
    const columns = new rooftopUserColumns(page);
    await columns.verifyRooftopUserColumnHeaders(testInfo);
  });

  //==================================================
  // 2. VALIDATIONS
  //==================================================

  test('Verify User Validations', async ({ page }, testInfo) => {

    const validation = new rooftopUserValidation(page);

    await validation.clickOnAddUserButton();
    await validation.verifyPlaceholderText(testInfo);
    await validation.verifyRequiredFieldValidations(testInfo);
    await validation.verifyInvalidFieldValidations(testInfo);
  });

  //==================================================
  // 3. CANCEL BUTTON
  //==================================================

  test('Verify Cancel Button', async ({ page }, testInfo) => {

    const cancel = new VerifyrooftopUserCancelButton(page);
    await cancel.verifyrooftopUserCancelButton(testInfo);

  });

  //==================================================
  // 4. ADD USER
  //==================================================

  test('Verify Add User', async ({ page }, testInfo) => {

    const addUser = new RooftopAddUser(page);

    await addUser.addrooftopUser();
    await page.waitForTimeout(2000);
    await addUser.verifyAddedUserIsDisplayed(testInfo);

  });

  //==================================================
  // 5. VERIFY CREATED USER DATA
  //==================================================

  test('Verify User Creation Data', async ({ page }, testInfo) => {

    Reporter.startTest();

    const update = new RooftopUpdateUserValidation(page);

    await update.addUserAndVerifyUpdateForm(testInfo);

    Reporter.endTest(testInfo);

  });

  //==================================================
  // 6. EDIT USER
  //==================================================

  test('Verify Edit User', async ({ page }, testInfo) => {

    Reporter.startTest();

    const edit = new EditrooftopUser(page);

    await edit.addAndEditUserWithReport(testInfo);

    Reporter.endTest(testInfo);

  });

  //==================================================
  // 7. DELETE USER
  //==================================================

  test('Verify Delete User', async ({ page }, testInfo) => {

    Reporter.startTest();

    const deleteUser = new rooftopdeleteUser(page);

    await deleteUser.DeleterooftopUser(testInfo.title);

    Reporter.endTest(testInfo);

  });

  //==================================================
  // 8. SORTING
  //==================================================

  test('Verify Sorting', async ({ page }, testInfo) => {

    Reporter.startTest();

    const sorting = new RooftopUserSortingWithPagination(page);

    await sorting.verifyAllColumnsSorting(testInfo);

    const summary = Reporter.endTest(testInfo);

    expect(summary.failed).toBe(0);

  });

  //==================================================
  // 9. PAGINATION
  //==================================================

  test('Verify Pagination', async ({ page }, testInfo) => {

    const pagination = new rooftopUsersPagination(page);

    await pagination.verifyrooftopUsersPagination(testInfo);

  });

  //==================================================
  // 10. SEARCH
  //==================================================

  test('Verify Search', async ({ page }, testInfo) => {

    Reporter.startTest();

    const search = new RooftopUserSearch(page);

    await search.searchByID(testInfo);
    await search.searchByUsername(testInfo);
    await search.searchByEmail(testInfo);
    await search.searchByReseller(testInfo);
    await search.searchByUserType(testInfo);
    await search.searchByStatus(testInfo);
    await search.searchByInactiveStatus(testInfo);
    await search.invalidSearch(testInfo);

    Reporter.endTest(testInfo);

  });

});