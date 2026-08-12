import { Page, TestInfo } from '@playwright/test';
import { AddUser } from './AddUser';
import { DeleteUser } from './DeleteUser';
import { Reporter } from '../../utils/NewReport';
import Edituser from '../../../testdata/AddUser.json';

export class VerifyAddedUser {
  readonly page: Page;
  readonly searchInput: any;
  readonly usernameInput: any;
  readonly passwordInput: any;
  readonly userTypeSelect: any;
  readonly resellerSelect: any;
  readonly emailInput: any;
  readonly cancelButton: any;
  readonly updateButton: any;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByPlaceholder('Search');
    this.usernameInput = page.locator('#admin-user-edit-userName, input[placeholder="User Name"]').first();
    this.passwordInput = page.locator('#admin-user-edit-password, input[type="password"]').first();
    this.userTypeSelect = page.locator('#admin-user-edit-userTypeId, select#userTypeId, .user-type-dropdown').first();
    this.resellerSelect = page.locator('#admin-user-edit-resellerId, select#resellerId, .reseller-dropdown').first();
    this.emailInput = page.locator('#admin-user-edit-email, input[placeholder="Email"]').first();
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.updateButton = page.getByRole('button', { name: 'Update User' });
  }

  async addUserAndVerify(testInfo: TestInfo) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`STEP 1: Adding New User`);
    console.log(`${'='.repeat(60)}`);

    // Add user with data from JSON
    const addUser = new AddUser(this.page);
    await addUser.addUser();
    const username = addUser.expectedUsername;
    const email = addUser.expectedEmail;

    if (!email) {
      throw new Error('Expected email was not captured during user creation');
    }

    console.log(`✅ User created: ${username}`);
    Reporter.validateData(username, username, 'User Created', testInfo);

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
    await editButton.click();
    
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
    
    // Get user type - this might be a dropdown value
    let actualUserType = '';
    let actualReseller = '';
    
    try {
      // Try to get the selected user type from dropdown
      const userTypeElement = this.page.locator('#admin-user-edit-userTypeId span, select#userTypeId option:checked');
      if (await userTypeElement.isVisible({ timeout: 3000 })) {
        actualUserType = (await userTypeElement.textContent())?.trim() || '';
      }
      
      // If not found, try alternative selector
      if (!actualUserType) {
        const altUserType = this.page.locator('label:has-text("User Type") + div, .form-group:has-text("User Type") .selected-value');
        if (await altUserType.isVisible({ timeout: 2000 })) {
          actualUserType = (await altUserType.textContent())?.trim() || '';
        }
      }
      
      // If still not found, try to get from the select element
      if (!actualUserType) {
        const selectUserType = this.page.locator('select#userTypeId');
        if (await selectUserType.isVisible({ timeout: 2000 })) {
          actualUserType = await selectUserType.inputValue() || '';
          // If it's a number (2), convert to the display name
          if (actualUserType === '2') {
            actualUserType = 'Reseller_Admin';
          }
        }
      }
    } catch (error) {
      console.log('⚠️ Could not get user type from form');
    }

    try {
      // Get the selected reseller from dropdown
      const resellerElement = this.page.locator('#admin-user-edit-resellerId span, select#resellerId option:checked');
      if (await resellerElement.isVisible({ timeout: 3000 })) {
        actualReseller = (await resellerElement.textContent())?.trim() || '';
      }
      
      if (!actualReseller) {
        const altReseller = this.page.locator('label:has-text("Reseller") + div, .form-group:has-text("Reseller") .selected-value');
        if (await altReseller.isVisible({ timeout: 2000 })) {
          actualReseller = (await altReseller.textContent())?.trim() || '';
        }
      }
      
      if (!actualReseller) {
        const selectReseller = this.page.locator('select#resellerId');
        if (await selectReseller.isVisible({ timeout: 2000 })) {
          const resellerValue = await selectReseller.inputValue();
          // If it's a number (2), convert to the display name
          if (resellerValue === '2') {
            actualReseller = 'Sunrise Motors';
          }
        }
      }
    } catch (error) {
      console.log('⚠️ Could not get reseller from form');
    }

    // Check if password field exists (it might not be visible in edit mode)
    let passwordType = 'N/A';
    try {
      const passwordVisible = await this.passwordInput.isVisible({ timeout: 2000 });
      if (passwordVisible) {
        passwordType = await this.passwordInput.getAttribute('type') || 'password';
      } else {
        console.log('ℹ️ Password field is not visible in edit mode (as expected)');
        passwordType = 'hidden';
      }
    } catch (error) {
      console.log('ℹ️ Password field not present in edit mode (as expected)');
      passwordType = 'hidden';
    }

    console.log(`Form Values:`);
    console.log(`  Username: ${actualUsername}`);
    console.log(`  Email: ${actualEmail}`);
    console.log(`  User Type: ${actualUserType}`);
    console.log(`  Reseller: ${actualReseller}`);
    console.log(`  Password Field: ${passwordType}`);

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

    // 3. Verify User Type - use expected value from JSON
    const expectedUserType = Edituser.usertype === '2' ? 'Reseller_Admin' : 'User';
    const userTypeValid = actualUserType === expectedUserType;
    Reporter.validateData(expectedUserType, actualUserType, '3. User Type Verification', testInfo);
    if (!userTypeValid) allValid = false;
    console.log(`  User Type: ${userTypeValid ? '✅ PASS' : '❌ FAIL'}`);

    // 4. Verify Reseller - use expected value from JSON
    const expectedReseller = Edituser.Reseller === '2' ? 'Sunrise Motors' : 'Default Reseller';
    const resellerValid = actualReseller === expectedReseller;
    Reporter.validateData(expectedReseller, actualReseller, '4. Reseller Verification', testInfo);
    if (!resellerValid) allValid = false;
    console.log(`  Reseller: ${resellerValid ? '✅ PASS' : '❌ FAIL'}`);

    // 5. Verify Password is not displayed (it shouldn't be in edit mode)
    const passwordHidden = passwordType === 'hidden' || passwordType === 'N/A';
    Reporter.validateData(true, passwordHidden, '5. Password Field Hidden in Edit Mode', testInfo);
    if (!passwordHidden) allValid = false;
    console.log(`  Password Hidden: ${passwordHidden ? '✅ PASS' : '❌ FAIL'}`);

    console.log(`\n${'='.repeat(60)}`);
    console.log(`STEP 5: Closing Edit Form`);
    console.log(`${'='.repeat(60)}`);

    // Click Cancel to close the form
    await this.cancelButton.click({ force: true });
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
      const deleteUser = new DeleteUser(this.page);
      await deleteUser.DeleteUserWithReport(username, testInfo);
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`FINAL RESULT: ${allValid ? '✅ TEST PASSED' : '❌ TEST FAILED'}`);
    console.log(`${'='.repeat(60)}`);
    
    return allValid;
  }
}