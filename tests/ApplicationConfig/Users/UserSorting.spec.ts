import { test, expect } from '@playwright/test';
import { Login } from '../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';
import { UserSortingWithPagination } from '../../../pages/ApplicationConfig/Users/UserSorting';
import { Reporter } from '../../../pages/utils/NewReport';


test.describe('User Table Sorting Validation', () => {
  test('Verify User Table Sorting Functionality', async ({ page }, testInfo) => {
    Reporter.startTest();
    
    const loginPage = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const sorting = new UserSortingWithPagination(page);
    
    await loginPage.navigateToURL();
    await loginPage.loginToApplication();
    await page.waitForLoadState('networkidle');
    
    await navigation.gotoApplicationConfig();
    await page.waitForLoadState('networkidle');
    
    await navigation.goToUsers();
    await page.waitForLoadState('networkidle');
    
    // Run the sorting validations
    await sorting.verifyAllColumnsSorting(testInfo);
    
    // Get the summary from Reporter
    const summary = Reporter.endTest(testInfo);
    
    // Hard assertion at the end - this will fail the test if any validations failed
    expect(summary.failed, `Test failed with ${summary.failed} validation(s) out of ${summary.totalValidations}`).toBe(0);
  });
});