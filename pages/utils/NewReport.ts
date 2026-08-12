import { TestInfo, expect } from '@playwright/test';

export type ValidationResult = {
  type: 'COLUMN' | 'DATA' | 'EDIT' | 'DELETE' | 'PAGINATION' | 'SEARCH' | 'SORT' | 'FILTER';
  status: 'PASS' | 'FAIL';
  expected: any;
  actual: any;
  message: string;
  timestamp: string;
};

export type TestSummary = {
  totalValidations: number;
  passed: number;
  failed: number;
  passRate: string;
  startTime: string;
  endTime: string;
  duration: string;
};

export class Reporter {
  private static validations: ValidationResult[] = [];
  private static testStartTime: Date;
  private static testEndTime: Date;

  static startTest() {
    this.testStartTime = new Date();
    this.validations = [];
    console.log(`
${'='.repeat(80)}
TEST EXECUTION STARTED
${'='.repeat(80)}
Start Time: ${this.testStartTime.toLocaleString()}
${'='.repeat(80)}
`);
  }

  static endTest(testInfo: TestInfo) {
    this.testEndTime = new Date();
    const duration = ((this.testEndTime.getTime() - this.testStartTime.getTime()) / 1000).toFixed(2);
    
    const summary = this.getSummary();
    summary.startTime = this.testStartTime.toISOString();
    summary.endTime = this.testEndTime.toISOString();
    summary.duration = `${duration} seconds`;
    
    const summaryReport = this.generateSummaryReport(summary);
    
    console.log(summaryReport);
    
    testInfo.annotations.push({
      type: 'Test Summary',
      description: summaryReport
    });
    
    return summary;
  }

  static validateColumns(expected: string[], actual: string[], testInfo: TestInfo, sectionName: string = 'Columns') {
    const results = expected.map((expectedCol, index) => {
      const found = actual.find(actualCol => actualCol === expectedCol);
      const status = found ? 'PASS' : 'FAIL';
      
      this.addValidation({
        type: 'COLUMN',
        status: status as 'PASS' | 'FAIL',
        expected: expectedCol,
        actual: found || 'NOT FOUND',
        message: `Column validation for "${expectedCol}"`,
        timestamp: new Date().toISOString()
      });
      
      return {
        index: index + 1,
        expected: expectedCol,
        actual: found || 'NOT FOUND',
        status
      };
    });
    
    const extraColumns = actual.filter(col => !expected.includes(col));
    const passCount = results.filter(r => r.status === 'PASS').length;
    const failCount = results.filter(r => r.status === 'FAIL').length;
    
    // Print each column in card format to console
    console.log(`\n${'='.repeat(80)}`);
    console.log(`COLUMN VALIDATION REPORT`);
    console.log(`${'='.repeat(80)}\n`);
    
    // Build annotation content
    let annotationContent = `COLUMN VALIDATION REPORT\n\n`;
    
    results.forEach(result => {
      const cardContent = this.getColumnCard(result);
      console.log(cardContent);
      annotationContent += cardContent + '\n';
    });
    
    if (extraColumns.length > 0) {
      const extraContent = `\n${'─'.repeat(80)}\n⚠️ EXTRA COLUMNS FOUND (Not in Expected):\n${'─'.repeat(80)}\n`;
      console.log(extraContent);
      extraColumns.forEach((col, idx) => {
        console.log(`  ${idx + 1}. ${col}`);
        annotationContent += `  ${idx + 1}. ${col}\n`;
      });
    }
    
    const summaryContent = `
${'─'.repeat(80)}
SUMMARY:
${'─'.repeat(80)}
✅ Expected Columns: ${expected.length}
📊 Actual Columns:   ${actual.length}
✅ Matched:          ${passCount}
❌ Missing:          ${failCount}
${'='.repeat(80)}`;
    
    console.log(summaryContent);
    annotationContent += summaryContent;
    
    // Push to annotations
    testInfo.annotations.push({
      type: 'Column Validation Report',
      description: annotationContent
    });
    
    // Also push each column as individual annotation
    results.forEach(result => {
      testInfo.annotations.push({
        type: `Column ${result.index}: ${result.expected}`,
        description: `STATUS: ${result.status} ${result.status === 'PASS' ? '✅' : '❌'}\nEXPECTED: ${result.expected}\nACTUAL: ${result.actual}`
      });
    });
    
    // Soft assertions for each column
    results.forEach(result => {
      expect.soft(result.status === 'PASS', `Column "${result.expected}" validation failed`).toBeTruthy();
    });
    
    return { results, extraColumns, summary: { total: expected.length, passed: passCount, failed: failCount } };
  }

  private static getColumnCard(result: any): string {
    const statusIcon = result.status === 'PASS' ? '✅' : '❌';
    const statusText = result.status === 'PASS' ? 'PASS' : 'FAIL';
    
    return `
${'─'.repeat(80)}
STEP    : COLUMN ${result.index} - ${result.expected}
STATUS  : ${statusText} ${statusIcon}
EXPECTED: ${result.expected}
ACTUAL  : ${result.actual}
${'─'.repeat(80)}`;
  }

 static validateData(expected: any, actual: any, fieldName: string, testInfo: TestInfo) {
    const status = expected === actual ? 'PASS' : 'FAIL';
    
    this.addValidation({
      type: 'DATA',
      status,
      expected,
      actual,
      message: `Data validation for "${fieldName}"`,
      timestamp: new Date().toISOString()
    });
    
    const cardContent = this.getValidationCard(fieldName, expected, actual, status, 'DATA VALIDATION');
    console.log(cardContent);
    
    testInfo.annotations.push({
      type: `Data Validation: ${fieldName}`,
      description: cardContent
    });
    
    expect.soft(actual, `Data mismatch for ${fieldName}`).toBe(expected);
    
    return { fieldName, expected, actual, status };
  }

  static validateEdit(originalValue: any, newValue: any, updatedValue: any, fieldName: string, testInfo: TestInfo) {
    const updateStatus = updatedValue === newValue ? 'PASS' : 'FAIL';
    
    this.addValidation({
      type: 'EDIT',
      status: updateStatus,
      expected: newValue,
      actual: updatedValue,
      message: `Edit validation for "${fieldName}"`,
      timestamp: new Date().toISOString()
    });
    
    const cardContent = `
${'='.repeat(80)}
EDIT VALIDATION: ${fieldName}
${'='.repeat(80)}
STEP    : EDIT ${fieldName}
STATUS  : ${updateStatus} ${updateStatus === 'PASS' ? '✅' : '❌'}
ORIGINAL: ${originalValue}
EXPECTED: ${newValue}
ACTUAL  : ${updatedValue}
${'='.repeat(80)}`;
    
    console.log(cardContent);
    
    testInfo.annotations.push({
      type: `Edit Validation: ${fieldName}`,
      description: cardContent
    });
    
    expect.soft(updatedValue, `Failed to update ${fieldName}`).toBe(newValue);
    
    return { fieldName, originalValue, newValue, updatedValue, status: updateStatus };
  }

  static validateDelete(itemId: string, isDeleted: boolean, testInfo: TestInfo) {
    const status = isDeleted ? 'PASS' : 'FAIL';
    
    this.addValidation({
      type: 'DELETE',
      status,
      expected: true,
      actual: isDeleted,
      message: `Delete validation for item "${itemId}"`,
      timestamp: new Date().toISOString()
    });
    
    const cardContent = this.getValidationCard(itemId, 'Deleted', isDeleted, status, 'DELETE VALIDATION');
    console.log(cardContent);
    
    testInfo.annotations.push({
      type: `Delete Validation: ${itemId}`,
      description: cardContent
    });
    
    expect.soft(isDeleted, `Failed to delete item ${itemId}`).toBeTruthy();
    
    return { itemId, isDeleted, status };
  }

  static validatePagination(currentPage: number, totalPages: number, itemsPerPage: number, totalItems: number, testInfo: TestInfo) {
    const isValid = currentPage <= totalPages && currentPage >= 1;
    const status = isValid ? 'PASS' : 'FAIL';
    
    this.addValidation({
      type: 'PAGINATION',
      status,
      expected: { currentPage, totalPages, itemsPerPage, totalItems },
      actual: { currentPage, totalPages, itemsPerPage, totalItems },
      message: `Pagination validation - Page ${currentPage} of ${totalPages}`,
      timestamp: new Date().toISOString()
    });
    
    const cardContent = `
${'='.repeat(80)}
PAGINATION VALIDATION
${'='.repeat(80)}
STEP    : PAGINATION VERIFICATION
STATUS  : ${status} ${status === 'PASS' ? '✅' : '❌'}
EXPECTED: Page ${currentPage} of ${totalPages}
ACTUAL  : ${itemsPerPage} items per page, ${totalItems} total items
${'='.repeat(80)}`;
    
    console.log(cardContent);
    
    testInfo.annotations.push({
      type: 'Pagination Validation',
      description: cardContent
    });
    
    expect.soft(isValid, `Invalid pagination state`).toBeTruthy();
    
    return { currentPage, totalPages, itemsPerPage, totalItems, status };
  }

  static validatePageNavigation(fromPage: number, toPage: number, success: boolean, testInfo: TestInfo) {
    const status = success ? 'PASS' : 'FAIL';
    
    this.addValidation({
      type: 'PAGINATION',
      status,
      expected: toPage,
      actual: fromPage,
      message: `Page navigation from ${fromPage} to ${toPage}`,
      timestamp: new Date().toISOString()
    });
    
    const cardContent = `
${'='.repeat(80)}
PAGE NAVIGATION
${'='.repeat(80)}
STEP    : NAVIGATE FROM PAGE ${fromPage} TO ${toPage}
STATUS  : ${status} ${status === 'PASS' ? '✅' : '❌'}
EXPECTED: Successful navigation
ACTUAL  : ${success ? 'Navigation successful' : 'Navigation failed'}
${'='.repeat(80)}`;
    
    console.log(cardContent);
    
    testInfo.annotations.push({
      type: 'Page Navigation',
      description: cardContent
    });
    
    return { fromPage, toPage, success, status };
  }

  static validateSearch(searchTerm: string, resultsCount: number, expectedMinResults: number, testInfo: TestInfo) {
    const status = resultsCount >= expectedMinResults ? 'PASS' : 'FAIL';
    
    this.addValidation({
      type: 'SEARCH',
      status,
      expected: `At least ${expectedMinResults} results`,
      actual: `${resultsCount} results`,
      message: `Search validation for "${searchTerm}"`,
      timestamp: new Date().toISOString()
    });
    
    const cardContent = `
${'='.repeat(80)}
SEARCH VALIDATION
${'='.repeat(80)}
STEP    : SEARCH "${searchTerm}"
STATUS  : ${status} ${status === 'PASS' ? '✅' : '❌'}
EXPECTED: At least ${expectedMinResults} result(s)
ACTUAL  : ${resultsCount} result(s) found
${'='.repeat(80)}`;
    
    console.log(cardContent);
    
    testInfo.annotations.push({
      type: `Search Validation: ${searchTerm}`,
      description: cardContent
    });
    
    return { searchTerm, resultsCount, expectedMinResults, status };
  }

  static validateSort(columnName: string, sortOrder: 'asc' | 'desc', isSortedCorrectly: boolean, testInfo: TestInfo) {
    const status = isSortedCorrectly ? 'PASS' : 'FAIL';
    
    this.addValidation({
      type: 'SORT',
      status,
      expected: `${sortOrder.toUpperCase()} order`,
      actual: isSortedCorrectly ? 'Correct' : 'Incorrect',
      message: `Sort validation for "${columnName}"`,
      timestamp: new Date().toISOString()
    });
    
    const cardContent = `
${'='.repeat(80)}
SORT VALIDATION
${'='.repeat(80)}
STEP    : ${sortOrder.toUpperCase()} ORDER (${columnName})
STATUS  : ${status} ${status === 'PASS' ? '✅' : '❌'}
EXPECTED: ${sortOrder.toUpperCase()} order
ACTUAL  : ${isSortedCorrectly ? 'Correct' : 'Incorrect'}
${'='.repeat(80)}`;
    
    console.log(cardContent);
    
    testInfo.annotations.push({
      type: `Sort Validation: ${columnName}`,
      description: cardContent
    });
    
    return { columnName, sortOrder, isSortedCorrectly, status };
  }

  static validateFilter(filterName: string, appliedValue: string, resultsCount: number, expectedCount: number, testInfo: TestInfo) {
    const status = resultsCount === expectedCount ? 'PASS' : 'FAIL';
    
    this.addValidation({
      type: 'FILTER',
      status,
      expected: expectedCount,
      actual: resultsCount,
      message: `Filter validation for "${filterName}=${appliedValue}"`,
      timestamp: new Date().toISOString()
    });
    
    const cardContent = `
${'='.repeat(80)}
FILTER VALIDATION
${'='.repeat(80)}
STEP    : FILTER BY ${filterName} = ${appliedValue}
STATUS  : ${status} ${status === 'PASS' ? '✅' : '❌'}
EXPECTED: ${expectedCount} result(s)
ACTUAL  : ${resultsCount} result(s)
${'='.repeat(80)}`;
    
    console.log(cardContent);
    
    testInfo.annotations.push({
      type: `Filter Validation: ${filterName}`,
      description: cardContent
    });
    
    return { filterName, appliedValue, resultsCount, expectedCount, status };
  }

  private static getValidationCard(title: string, expected: any, actual: any, status: string, type: string): string {
    const statusIcon = status === 'PASS' ? '✅' : '❌';
    
    return `
${'='.repeat(80)}
${type}: ${title}
${'='.repeat(80)}
STEP    : ${title}
STATUS  : ${status} ${statusIcon}
EXPECTED: ${expected}
ACTUAL  : ${actual}
${'='.repeat(80)}`;
  }

  private static addValidation(validation: ValidationResult) {
    this.validations.push(validation);
  }
  
  private static getSummary(): TestSummary {
    const totalValidations = this.validations.length;
    const passed = this.validations.filter(v => v.status === 'PASS').length;
    const failed = this.validations.filter(v => v.status === 'FAIL').length;
    const passRate = totalValidations === 0 ? '0.00%' : ((passed / totalValidations) * 100).toFixed(2);
    
    return {
      totalValidations,
      passed,
      failed,
      passRate: `${passRate}%`,
      startTime: '',
      endTime: '',
      duration: ''
    };
  }
  
  private static generateSummaryReport(summary: TestSummary): string {
    const passIcon = summary.failed === 0 ? '✅' : '⚠️';
    
    return `
${'='.repeat(80)}
TEST EXECUTION SUMMARY
${'='.repeat(80)}
${passIcon} Total Validations: ${summary.totalValidations}
✅ Passed:           ${summary.passed}
❌ Failed:           ${summary.failed}
📊 Pass Rate:        ${summary.passRate}

⏱️  Start Time:       ${summary.startTime}
⏱️  End Time:         ${summary.endTime}
⏱️  Duration:         ${summary.duration}
${'='.repeat(80)}`;
  }
  // Add this NEW method to your existing NewReport.ts (don't modify existing methods)

static validateSortDetails(
  columnName: string, 
  sortOrder: 'asc' | 'desc', 
  isSortedCorrectly: boolean, 
  details: { totalRecords: number; failedPosition?: number; sampleData?: any[] },
  testInfo: TestInfo
) {
  const status = isSortedCorrectly ? 'PASS' : 'FAIL';
  
  // Create detailed expected and actual for better reporting
  let expectedDetail = `${sortOrder.toUpperCase()} order for ${columnName}`;
  let actualDetail = isSortedCorrectly ? 'Correctly sorted' : 'Not sorted correctly';
  
  if (!isSortedCorrectly && details.failedPosition) {
    expectedDetail = `All ${details.totalRecords} records in ${sortOrder.toUpperCase()} order`;
    actualDetail = `Failed at position ${details.failedPosition} (${details.totalRecords} total records)`;
  }
  
  this.addValidation({
    type: 'SORT',
    status,
    expected: expectedDetail,
    actual: actualDetail,
    message: `Sort validation for "${columnName}" - ${sortOrder.toUpperCase()}`,
    timestamp: new Date().toISOString()
  });
  
  const cardContent = `
${'='.repeat(80)}
SORT VALIDATION: ${columnName}
${'='.repeat(80)}
STEP    : ${sortOrder.toUpperCase()} ORDER VERIFICATION
STATUS  : ${status} ${status === 'PASS' ? '✅' : '❌'}
EXPECTED: ${expectedDetail}
ACTUAL  : ${actualDetail}
RECORDS : ${details.totalRecords} records validated
${isSortedCorrectly ? '✅ All records are in correct order' : `❌ Failed at position ${details.failedPosition}`}
${'='.repeat(80)}`;
  
  console.log(cardContent);
  
  testInfo.annotations.push({
    type: `Sort Validation: ${columnName} (${sortOrder.toUpperCase()})`,
    description: cardContent
  });
  
  // Use expect.soft instead of hard assertion to not break existing flow
  expect.soft(isSortedCorrectly, `Sort validation failed for ${columnName} in ${sortOrder.toUpperCase()} order`).toBeTruthy();
  
  return { columnName, sortOrder, isSortedCorrectly, status };
}
}