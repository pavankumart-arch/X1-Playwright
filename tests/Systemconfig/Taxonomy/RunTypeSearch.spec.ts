
import {
  test,
  expect
} from '@playwright/test';

import { Login }
  from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
  from '../../../pages/Navigations/LeftSideNavigation';

import { RunTypeSearch }
  from '../../../pages/Systemconfig/Taxonomy/RunTypeSearch';

import { Reporter }
  from '../../../pages/utils/NewReport';


test.describe(
  'RunType Search Verification',
  () => {

    test(
      'Verify RunType Search Functionality',

      async ({ page }, testInfo) => {

        Reporter.startTest();


        // ==========================
        // LOGIN
        // ==========================

        const loginPage =
          new Login(page);

        await loginPage.navigateToURL();

        await loginPage.loginToApplication();


        // ==========================
        // NAVIGATION
        // ==========================

        const navigation =
          new LeftsideNavigation(page);

        await navigation.gotoSystemConfig();

        await navigation.goToTaxonomy();

        await navigation.goToAppTypes();


        // ==========================
        // OPEN RUNTYPE PAGE
        // ==========================

        const runTypeSearch =
          new RunTypeSearch(
            page,
            testInfo
          );

        await runTypeSearch.openRunTypes();


        // ==========================
        // POSITIVE SEARCH TESTS
        // ==========================

        await runTypeSearch.searchByID();

        await runTypeSearch.searchByTitle();

        await runTypeSearch.searchByRunType();

        await runTypeSearch.searchByClass();

        await runTypeSearch.searchByMethod();


        // ==========================
        // NEGATIVE SEARCH TESTS
        // ==========================

        await runTypeSearch.invalidSearch();

        await runTypeSearch.nonExistentTitle();

        await runTypeSearch.nonExistentID();


        // ==========================
        // FINAL VALIDATION
        // ==========================

        const hasFailures =
          runTypeSearch.hasFailures();


        const actualSummary =
          hasFailures
            ? runTypeSearch
                .getFailures()
                .join(', ')
            : 'No Search Failures';


        Reporter.validateData(

          'No Search Failures',

          actualSummary,

          'RunType Search Summary',

          testInfo

        );


        // ==========================
        // PLAYWRIGHT VALIDATION
        // ==========================

        expect(
          hasFailures,
          hasFailures
            ? runTypeSearch
                .getFailures()
                .join('\n')
            : 'RunType Search completed successfully'
        ).toBeFalsy();


        // ==========================
        // END TEST
        // ==========================

        Reporter.endTest(
          testInfo
        );

      }

    );

  }
);
