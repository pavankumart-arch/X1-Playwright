import { test, TestInfo } from '@playwright/test';
import { Login } from '../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../pages/Navigations/LeftSideNavigation';
import { EditRooftop } from '../../pages/Rooftops/EdtiRooftop';

test("Add, Edit and Delete Rooftop", async ({ page }, testInfo: TestInfo) => {
  test.setTimeout(180000);
  
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
  
  // Navigate to rooftops list
  await navigation.goToListofRooftops();
  await page.waitForLoadState('networkidle');
  
  const editRooftop = new EditRooftop(page);
  
  let editedRooftopName = '';
  
  try {
    // Add and edit rooftop (AddRooftop class handles JSON data internally)
    const result = await editRooftop.addAndEditRooftop(testInfo);
    editedRooftopName = result.editedName;
    
    console.log(`\n${"=".repeat(60)}`);
    console.log(`EDIT ROOFTOP RESULT`);
    console.log(`${"=".repeat(60)}`);
    console.log(`Add Rooftop: ${result.addSuccess ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Edit Rooftop: ${result.editSuccess ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   Added Name: ${result.addedName}`);
    console.log(`   Edited Name: ${result.editedName}`);
    
    if (!result.editSuccess && result.fieldComparisons.length > 0) {
      console.log(`\n❌ Failed Field Comparisons:`);
      for (const field of result.fieldComparisons) {
        if (field.status === '❌ FAIL') {
          console.log(`   ${field.field}: ${field.error}`);
        }
      }
    }
    
    // Add annotations for report
    testInfo.annotations.push({
      type: 'Add Rooftop',
      description: result.addSuccess ? `Success - Name: ${result.addedName}` : 'Failed'
    });
    
    testInfo.annotations.push({
      type: 'Edit Rooftop',
      description: result.editSuccess ? `Success - New Name: ${result.editedName}` : 'Failed'
    });
    
    // Fail the test if edit was not successful
    if (!result.editSuccess) {
      throw new Error(`Edit rooftop verification failed. Check the logs for details.`);
    }
    
  } finally {
    // Clean up - Delete the edited rooftop using the delete method
    if (editedRooftopName) {
      console.log(`\n${"=".repeat(60)}`);
      console.log(`STEP 3: Deleting Edited Rooftop`);
      console.log(`${"=".repeat(60)}`);
      
      // Just call the delete method - no duplicate code
      await editRooftop.deleteRooftop(editedRooftopName);
      
      testInfo.annotations.push({
        type: 'Delete Rooftop',
        description: `Deleted: ${editedRooftopName}`
      });
    }
  }
});