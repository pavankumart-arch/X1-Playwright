import { test, expect, TestInfo } from '@playwright/test';

import { Login } from '../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';
import { ModuleSearch } from '../../../pages/Systemconfig/Taxonomy/ModuleSearch';
import { Reporter } from '../../../pages/utils/NewReport';

test(
  'Verify Module Search Functionality',

  async ({ page }, testInfo: TestInfo) => {

    Reporter.startTest();

    const login = new Login(page);

    await login.navigateToURL();

    await login.loginToApplication();

    const navigation = new LeftsideNavigation(page);

    await navigation.gotoSystemConfig();

    await navigation.goToTaxonomy();

    const moduleSearch =
      new ModuleSearch(page, testInfo);

    // Open Admin module list
    await moduleSearch.openAdminModules();

    console.log('\n===================================================');
    console.log('RUNNING MODULE SEARCH TESTS');
    console.log('===================================================');

    // Positive Tests
    await moduleSearch.searchByID();

    await moduleSearch.searchByModuleName();

    await moduleSearch.searchByModuleType();

    // Negative Tests
    await moduleSearch.invalidSearch();

    await moduleSearch.nonExistentModuleName();

    await moduleSearch.nonExistentID();

    const hasFailures =
      moduleSearch.hasFailures();

    Reporter.validateData(

      'All tests passed',

      hasFailures
        ? `${moduleSearch.getFailures().length} test(s) failed`
        : 'All tests passed',

      'SUMMARY - Module Search',

      testInfo

    );

    expect(hasFailures).toBeFalsy();

    Reporter.endTest(testInfo);
  }
);