import { test, expect, TestInfo } from '@playwright/test';

import { Login } from '../../pages/Login/Loginpage';

import { LeftsideNavigation } from '../../pages/Navigations/LeftSideNavigation';

import { ResellerValidation } from '../../pages/Resellers/AddResellerValidation';

import { VerifyCancelbutton } from '../../pages/Resellers/ResellerCancelbutton';

import { AddReseller } from '../../pages/Resellers/AddReseller';

import { ViewReseller } from '../../pages/Resellers/View Reseller';

import { EditReseller } from '../../pages/Resellers/EditReseller';

import { ResellerColumns } from '../../pages/Resellers/ResellerColumns';

import { ResellerSearch } from '../../pages/Resellers/ResellerSearch';

import { TableSorting } from '../../pages/Resellers/ResellerSorting';

import { ResellerPagination } from '../../pages/Resellers/ResellerPagination';

import AddResellerdata from '../../testdata/AddResellerData.json';

test.describe('Reseller Module Test Cases', () => {

  test.setTimeout(300000);

  // =====================================
  // VERIFY RESELLER VALIDATION
  // =====================================

  test(
    'Verify the Reseller Validation functionality',
    async ({ page }, testInfo: TestInfo) => {

      const loginPage =
        new Login(page);

      const navigation =
        new LeftsideNavigation(page);

      const resellerValidation =
        new ResellerValidation(page);

      await loginPage.navigateToURL();

      await loginPage.loginToApplication();

      await navigation.goToDashboard();

      await page.waitForLoadState(
        'networkidle'
      );

      await navigation.goToResellers();

      await page.waitForLoadState(
        'networkidle'
      );

      await resellerValidation.validateResellerForm(
        testInfo
      );
    }
  );

  // =====================================
  // VERIFY CANCEL BUTTON
  // =====================================

  test(
    'Verify Reseller Cancel Button',
    async ({ page }, testInfo: TestInfo) => {

      const loginPage =
        new Login(page);

      const leftsideNavigation =
        new LeftsideNavigation(page);

      const verifyCancelbutton =
        new VerifyCancelbutton(page);

      await loginPage.navigateToURL();

      await loginPage.loginToApplication();

      await page.waitForTimeout(
        2000
      );

      await leftsideNavigation.goToDashboard();

      await leftsideNavigation.goToResellers();

      await page.waitForTimeout(
        2000
      );

      await verifyCancelbutton.VerifyResellerCancelbutton(
        testInfo
      );
    }
  );

  // =====================================
  // VERIFY ADD RESELLER
  // =====================================

  test(
    'Verify the Add Reseller functionality',
    async ({ page }, testInfo: TestInfo) => {

      const loginPage =
        new Login(page);

      const navigation =
        new LeftsideNavigation(page);

      const addReseller =
        new AddReseller(page);

      await loginPage.navigateToURL();

      await loginPage.loginToApplication();

      await page.waitForLoadState(
        'networkidle'
      );

      await navigation.goToDashboard();

      await page.waitForLoadState(
        'networkidle'
      );

      await navigation.goToResellers();

      await page.waitForLoadState(
        'networkidle'
      );

      await addReseller.AddReseller(
        testInfo
      );
    }
  );

  // =====================================
  // VERIFY ADDED RESELLER
  // =====================================

  test(
    'Verify Add + View Reseller flow',
    async ({ page }, testInfo: TestInfo) => {

      test.setTimeout(
        120000
      );

      const loginPage =
        new Login(page);

      const nav =
        new LeftsideNavigation(page);

      const addReseller =
        new AddReseller(page);

      const viewReseller =
        new ViewReseller(
          page,
          testInfo
        );

      await loginPage.navigateToURL();

      await loginPage.loginToApplication();

      await nav.goToDashboard();

      await nav.goToResellers();

      const createdName =
        await addReseller.AddReseller(
          testInfo
        );

      if (!createdName) {

        throw new Error(
          '❌ Created reseller name not found'
        );
      }

      console.log(
        '✅ Created Reseller:',
        createdName
      );

      await page.waitForTimeout(
        2000
      );

      await viewReseller.openResellerDetails(
        createdName
      );

      const expectedData = {

        Name:
          createdName,

        Description:
          AddResellerdata.Description,

        BillingName:
          AddResellerdata.BillingName,

        SalesPerson:
          AddResellerdata.SalesPerson,

        TTOptions:
          AddResellerdata.TTOptions,

        AppID:
          AddResellerdata.AppID,

        PlayerSize:
          AddResellerdata.PlayerSize,

        ShowControls:
          false,

        ShowMap:
          false,

        ShowRelated:
          false,

        ShowForm:
          false,

        AutoPlay:
          false,

        ShowSharing:
          false,

        ShowCC:
          false,

        Active:
          true,
      };

      const validationPassed =
        await viewReseller.verifyResellerFromJson(
          expectedData,
          testInfo
        );

      if (!validationPassed) {

        throw new Error(
          '❌ Reseller validation failed - some fields did not match'
        );
      }

      console.log(`
✅ Test completed successfully
`);
    }
  );

  // =====================================
  // VERIFY EDIT AND DELETE RESELLER
  // =====================================

  test(
    'Add Edit and Delete Reseller',
    async ({ page }, testInfo: TestInfo) => {

      const loginPage =
        new Login(page);

      await loginPage.navigateToURL();

      await loginPage.loginToApplication();

      const navigation =
        new LeftsideNavigation(page);

      await navigation.goToDashboard();

      await page.waitForLoadState(
        'domcontentloaded'
      );

      await navigation.goToResellers();

      await page.waitForLoadState(
        'domcontentloaded'
      );

      const editReseller =
        new EditReseller(page);

      let editedResellerName =
        '';

      try {

        const result =
          await editReseller.addAndEditReseller(
            testInfo
          );

        editedResellerName =
          result.editedName;

        console.log(`
========================================
EDIT RESELLER RESULT
========================================
`);

        console.log(
          `Add Reseller: ${
            result.addSuccess
              ? '✅ PASSED'
              : '❌ FAILED'
          }`
        );

        console.log(
          `Edit Reseller: ${
            result.editSuccess
              ? '✅ PASSED'
              : '❌ FAILED'
          }`
        );

        console.log(
          `Added Name: ${result.addedName}`
        );

        console.log(
          `Edited Name: ${result.editedName}`
        );

        console.log(`
FIELD COMPARISON RESULTS:
`);

        for (const field of result.fieldComparisons) {

          const message = `
FIELD   : ${field.field}
EXPECTED: ${field.expected}
ACTUAL  : ${field.actual}
STATUS  : ${field.status}
`;

          console.log(message);

          testInfo.annotations.push({
            type: field.field,
            description: message,
          });
        }

        testInfo.annotations.push({
          type: 'Add Reseller',
          description:
            result.addSuccess
              ? `Success - Name: ${result.addedName}`
              : 'Failed',
        });

        testInfo.annotations.push({
          type: 'Edit Reseller',
          description:
            result.editSuccess
              ? `Success - New Name: ${result.editedName}`
              : 'Failed',
        });

        if (!result.editSuccess) {

          throw new Error(
            `Edit reseller verification failed`
          );
        }

      } finally {

        if (editedResellerName) {

          await editReseller.deleteReseller(
            editedResellerName
          );

          testInfo.annotations.push({
            type: 'Delete Reseller',
            description:
              `Deleted: ${editedResellerName}`,
          });
        }
      }
    }
  );

  // =====================================
  // VERIFY RESELLER COLUMNS
  // =====================================

  test(
    'Verify Reseller Columns',
    async ({ page }, testInfo: TestInfo) => {

      const loginPage =
        new Login(page);

      const leftsideNavigation =
        new LeftsideNavigation(page);

      const resellerColumns =
        new ResellerColumns(page);

      testInfo.annotations.push({
        type: 'COLUMN VALIDATION',

        description:
`
========================================
RESELLER COLUMN VALIDATION
========================================
`
      });

      await test.step(
        'Login to application',
        async () => {

          await loginPage.navigateToURL();

          await loginPage.loginToApplication();
        }
      );

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

      const expectedColumns = [
        'ID',
        'Name',
        'Description',
        'Created',
        'Status',
        'Actions'
      ];

      await test.step(
        'Verify reseller table headers',
        async () => {

          await resellerColumns.verifyHeaders(
            expectedColumns,
            testInfo
          );
        }
      );
    }
  );

  // =====================================
  // VERIFY SEARCH FUNCTIONALITY
  // =====================================

  test(
    'Verify All Reseller Search Validations',
    async ({ page }, testInfo: TestInfo) => {

      const loginPage =
        new Login(page);

      const leftsideNavigation =
        new LeftsideNavigation(page);

      const resellerSearch =
        new ResellerSearch(page);

      await loginPage.navigateToURL();

      await loginPage.loginToApplication();

      await leftsideNavigation.goToDashboard();

      await leftsideNavigation.goToResellers();

      testInfo.annotations.push({

        type: 'SEARCH VALIDATION',

        description:
`
========================================
RESELLER SEARCH VALIDATION
========================================
`
      });

      const searchTests = [

        {
          name: 'Search by ID',
          method: () =>
            resellerSearch.searchByID(
              testInfo
            )
        },

        {
          name: 'Search by Name',
          method: () =>
            resellerSearch.searchByName(
              testInfo
            )
        },

        {
          name: 'Search by Description',
          method: () =>
            resellerSearch.searchByDescription(
              testInfo
            )
        },

        {
          name: 'Search by Created Date',
          method: () =>
            resellerSearch.searchByCreated(
              testInfo
            )
        },

        {
          name: 'Search by Status',
          method: () =>
            resellerSearch.searchByStatus(
              testInfo
            )
        },

        {
          name: 'Search by Billing Name',
          method: () =>
            resellerSearch.searchByBillingName(
              testInfo
            )
        },

        {
          name: 'Search by Sales Person',
          method: () =>
            resellerSearch.searchBySalesPerson(
              testInfo
            )
        },

        {
          name: 'Search by TT Options',
          method: () =>
            resellerSearch.searchByTTOptions(
              testInfo
            )
        },

        {
          name: 'Search by App ID',
          method: () =>
            resellerSearch.searchByAppID(
              testInfo
            )
        },

        {
          name: 'Search by Player Size',
          method: () =>
            resellerSearch.searchByPlayerSize(
              testInfo
            )
        },

        {
          name: 'Invalid Search',
          method: () =>
            resellerSearch.invalidSearch(
              testInfo
            )
        }
      ];

      for (const searchTest of searchTests) {

        try {

          console.log(`
========================================
RUNNING : ${searchTest.name}
========================================
`);

          await searchTest.method();

          console.log(`
========================================
PASSED : ${searchTest.name}
========================================
`);

        } catch (error: any) {

          console.log(`
========================================
FAILED : ${searchTest.name}

ERROR : ${error.message}
========================================
`);
        }
      }

      console.log(`
========================================
ALL SEARCH TESTS EXECUTED
========================================
`);
    }
  );

  // =====================================
  // VERIFY SORTING
  // =====================================

  test(
    'Verify All Reseller Sorting Validations',
    async ({ page }, testInfo: TestInfo) => {

      const loginPage =
        new Login(page);

      const navigation =
        new LeftsideNavigation(page);

      const sorting =
        new TableSorting(page);

      const failedColumns:
        string[] = [];

      await loginPage.navigateToURL();

      await loginPage.loginToApplication();

      await navigation.goToDashboard();

      await navigation.goToResellers();

      testInfo.annotations.push({

        type: 'SORTING VALIDATION',

        description:
`
========================================
RESELLER SORTING VALIDATION
========================================
`
      });

      const columns = [
        'ID',
        'NAME',
        'DESCRIPTION',
        'CREATED',
        'STATUS'
      ];

      for (const column of columns) {

        try {

          console.log(`
========================================
RUNNING SORTING : ${column}
========================================
`);

          const result =
            await sorting.validateColumnSorting(
              column,
              testInfo
            );

          if (!result) {

            failedColumns.push(
              column
            );
          }

          console.log(`
========================================
COMPLETED SORTING : ${column}
========================================
`);

        } catch (error: any) {

          failedColumns.push(
            column
          );

          console.log(`
========================================
SORTING FAILED : ${column}

ERROR : ${error.message}
========================================
`);
        }
      }

      if (failedColumns.length > 0) {

        console.log(`
========================================
FAILED SORTING COLUMNS

${failedColumns.join('\n')}
========================================
`);

        expect.soft(
          failedColumns.length,
          `Failed Columns:\n${failedColumns.join('\n')}`
        ).toBe(0);
      }

      console.log(`
========================================
ALL SORTING VALIDATIONS COMPLETED
========================================
`);
    }
  );

  // =====================================
  // VERIFY PAGINATION
  // =====================================

  test(
    'Verify Reseller Pagination',
    async ({ page }, testInfo: TestInfo) => {

      const loginPage =
        new Login(page);

      const leftsideNavigation =
        new LeftsideNavigation(page);

      const resellerPagination =
        new ResellerPagination(page);

      await loginPage.navigateToURL();

      await loginPage.loginToApplication();

      await leftsideNavigation.goToDashboard();

      await leftsideNavigation.goToResellers();

      await resellerPagination.verifyAllPagination(
        testInfo
      );
    }
  );

});