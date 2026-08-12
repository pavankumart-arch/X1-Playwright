import { test } from '@playwright/test';
import { Login } from '../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../pages/Navigations/LeftSideNavigation';
import { validateAddRooftopForm } from '../../pages/Rooftops/AddRooftopValidation';
import { RooftopNavigation } from '../../pages/Rooftops/RooftopNavigation';
import AddRooftopData from '../../testdata/AddRooftopData.json';

test("Validate Add Rooftop Form", async ({ page }, testInfo) => {

  const loginPage = new Login(page);
  await loginPage.navigateToURL();
  await loginPage.loginToApplication();

  const navigation = new LeftsideNavigation(page);

  await navigation.goToDashboard();
  await page.waitForLoadState('networkidle');

  await navigation.goToResellers();
  await page.waitForLoadState('networkidle');

  const resellerName = "Premier Auto Group";

   const rooftopNavigation = new RooftopNavigation(page);
 // Step 1 & Step 2
  await rooftopNavigation.searchAndOpenRecord(
    AddRooftopData.rooftopname,
    testInfo
  );

  // Navigate to rooftops list
  await navigation.goToListofRooftops();
  await page.waitForLoadState('networkidle');
  
  // Validate Add Rooftop form
  const validateForm = new validateAddRooftopForm(page, testInfo);
  
  // Call the complete validation method
  const isValid = await validateForm.validateAddRooftopForm();
  
  // Final assertion using testInfo annotation
  testInfo.annotations.push({
    type: 'Final Result',
    description: isValid ? 'Test PASSED' : 'Test FAILED'
  });
});