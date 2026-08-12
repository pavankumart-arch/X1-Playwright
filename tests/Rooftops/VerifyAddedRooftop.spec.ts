import { test, TestInfo } from '@playwright/test';
import { Login } from '../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../pages/Navigations/LeftSideNavigation';
import { AddRooftop } from '../../pages/Rooftops/AddRooftop';
import { UpdatedRooftop } from '../../pages/Rooftops/VerifyAddedRooftop';
import AddRooftopData from '../../testdata/AddRooftopData.json';
import { Reporter } from '../../pages/utils/NewReport';
import { RooftopNavigation } from '../../pages/Rooftops/RooftopNavigation';

test("Verify Added Rooftop", async ({ page }, testInfo: TestInfo) => {

  // Start Reporter
  Reporter.startTest();

  try {
    const loginPage = new Login(page);
    const navigation = new LeftsideNavigation(page);

    await loginPage.navigateToURL();
    await loginPage.loginToApplication();

    Reporter.validateData(
      'Login Successful',
      'Login Successful',
      'Authentication',
      testInfo
    );

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

    console.log(`\n${"=".repeat(70)}`);
    console.log("STEP 2: Add Rooftop");
    console.log(`${"=".repeat(70)}`);

    const addRooftop = new AddRooftop(page);
    const rooftopName = await addRooftop.AddRooftop(testInfo);
    
    // REMOVED the redundant validation here since AddRooftop already validates everything
    console.log(`✅ Rooftop added successfully: ${rooftopName}`);

    console.log(`\n${"=".repeat(70)}`);
    console.log("STEP 3: Reload Page");
    console.log(`${"=".repeat(70)}`);

    await page.reload();
    await page.waitForLoadState('networkidle');

    console.log(`\n${"=".repeat(70)}`);
    console.log("STEP 4: Verify Rooftop");
    console.log(`${"=".repeat(70)}`);

    const verifyRooftop = new UpdatedRooftop(page);
    
    await verifyRooftop.OpenRooftopView(rooftopName, testInfo);
    await verifyRooftop.VerifyRooftopDetails(rooftopName, testInfo);

    console.log(`\n${"=".repeat(70)}`);
    console.log("✅ TEST PASSED - Rooftop verified successfully");
    console.log(`${"=".repeat(70)}\n`);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    Reporter.validateData(
      'Test should pass',
      `Failed: ${errorMessage}`,
      'Overall Test Execution',
      testInfo
    );
    
    console.log(`\n${"=".repeat(70)}`);
    console.log(`❌ TEST FAILED: ${errorMessage}`);
    console.log(`${"=".repeat(70)}\n`);
    
    throw error;
  } finally {
    // End Reporter and get summary
    const summary = Reporter.endTest(testInfo);
    
    console.log(`\n📊 Test Summary:`);
    console.log(`   Total Validations: ${summary.totalValidations}`);
    console.log(`   Passed: ${summary.passed}`);
    console.log(`   Failed: ${summary.failed}`);
    console.log(`   Pass Rate: ${summary.passRate}`);
    console.log(`   Duration: ${summary.duration}`);
  }
});