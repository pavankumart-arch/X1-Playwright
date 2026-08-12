import { test } from '@playwright/test';
import AddRooftopData from '../../../testdata/AddRooftopData.json';
import { Login } from '../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';
import { RooftopNavigation } from '../../../pages/Rooftops/RooftopNavigation';
import { rooftopUserValidation } from '../../../pages/other/user/rooftop_AddUserValidation';

test.describe('User Validation', () => {

  test('Verify all User validations', async ({ page }, testInfo) => {

 const loginPage = new Login(page);
  // Login and navigate

  await loginPage.navigateToURL();
  await loginPage.loginToApplication();

  const navigation = new LeftsideNavigation(page);

  await navigation.goToDashboard();
  await page.waitForLoadState('networkidle');

  await navigation.goToResellers();
  await page.waitForLoadState('networkidle');

   const rooftopNavigation = new RooftopNavigation(page);
 // Step 1 & Step 2
  await rooftopNavigation.searchAndOpenRecord(
    AddRooftopData.rooftopname,
    testInfo
  );

  // Navigate to rooftops list
  await navigation.goToListofRooftops();
  await page.waitForLoadState('networkidle');

  await page.waitForTimeout(2000); // Wait for 2 seconds to ensure the page is fully loaded

  // Navigate to Other -> Users
  await navigation.goToOther();
  await page.waitForTimeout(2000);
  await navigation.goToRooftopUsers();
  await page.waitForLoadState('networkidle');
    const RooftopUserValidation = new rooftopUserValidation(page);

  

    // ======================================================
    // CLICK ON ADD USER BUTTON
    // ======================================================

    await RooftopUserValidation.clickOnAddUserButton();

    // ======================================================
    // VERIFY LABELS AND BUTTON TEXT
    // ======================================================
    // TODO: verifyLabelsAndButtonText is not available on rooftopUserValidation page object

    // ======================================================
    // VERIFY PLACEHOLDER TEXT
    // ======================================================

    await RooftopUserValidation.verifyPlaceholderText(testInfo);

    // ======================================================
    // VERIFY REQUIRED FIELD VALIDATIONS
    // ======================================================

    await RooftopUserValidation.verifyRequiredFieldValidations(testInfo);

    // ======================================================
    // VERIFY INVALID FIELD VALIDATIONS
    // ======================================================

    await RooftopUserValidation.verifyInvalidFieldValidations(testInfo);

  });

});