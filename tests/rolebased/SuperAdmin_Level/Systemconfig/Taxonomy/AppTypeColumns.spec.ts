import { test, expect } from '@playwright/test';
import { AppTypeColumns } from '../../../pages/Systemconfig/Taxonomy/AppTypeColumns';
import { Login } from '../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';
import { Taxonomy  } from '../../../pages/Systemconfig/Taxonomy/AddAppType';

test.describe('App Types Columns Verification', () => {

  test('Verify App Types table columns', async ({ page }) => {

        const loginPage = new Login(page);
        const navigation = new LeftsideNavigation(page);
         const taxonomy = new Taxonomy(page);
              
                  await loginPage.navigateToURL();
              
                  await loginPage.loginToApplication();
              
                  await navigation.gotoSystemConfig();
              
                  await navigation.goToTaxonomy();
              
                  await navigation.goToAppTypes();
    
        await page.waitForLoadState('networkidle');
    
    // Wait for dashboard load
    await page.waitForLoadState('networkidle');

    // =========================================
    // ✅ NAVIGATE TO APP TYPES PAGE
    // =========================================
    await page.click('text=Taxonomy');

    await page.click('text=AppTypes');

    await page.waitForLoadState('networkidle');

    // =========================================
    // ✅ COLUMN VALIDATION
    // =========================================
    const appTypeColumns = new AppTypeColumns(page);

    const {
      expectedColumns,
      actualHeaders
    } = await appTypeColumns.verifyAppTypeColumns();

    // =========================================
    // ✅ LOG RESULTS
    // =========================================
    console.log('\n===================================');
    console.log('📊 APP TYPES COLUMN VALIDATION');
    console.log('===================================');

    console.log('Expected Columns:', expectedColumns);
    console.log('Actual Columns  :', actualHeaders);

    // =========================================
    // ✅ ASSERTION
    // =========================================
    expect(actualHeaders).toEqual(expectedColumns);

    console.log('\n✅ App Types Columns Validation Passed');
  });

});