import { test } from '@playwright/test';

import { AppTypeColumns }
from '../../../pages/Systemconfig/Taxonomy/Unselectandselectcolumns';

import { Login }
from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
from '../../../pages/Navigations/LeftSideNavigation';

test.describe(
  'App Types Column Combination Verification',
  () => {

    test(
      'Verify hide/show functionality for all columns',
      async ({ page }) => {

        // Increase timeout for all column operations
        test.setTimeout(120000);

        const loginPage =
          new Login(page);

        const navigation =
          new LeftsideNavigation(page);

        await loginPage.navigateToURL();

        await loginPage.loginToApplication();

        await navigation.gotoSystemConfig();

        await navigation.goToTaxonomy();

        await navigation.goToAppTypes();

        await page.waitForLoadState(
          'networkidle'
        );

        const appTypeColumns =
          new AppTypeColumns(page);

        await appTypeColumns
          .verifyAllColumnCombinations();

        console.log(
          '✅ All Column Hide/Show combinations verified successfully'
        );
      }
    );
  }
);