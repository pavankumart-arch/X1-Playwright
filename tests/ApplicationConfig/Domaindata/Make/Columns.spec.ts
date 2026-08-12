import { test } from '@playwright/test';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { MakesColumns } from '../../../../pages/ApplicationConfig/DomainData/Make/ColumnsMake';
import { Login } from '../../../../pages/Login/Loginpage';
import { Reporter } from '../../../../pages/utils/NewReport';

test.describe('Verify the Column Headers functionality', () => {
  test('Verify Makes table column headers', async ({ page }, testInfo) => {
    Reporter.startTest();
    
    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const makesColumns = new MakesColumns(page);

    // LOGIN
    await login.navigateToURL();
    await login.loginToApplication();

    // NAVIGATION
    await navigation.gotoApplicationConfig();
    await navigation.goToDomainData();

    // VERIFY Columns names
    await makesColumns.verifyMakesColumnHeaders(testInfo);
    
    Reporter.endTest(testInfo);
  });
});