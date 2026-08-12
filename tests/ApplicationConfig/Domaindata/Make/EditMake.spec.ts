import { test, expect } from '@playwright/test';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { EditMake } from '../../../../pages/ApplicationConfig/DomainData/Make/EditMake';
import { Login } from '../../../../pages/Login/Loginpage';

test.describe('Verify Edit Make functionality', () => {
  
  test('Verify Complete Make Flow - Add, Search, Edit, Verify, Delete', async ({ page }, testInfo) => {
    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const editMake = new EditMake(page);

    // LOGIN
    await login.navigateToURL();
    await login.loginToApplication();

    // NAVIGATE TO MAKE
    await navigation.gotoApplicationConfig();
    await navigation.goToDomainData();

    // EXECUTE COMPLETE FLOW: Add → Search → Edit → Verify → Delete
    const success = await editMake.editAndVerifyMake(testInfo)

    // VERIFY ALL STEPS PASSED
    expect(success).toBeTruthy();
  });
});