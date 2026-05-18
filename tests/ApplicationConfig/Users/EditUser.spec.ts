import { test, expect } from '@playwright/test';

import { Login }
  from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
  from '../../../pages/Navigations/LeftSideNavigation';

import { EditUser }
  from '../../../pages/ApplicationConfig/Users/EditUser';

test.describe(
  'Verify the Update User functionality',
  () => {

    test(
      'Verify that the edited user details are saved and displayed correctly',

      async ({ page }, testInfo) => {

        const login =
          new Login(page);

        const navigation =
          new LeftsideNavigation(page);

        const editUser =
          new EditUser(page);

        // LOGIN

        await login.navigateToURL();

        await login.loginToApplication();

        // NAVIGATE TO USERS

        await navigation.gotoApplicationConfig();

        await navigation.goToUsers();

        // COMPLETE FLOW

        const result =
          await editUser.addAndEditUser(
            testInfo
          );

        // FINAL ASSERTIONS

        expect(
          result.addSuccess
        ).toBeTruthy();

        expect(
          result.editSuccess
        ).toBeTruthy();

        expect(
          result.deleteSuccess
        ).toBeTruthy();

        // CONSOLE SUMMARY

        console.log(
          '\n' + '='.repeat(60)
        );

        console.log(
          'UPDATE USER SUMMARY'
        );

        console.log(
          '='.repeat(60)
        );

        console.log(
          `Edited Username : ${result.editedUsername}`
        );

        console.log(
          `Add Status      : ${
            result.addSuccess
              ? 'PASS ✅'
              : 'FAIL ❌'
          }`
        );

        console.log(
          `Edit Status     : ${
            result.editSuccess
              ? 'PASS ✅'
              : 'FAIL ❌'
          }`
        );

        console.log(
          `Delete Status   : ${
            result.deleteSuccess
              ? 'PASS ✅'
              : 'FAIL ❌'
          }`
        );

        console.log(
          '='.repeat(60)
        );

        // FIELD VALIDATIONS

        for (
          const comparison
          of result.fieldComparisons
        ) {

          console.log(`
FIELD    : ${comparison.field}
EXPECTED : ${comparison.expected}
ACTUAL   : ${comparison.actual}
STATUS   : ${comparison.status}
`);
        }

        // REPORT SUMMARY

        const summary = `
============================================================
UPDATE USER SUMMARY
============================================================

Edited Username : ${result.editedUsername}

Add Status      : ${
  result.addSuccess
    ? 'PASS ✅'
    : 'FAIL ❌'
}

Edit Status     : ${
  result.editSuccess
    ? 'PASS ✅'
    : 'FAIL ❌'
}

Delete Status   : ${
  result.deleteSuccess
    ? 'PASS ✅'
    : 'FAIL ❌'
}

============================================================
FIELD VALIDATIONS
============================================================

${result.fieldComparisons.map(
  comparison => `
FIELD    : ${comparison.field}

EXPECTED : ${comparison.expected}

ACTUAL   : ${comparison.actual}

STATUS   : ${comparison.status}
`
).join('\n')}
`;

        // ATTACH TO PLAYWRIGHT REPORT

        await testInfo.attach(
          'Update User Summary',
          {
            body: summary,
            contentType: 'text/plain'
          }
        );
      }
    );
  }
);