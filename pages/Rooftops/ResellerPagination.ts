import { Page, TestInfo, test, expect } from '@playwright/test';
import { logAndValidate } from '../../utils/reportUtil';

export class UsersPagination {

  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async verifyUsersPagination(testInfo: TestInfo) {

    // =====================================================
    // DROPDOWN LOCATOR
    // =====================================================

    const dropdown = this.page.locator('select');

    // =====================================================
    // PAGE SIZE OPTIONS
    // =====================================================

    const options = ['10', '20', '50', '100'];

    let finalReport = `
==================================================
👥 USERS PAGINATION VALIDATION REPORT
==================================================

AVAILABLE PAGE SIZE OPTIONS:
${options.join(', ')}

`;

    console.log(`\n${'='.repeat(60)}`);
    console.log(`👥 SUMMARY - USERS PAGINATION`);
    console.log(`${'='.repeat(60)}`);

    // =====================================================
    // LOOP THROUGH EACH DROPDOWN OPTION
    // =====================================================

    for (const optionValue of options) {

      await test.step(`Verify pagination with Show ${optionValue}`, async () => {

        // =====================================================
        // WAIT BEFORE SELECTING
        // =====================================================

        console.log(`\n⏳ Waiting 10 seconds before selecting ${optionValue}`);

        await this.page.waitForTimeout(10000);

        // =====================================================
        // SELECT DROPDOWN VALUE
        // =====================================================

        console.log(`✅ Selecting Show: ${optionValue}`);

        await dropdown.selectOption(optionValue);

        await this.page.waitForLoadState('networkidle');

        // =====================================================
        // WAIT AFTER SELECTING
        // =====================================================

        console.log(`⏳ Waiting 10 seconds after selecting ${optionValue}`);

        await this.page.waitForTimeout(10000);

        // =====================================================
        // GET PAGINATION TEXT
        // Example:
        // Showing 1-10 of 73
        // =====================================================

        const paginationText =
          this.page.locator('text=/Showing \\d+-\\d+ of \\d+/');

        const text = await paginationText.textContent();

        console.log(`📄 Pagination Text: ${text}`);

        // =====================================================
        // TOTAL RECORDS
        // =====================================================

        const totalMatch = text?.match(/of (\d+)/);

        const totalRecords =
          totalMatch ? Number(totalMatch[1]) : 0;

        // =====================================================
        // COUNT TABLE ROWS
        // =====================================================

        const rows =
          await this.page.locator('table tbody tr').count();

        console.log(`📊 Rows Displayed: ${rows}`);

        // =====================================================
        // VALIDATE ROW COUNT
        // =====================================================

        const rowValidation =
          rows <= parseInt(optionValue);

        // =====================================================
        // PAGINATION VALIDATION
        // =====================================================

        let paginationMessage = '';

        const nextButton = this.page
          .locator('button[aria-label="Next"], li:has-text(">")')
          .first();

        const isNextVisible =
          await nextButton.isVisible().catch(() => false);

        if (!isNextVisible) {

          paginationMessage =
            'Pagination not available';

        } else {

          const isNextEnabled =
            await nextButton.isEnabled().catch(() => false);

          if (!isNextEnabled) {

            paginationMessage =
              'Only one page available (Next button disabled)';

          } else {

            // =====================================================
            // CURRENT PAGE
            // =====================================================

            const currentPage =
              await this.page.locator('.active').textContent();

            console.log(`📌 Current Page: ${currentPage}`);

            // =====================================================
            // CLICK NEXT
            // =====================================================

            console.log(`➡ Clicking Next Page`);

            await nextButton.click();

            await this.page.waitForLoadState('networkidle');

            // =====================================================
            // WAIT AFTER NEXT
            // =====================================================

            console.log(`⏳ Waiting 10 seconds after clicking next`);

            await this.page.waitForTimeout(10000);

            // =====================================================
            // NEW PAGE
            // =====================================================

            const newPage =
              await this.page.locator('.active').textContent();

            console.log(`📌 New Page: ${newPage}`);

            expect(newPage).not.toBe(currentPage);

            paginationMessage =
              'Pagination navigation working successfully';

            // =====================================================
            // CLICK PREVIOUS
            // =====================================================

            const prevButton = this.page
              .locator('button[aria-label="Previous"], li:has-text("<")')
              .first();

            const isPrevVisible =
              await prevButton.isVisible().catch(() => false);

            if (isPrevVisible) {

              console.log(`⬅ Clicking Previous Page`);

              await prevButton.click();

              await this.page.waitForLoadState('networkidle');

              console.log(`⏳ Waiting 10 seconds after clicking previous`);

              await this.page.waitForTimeout(10000);
            }
          }
        }

        // =====================================================
        // FINAL STATUS
        // =====================================================

        const status =
          rowValidation && totalRecords > 0
            ? 'PASS ✅'
            : 'FAIL ❌';

        // =====================================================
        // CONSOLE SUMMARY
        // =====================================================

        console.log(`
--------------------------------------------------
SHOW VALUE    : ${optionValue}
TOTAL RECORDS : ${totalRecords}
ROWS DISPLAYED: ${rows}
RESULT        : ${paginationMessage}
STATUS        : ${status}
--------------------------------------------------
`);

        // =====================================================
        // PLAYWRIGHT REPORT LOG
        // =====================================================

        logAndValidate(
          {
            step: `Show: ${optionValue}`,
            expected:
              `Rows should be <= ${optionValue} and pagination should work`,
            actual:
              `${paginationMessage} | Rows Displayed: ${rows}`,
          },
          testInfo
        );

        // =====================================================
        // FINAL REPORT ATTACHMENT
        // =====================================================

        finalReport += `
--------------------------------------------------
SHOW VALUE    : ${optionValue}
TOTAL RECORDS : ${totalRecords}
ROWS DISPLAYED: ${rows}
RESULT        : ${paginationMessage}
STATUS        : ${status}
`;
      });
    }

    console.log(`${'='.repeat(60)}`);

    // =====================================================
    // ATTACH REPORT
    // =====================================================

    await testInfo.attach(
      'Users Pagination Final Report',
      {
        body: Buffer.from(finalReport),
        contentType: 'text/plain',
      }
    );

    console.log(`
==================================================
✅ USERS PAGINATION VALIDATION COMPLETED
==================================================
`);
  }
}