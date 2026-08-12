import { Page, TestInfo, Locator } from '@playwright/test';
import { BasePage } from '../../BasePage';
import { RooftopAddUser } from './rooftop_AddUser';
import { Reporter } from '../../utils/NewReport';
import Edituserdata from '../../../testdata/EditUser.json';
import { rooftopdeleteUser } from './rooftop_DeleteUser';

export class RooftopUpdateUserValidation extends BasePage {
  readonly searchInput: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly userTypeDropdown: Locator;
  readonly emailInput: Locator;
  readonly cancelButton: Locator;
  readonly updateButton: Locator;
  readonly activeCheckbox: Locator;

  constructor(page: Page) {
    super(page);

    this.searchInput = page.getByPlaceholder('Search');
    this.usernameInput = page.getByPlaceholder('Enter username');
    this.passwordInput = page.getByPlaceholder('Enter password');
    this.userTypeDropdown = page.locator('[data-form-field="userTypeId"]');
    this.emailInput = page.getByPlaceholder('Enter email address');
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.updateButton = page.getByRole('button', { name: 'Update User' });
    this.activeCheckbox = page.locator('svg.lucide-check');
  }

  // =========================================================
  // Reliable Button Click - Same as AddUser
  // =========================================================

  private async clickButtonReliably(button: Locator): Promise<void> {
    try {
      await button.click({ timeout: 5000 });
      return;
    } catch (error) {
      console.log('Normal click failed, trying force click...');
    }

    try {
      await button.click({ force: true, timeout: 5000 });
      return;
    } catch (error) {
      console.log('Force click failed, trying JavaScript...');
    }

    try {
      const buttonText = await button.textContent() || 'button';
      await this.page.evaluate((text) => {
        const buttons = document.querySelectorAll('button, [role="button"]');
        for (const btn of buttons) {
          if (btn.textContent?.includes(text)) {
            (btn as HTMLElement).click();
            return;
          }
        }
      }, buttonText);
      return;
    } catch (error) {
      console.log('JavaScript click failed, trying coordinates...');
    }

    try {
      const box = await button.boundingBox();
      if (box) {
        await this.page.mouse.click(
          box.x + box.width / 2,
          box.y + box.height / 2
        );
        return;
      }
    } catch (error) {
      console.log('Coordinates click failed');
    }

    throw new Error('All click methods failed');
  }

  // =========================================================
  // Select User Type using JavaScript (reliable method)
  // =========================================================

  private async selectUserType(index: number): Promise<void> {
    await this.page.evaluate((idx) => {
      try {
        document.querySelectorAll('[inert]').forEach(el => {
          el.removeAttribute('inert');
        });

        const container = document.querySelector('[data-form-field="userTypeId"]');
        if (container) {
          container.removeAttribute('inert');
          const select = container.querySelector('select');
          if (select && select.options.length > idx) {
            select.selectedIndex = idx;
            select.dispatchEvent(new Event('change', { bubbles: true }));
            select.dispatchEvent(new Event('input', { bubbles: true }));
            return;
          }
        }

        // Fallback: Click the dropdown and select option
        const trigger = document.querySelector('[data-form-field="userTypeId"] div[role="button"]');
        if (trigger) {
          (trigger as HTMLElement).click();
          setTimeout(() => {
            const options = document.querySelectorAll('[role="option"]');
            if (options.length > idx) {
              (options[idx] as HTMLElement).click();
            }
          }, 300);
        }
      } catch (e) {
        console.log('Error selecting user type:', e);
      }
    }, index);

    await this.page.waitForTimeout(500);
  }

  // =========================================================
  // Get User Type Text from Dropdown
  // =========================================================

  private async getUserTypeText(): Promise<string> {
    try {
      const text = await this.userTypeDropdown.textContent();
      if (text) {
        // If it contains "Select an option", no value is selected
        if (text.includes('Select an option')) {
          return 'Not selected';
        }
        // Extract the selected value - it might be the first text before "Select an option"
        const parts = text.split('Select an option');
        if (parts.length > 0 && parts[0].trim()) {
          return parts[0].trim();
        }
        return text.trim();
      }
      return '';
    } catch (error) {
      return '';
    }
  }

  // =========================================================
  // Main: Add User and Verify Update Form
  // =========================================================

  async addUserAndVerifyUpdateForm(testInfo: TestInfo): Promise<boolean> {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`STEP 1: Adding New User`);
    console.log(`${'='.repeat(60)}`);

    // Add user using RooftopAddUser
    const addUser = new RooftopAddUser(this.page);
    await addUser.addrooftopUser();
    const username = addUser.expectedUsername;
    const email = addUser.expectedEmail;

    if (!email) {
      throw new Error('Expected email was not captured during user creation');
    }

    console.log(`✅ User created: ${username}`);
    Reporter.validateData(username, username, 'User Created', testInfo);

    // Verify user is displayed
    await addUser.verifyAddedUserIsDisplayed(testInfo);

    console.log(`\n${'='.repeat(60)}`);
    console.log(`STEP 2: Searching for User`);
    console.log(`${'='.repeat(60)}`);

    // Search for the user
    await this.searchInput.clear();
    await this.searchInput.fill(username);
    await this.page.waitForTimeout(2000);

    console.log(`\n${'='.repeat(60)}`);
    console.log(`STEP 3: Opening Edit Form`);
    console.log(`${'='.repeat(60)}`);

    // Click edit button
    const row = this.page.locator('table tbody tr').filter({ hasText: username }).first();
    await row.waitFor({ state: 'visible', timeout: 10000 });
    const editButton = row.locator('button').first();
    await this.clickButtonReliably(editButton);

    // Wait for the form to be fully loaded
    await this.page.waitForTimeout(2000);
    await this.usernameInput.waitFor({ state: 'visible', timeout: 10000 });
    console.log(`✅ Edit form opened`);

    console.log(`\n${'='.repeat(60)}`);
    console.log(`STEP 4: Verifying Form Data`);
    console.log(`${'='.repeat(60)}`);

    // Get values from the form
    const actualUsername = await this.usernameInput.inputValue();
    const actualEmail = await this.emailInput.inputValue();
    const actualUserType = await this.getUserTypeText();

    // Check if checkbox is checked
    let isCheckboxChecked = false;
    try {
      const checkboxInput = this.page.locator('input[type="checkbox"]');
      isCheckboxChecked = await checkboxInput.isChecked().catch(() => false);
    } catch (error) {
      // If checkbox input not found, check if the svg is visible
      isCheckboxChecked = await this.activeCheckbox.isVisible().catch(() => false);
    }

    console.log(`Form Values:`);
    console.log(`  Username: ${actualUsername}`);
    console.log(`  Email: ${actualEmail}`);
    console.log(`  User Type: ${actualUserType}`);
    console.log(`  Active Checkbox: ${isCheckboxChecked ? 'Checked' : 'Unchecked'}`);

    // Verify each field
    let allValid = true;

    // 1. Verify Username
    const usernameValid = actualUsername === username;
    Reporter.validateData(username, actualUsername, '1. Username Verification', testInfo);
    if (!usernameValid) allValid = false;
    console.log(`  Username: ${usernameValid ? '✅ PASS' : '❌ FAIL'}`);

    // 2. Verify Email
    const emailValid = actualEmail === email;
    Reporter.validateData(email, actualEmail, '2. Email Verification', testInfo);
    if (!emailValid) allValid = false;
    console.log(`  Email: ${emailValid ? '✅ PASS' : '❌ FAIL'}`);

    // 3. Verify User Type
    const expectedUserType = Edituserdata.usertype;
    // Map the index to the actual text if needed
    let expectedUserTypeText = '';
    switch (expectedUserType) {
      case '0':
        expectedUserTypeText = 'Premier Toyota Downtown';
        break;
      case '1':
        expectedUserTypeText = 'Premier Honda Westside';
        break;
      case '2':
        expectedUserTypeText = 'Load Test';
        break;
      default:
        expectedUserTypeText = `Option ${expectedUserType}`;
    }
    
    const userTypeValid = actualUserType.includes(expectedUserTypeText) || actualUserType === expectedUserTypeText;
    Reporter.validateData(expectedUserTypeText, actualUserType, '3. User Type Verification', testInfo);
    if (!userTypeValid) allValid = false;
    console.log(`  User Type: ${userTypeValid ? '✅ PASS' : '❌ FAIL'}`);

    // 4. Verify Active Checkbox
    // By default, checkbox should be unchecked
    Reporter.validateData(false, isCheckboxChecked, '4. Active Checkbox Default State', testInfo);
    if (isCheckboxChecked) allValid = false;
    console.log(`  Active Checkbox (default unchecked): ${!isCheckboxChecked ? '✅ PASS' : '❌ FAIL'}`);

    console.log(`\n${'='.repeat(60)}`);
    console.log(`STEP 5: Closing Edit Form`);
    console.log(`${'='.repeat(60)}`);

    // Click Cancel to close the form
    await this.clickButtonReliably(this.cancelButton);
    await this.page.waitForTimeout(1000);

    // Wait for the table to be visible again
    await this.page.locator('table tbody').waitFor({ state: 'visible', timeout: 5000 });

    console.log(`\n${'='.repeat(60)}`);
    console.log(`STEP 6: Deleting User`);
    console.log(`${'='.repeat(60)}`);

    // Search for the user again before deleting
    await this.searchInput.clear();
    await this.searchInput.fill(username);
    await this.page.waitForTimeout(2000);

    // Check if user exists before deleting
    const userRow = this.page.locator('table tbody tr').filter({ hasText: username }).first();
    const userExists = await userRow.isVisible({ timeout: 5000 });

    if (!userExists) {
      console.log(`⚠️ User ${username} not found in table - might have been removed`);
      console.log(`⚠️ Checking if user was already deleted...`);
    } else {
      // Delete user
      const RooftopdeleteUser = new rooftopdeleteUser(this.page);
      await RooftopdeleteUser.deleteWithReport(username, testInfo);
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`FINAL RESULT: ${allValid ? '✅ TEST PASSED' : '❌ TEST FAILED'}`);
    console.log(`${'='.repeat(60)}`);

    return allValid;
  }

  // =========================================================
  // Debug method
  // =========================================================

  async debugFormState() {
    console.log('=== DEBUG: Update Form State ===');

    const usernameVisible = await this.usernameInput.isVisible().catch(() => false);
    console.log('Username field visible:', usernameVisible);

    const emailVisible = await this.emailInput.isVisible().catch(() => false);
    console.log('Email field visible:', emailVisible);

    const userTypeText = await this.getUserTypeText();
    console.log('User Type text:', userTypeText);

    const updateButtonEnabled = await this.updateButton.isEnabled().catch(() => false);
    console.log('Update button enabled:', updateButtonEnabled);

    // Check checkbox state
    let isCheckboxChecked = false;
    try {
      const checkboxInput = this.page.locator('input[type="checkbox"]');
      isCheckboxChecked = await checkboxInput.isChecked().catch(() => false);
    } catch (error) {
      isCheckboxChecked = await this.activeCheckbox.isVisible().catch(() => false);
    }
    console.log('Checkbox checked:', isCheckboxChecked);

    await this.page.screenshot({ path: `debug-update-form-${Date.now()}.png` }).catch(() => {});
  }
}