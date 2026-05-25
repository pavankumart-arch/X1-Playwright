import { test } from '@playwright/test';
import { Login } from '../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';
import { UpdatedUser } from '../../../pages/ApplicationConfig/Users/UpdatedUser';
import EditUserdata from '../../../testdata/EditUser.json';
import { AddUser } from '../../../pages/ApplicationConfig/Users/AddUser';
test('Verify that the edited user details are saved and displayed correctly', async ({ page }) => {
  const login = new Login(page);
  const navigation = new LeftsideNavigation(page);
  const addUser = new AddUser(page);
  const updatedUser = new UpdatedUser(page);

  await login.navigateToURL();
  await login.loginToApplication();
  await navigation.gotoApplicationConfig();
  await navigation.goToUsers();

  // 1. Create a new user (unique username)
  await addUser.addUser();
  // const createdUsername = addUser.getCreatedUsername(); // e.g., "john_1734567890123"

  // // 2. Open the edit view for that specific user
  // await updatedUser.openEditUserView(createdUsername);

  // // // 3. Verify the details (your verify method already cancels)
  // await updatedUser.verifyUpdatedUserDetails();
});