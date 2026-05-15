import {
  test,
  expect,
  TestInfo
} from '@playwright/test';

import { Login }
from '../../pages/Login/Loginpage';

import { LeftsideNavigation }
from '../../pages/Navigations/LeftSideNavigation';

import { ResellerColumns }
from '../../pages/Resellers/ResellerColumns';

import { logAndValidate }
from '../../pages/utils/reportUtil';

test(
  'Verify Reseller Columns',
  async (
    { page },
    testInfo: TestInfo
  ) => {

    const loginPage =
      new Login(page);

    const leftsideNavigation =
      new LeftsideNavigation(
        page
      );

    const resellerColumns =
      new ResellerColumns(
        page
      );

    // =====================================
    // COLUMN VALIDATION HEADING
    // =====================================

    testInfo.annotations.push({
      type:
        'COLUMN VALIDATION',

      description:
`
========================================
RESELLER COLUMN VALIDATION
========================================
`
    });

    // =====================================
    // STEP 1 : LOGIN
    // =====================================

    await test.step(
      'Login to application',
      async () => {

        await loginPage.navigateToURL();

        await loginPage.loginToApplication();
      }
    );

    // =====================================
    // STEP 2 : NAVIGATION
    // =====================================

    await test.step(
      'Navigate to Resellers page',
      async () => {

        await leftsideNavigation.goToDashboard();

        await leftsideNavigation.goToResellers();

        await page.waitForSelector(
          'table'
        );
      }
    );

    // =====================================
    // STEP 3 : FETCH HEADERS
    // =====================================

    const actualHeaders =
      await test.step(
        'Fetch table headers',
        async () => {

          return await resellerColumns.getActualHeaders();
        }
      );

    // =====================================
    // EXPECTED HEADERS
    // =====================================

    const expectedColumns = [
      'ID',
      'NAME',
      'DESCRIPTION',
      'CREATED',
      'STATUS',
      'ACTIONS'
    ];

    // =====================================
    // VERIFY HEADERS
    // =====================================

    for (const expected of expectedColumns) {

      await test.step(
        `Verify column: ${expected}`,
        async () => {

          const isPresent =
            actualHeaders.includes(
              expected
            );

          const actualValue =
            isPresent
              ? expected
              : 'MISSING';

          logAndValidate(
            {
              step:
                `Verify column: ${expected}`,

              expected,

              actual:
                actualValue
            },
            testInfo
          );

          expect.soft(
            actualHeaders,
            `Column "${expected}" not found`
          ).toContain(
            expected
          );
        }
      );
    }
  }
);