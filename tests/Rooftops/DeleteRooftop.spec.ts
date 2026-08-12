import { test, expect } from '@playwright/test';
import { AddRooftop } from '../../pages/Rooftops/AddRooftop';
import { DeleteRooftop } from '../../pages/Rooftops/DeleteRooftop';
import { Login } from '../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../pages/Navigations/LeftSideNavigation';
import { RooftopNavigation } from '../../pages/Rooftops/RooftopNavigation';
import AddRooftopData from '../../testdata/AddRooftopData.json';

test("Delete Rooftop Functionality", async ({ page }, testInfo) => {

  const loginPage = new Login(page);
  const addRooftop = new AddRooftop(page);
  const deleteRooftop = new DeleteRooftop(page);

  // Login and navigate

  await loginPage.navigateToURL();
  await loginPage.loginToApplication();

  const navigation = new LeftsideNavigation(page);

  await navigation.goToDashboard();
  await page.waitForLoadState('networkidle');

  await navigation.goToResellers();
  await page.waitForLoadState('networkidle');

   const rooftopNavigation = new RooftopNavigation(page);
 // Step 1 & Step 2
  await rooftopNavigation.searchAndOpenRecord(
    AddRooftopData.rooftopname,
    testInfo
  );

  // Navigate to rooftops list
  await navigation.goToListofRooftops();
  await page.waitForLoadState('networkidle');

  // Add rooftop
  const rooftopName = `Rooftop_${Date.now()}`;
  const createdRooftopName = await addRooftop.AddRooftop(testInfo, rooftopName);
  console.log(`\n✅ Rooftop created: ${createdRooftopName}`);

  // Reload page
  await page.waitForTimeout(1000);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);

  // Delete rooftop
  const result = await deleteRooftop.DeleteRooftop(createdRooftopName, testInfo);

  // HARD ASSERTIONS - This ensures the test shows as FAILED in the report
  // If these fail, the Playwright report will show the test as FAILED
  expect(result.deletePassed, 'Delete button click should succeed').toBe(true);
  expect(result.verificationPassed, 'Rooftop should be deleted successfully').toBe(true);

  console.log(`\n✅ Test completed successfully!`);
});