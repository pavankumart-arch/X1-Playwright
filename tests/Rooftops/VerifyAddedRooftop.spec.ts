import { test, expect } from '@playwright/test';
import { AddRooftop } from '../../pages/Rooftops/AddRooftop'
import { Login } from '../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../pages/Navigations/LeftSideNavigation';
import { logAndValidate } from '../../utils/reportUtil';
import { VerifyRooftop } from '../../pages/Rooftops/VerifyAddedRooftop';

test("Verify Added Rooftop", async ({ page }, testInfo) => {

  const loginPage = new Login(page);
  await loginPage.navigateToURL();
  await loginPage.loginToApplication();

  const navigation = new LeftsideNavigation(page);

  await navigation.goToDashboard();
  await page.waitForLoadState('networkidle');

  await navigation.goToResellers();
  await page.waitForLoadState('networkidle');

  const resellerName = "Premier Auto Group";

  console.log(`\n${"=".repeat(70)}`);
  console.log(`STEP 1: Opening Reseller - ${resellerName}`);
  console.log(`${"=".repeat(70)}`);

  const resellerButton = page
    .locator('table')
    .getByRole('button', { name: resellerName })
    .first();

  await resellerButton.click();
  await page.waitForLoadState('networkidle');

  console.log(`\n${"=".repeat(70)}`);
  console.log(`STEP 2: Adding New Rooftop`);
  console.log(`${"=".repeat(70)}`);

  const addRooftop = new AddRooftop(page);
  const rooftopName = `Rooftop_${Date.now()}`;
  
  try {
    const createdRooftopName = await addRooftop.AddRooftop(rooftopName);

    const addedData = addRooftop.getAddedRooftopData();
    
    if (!addedData) {
      console.log(`❌ ERROR: Added data is null!`);
      throw new Error('Failed to retrieve added rooftop data');
    }

    console.log(`\n✅ Added Data Retrieved (${Object.keys(addedData).length} fields):`);
    console.log(JSON.stringify(addedData, null, 2));

    console.log(`\n${"=".repeat(70)}`);
    console.log(`STEP 3: Reloading Page`);
    console.log(`${"=".repeat(70)}`);

    await page.waitForTimeout(1000);
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    console.log(`\n${"=".repeat(70)}`);
    console.log(`STEP 4: Verifying Rooftop Data`);
    console.log(`${"=".repeat(70)}`);

    const verifyRooftop = new VerifyRooftop(page);
    const result = await verifyRooftop.VerifyAddedRooftop(createdRooftopName, addedData);

    console.log(`\n${"=".repeat(70)}`);
    console.log(`TEST RESULTS`);
    console.log(`${"=".repeat(70)}\n`);

    logAndValidate({
      step: 'Step 1 - Search Rooftop in Summary',
      expected: createdRooftopName,
      actual: result.searchPassed ? createdRooftopName : 'NOT FOUND',
      isSummary: false
    }, testInfo);

    console.log(`\n${"=".repeat(70)}`);
    console.log(`Field-by-Field Comparison`);
    console.log(`${"=".repeat(70)}\n`);

    for (const fieldComparison of result.fieldComparisons) {
      logAndValidate({
        step: fieldComparison.field.toUpperCase(),
        expected: fieldComparison.expected || '(empty)',
        actual: fieldComparison.actual || '(empty)',
        isSummary: false
      }, testInfo);
    }

    const passedFields = result.fieldComparisons.filter((fc: any) => fc.status.includes('✅')).length;
    const totalFields = result.fieldComparisons.length;
    const failedFields = result.fieldComparisons.filter((fc: any) => fc.status.includes('❌'));
    
    console.log(`${"=".repeat(70)}`);
    if (result.verificationPassed) {
      console.log(`✅ ALL FIELDS MATCHED! (${passedFields}/${totalFields})`);
    } else {
      console.log(`⚠️ MISMATCH DETECTED!`);
      console.log(`  ✅ Passed: ${passedFields}`);
      console.log(`  ❌ Failed: ${failedFields.length}`);
      console.log(`\nFailed Fields:`);
      failedFields.forEach((ff: any) => {
        console.log(`  - ${ff.field}: Expected "${ff.expected}" but got "${ff.actual}"`);
      });
    }
    console.log(`${"=".repeat(70)}\n`);

    logAndValidate({
      step: 'Verify Added Rooftop - Complete Data Validation',
      expected: `All ${totalFields} Fields Matched`,
      actual: `${passedFields} / ${totalFields} Fields Matched`,
      isSummary: true
    }, testInfo);

    if (!result.verificationPassed) {
      for (const failedField of failedFields) {
        logAndValidate({
          step: `❌ MISMATCH: ${failedField.field}`,
          expected: failedField.expected,
          actual: failedField.actual,
          isSummary: false
        }, testInfo);
      }
    }

    expect(result.searchPassed, 'Rooftop search should pass').toBeTruthy();
    expect(result.verificationPassed, 'All fields should match').toBeTruthy();

    console.log(`\n${"=".repeat(70)}`);
    if (result.verificationPassed) {
      console.log(`✅✅✅ TEST PASSED - All Data Verified Successfully!`);
    } else {
      console.log(`❌ TEST FAILED - Some fields don't match!`);
    }
    console.log(`${"=".repeat(70)}\n`);

  } catch (error) {
    console.log(`\n❌ TEST FAILED WITH ERROR:`);
    console.log(`${error}`);
    logAndValidate({
      step: 'Overall Test Execution',
      expected: 'Success',
      actual: `Failed - ${error}`,
      isSummary: true
    }, testInfo);
    throw error;
  }
});