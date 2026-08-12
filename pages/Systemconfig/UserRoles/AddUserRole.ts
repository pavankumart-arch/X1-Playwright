import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../BasePage';

export class AddUserRole extends BasePage {

  AddUserRoleButton: Locator;
  UserRole: Locator;
  AppTypeDropdown: Locator;
  ActiveCheckbox: Locator;
  SaveUserRoleButton: Locator;
  SearchBox: Locator;

  private addedUserRoleData: any = null;

  constructor(page: Page) {

    super(page);

    this.AddUserRoleButton =page.getByRole('button', { name: 'Role' });
       

    this.UserRole =
      page.getByPlaceholder('User Role');

    this.AppTypeDropdown =
      page.locator('select');

    this.ActiveCheckbox =
      page.locator('input[type="checkbox"]');

    this.SaveUserRoleButton =
      page.getByRole('button', {
        name: /Save Role/i
      });

    this.SearchBox =
      page.getByPlaceholder('Search...').first();
  }
//   async clickAddUserRole() {

//   const buttons =
//     this.page.locator('button');

//   const count =
//     await buttons.count();

//   console.log(
//     `Total buttons: ${count}`
//   );

//   for (let i = 0; i < count; i++) {

//     const text =
//       await buttons.nth(i).textContent();

//     console.log(
//       `Button ${i}: ${text}`
//     );
//   }

//   await this.page.screenshot({
//     path: 'role-list-page.png',
//     fullPage: true
//   });
// }

  async AddUserRole(
    roleName: string,
    appType: string
  ): Promise<string> {

    console.log('\n📋 Opening Add Role Page...');
console.log(
   await this.page.getByRole('link', { name: /Role/i }).count()
);
    await this.AddUserRoleButton.click();

    await this.UserRole.waitFor({ state: 'visible' });

    console.log(`📋 Entering Role Name: ${roleName}`);

    await this.UserRole.fill(roleName);

    // ==========================
    // APPTYPE SELECTION
    // ==========================

    await Promise.all([
      this.page.waitForResponse(
        response => response.status() === 200,
        { timeout: 15000 }
      ),
      this.AppTypeDropdown.selectOption({ label: appType }),
    ]);

    console.log(`✅ AppType Selected: ${appType}`);

    const activeStatus =
      (await this.ActiveCheckbox.isChecked())
        ? 'Checked'
        : 'Unchecked';

    this.addedUserRoleData = {
      roleName,
      appType,
      active: activeStatus
    };

    // ==========================
    // MODULE SELECTION
    // ==========================

    const moduleItem = this.page.getByRole('option').filter({ hasText: /^Admin - Dealer Groups$/ });
      

    await expect(moduleItem).toBeVisible({ timeout: 10000 });

    await moduleItem.scrollIntoViewIfNeeded();

    await Promise.all([
      this.page.waitForResponse(
        response => response.status() === 200,
        { timeout: 15000 }
      ),
      moduleItem.click(),
    ]);

    console.log('✅ Module Selected: Admin - Dealer Groups');

//     // ==========================
//     // RUN TYPE SELECTION
//     // Playwright coordinate-based click is missing the element.
//     // Use dispatchEvent to fire click directly on the DOM node —
//     // this bypasses coordinate calculation entirely.
//     // ==========================

//     // Wait for RunType item to appear in DOM
//     const runTypeItem = this.page
//   .locator('div.cursor-pointer')
//   .filter({
//     hasText: /^Dealer Groups - List Dealer Groups$/
//   });

// await expect(runTypeItem)
//   .toBeVisible({ timeout: 20000 });

// await runTypeItem.scrollIntoViewIfNeeded();

// await Promise.all([
//   this.page.waitForTimeout(2000),
//   runTypeItem.click({ force: true })
// ]);

// console.log(
//   '✅ Run Type Selected: Dealer Groups - List Dealer Groups'
// );

// // Wait until item appears in Selected panel
// await expect(
//   this.page.getByText(
//     'Dealer Groups - List Dealer Groups',
//     { exact: true }
//   ).last()
// ).toBeVisible({
//   timeout: 10000
// });

// // Verify "Nothing selected yet" disappears
// const nothingSelected =
//   this.page.getByText(
//     'Nothing selected yet'
//   );

// await expect(
//   nothingSelected
// ).not.toBeVisible({
//   timeout: 10000
// });

// console.log(
//   '✅ VALIDATION PASSED: RunType moved to Selected panel'
// );

//     // ==========================
//     // VALIDATION 1: RunType moved to Selected panel
//     // ==========================

  
//     const isStillEmpty = await nothingSelected
//       .isVisible({ timeout: 2000 })
//       .catch(() => false);

//     if (isStillEmpty) {
//       throw new Error(
//         '❌ VALIDATION FAILED: RunType was NOT transferred to Selected panel. ' +
//         '"Nothing selected yet" is still visible.'
//       );
//     }

//     console.log('✅ VALIDATION PASSED: RunType confirmed in Selected panel');

    // ==========================
    // SAVE ROLE
    // ==========================

    await this.SaveUserRoleButton.scrollIntoViewIfNeeded();

    await expect(this.SaveUserRoleButton).toBeVisible({ timeout: 2000 });
    

    console.log('📋 Clicking Save Role Button...');

    await this.SaveUserRoleButton.click({ force: true });

    await this.page.waitForLoadState('networkidle');

    // ==========================
    // VALIDATION 2: Save succeeded — page navigates away from /create
    // ==========================

    await this.page.waitForFunction(
      () => !window.location.href.includes('/role/create'),
      { timeout: 1000 }
    ).catch(async () => {
      const url = this.page.url();
      if (url.includes('/role/create')) {
        throw new Error(
          '❌ VALIDATION FAILED: Page still on /role/create after Save. ' +
          'Role was NOT saved. Check for form validation errors.'
        );
      }
    });

    console.log(`✅ VALIDATION PASSED: Navigated away from create page`);
    console.log(`✅ User Role Created: ${roleName}`);

    return roleName;
  }

  async searchUserRoleInSummary(
    roleName: string
  ): Promise<string | null> {

    try {

      await this.SearchBox.waitFor({
        state: 'visible',
        timeout: 5000
      });

      await this.SearchBox.fill(roleName);

      await this.page.waitForResponse(
        (response) => response.status() === 200,
        { timeout: 5000 }
      ).catch(() => {});

      await this.page.waitForTimeout(500);

      const rows = this.page.locator('table tbody tr');
      const count = await rows.count();

      if (count > 0) {
        const text =
          (
            await rows
              .first()
              .locator('td')
              .first()
              .textContent()
          )?.trim() || '';

        if (text.toLowerCase().includes(roleName.toLowerCase())) {
          return text;
        }
      }

      return null;

    } catch (error) {
      console.log(`❌ Search Error: ${error}`);
      return null;
    }
  }

  getAddedUserRoleData(): any {
    return this.addedUserRoleData;
  }
}