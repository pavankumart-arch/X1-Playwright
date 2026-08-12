import { test, TestInfo } from '@playwright/test';
import { Login } from '../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../pages/Navigations/LeftSideNavigation';
import { RooftopSearch } from '../../pages/Rooftops/RooftopSearch';
import AddRooftopData from '../../testdata/AddRooftopData.json';
import { Reporter } from '../../pages/utils/NewReport';
import { RooftopNavigation } from '../../pages/Rooftops/RooftopNavigation';

test.setTimeout(120000);

test("Verify Rooftop Search Functionality", async ({ page }, testInfo: TestInfo) => {
  Reporter.startTest();

  const loginPage = new Login(page);
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
  
  // Execute all search validations
  const rooftopSearch = new RooftopSearch(page, testInfo);
  
  // POSITIVE TEST CASES - These should return results
  console.log('\n📍 Running Positive Test Cases (expecting results)...');
  await rooftopSearch.searchByID();                    // Should find at least 1 result
  await rooftopSearch.searchByName();                  // Should find at least 1 result
  await rooftopSearch.searchByDescription();           // Should find at least 1 result
  
  // NEGATIVE TEST CASES - These should return 0 results
  console.log('\n📍 Running Negative Test Cases (expecting 0 results)...');
  await rooftopSearch.searchByCreated();               // Should return 0 results (invalid date)
  await rooftopSearch.invalidSearch();                 // Should return 0 results (invalid value)
  await rooftopSearch.searchByNonExistentName();       // Should return 0 results (non-existent name)
  await rooftopSearch.searchByNonExistentID();         // Should return 0 results (non-existent ID)
  
  // STATUS TESTS - These might need adjustment based on your data
  console.log('\n📍 Running Status Tests...');
  await rooftopSearch.searchByStatus();                // Should find at least 1 result (if Active exists)
  await rooftopSearch.searchInactiveStatus();          // Should find at least 1 result (if Inactive exists)

  // Final reporting
  const summary = Reporter.endTest(testInfo);
  
  if (rooftopSearch.hasFailures()) {
    throw new Error(rooftopSearch.getFailures().join('\n'));
  }
  
  console.log('\n✅ Rooftop Search test completed successfully!');
});