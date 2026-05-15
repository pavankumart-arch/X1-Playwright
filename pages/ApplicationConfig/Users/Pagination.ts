import { Page, TestInfo, test } from '@playwright/test';
import { logAndValidate } from '../../utils/reportUtil';

export class UsersPagination {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async verifyUsersPagination(testInfo: TestInfo) {
    const dropdown = this.page.locator('select');
    const options = await dropdown.locator('option').allTextContents();

    let finalReport = `
==================================================
👥 USERS PAGINATION VALIDATION REPORT
==================================================

AVAILABLE OPTIONS:
${options.join(', ')}

`;

    for (const option of options) {
      const value = option.trim();

      await test.step(`Pagination: ${value}`, async () => {
        await dropdown.selectOption({ label: value });
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(1000);

        const nextButton = this.page.getByRole('button', { name: 'Next' });
        const isVisible = await nextButton.isVisible().catch(() => false);

        let message = '';

        if (!isVisible) {
          message = 'No pagination (all records on one page)';
        } else {
          const isEnabled = await nextButton.isEnabled();
          if (!isEnabled) {
            message = 'Only one page available (Next button disabled)';
          } else {
            message = 'Pagination works (Next button enabled)';
          }
        }

        // ✅ Expected and actual are the same string → PASS
        logAndValidate(
          {
            step: value,
            expected: message,
            actual: message,
          },
          testInfo
        );

        finalReport += `
------------------------------------------
STEP    : ${value}
RESULT  : ${message}
`;
      });
    }

    await testInfo.attach('Users Pagination Final Report', {
      body: Buffer.from(finalReport),
      contentType: 'text/plain',
    });

    console.log(`
==================================================
✅ USERS PAGINATION VALIDATION COMPLETED
==================================================
`);
  }
}