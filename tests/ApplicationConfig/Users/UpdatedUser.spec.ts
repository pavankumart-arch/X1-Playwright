import { test } from '@playwright/test';
import { Login } from '../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';
import { Reporter } from '../../../pages/utils/NewReport';
import { VerifyAddedUser } from '../../../pages/ApplicationConfig/Users/UpdatedUser';

test.describe('Verify User Creation Data', () => {
  test('Verify that user data is correctly displayed in edit form after creation', 
    async ({ page }, testInfo) => {

    Reporter.startTest();

    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const verifyAddedUser = new VerifyAddedUser(page);

    await login.navigateToURL();
    await login.loginToApplication();
    await navigation.gotoApplicationConfig();
    await navigation.goToUsers();

    await verifyAddedUser.addUserAndVerify(testInfo);

    Reporter.endTest(testInfo);

  })
  });