import {
  test,
  expect,
  TestInfo
} from '@playwright/test';

// ======================================================
// ENABLE PARALLEL EXECUTION
// ======================================================

test.describe.configure({
  mode: 'parallel'
});

// ======================================================
// IMPORTS
// ======================================================

import { Login }
from '../../pages/Login/Loginpage';

import { LeftsideNavigation }
from '../../pages/Navigations/LeftSideNavigation';

import { ResellerColumns }
from '../../pages/Resellers/ResellerColumns';

import { ResellerValidation }
from '../../pages/Resellers/AddResellerValidation';

import { AddReseller }
from '../../pages/Resellers/AddReseller';

import { ViewReseller }
from '../../pages/Resellers/View Reseller';

import { EditReseller }
from '../../pages/Resellers/EditReseller';

import { VerifyCancelbutton }
from '../../pages/Resellers/ResellerCancelbutton';

import { TableSorting }
from '../../pages/Resellers/ResellerSorting';

import { ResellerPagination }
from '../../pages/Resellers/ResellerPagination';

import { ResellerSearch }
from '../../pages/Resellers/ResellerSearch';

import { DeleteReseller }
from '../../pages/Resellers/DeleteReseller';

import AddResellerdata
from '../../testdata/AddResellerData.json';

import { logAndValidate }
from '../../pages/utils/reportUtil';

// ======================================================
// COMMON LOGIN + NAVIGATION METHOD
// ======================================================

async function loginAndNavigate(page: any) {

  const loginPage =
    new Login(page);

  const navigation =
    new LeftsideNavigation(page);

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
}

// ======================================================
// UNIQUE NAME GENERATOR
// ======================================================

function generateUniqueName() {

  return `Auto_Reseller_${
    Date.now()
  }_${
    Math.floor(
      Math.random() * 1000
    )
  }`;
}

// ======================================================
// 1. VERIFY RESELLER COLUMNS
// ======================================================

test(
  'Verify Reseller Columns',
  async ({ page }, testInfo: TestInfo) => {

    const resellerColumns =
      new ResellerColumns(page);

    await loginAndNavigate(page);

    const actualHeaders =
      await resellerColumns
        .getActualHeaders();

    const expectedColumns = [
      'ID',
      'NAME',
      'DESCRIPTION',
      'CREATED',
      'STATUS',
      'ACTIONS'
    ];

    for (const expected of expectedColumns) {

      const isPresent =
        actualHeaders.includes(
          expected
        );

      logAndValidate({
        step:
          `Verify Column ${expected}`,
        expected,
        actual:
          isPresent
            ? expected
            : 'MISSING'
      }, testInfo);

      expect.soft(
        actualHeaders
      ).toContain(
        expected
      );
    }
  }
);

// ======================================================
// 2. VERIFY ADD RESELLER VALIDATION
// ======================================================

test(
  'Verify Add Reseller Validation',
  async ({ page }, testInfo) => {

    test.setTimeout(60000);

    const resellerValidation =
      new ResellerValidation(page);

    await loginAndNavigate(page);

    await resellerValidation
      .validateResellerForm(
        testInfo
      );
  }
);

// ======================================================
// 3. VERIFY ADD RESELLER
// ======================================================

test(
  'Verify Add Reseller',
  async ({ page }, testInfo) => {

    const addReseller =
      new AddReseller(page);

    await loginAndNavigate(page);

    await addReseller
      .AddReseller(testInfo);
  }
);

// ======================================================
// 4. VERIFY ADDED RESELLER DATA
// ======================================================

test(
  'Verify Added Reseller Data',
  async ({ page }, testInfo) => {

    test.setTimeout(120000);

    const addReseller =
      new AddReseller(page);

    const viewReseller =
      new ViewReseller(
        page,
        testInfo
      );

    await loginAndNavigate(page);

    const createdName =
      await addReseller
        .AddReseller(testInfo);

    if (!createdName) {

      throw new Error(
        'Created reseller name not found'
      );
    }

    console.log(
      `Created Reseller: ${createdName}`
    );

    await page.waitForTimeout(
      2000
    );

    await viewReseller
      .openResellerDetails(
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

      ShowControls: false,
      ShowMap: false,
      ShowRelated: false,
      ShowForm: false,
      AutoPlay: false,
      ShowSharing: false,
      ShowCC: false,
      Active: true,
    };

    const validationPassed =
      await viewReseller
        .verifyResellerFromJson(
          expectedData,
          testInfo
        );

    expect(
      validationPassed
    ).toBeTruthy();
  }
);

// ======================================================
// 5. VERIFY EDIT RESELLER
// ======================================================

test(
  'Verify Edit Reseller',
  async ({ page }, testInfo) => {

    test.setTimeout(180000);

    const editReseller =
      new EditReseller(page);

    await loginAndNavigate(page);

    let editedResellerName =
      '';

    try {

      const result =
        await editReseller
          .addAndEditReseller(
            testInfo
          );

      editedResellerName =
        result.editedName;

      console.log(
        `Added Name: ${
          result.addedName
        }`
      );

      console.log(
        `Edited Name: ${
          result.editedName
        }`
      );

      for (
        const field
        of result.fieldComparisons
      ) {

        console.log(`
FIELD   : ${field.field}
EXPECTED: ${field.expected}
ACTUAL  : ${field.actual}
STATUS  : ${field.status}
`);
      }

      expect(
        result.editSuccess
      ).toBeTruthy();

    } finally {

      if (
        editedResellerName
      ) {

        await editReseller
          .deleteReseller(
            editedResellerName
          );

        console.log(
          `Deleted Reseller: ${editedResellerName}`
        );
      }
    }
  }
);

// ======================================================
// 6. VERIFY DELETE RESELLER
// ======================================================

test(
  'Verify Delete Reseller',
  async ({ page }, testInfo) => {

    const addResellerPage =
      new AddReseller(page);

    const deleteResellerPage =
      new DeleteReseller(page);

    await loginAndNavigate(page);

    const createdResellerName =
      await addResellerPage
        .AddReseller(testInfo);

    console.log(
      `Created Reseller: ${createdResellerName}`
    );

    const deleteSuccess =
      await deleteResellerPage
        .delete(
          createdResellerName
        );

    expect(
      deleteSuccess
    ).toBeTruthy();

    const deletionVerified =
      await deleteResellerPage
        .verifyDeletionSuccess(
          createdResellerName
        );

    expect(
      deletionVerified
    ).toBeTruthy();
  }
);

// ======================================================
// 7. VERIFY CANCEL BUTTON
// ======================================================

test(
  'Verify Reseller Cancel Button',
  async ({ page }, testInfo) => {

    const verifyCancelbutton =
      new VerifyCancelbutton(
        page
      );

    await loginAndNavigate(page);

    await verifyCancelbutton
      .VerifyResellerCancelbutton(
        testInfo
      );
  }
);

// ======================================================
// 8. VERIFY SEARCH
// ======================================================

test(
  'Verify Reseller Search',
  async ({ page }, testInfo) => {

    const resellerSearch =
      new ResellerSearch(page);

    await loginAndNavigate(page);

    await resellerSearch
      .searchByID(testInfo);

    await resellerSearch
      .searchByName(testInfo);

    await resellerSearch
      .searchByDescription(
        testInfo
      );

    await resellerSearch
      .searchByCreated(
        testInfo
      );

    await resellerSearch
      .searchByStatus(
        testInfo
      );

    await resellerSearch
      .searchByBillingName(
        testInfo
      );

    await resellerSearch
      .searchBySalesPerson(
        testInfo
      );

    await resellerSearch
      .searchByTTOptions(
        testInfo
      );

    await resellerSearch
      .searchByAppID(
        testInfo
      );

    await resellerSearch
      .searchByPlayerSize(
        testInfo
      );

    await resellerSearch
      .invalidSearch(
        testInfo
      );
  }
);

// ======================================================
// 9. VERIFY SORTING
// ======================================================

const columns = [
  'ID',
  'NAME',
  'DESCRIPTION',
  'CREATED',
  'STATUS'
];

for (
  const column
  of columns
) {

  test(
    `Sorting Validation - ${column}`,
    async ({ page }, testInfo) => {

      const sorting =
        new TableSorting(page);

      await loginAndNavigate(page);

      const result =
        await sorting
          .validateColumnSorting(
            column,
            testInfo
          );

      expect(
        result,
        `${column} Sorting Failed`
      ).toBeTruthy();
    }
  );
}

// ======================================================
// 10. VERIFY PAGINATION
// ======================================================

test(
  'Verify Reseller Pagination',
  async ({ page }, testInfo) => {

    const resellerPagination =
      new ResellerPagination(page);

    await loginAndNavigate(page);

    await resellerPagination
      .verifyAllPagination(
        testInfo
      );
  }
);