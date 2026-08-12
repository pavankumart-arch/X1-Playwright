import { test, expect } from '@playwright/test';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { AddMake } from '../../../../pages/ApplicationConfig/DomainData/Make/AddMake';
import { DeleteMake } from '../../../../pages/ApplicationConfig/DomainData/Make/DeleteMake';
import { Login } from '../../../../pages/Login/Loginpage';
import { Reporter } from '../../../../pages/utils/NewReport';

test('Verify that the added Make appears in the summary table and can be deleted', async ({ page }, testInfo) => {
  Reporter.startTest();
  
  const login = new Login(page);
  const navigation = new LeftsideNavigation(page);
  const addMake = new AddMake(page);
  const deleteMake = new DeleteMake(page);

  // LOGIN
  await login.navigateToURL();
  await login.loginToApplication();

  // NAVIGATE TO MAKE
  await navigation.gotoApplicationConfig();
  await navigation.goToDomainData();

  // ADD MAKE
  const makeName = await addMake.addMake(testInfo);

  // VERIFY MAKE IN SUMMARY TABLE
  await addMake.verifyAddedMakeIsDisplayed(testInfo);

  // CLEAN UP - DELETE THE ADDED MAKE
  // ✅ FIXED: Removed testInfo - only pass makeName
  await deleteMake.deleteExistingMake(makeName);
  
  Reporter.endTest(testInfo);
});