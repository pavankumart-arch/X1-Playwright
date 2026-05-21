import { test, expect } from '@playwright/test';
import { Login } from '../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';
import { AddUser } from '../../../pages/ApplicationConfig/Users/AddUser';
import { DeleteUser } from '../../../pages/ApplicationConfig/Users/DeleteUser';

test.describe('Verify the Delete User functionality', () => {

  test('Verify that a user can be deleted successfully', async ({ page }, testInfo) => {

    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const addUser = new AddUser(page);
    const deleteUser = new DeleteUser(page);

    // ======================================================
    // LOGIN
    // ======================================================

    await login.navigateToURL();

    await login.loginToApplication();

    // ======================================================
    // NAVIGATE TO USERS
    // ======================================================

    await navigation.gotoApplicationConfig();

    await navigation.goToUsers();

    // ======================================================
    // ADD USER
    // ======================================================

    await addUser.addUser();

    // ======================================================
    // DELETE USER
    // ======================================================

    const result = await deleteUser.DeleteUser(
      addUser['expectedUsername']
    );

    // ======================================================
    // SUMMARY REPORT
    // ======================================================

    const summaryReport =
`✅ Login successful
✅ User Created Successfully: ${addUser['expectedUsername']}
✅ Created Username: ${addUser['expectedUsername']}

==================================================
SUMMARY - Delete User Functionality
==================================================
Expected: User should be deleted successfully
Actual: ${result.verificationPassed ? 'User deleted successfully' : 'Deletion failed'}
Status: ${result.verificationPassed ? 'PASS ✅' : 'FAIL ❌'}
==================================================`;

    // ======================================================
    // ATTACH REPORT TO PLAYWRIGHT HTML REPORT
    // ======================================================

    await testInfo.attach(
      'Delete User Functionality Summary',
      {
        body: Buffer.from(summaryReport),
        contentType: 'text/plain'
      }
    );

    // ======================================================
    // ASSERTIONS
    // ======================================================

    expect.soft(result.deletePassed).toBe(true);

    expect.soft(result.verificationPassed).toBe(true);

  });

});