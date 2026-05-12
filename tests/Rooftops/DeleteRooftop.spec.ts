  import { test, expect } from '@playwright/test';
  import { AddRooftop } from '../../pages/Rooftops/AddRooftop';
  import { Login } from '../../pages/Login/Loginpage';
  import { LeftsideNavigation } from '../../pages/Navigations/LeftSideNavigation';

  test("Delete Rooftop Functionality", async ({ page }) => {

    const loginPage = new Login(page);
    await loginPage.navigateToURL();
    await loginPage.loginToApplication();

    const navigation = new LeftsideNavigation(page);

    await navigation.goToDashboard();
    await page.waitForLoadState('networkidle');

    await navigation.goToResellers();
    await page.waitForLoadState('networkidle');

    const resellerName = "Premier Auto Group";

    const resellerButton = page
      .locator('table')
      .getByRole('button', { name: resellerName })
      .first();

    await resellerButton.click();
    await page.waitForLoadState('networkidle');

    const addRooftop = new AddRooftop(page);
    const rooftopName = `Rooftop_${Date.now()}`;
    
    const createdRooftopName = await addRooftop.AddRooftop(rooftopName);
    
    console.log(`\n✅ Rooftop created: ${createdRooftopName}`);

    await page.waitForTimeout(1000);
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Search and Delete
    const searchBox = page.getByPlaceholder('Search...');
    await searchBox.click();
    await searchBox.fill('');
    await page.waitForTimeout(300);
    await searchBox.fill(createdRooftopName);
    await page.waitForTimeout(800);

    // Click Delete button
    const deleteButton = page
      .locator('table tbody tr')
      .filter({ hasText: createdRooftopName })
      .locator('td').last()
      .locator('button')
      .last();
    
    await deleteButton.click();
    await page.waitForTimeout(500);
    
    // Confirm deletion
    const confirmButton = page.locator('button:has-text("Delete")').last();
    await confirmButton.click();

    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');

    // Verify deletion
    await searchBox.click();
    await searchBox.fill('');
    await page.waitForTimeout(300);
    await searchBox.fill(createdRooftopName);
    await page.waitForTimeout(800);

    const noDataMessage = page.locator('text=No data available');
    const deletionPassed = await noDataMessage.isVisible().catch(() => false);

    // Summary Result
    console.log(`\n${"=".repeat(50)}`);
    console.log(`SUMMARY - Delete Rooftop Functionality`);
    console.log(`${"=".repeat(50)}`);
    console.log(`Expected: Rooftop should be deleted successfully`);
    console.log(`Actual: ${deletionPassed ? 'Rooftop deleted successfully' : 'Deletion failed'}`);
    console.log(`Status: ${deletionPassed ? 'PASS ✅' : 'FAIL ❌'}`);
    console.log(`${"=".repeat(50)}`);

    expect(deletionPassed, 'Rooftop should be deleted').toBeTruthy();
  });