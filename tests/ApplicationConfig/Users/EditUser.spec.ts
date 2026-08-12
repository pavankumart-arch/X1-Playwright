import { test } from '@playwright/test';
import { Login } from '../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';
import { EditUser } from '../../../pages/ApplicationConfig/Users/EditUser';
import { Reporter } from '../../../pages/utils/NewReport';

test.describe('Verify the Update User functionality', () => {

  test('Verify that the edited user details are saved and displayed correctly', 
    async ({ page }, testInfo) => {

    Reporter.startTest();

    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const editUser = new EditUser(page);

    await login.navigateToURL();
    await login.loginToApplication();
    await navigation.gotoApplicationConfig();
    await navigation.goToUsers();

    await editUser.addAndEditUserWithReport(testInfo);

    Reporter.endTest(testInfo);

  });

});