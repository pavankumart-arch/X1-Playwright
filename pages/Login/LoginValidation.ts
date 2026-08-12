import { Locator, Page, TestInfo } from '@playwright/test';
import { BasePage } from '../BasePage';
import { Homepage } from '../Homepage/Homepage';
import { Login } from './Loginpage';
import { Reporter } from '../utils/NewReport';

import ProjectURLs from '../../testdata/ProjectURLs.json';
import LoginData from '../../testdata/LoginData.json';

export class LoginValidation extends BasePage {

    Username: Locator;
    Password: Locator;
    Singin: Locator;

    constructor(page: Page) {

        super(page);

        this.Username = this.page.getByPlaceholder('Enter your username');

        this.Password = this.page.getByPlaceholder('Enter your password');

        this.Singin = this.page.getByRole('button', { name: 'Sign in' });
    }

    async navigatetoURL() {

        await this.page.goto(ProjectURLs.QAURL);

        await this.Username.waitFor({ state: 'visible' });
    }

    async login(username: string, password: string) {

        await this.Username.fill(username);

        await this.Password.fill(password);

        await this.clickOnElement(this.Singin);
    }

    async getActualErrorMessage(): Promise<string> {

        await this.page.waitForTimeout(1000);

        const pageText =
            await this.page.locator('body').textContent() || '';

        const matchedMessages: string[] = [];

        // Capture EXACT message from application

        if (pageText.includes('User Name is required')) {
            matchedMessages.push('User Name is required');
        }

        if (pageText.includes('Username is required')) {
            matchedMessages.push('Username is required');
        }

        if (pageText.includes('Password is required')) {
            matchedMessages.push('Password is required');
        }

        if (pageText.includes('Invalid credentials')) {
            matchedMessages.push('Invalid credentials');
        }

        console.log('Actual Messages Found:', matchedMessages);

        return matchedMessages.join(' | ');
    }

    async validateErrorMessage(
        testCaseNumber: number,
        testCaseName: string,
        expectedMessage: string,
        testInfo: TestInfo
    ) {

        const actualMessage = await this.getActualErrorMessage();

        Reporter.validateData(
            expectedMessage,
            actualMessage,
            `${testCaseNumber}. ${testCaseName}`,
            testInfo
        );
    }

    // 1. Empty Username & Password
    async verifyEmptyCredentials(testInfo: TestInfo) {

        await this.login('', '');

        await this.validateErrorMessage(
            1,
            'EMPTY USERNAME & PASSWORD',
            'User Name is required | Password is required',
            testInfo
        );
    }

    // 2. Empty Username
    async verifyEmptyUsername(testInfo: TestInfo) {

        await this.login(
            '',
            LoginData.QAvalidData.Password
        );

        await this.validateErrorMessage(
            2,
            'EMPTY USERNAME',
            'User Name is required',
            testInfo
        );
    }

    // 3. Empty Password
    async verifyEmptyPassword(testInfo: TestInfo) {

        await this.login(
            LoginData.QAvalidData.Username,
            ''
        );

        await this.validateErrorMessage(
            3,
            'EMPTY PASSWORD',
            'Password is required',
            testInfo
        );
    }

    // 4. Invalid Credentials
    async verifyInvalidCredentials(testInfo: TestInfo) {

        await this.login(
            LoginData.QAinvalidData[0].Username,
            LoginData.QAinvalidData[0].Password
        );

        await this.validateErrorMessage(
            4,
            'INVALID CREDENTIALS',
            'Invalid credentials',
            testInfo
        );
    }

    // 5. Case Sensitive Password
    async verifyCaseSensitivePassword(testInfo: TestInfo) {

        await this.login(
            LoginData.QAvalidData.Username,
            'aDmin@123'
        );

        await this.validateErrorMessage(
            5,
            'CASE SENSITIVE PASSWORD',
            'Invalid credentials',
            testInfo
        );
    }

    // 6. Valid Login
    async verifyValidLogin(testInfo: TestInfo) {

        const loginPage = new Login(this.page);

        const homePage = new Homepage(this.page);

        await loginPage.navigateToURL();

        await loginPage.loginToApplication();

        const logoVisible = await homePage.Logo.isVisible();

        Reporter.validateData(
            true,
            logoVisible,
            'VALID LOGIN',
            testInfo
        );

        await homePage.VerifytheLogoutfunctionality();
    }
}

