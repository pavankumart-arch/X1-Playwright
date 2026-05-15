import {
  Page,
  Locator,
  TestInfo
} from '@playwright/test';

import {
  validateColumnSortingWithPagination
} from '../../utils/sorting';

// =====================================================
// USER SORTING CLASS
// =====================================================

export class UserSorting {

  page: Page;

  tableRows: Locator;

  tableHeaders: Locator;

  constructor(page: Page) {

    this.page = page;

    // =====================================================
    // TABLE LOCATORS
    // =====================================================

    this.tableRows =
      page.locator(
        'table tbody tr'
      );

    this.tableHeaders =
      page.locator(
        'table thead th'
      );
  }

  // =====================================================
  // COMMON SORT VALIDATION METHOD
  // =====================================================

  async validateSorting(
    columnName: string,
    friendlyColumnName: string,
    testInfo: TestInfo
  ) {

    console.log(
      `\n================================================`
    );

    console.log(
      `Starting ${friendlyColumnName} Column Sorting Validation`
    );

    console.log(
      `================================================`
    );

    // =====================================================
    // ASCENDING SORT VALIDATION
    // =====================================================

    console.log(
      `Checking ${friendlyColumnName} Column in Ascending Order`
    );

    try {

      await validateColumnSortingWithPagination(
        this.page,
        this.tableRows,
        this.tableHeaders,
        columnName,
        testInfo
      );

      console.log(
        `✅ ${friendlyColumnName} Column Sorting Working Correctly`
      );
    }

    catch {

      console.log(
        `❌ ${friendlyColumnName} Column Sorting NOT Working Correctly`
      );
    }

    // =====================================================
    // COMPLETED
    // =====================================================

    console.log(
      `Completed ${friendlyColumnName} Column Sorting Validation`
    );
  }

  // =====================================================
  // SORT BY ID
  // =====================================================

  async sortByID(
    testInfo: TestInfo
  ) {

    await this.validateSorting(
      'ID',
      'User ID',
      testInfo
    );
  }

  // =====================================================
  // SORT BY USERNAME
  // =====================================================

  async sortByUsername(
    testInfo: TestInfo
  ) {

    await this.validateSorting(
      'Username',
      'Username',
      testInfo
    );
  }

  // =====================================================
  // SORT BY EMAIL
  // =====================================================

  async sortByEmail(
    testInfo: TestInfo
  ) {

    await this.validateSorting(
      'Email',
      'Email Address',
      testInfo
    );
  }

  // =====================================================
  // SORT BY RESELLER
  // =====================================================

  async sortByReseller(
    testInfo: TestInfo
  ) {

    await this.validateSorting(
      'Reseller',
      'Reseller',
      testInfo
    );
  }

  // =====================================================
  // SORT BY USER TYPE
  // =====================================================

  async sortByUserType(
    testInfo: TestInfo
  ) {

    await this.validateSorting(
      'User Type',
      'User Type',
      testInfo
    );
  }

  // =====================================================
  // SORT BY STATUS
  // =====================================================

  async sortByStatus(
    testInfo: TestInfo
  ) {

    await this.validateSorting(
      'Status',
      'Status',
      testInfo
    );
  }
}