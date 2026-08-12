import { test, expect } from '@playwright/test';
import { DeleteAppType } from '../../../pages/Systemconfig/Taxonomy/DeleteAppType';
import { Login } from '../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';
import { Taxonomy } from '../../../pages/Systemconfig/Taxonomy/AddAppType';
import { AppTypePagination } from '../../../pages/Systemconfig/Taxonomy/PaginationApptypes';

  test('Verify App Type pagination', async ({ page }) => {
                 const loginPage = new Login(page);
              const navigation = new LeftsideNavigation(page);
              const taxonomy = new Taxonomy(page);
          
              await loginPage.navigateToURL();
          
              await loginPage.loginToApplication();
          
              await navigation.gotoSystemConfig();
          
              await navigation.goToTaxonomy();
          
              await navigation.goToAppTypes();
               await page.waitForLoadState('networkidle');

    // =========================================
    // ✅ PAGINATION OBJECT
    // =========================================
    const appTypePagination = new AppTypePagination(page);

    // =========================================
    // ✅ VERIFY PAGINATION
    // =========================================
    const results = await appTypePagination.verifyAllPagination();

    // =========================================
    // ✅ PRINT RESULTS
    // =========================================
    console.log('\n========================================');
    console.log('📊 FINAL PAGINATION RESULTS');
    console.log('========================================');

    let allPassed = true;

    for (const result of results) {

      const passed = result.expected === result.actual;

      if (!passed) {
        allPassed = false;
      }

      console.log(
        `🔍 ${result.step} → Expected: ${result.expected} | Actual: ${result.actual} | ${passed ? 'PASS ✅' : 'FAIL ❌'}`
      );
    }

    console.log('\n========================================');
    console.log(
      `FINAL RESULT: ${allPassed ? 'PASS ✅' : 'FAIL ❌'}`
    );
    console.log('========================================');

    // =========================================
    // ✅ FINAL ASSERTION
    // =========================================
    expect(
      allPassed,
      'All AppType pagination validations should pass'
    ).toBeTruthy();
  });

