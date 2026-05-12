import { test, expect } from '@playwright/test';
import { AddRooftop } from '../../pages/Rooftops/AddRooftop';
import { Login } from '../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../pages/Navigations/LeftSideNavigation';
import { logAndValidate } from '../../utils/reportUtil';

test("Add New Rooftop", async ({ page }, testInfo) => {

  const loginPage = new Login(page);
  await loginPage.navigateToURL();
  await loginPage.loginToApplication();

  const navigation = new LeftsideNavigation(page);

  await navigation.goToDashboard();
  await page.waitForLoadState('networkidle');

  await navigation.goToResellers();
  await page.waitForLoadState('networkidle');
 

  const resellerName = "Premier Auto Group";

  // STEP 1: Click on reseller
  const resellerButton = page
    .locator('table')
    .getByRole('button', { name: resellerName })
    .first();
   
  await resellerButton.click();
  await page.waitForLoadState('networkidle');
  ;
  
  //navigate to rooftops list
  await navigation.goToListofRooftops();
  await page.waitForLoadState('networkidle')
  // STEP 2: Add rooftop
  const addRooftop = new AddRooftop(page);
  const rooftopName = `Rooftop_${Date.now()}`;
  const createdRooftopName = await addRooftop.AddRooftop(rooftopName);

  // STEP 3: Reload page
  await page.waitForTimeout(1000);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);

  // STEP 4: Search for rooftop - FAST
  const searchedRooftopName = await addRooftop.searchRooftopInSummary(createdRooftopName);

  // STEP 5: Report with validation
  logAndValidate({
    step: 'Summary-Add Rooftop Status',
    expected: createdRooftopName,
    actual: searchedRooftopName,
    isSummary: true
  }, testInfo);

  expect(searchedRooftopName).toBe(createdRooftopName);
});