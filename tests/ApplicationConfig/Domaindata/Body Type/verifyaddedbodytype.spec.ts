import { test } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { Reporter } from '../../../../pages/utils/NewReport';
import { updateBodyType } from '../../../../pages/ApplicationConfig/DomainData/Body Types/update_bodytype';

test('Verify that the Addedbodytype for Bodytype', async ({ page }, testInfo) => {

  Reporter.startTest();

  const login = new Login(page);
  const navigation = new LeftsideNavigation(page);
  const UpdateBodyType = new updateBodyType(page);

  await login.navigateToURL();
  await login.loginToApplication();

  await navigation.gotoApplicationConfig();
  await navigation.goToDomainData();
  await navigation.goTobodytype();

  // Create Body Type and get created name
  const createdBodyType =
    await UpdateBodyType.createAndVerifyBodyType(testInfo)

  // Click Edit and verify from Edit page
  await UpdateBodyType.verifyAddedBodyType(
    createdBodyType,
    testInfo
  );

  Reporter.endTest(testInfo);
});