
import {
  Page,
  Locator,
  expect
} from '@playwright/test';


export class UserRoleValidationPage {

  readonly page: Page;

  readonly userRole: Locator;
  readonly appTypeDropdown: Locator;
  readonly saveButton: Locator;
  readonly userRoleError: Locator;
  readonly addRoleButton: Locator;


  constructor(page: Page) {

    this.page = page;


    // =========================================
    // USER ROLE FIELD
    // =========================================

    this.userRole =
      page.getByPlaceholder(
        'User Role'
      );


    // =========================================
    // ADD ROLE BUTTON
    // =========================================

    this.addRoleButton =
      page.getByRole(
        'button',
        {
          name: /^\+?\s*Role$/i
        }
      );


    // =========================================
    // APP TYPE DROPDOWN
    // =========================================

    this.appTypeDropdown =
      page.locator('select');


    // =========================================
    // SAVE BUTTON
    // =========================================

    this.saveButton =
      page.getByRole(
        'button',
        {
          name: /^(save|save role)$/i
        }
      ).first();


    // =========================================
    // USER ROLE VALIDATION ERROR
    // =========================================

    this.userRoleError =
      page
        .locator('span, div, p')
        .filter({
          hasText:
            'Role name is required.'
        })
        .first();
  }


  // =========================================================
  // CLICK ADD ROLE
  // =========================================================

  async clickAddRoleButton(): Promise<void> {

    console.log(
      '📋 Clicking Add Role button...'
    );


    await expect(
      this.addRoleButton
    ).toBeVisible({
      timeout: 10000
    });


    await this.addRoleButton.click();


    // Wait for the Add Role form
    // instead of waiting for networkidle.

    await expect(
      this.userRole
    ).toBeVisible({
      timeout: 15000
    });


    console.log(
      '✅ Add Role page opened'
    );
  }


  // =========================================================
  // CLICK SAVE BUTTON
  // =========================================================

  async clickSaveButton(): Promise<void> {

    console.log(
      '\n📋 Clicking Save button...'
    );


    const saveCount =
      await this.saveButton.count();


    console.log(
      `📋 Save button candidates: ${saveCount}`
    );


    if (saveCount === 0) {

      // Fallback locator for a button
      // containing exactly "Save".

      const saveFallback =
        this.page
          .locator('button')
          .filter({
            hasText: /^save$/i
          })
          .first();


      await expect(
        saveFallback
      ).toBeVisible({
        timeout: 10000
      });


      await expect(
        saveFallback
      ).toBeEnabled({
        timeout: 10000
      });


      await saveFallback.click();

    } else {

      await expect(
        this.saveButton
      ).toBeVisible({
        timeout: 10000
      });


      await expect(
        this.saveButton
      ).toBeEnabled({
        timeout: 10000
      });


      await this.saveButton.click();
    }


    console.log(
      '✅ Save button clicked successfully'
    );
  }


  // =========================================================
  // VALIDATE REQUIRED FIELD ERROR
  // =========================================================

  async validateRequiredFieldErrors(): Promise<boolean> {

    console.log(
      '\n============================================================'
    );

    console.log(
      '📋 USER ROLE VALIDATION'
    );

    console.log(
      '============================================================'
    );


    await expect(
      this.userRoleError
    ).toBeVisible({
      timeout: 10000
    });


    const userRoleText =
      (
        await this.userRoleError
          .textContent()
      )?.trim() || '';


    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP     : User Role Validation
STATUS   : PASS ✅
EXPECTED : Role name is required.
ACTUAL   : ${userRoleText}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);


    expect(
      userRoleText
    ).toContain(
      'Role name is required.'
    );


    console.log(
      '\n============================================================'
    );

    console.log(
      '✅ ALL VALIDATIONS PASSED!'
    );

    console.log(
      '============================================================'
    );


    return true;
  }
}
