import { test } from '@playwright/test';
import { Login } from '../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';
import { AddUser } from '../../../pages/ApplicationConfig/Users/AddUser';
import { DeleteUser } from '../../../pages/ApplicationConfig/Users/DeleteUser';
import Adduserdata from '../../../testdata/AddUser.json';

test.describe('Verify the Delete User functionality', () => {
  test('Verify that a user can be deleted successfully', async ({ page }, testInfo) => {
    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const addUser = new AddUser(page);
    const deleteUser = new DeleteUser(page);

    // LOGIN
    await login.navigateToURL();
    await login.loginToApplication();

    // NAVIGATE TO USERS
    await navigation.gotoApplicationConfig();
    await navigation.goToUsers();

    // FIRST ADD A USER (so we have something to delete)
    await addUser.addUser();

    // THEN DELETE THE SAME USER
    const result = await deleteUser.DeleteUser(Adduserdata.username);

    testInfo.annotations.push({
      type: 'Deletion Result',
      description: `Delete passed: ${result.deletePassed}, Verification passed: ${result.verificationPassed}`
    });
    const { expect } = await import('@playwright/test');
    expect.soft(result.deletePassed).toBe(true);
    expect.soft(result.verificationPassed).toBe(true);
  });
});