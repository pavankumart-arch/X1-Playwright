import { test } from '@playwright/test';
import { Login } from '../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';
import { EditUser } from '../../../pages/ApplicationConfig/Users/EditUser';
import { UpdatedUser } from '../../../pages/ApplicationConfig/Users/UpdatedUser';
import EditUserdata from '../../../testdata/EditUser.json';

test.describe('Verify the Update User functionality', () => {
  test('Verify that the edited user details are saved and displayed correctly', async ({ page }) => {
    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const editUser = new EditUser(page);
    const updatedUser = new UpdatedUser(page);

    // LOGIN
    await login.navigateToURL();
    await login.loginToApplication();

    // NAVIGATE TO USERS
    await navigation.gotoApplicationConfig();
    await navigation.goToUsers();

    // EDIT USER (using the existing editUser method which creates/edits a user)
    await editUser.editUser();

    // VERIFY UPDATED DETAILS
    // Open the edit view for the updated username and verify all fields
    await updatedUser.openEditUserView(EditUserdata.username);
    await updatedUser.verifyUpdatedUserDetails();
  });
});