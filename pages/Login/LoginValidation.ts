import { Locator, Page, expect } from '@playwright/test'
import { BasePage } from '../BasePage';
import { Homepage } from '../Homepage/Homepage';
import { Login } from './Loginpage';
import ProjectURLs from '../../testdata/ProjectURLs.json';
import LoginData from '../../testdata/LoginData.json';

export class LoginValidation extends BasePage {
    Username: Locator
    Password: Locator
    Singin: Locator
    ErrorMessage: Locator

    constructor(page: Page) {
        super(page)
        this.Username = this.page.getByPlaceholder("Enter your username")
        this.Password = this.page.getByPlaceholder("Enter your password")
        this.Singin = this.page.getByRole('button', { name: "Sign in" })
        this.ErrorMessage = this.page.getByText('Invalid username or password');
    }

    async navigatetoURL() {
        await this.page.goto(ProjectURLs.QAURL)
        await this.Username.waitFor({ state: 'visible' })
    }

    // ✅ Generic Login Method
    async login(username: string, password: string) {
        await this.Username.fill(username)
        await this.Password.fill(password)
        await this.clickOnElement(this.Singin)
    }

    // 1. Empty Username & Password
    async verifyEmptyCredentials() {
        console.log('Test Case 1: Empty Username & Password');
        await this.login('', '');
        await expect(this.ErrorMessage).toBeVisible();
        await expect(this.ErrorMessage).toHaveText('Please enter username and password');
        console.log('Result: Proper error displayed for empty username & password');
    }

    // 2. Empty Username
    async verifyEmptyUsername() {
        console.log('Test Case 2: Empty Username');
        await this.login('', LoginData.QAvalidData.Password);
        await expect(this.ErrorMessage).toBeVisible();
        await expect(this.ErrorMessage).toHaveText('Username is required');
        console.log('Result: Proper error displayed for empty username');
    }

    // 3. Empty Password
    async verifyEmptyPassword() {
        console.log('Test Case 3: Empty Password');
        await this.login(LoginData.QAvalidData.Username, '');
        await expect(this.ErrorMessage).toBeVisible();
        await expect(this.ErrorMessage).toHaveText('Password is required');
        console.log('Result: Proper error displayed for empty password');
    }

    // 4. Invalid Credentials
    async verifyInvalidCredentials() {
        console.log('Test Case 4: Invalid Credentials');
        await this.login(LoginData.QAinvalidData[0].Username, LoginData.QAinvalidData[0].Password);
        await expect(this.ErrorMessage).toBeVisible();
        await expect(this.ErrorMessage).toHaveText('Invalid username or password');
        console.log('Result: Proper error displayed for invalid credentials');
    }

    // 5. Case Sensitive Password
    async verifyCaseSensitivePassword() {
        console.log('Test Case 5: Case Sensitive Password');
        await this.login(LoginData.QAvalidData.Username, 'aDmin@123'); 
        await expect(this.ErrorMessage).toBeVisible();
        await expect(this.ErrorMessage).toHaveText('Invalid username or password');
        console.log('Result: Proper error displayed for case-sensitive password');
    }

    // 6. Valid Login
    async verifyValidLogin() {
         console.log('Test Case 6: Valid Login verification');
       const Loginpage=new Login(this.page)
       const homePage=new Homepage(this.page)
         await Loginpage.navigateToURL()
         await Loginpage.loginToApplication()
         await homePage.VerifytheEVSLogo()
         await homePage.VerifytheLogoutfunctionality()
         console.log('Result: Successfully logged in with valid credentials');

}}