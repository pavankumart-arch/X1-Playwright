import { test, expect } from '@playwright/test';
import { Login } from '../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../pages/Navigations/LeftSideNavigation';
import { UserColumns } from '../../pages/ApplicationConfig/Users/UserColumns';
import { UserValidation } from '../../pages/ApplicationConfig/Users/AddUserValidation';
import { VerifyUserCancelButton } from '../../pages/ApplicationConfig/Users/AddUserCancelbutton';
import { AddUser } from '../../pages/ApplicationConfig/Users/AddUser';
import { VerifyAddedUser } from '../../pages/ApplicationConfig/Users/UpdatedUser';
import { Reporter } from '../../pages/utils/NewReport';
import { EditUser } from '../../pages/ApplicationConfig/Users/EditUser';
import { DeleteUser } from '../../pages/ApplicationConfig/Users/DeleteUser';
import { UsersPagination } from '../../X1-Playwright/pages/Rooftops/ResellerPagination';
import { UserSearch } from '../../pages/ApplicationConfig/Users/Search';
import { UserSortingWithPagination } from '../../pages/ApplicationConfig/Users/UserSorting';


test.describe('Users Module Complete Suite', () => {

    test.beforeEach(async ({ page }) => {
        const login = new Login(page);
        const navigation = new LeftsideNavigation(page);

        await login.navigateToURL();
        await login.loginToApplication();

        await page.waitForLoadState('networkidle');

        await navigation.gotoApplicationConfig();
        await navigation.goToUsers();

        await page.waitForLoadState('networkidle');
    });

    //====================================================
    // USER TABLE HEADERS
    //====================================================

    test('Verify User Table Headers', async ({ page }, testInfo) => {

        const userColumns = new UserColumns(page);

        await userColumns.verifyUserColumnHeaders(testInfo);

    });

    //====================================================
    // USER VALIDATIONS
    //====================================================

    test('Verify User Validations', async ({ page }, testInfo) => {

        const validation = new UserValidation(page);

        await validation.clickOnAddUserButton();

        await validation.verifyLabelsAndButtonText(testInfo);
        await validation.verifyPlaceholderText(testInfo);
        await validation.verifyRequiredFieldValidations(testInfo);
        await validation.verifyInvalidFieldValidations(testInfo);

    });

    //====================================================
    // CANCEL BUTTON
    //====================================================

    test('Verify Cancel Button', async ({ page }, testInfo) => {

        const cancel = new VerifyUserCancelButton(page);

        await cancel.verifyUserCancelButton(testInfo);

    });

    //====================================================
    // ADD USER
    //====================================================

    test('Verify Add User', async ({ page }, testInfo) => {

        const addUser = new AddUser(page);

        await addUser.addUser();
        await addUser.verifyAddedUserIsDisplayed(testInfo);

    });

    //====================================================
    // VERIFY CREATED USER
    //====================================================

    test('Verify Added User Data', async ({ page }, testInfo) => {

        Reporter.startTest();

        const verify = new VerifyAddedUser(page);

        await verify.addUserAndVerify(testInfo);

        Reporter.endTest(testInfo);

    });

    //====================================================
    // EDIT USER
    //====================================================

    test('Verify Edit User', async ({ page }, testInfo) => {

        Reporter.startTest();

        const edit = new EditUser(page);

        await edit.addAndEditUserWithReport(testInfo);

        Reporter.endTest(testInfo);

    });

    //====================================================
    // DELETE USER
    //====================================================

    test('Verify Delete User', async ({ page }, testInfo) => {

        Reporter.startTest();

        const addUser = new AddUser(page);
        const deleteUser = new DeleteUser(page);

        await addUser.addUser();
        await addUser.verifyAddedUserIsDisplayed(testInfo);

        const username = await page.locator('table tbody tr').first().locator('td').nth(1).textContent();

        expect(username).toBeTruthy();

        const cleanUsername = username!.trim();

        const deleteResult = await deleteUser.DeleteUser(cleanUsername);

        expect(deleteResult.deletePassed).toBeTruthy();
        expect(deleteResult.verificationPassed).toBeTruthy();

        Reporter.endTest(testInfo);

    });

    //====================================================
    // PAGINATION
    //====================================================

    test('Verify Pagination', async ({ page }, testInfo) => {

        const pagination = new UsersPagination(page);

        await pagination.verifyUsersPagination(testInfo);

    });

    //====================================================
    // SEARCH
    //====================================================

    test('Verify User Search', async ({ page }, testInfo) => {

        Reporter.startTest();

        const search = new UserSearch(page);

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

    //====================================================
    // SORTING
    //====================================================

    test('Verify User Sorting', async ({ page }, testInfo) => {

        Reporter.startTest();

        const sorting = new UserSortingWithPagination(page);

        await sorting.verifyAllColumnsSorting(testInfo);

        const summary = Reporter.endTest(testInfo);

        expect(summary.failed).toBe(0);

    });

});