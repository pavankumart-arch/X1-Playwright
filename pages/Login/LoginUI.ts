import { Page, Locator, expect, TestInfo } from '@playwright/test';
import { Reporter } from '../utils/NewReport';

export class LoginUI {
  EVSLogo: Locator;
  UsernameLabel: Locator;
  PasswordLabel: Locator;
  Username: Locator;
  Password: Locator;
  SignIn: Locator;
  EyeIcon: Locator;

  constructor(private page: Page) {
    // Logo
    this.EVSLogo = page.locator('.h-8.w-auto');

    // Labels
    this.UsernameLabel = page.getByText(/User\s*Name/i).first();
    this.PasswordLabel = page.getByText(/Password/i).first();

    // Input Fields
    this.Username = page.locator('input[name="username"], #username').first();
    this.Password = page.locator('#password').first();

    // Sign In Button
    this.SignIn = page.getByRole('button', { name: /sign in/i });

    // Show Password Icon
    this.EyeIcon = page.getByRole('button', { name: /show password/i });
  }

  async loginUI(testInfo: TestInfo) {
    // Wait for page load
    await this.page.waitForLoadState('domcontentloaded');

    // Visibility Checks
    await expect(this.EVSLogo).toBeVisible();
    await expect(this.Username).toBeVisible();
    await expect(this.Password).toBeVisible();
    await expect(this.SignIn).toBeVisible();
    await expect(this.EyeIcon).toBeVisible();

    // Label Checks
    await expect(this.UsernameLabel).toBeVisible();
    await expect(this.PasswordLabel).toBeVisible();

    // Username Label Validation
    Reporter.validateData(
      'User Name*:',
      (await this.UsernameLabel.textContent())?.trim() ?? '',
      'Username Label',
      testInfo
    );

    // Password Label Validation
    Reporter.validateData(
      'Password*:',
      (await this.PasswordLabel.textContent())?.trim() ?? '',
      'Password Label',
      testInfo
    );

    // Username Placeholder Validation
    Reporter.validateData(
      'User Name',
      (await this.Username.getAttribute('placeholder')) ?? '',
      'Username Placeholder',
      testInfo
    );

    // Password Placeholder Validation
    Reporter.validateData(
      'Enter your password',
      (await this.Password.getAttribute('placeholder')) ?? '',
      'Password Placeholder',
      testInfo
    );

    // Sign In Button Validation
    Reporter.validateData(
      'Sign In',
      (await this.SignIn.textContent())?.trim() ?? '',
      'Sign In Button',
      testInfo
    );
  }
}