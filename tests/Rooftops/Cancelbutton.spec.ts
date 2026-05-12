  import { test, expect } from '@playwright/test';
  import { Login } from '../../pages/Login/Loginpage';
  import { LeftsideNavigation } from '../../pages/Navigations/LeftSideNavigation';
  import { logAndValidate } from '../../utils/reportUtil';
  import { VerifyRooftopCancelButton } from '../../pages/Rooftops/CancelRooftop';

  test("Verify Rooftop Cancel Button Functionality", async ({ page }, testInfo) => {

    const loginPage = new Login(page);
    await loginPage.navigateToURL();
    await loginPage.loginToApplication();

    const navigation = new LeftsideNavigation(page);

    await navigation.goToDashboard();
    await page.waitForLoadState('networkidle');

    await navigation.goToResellers();
    await page.waitForLoadState('networkidle');

    const resellerName = "Premier Auto Group";

    const resellerButton = page
      .locator('table')
      .getByRole('button', { name: resellerName })
      .first();

    await resellerButton.click();
    await page.waitForLoadState('networkidle');
    
    // Navigate to rooftops list
    await navigation.goToListofRooftops();
    await page.waitForLoadState('networkidle');
    

    // Use Page Object Model
    const cancelButtonTest = new VerifyRooftopCancelButton(page);
    const isSuccess = await cancelButtonTest.VerifyRooftopCancelButton();

    // Report to HTML
    logAndValidate({
      step: 'Verify Rooftop Cancel Button Functionality',
      expected: 'Successfully navigated back to summary page',
      actual: isSuccess ? 'Successfully navigated back to summary page' : 'Failed to navigate back',
      isSummary: true
    }, testInfo);

    // Assertion
    expect(isSuccess, 'Cancel button should navigate back to summary page').toBeTruthy();
  });