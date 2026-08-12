import { test, expect, TestInfo } from '@playwright/test';

import { Login } from '../../../pages/Login/Loginpage';

import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';

import { ModuleSearch } from '../../../pages/Systemconfig/Taxonomy/ModuleSearch';

import { RunTypeSorting } from '../../../pages/Systemconfig/Taxonomy/RunTypeSorting';

import { Reporter } from '../../../pages/utils/NewReport';

test('Verify RunType Sorting Functionality', async ({ page }, testInfo: TestInfo) => {

Reporter.startTest();

// LOGIN

const loginPage = new Login(page);

await loginPage.navigateToURL();

await loginPage.loginToApplication();

// NAVIGATION

const navigation = new LeftsideNavigation(page);

await navigation.gotoSystemConfig();

await navigation.goToTaxonomy();

await page.waitForLoadState('networkidle');

// OPEN ADMIN APP TYPE

const moduleSearch = new ModuleSearch(page, testInfo);

// Search and open the Admin App Type

await moduleSearch.openAdminApp();

// Click the Modules row to open the RunType list

const moduleRow = page

.locator('table tbody tr')

.filter({

has: page.locator('td').filter({ hasText: 'Modules' })

});

await moduleRow.first().waitFor({ state: 'visible' });

await moduleRow.first().click();

console.log('✅ Module Found : Modules');

// Wait until the RunType list screen is loaded

await page.waitForLoadState('networkidle');

// Optional: verify RunType table is visible

await page.locator('table tbody tr').first().waitFor({ state: 'visible' });

console.log('✅ RunType page opened');

// SORTING CLASS

const runTypeSorting = new RunTypeSorting(page);

const columns = [

'ID',

'Title',

'RunType',

'Description',

'Created',

'Updated',

'Status'

];

const failures: string[] = [];

console.log(`
${'='.repeat(60)}`);

console.log('RUNNING RUNTYPE SORTING TESTS');

console.log(`${'='.repeat(60)}`);

// RUN SORTING VALIDATION

for (const column of columns) {

console.log(`
${'='.repeat(60)}`);

console.log(`📊 TESTING SORTING : ${column}`);

console.log(`${'='.repeat(60)}`);

try {

const result = await runTypeSorting.validateColumnSorting(

column,

testInfo

);

if (!result.passed) {

failures.push(`${column} : ${result.error}`);

}

} catch (error) {

failures.push(

`${column} : ${

error instanceof Error

? error.message

: String(error)

}`

);

}

}

// FINAL SUMMARY

console.log(`
${'='.repeat(60)}`);

console.log('FINAL SUMMARY');

console.log(`${'='.repeat(60)}`);

if (failures.length > 0) {

console.log('❌ FAILURES:');

failures.forEach(f => console.log(`- ${f}`));

} else {

console.log('✅ ALL SORTING TESTS PASSED');

}

Reporter.validateData(

'All sorting tests passed',

failures.length > 0

? `${failures.length} failure(s)`

: 'All sorting tests passed',

'SUMMARY - RunType Sorting',

testInfo

);

// Assertion

expect(

failures,

failures.join('\n')

).toHaveLength(0);

// End report

Reporter.endTest(testInfo);

});