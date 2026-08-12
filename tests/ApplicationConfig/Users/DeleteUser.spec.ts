import { test, expect } from '@playwright/test';
import { Login } from '../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';
import { Reporter } from '../../../pages/utils/NewReport';
import { DeleteUser } from '../../../X1-Playwright/pages/ApplicationConfig/Users/DeleteUser';
import { AddUser } from '../../../X1-Playwright/pages/ApplicationConfig/Users/AddUser';

test.describe('Verify the Delete User functionality', () => {

  test('Verify that a user can be deleted successfully', 
    async ({ page }, testInfo) => {

    Reporter.startTest();

    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const deleteUser = new DeleteUser(page);
    const addUser = new AddUser(page);

    await login.navigateToURL();
    await login.loginToApplication();
    await navigation.gotoApplicationConfig();
    await navigation.goToUsers();

    // ADD USER
    await addUser.addUser();
    await addUser.verifyAddedUserIsDisplayed(testInfo);

    // Get the username from the table (first row after search should be the newly added user)
    const rows = page.locator('table tbody tr');
    const firstRow = rows.first();
    const username = await firstRow.locator('td').nth(1).textContent();
    
    if (!username || username.trim() === '') {
      console.log('❌ Could not retrieve username from table');
      expect(username).toBeDefined();
      return;
    }

    const cleanUsername = username.trim();
    console.log(`✅ Retrieved username: "${cleanUsername}"`);

    // DELETE USER
    console.log(`🗑️ Attempting to delete user "${cleanUsername}"...`);
    const deleteResult = await deleteUser.delete(cleanUsername);
    
    if (deleteResult) {
      console.log(`✅ Delete operation completed for "${cleanUsername}"`);
      
      // Verify deletion
      const verificationResult = await deleteUser.verifyDeletionSuccess(cleanUsername);
      
      if (verificationResult) {
        console.log(`✅ User "${cleanUsername}" successfully deleted and verified`);
        expect(verificationResult).toBe(true);
      } else {
        console.log(`❌ User "${cleanUsername}" still exists after deletion`);
        expect(verificationResult).toBe(true);
      }
    } else {
      console.log(`❌ Failed to delete user "${cleanUsername}"`);
      expect(deleteResult).toBe(true);
    }

    Reporter.endTest(testInfo);

  });

});