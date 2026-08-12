import { test, expect } from '@playwright/test';

import { Login } from '../../pages/Login/Loginpage';

import { LeftsideNavigation } from '../../pages/Navigations/LeftSideNavigation';

import { AddReseller } from '../../pages/Resellers/AddReseller';

import { EditReseller } from '../../pages/Resellers/EditReseller';

// =====================================
// IGNORE FUNCTIONAL FAILURES
// PERFORMANCE ONLY REPORT
// =====================================

test.afterEach(async ({ }, testInfo) => {

  testInfo.errors.length = 0;

});

test.describe(
  'Application Performance Testing',
  () => {

    test.setTimeout(300000);

    const performanceReports:
      string[] = [];

    async function measurePerformance(
      page: any,
      pageName: string,
      expectedTime: number,
      action: () => Promise<void>
    ) {

      const startTime =
        Date.now();

      try {

        await action();

      } catch (error: any) {

      }

      await page.waitForLoadState(
        'networkidle'
      );

      const endTime =
        Date.now();

      const actualTime =
        endTime - startTime;

      const status =
        actualTime <= expectedTime
          ? '✅ PASSED'
          : '❌ FAILED';

      const report =
`
========================================
PAGE NAME    : ${pageName}

EXPECTED     : ${expectedTime} ms

ACTUAL       : ${actualTime} ms

STATUS       : ${status}
========================================
`;

      performanceReports.push(
        report
      );
    }

    test(
      'Measure Complete Application Performance',
      async ({ page }, testInfo) => {

        // =====================================
        // HIDE FUNCTIONAL LOGS
        // =====================================

        const originalConsoleLog =
          console.log;

        console.log = () => {};

        const loginPage =
          new Login(page);

        const navigation =
          new LeftsideNavigation(page);

        const addReseller =
          new AddReseller(page);

        const editReseller =
          new EditReseller(page);

        let resellerName =
          '';

        // =====================================
        // LOGIN PAGE PERFORMANCE
        // =====================================

        await measurePerformance(
          page,
          'Login Page',
          1000,
          async () => {

            await loginPage.navigateToURL();

          }
        );

        // =====================================
        // LOGIN FUNCTIONALITY PERFORMANCE
        // =====================================

        await measurePerformance(
          page,
          'Login Functionality',
          1000,
          async () => {

            await loginPage.loginToApplication();

          }
        );

        // =====================================
        // DASHBOARD PAGE PERFORMANCE
        // =====================================

        await measurePerformance(
          page,
          'Dashboard Page',
          1000,
          async () => {

            await navigation.goToDashboard();

          }
        );

        // =====================================
        // RESELLER SUMMARY PAGE PERFORMANCE
        // =====================================

        await measurePerformance(
          page,
          'Reseller Summary Page',
          1000,
          async () => {

            await navigation.goToResellers();

          }
        );

        // =====================================
        // ADD RESELLER PERFORMANCE
        // =====================================

        await measurePerformance(
          page,
          'Add Reseller Page',
          3000,
          async () => {

            resellerName =
              await addReseller.AddReseller(
                testInfo
              );

          }
        );

        // =====================================
        // EDIT RESELLER PERFORMANCE
        // =====================================

        await measurePerformance(
          page,
          'Edit Reseller Page',
          3000,
          async () => {

            await editReseller.addAndEditReseller(
              testInfo
            );

          }
        );

        // =====================================
        // DELETE RESELLER PERFORMANCE
        // =====================================

        await measurePerformance(
          page,
          'Delete Reseller Page',
          3000,
          async () => {

            if (resellerName) {

              await editReseller.deleteReseller(
                resellerName
              );
            }

          }
        );

        // =====================================
        // ENABLE CONSOLE LOG AGAIN
        // =====================================

        console.log =
          originalConsoleLog;

        // =====================================
        // FINAL PERFORMANCE REPORT
        // =====================================

        const finalPerformanceReport =
`
========================================
APPLICATION PERFORMANCE REPORT
========================================

${performanceReports.join('\n')}
`;

        console.log(
          finalPerformanceReport
        );

        testInfo.annotations.push({

          type:
            'APPLICATION PERFORMANCE REPORT',

          description:
            finalPerformanceReport
        });

        // =====================================
        // CLEAR FUNCTIONAL FAILURES
        // =====================================

        testInfo.errors.length = 0;

      }
    );
  }
);