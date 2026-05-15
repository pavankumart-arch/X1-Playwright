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

import { RooftopColumns }
from '../../pages/Rooftops/RooftopColumns';

import { validateAddRooftopForm }
from '../../pages/Rooftops/AddRooftopValidation';

import { VerifyRooftopCancelButton }
from '../../pages/Rooftops/CancelRooftop';

import { AddRooftop }
from '../../pages/Rooftops/AddRooftop';

import { VerifyRooftop }
from '../../pages/Rooftops/VerifyAddedRooftop';

import { EditRooftop }
from '../../pages/Rooftops/EdtiRooftop';

import { RooftopSearch }
from '../../pages/Rooftops/RooftopSearch';

import { RooftopShow }
from '../../pages/Rooftops/RooftopShow';

import { RooftopSorting }
from '../../pages/Rooftops/RooftopSorting';

import { logAndValidate }
from '../../utils/reportUtil';

// ======================================================
// COMMON NAVIGATION METHOD
// ======================================================

async function loginAndNavigateToRooftops(
  page: any
) {

  const loginPage =
    new Login(page);

  await loginPage.navigateToURL();

  await loginPage.loginToApplication();

  const navigation =
    new LeftsideNavigation(page);

  await navigation.goToDashboard();

  await page.waitForLoadState(
    'networkidle'
  );

  await navigation.goToResellers();

  await page.waitForLoadState(
    'networkidle'
  );

  const resellerName =
    'Premier Auto Group';

  const resellerButton =
    page
      .locator('table')
      .getByRole(
        'button',
        {
          name:
            resellerName
        }
      )
      .first();

  await resellerButton.click();

  await page.waitForLoadState(
    'networkidle'
  );

  await navigation
    .goToListofRooftops();

  await page.waitForLoadState(
    'networkidle'
  );

  return navigation;
}

// ======================================================
// 1. VERIFY ROOFTOP COLUMNS
// ======================================================

test(
  'Verify Rooftop Columns',
  async ({ page }, testInfo) => {

    await loginAndNavigateToRooftops(
      page
    );

    const rooftopColumns =
      new RooftopColumns(page);

    const {
      expectedColumns,
      actualHeaders
    } =
      await rooftopColumns
        .verifyRooftopColumns();

    for (
      let i = 0;
      i < expectedColumns.length;
      i++
    ) {

      logAndValidate({
        step:
          `Column ${i + 1}`,
        expected:
          expectedColumns[i],
        actual:
          actualHeaders[i]
            || 'MISSING',
        isSummary: false
      }, testInfo);
    }

    expect(
      actualHeaders
    ).toEqual(
      expectedColumns
    );
  }
);

// ======================================================
// 2. VERIFY ROOFTOP VALIDATION
// ======================================================

test(
  'Verify Rooftop Validation',
  async ({ page }, testInfo) => {

    await loginAndNavigateToRooftops(
      page
    );

    const validateForm =
      new validateAddRooftopForm(
        page,
        testInfo
      );

    const isValid =
      await validateForm
        .validateAddRooftopForm();

    expect(
      isValid
    ).toBeTruthy();
  }
);

// ======================================================
// 3. VERIFY ROOFTOP CANCEL BUTTON
// ======================================================

test(
  'Verify Rooftop Cancel Button',
  async ({ page }, testInfo) => {

    await loginAndNavigateToRooftops(
      page
    );

    const cancelButtonTest =
      new VerifyRooftopCancelButton(
        page
      );

    const isSuccess =
      await cancelButtonTest
        .VerifyRooftopCancelButton();

    logAndValidate({
      step:
        'Verify Rooftop Cancel Button',
      expected:
        'Successfully navigated back',
      actual:
        isSuccess
          ? 'Successfully navigated back'
          : 'Failed',
      isSummary: true
    }, testInfo);

    expect(
      isSuccess
    ).toBeTruthy();
  }
);

// ======================================================
// 4. VERIFY ADD ROOFTOP
// ======================================================

test(
  'Verify Add Rooftop',
  async ({ page }, testInfo) => {

    await loginAndNavigateToRooftops(
      page
    );

    const addRooftop =
      new AddRooftop(page);

    const rooftopName =
      `Rooftop_${
        Date.now()
      }`;

    const createdRooftopName =
      await addRooftop
        .AddRooftop(
          rooftopName
        );

    await page.waitForTimeout(
      1000
    );

    await page.reload();

    await page.waitForLoadState(
      'networkidle'
    );

    const searchedRooftopName =
      await addRooftop
        .searchRooftopInSummary(
          createdRooftopName
        );

    logAndValidate({
      step:
        'Summary Add Rooftop',
      expected:
        createdRooftopName,
      actual:
        searchedRooftopName,
      isSummary: true
    }, testInfo);

    expect(
      searchedRooftopName
    ).toBe(
      createdRooftopName
    );
  }
);

// ======================================================
// 5. VERIFY ADDED ROOFTOP DATA
// ======================================================

test(
  'Verify Added Rooftop Data',
  async ({ page }, testInfo) => {

    test.setTimeout(
      180000
    );

    await loginAndNavigateToRooftops(
      page
    );

    const addRooftop =
      new AddRooftop(page);

    const rooftopName =
      `Rooftop_${
        Date.now()
      }`;

    const createdRooftopName =
      await addRooftop
        .AddRooftop(
          rooftopName
        );

    const addedData =
      addRooftop
        .getAddedRooftopData();

    expect(
      addedData
    ).toBeTruthy();

    await page.reload();

    await page.waitForLoadState(
      'networkidle'
    );

    const verifyRooftop =
      new VerifyRooftop(page);

    const result =
      await verifyRooftop
        .VerifyAddedRooftop(
          createdRooftopName,
          addedData
        );

    expect(
      result.searchPassed
    ).toBeTruthy();

    expect(
      result.verificationPassed
    ).toBeTruthy();
  }
);

// ======================================================
// 6. VERIFY EDIT ROOFTOP
// ======================================================

test(
  'Verify Edit Rooftop',
  async ({ page }, testInfo) => {

    test.setTimeout(
      180000
    );

    await loginAndNavigateToRooftops(
      page
    );

    const editRooftop =
      new EditRooftop(page);

    let editedRooftopName =
      '';

    try {

      const result =
        await editRooftop
          .addAndEditRooftop(
            testInfo
          );

      editedRooftopName =
        result.editedName;

      expect(
        result.editSuccess
      ).toBeTruthy();

    } finally {

      if (
        editedRooftopName
      ) {

        await editRooftop
          .deleteRooftop(
            editedRooftopName
          );
      }
    }
  }
);

// ======================================================
// 7. VERIFY DELETE ROOFTOP
// ======================================================

test(
  'Verify Delete Rooftop',
  async ({ page }) => {

    await loginAndNavigateToRooftops(
      page
    );

    const addRooftop =
      new AddRooftop(page);

    const rooftopName =
      `Rooftop_${
        Date.now()
      }`;

    const createdRooftopName =
      await addRooftop
        .AddRooftop(
          rooftopName
        );

    await page.reload();

    await page.waitForLoadState(
      'networkidle'
    );

    const searchBox =
      page.getByPlaceholder(
        'Search...'
      );

    await searchBox.fill(
      createdRooftopName
    );

    await page.waitForTimeout(
      1000
    );

    const deleteButton =
      page
        .locator(
          'table tbody tr'
        )
        .filter({
          hasText:
            createdRooftopName
        })
        .locator('td')
        .last()
        .locator('button')
        .last();

    await deleteButton.click();

    const confirmButton =
      page
        .locator(
          'button:has-text("Delete")'
        )
        .last();

    await confirmButton.click();

    await page.waitForLoadState(
      'networkidle'
    );

    await searchBox.fill('');

    await searchBox.fill(
      createdRooftopName
    );

    const noDataMessage =
      page.locator(
        'text=No data available'
      );

    const deletionPassed =
      await noDataMessage
        .isVisible()
        .catch(() => false);

    expect(
      deletionPassed
    ).toBeTruthy();
  }
);

// ======================================================
// 8. VERIFY PAGINATION
// ======================================================

test(
  'Verify Rooftop Pagination',
  async ({ page }, testInfo) => {

    await loginAndNavigateToRooftops(
      page
    );

    const dropdown =
      page.locator('select');

    const options = [
      '10',
      '20',
      '50',
      '100'
    ];

    let allTestsPassed =
      true;

    for (
      const optionValue
      of options
    ) {

      await dropdown.selectOption(
        optionValue
      );

      await page.waitForTimeout(
        1500
      );

      const text =
        await page
          .locator(
            'text=/Showing \\d+-\\d+ of \\d+/'
          )
          .textContent();

      const totalMatch =
        text?.match(
          /of (\d+)/
        );

      const totalRecords =
        totalMatch
          ? Number(totalMatch[1])
          : 0;

      const rowsPerPage =
        parseInt(optionValue);

      const expectedPages =
        Math.ceil(
          totalRecords
          / rowsPerPage
        );

      let actualPages = 1;

      let canGoNext = true;

      while (
        canGoNext
        && actualPages < expectedPages
      ) {

        const nextButton =
          page.getByRole(
            'button',
            { name: 'Next' }
          );

        const isNextEnabled =
          await nextButton
            .isEnabled();

        if (isNextEnabled) {

          await nextButton.click();

          await page.waitForTimeout(
            1000
          );

          actualPages++;

        } else {

          canGoNext = false;
        }
      }

      if (
        actualPages
        !== expectedPages
      ) {

        allTestsPassed = false;
      }
    }

    expect(
      allTestsPassed
    ).toBeTruthy();
  }
);

// ======================================================
// 9. VERIFY SEARCH
// ======================================================

test(
  'Verify Rooftop Search',
  async ({ page }, testInfo) => {

    await loginAndNavigateToRooftops(
      page
    );

    const rooftopSearch =
      new RooftopSearch(
        page,
        testInfo
      );

    await rooftopSearch
      .searchByID();

    await rooftopSearch
      .searchByName();

    await rooftopSearch
      .searchByDescription();

    await rooftopSearch
      .searchByCreated();

    await rooftopSearch
      .searchByStatus();

    await rooftopSearch
      .invalidSearch();

    await rooftopSearch
      .searchByNonExistentName();

    await rooftopSearch
      .searchByNonExistentID();

    expect(
      rooftopSearch
        .hasFailures()
    ).toBeFalsy();
  }
);

// ======================================================
// 10. VERIFY SHOW OPTIONS
// ======================================================

test(
  'Verify Rooftop Show Up',
  async ({ page }, testInfo) => {

    test.setTimeout(
      180000
    );

    const navigation =
      await loginAndNavigateToRooftops(
        page
      );

    const rooftopShow =
      new RooftopShow(page);

    const result =
      await rooftopShow
        .testAllShowOptions(
          navigation,
          testInfo
        );

    expect(
      result.success
    ).toBeTruthy();
  }
);

// ======================================================
// 11. VERIFY SORTING
// ======================================================

const columnsToTest = [
  'Rooftop Name',
  'Description',
  'Created',
  'Status'
];

for (
  const column
  of columnsToTest
) {

  test(
    `Sorting Validation - ${column}`,
    async ({ page }, testInfo) => {

      test.setTimeout(
        120000
      );

      await loginAndNavigateToRooftops(
        page
      );

      const rooftopSorting =
        new RooftopSorting(page);

      const timeout =
        column === 'Status'
          ? 90000
          : 60000;

      const result =
        await rooftopSorting
          .validateColumnSorting(
            column,
            testInfo,
            timeout
          );

      expect(
        result.passed
      ).toBeTruthy();
    }
  );
}