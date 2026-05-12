import { test, TestInfo } from '@playwright/test';
import { Login } from '../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../pages/Navigations/LeftSideNavigation';
import { EditReseller } from '../../pages/Resellers/EditReseller';

test(
  'Add, Edit and Delete Reseller',
  async ({ page }, testInfo: TestInfo) => {
    test.setTimeout(180000);

    const loginPage =
      new Login(page);

    await loginPage.navigateToURL();

    await loginPage.loginToApplication();

    const navigation =
      new LeftsideNavigation(
        page
      );

    await navigation.goToDashboard();

    await page.waitForLoadState(
      'domcontentloaded'
    );

    await navigation.goToResellers();

    await page.waitForLoadState(
      'domcontentloaded'
    );

    const editReseller =
      new EditReseller(
        page
      );

    let editedResellerName =
      '';

    try {
      const result =
        await editReseller.addAndEditReseller(
          testInfo
        );

      editedResellerName =
        result.editedName;

      console.log(
        `\n${'='.repeat(60)}`
      );

      console.log(
        `EDIT RESELLER RESULT`
      );

      console.log(
        `${'='.repeat(60)}`
      );

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
        `   Added Name: ${result.addedName}`
      );

      console.log(
        `   Edited Name: ${result.editedName}`
      );

      // =====================================
      // FIELD VALIDATIONS
      // =====================================

      console.log(
        `\nFIELD COMPARISON RESULTS:`
      );

      for (const field of result.fieldComparisons) {
        const message = `
FIELD   : ${field.field}
EXPECTED: ${field.expected}
ACTUAL  : ${field.actual}
STATUS  : ${field.status}
`;

        console.log(message);

        // PLAYWRIGHT REPORT
        testInfo.annotations.push({
          type: field.field,
          description: message,
        });
      }

      // =====================================
      // SUMMARY
      // =====================================

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

      // FAIL ONLY IF
      // REAL VALIDATION FAILS
      if (!result.editSuccess) {
        throw new Error(
          `Edit reseller verification failed. Check field validations.`
        );
      }
    } finally {
      if (
        editedResellerName
      ) {
        await editReseller.deleteReseller(
          editedResellerName
        );

        testInfo.annotations.push({
          type:
            'Delete Reseller',
          description:
            `Deleted: ${editedResellerName}`,
        });
      }
    }
  }
);