import { test } from '@playwright/test';
import { Login } from '../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../pages/Navigations/LeftSideNavigation';
import { validateAddRooftopForm } from '../../pages/Rooftops/AddRooftopValidation';


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

  // Click on reseller
  const resellerButton = page
    .locator('table')
    .getByRole('button', { name: resellerName })
    .first();
   
  await resellerButton.click();
  await page.waitForLoadState('networkidle');
  
  // Navigate to rooftops list
  await navigation.goToListofRooftops();
  await page.waitForLoadState('networkidle');
  
  // Validate Add Rooftop form
  const validateForm = new validateAddRooftopForm(page, testInfo);
  
  // Call the complete validation method
  const isValid = await validateForm.validateAddRooftopForm();
  
  // Final assertion
  testInfo.annotations.push({
    type: 'Final Result',
    description: isValid ? 'Test PASSED' : 'Test FAILED'
  });
});