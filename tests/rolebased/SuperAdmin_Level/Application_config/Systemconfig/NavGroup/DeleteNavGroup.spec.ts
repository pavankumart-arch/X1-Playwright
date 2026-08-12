import { test, expect } from '@playwright/test';
import { Login } from '../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';
import { DeleteNavGroup } from '../../../pages/Systemconfig/NavGroup/DeleteNavGroup';

test('Delete First Nav Group Functionality', async ({ page }, testInfo) => {

  const login = new Login(page);
  await login.navigateToURL();
  await login.loginToApplication();

  const navigation = new LeftsideNavigation(page);
  await navigation.gotoSystemConfig();
  await navigation.gotoNavGroup();

  console.log('\n============================================================');
  console.log('DELETE NAV GROUP (FIRST ROW)');
  console.log('============================================================');

  const deleteNavGroup = new DeleteNavGroup(page);

  // STEP 1: Delete first row and capture name
  const deletedNavGroupName = await deleteNavGroup.deleteFirstNavGroup();

  console.log(`🗑️ Deleted Nav Group: ${deletedNavGroupName}`);

  // STEP 2: Validate deletion
  const isDeleted = await deleteNavGroup.verifyDeletion(deletedNavGroupName);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('STEP     : Delete Nav Group Functionality');
  console.log('STATUS   :', isDeleted ? 'PASS ✅' : 'FAIL ❌');
  console.log('EXPECTED : Nav Group deleted successfully');
  console.log('ACTUAL   :', isDeleted ? 'Nav Group deleted successfully' : 'Nav Group deletion failed');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // STEP 3: Assertion
  expect(isDeleted).toBeTruthy();
});