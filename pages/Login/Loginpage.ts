// Loginpage.ts

import { Locator, Page } from '@playwright/test';
import { BasePage } from '../BasePage';
import { Homepage } from '../Homepage/Homepage';
import ProjectURLs from '../../testdata/ProjectURLs.json';
import LoginData from '../../testdata/LoginData.json';

export class Login extends BasePage {

  Username: Locator;
  Password: Locator;
  SignIn: Locator;
  ErrorMessage: Locator;

  constructor(page: Page) {

    super(page);

    this.Username = this.page.getByPlaceholder('Enter your username');

    this.Password = this.page.getByPlaceholder('Enter your password');

    this.SignIn = this.page.getByRole('button', { name: 'Sign in' });

    this.ErrorMessage = this.page.getByText('Invalid username or password');
  }

  async navigateToURL() {

    await this.page.goto(ProjectURLs.QAURL);

    await this.page.waitForLoadState('domcontentloaded');
  }

  async loginToApplication(): Promise<Homepage | null> {

    await this.fillElement(
      this.Username,
      LoginData.QAvalidData.Username
    );

    await this.fillElement(
      this.Password,
      LoginData.QAvalidData.Password
    );

    await this.clickOnElement(this.SignIn);

    // Wait for either the error message or the homepage logo
    const errorVisible = await this.ErrorMessage
      .isVisible()
      .catch(() => false);

    if (errorVisible) {

      console.log(
        '❌ Login not successful – invalid credentials'
      );

      return null;
    }

    const homePage = new Homepage(this.page);

    const logoVisible = await homePage.Logo
      .isVisible()
      .catch(() => false);

    if (logoVisible) {

      console.log('✅ Login successful');

      return homePage;
    }

    console.log(
      '⚠️ Unknown login state – no error and no logo'
    );

    return null;
  }
}