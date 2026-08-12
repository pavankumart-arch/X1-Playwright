import { Locator, Page, TestInfo } from '@playwright/test';
import { BasePage } from '../BasePage';
import { Homepage } from '../Homepage/Homepage';
import { Reporter } from '../utils/NewReport';

import ProjectURLs from '../../testdata/ProjectURLs.json';
import LoginData from '../../testdata/LoginData.json';

type UserRole =
    | 'SuperAdmin'
    | 'ResellerAdmin'
    | 'RooftopAdmin'
    | 'RooftopUser';

export class Login extends BasePage {

    Username: Locator;
    Password: Locator;
    SignIn: Locator;
    ErrorMessage: Locator;

    constructor(page: Page) {

        super(page);

        this.Username = this.page.locator(
            'input[name="username"], input[placeholder*="User Name"], input[placeholder*="username"], input[placeholder="Enter User Name"], input[placeholder="Enter your username"]'
        ).first();

        this.Password = this.page.locator(
            'input[type="password"], input[name="password"], input[placeholder*="password"]'
        ).first();

        this.SignIn = this.page.getByRole('button', { name: /sign in/i }).first();

        this.ErrorMessage =
            this.page.getByText(/invalid username or password/i);
    }

    async navigateToURL() {

        await this.page.goto(ProjectURLs.QAURL);

        await this.page.waitForLoadState('domcontentloaded');
    }

    async loginToApplication(email?: string, password?: string): Promise<Homepage | null> {

        await this.fillElement(
            this.Username,
            email ?? LoginData.QAvalidData.Username
        );

        await this.fillElement(
            this.Password,
            password ?? LoginData.QAvalidData.Password
        );

        await this.clickOnElement(this.SignIn);

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

    // ===========================
    // NEW ROLE-BASED LOGIN METHOD
    // ===========================
    async loginByRole(role: UserRole): Promise<Homepage | null> {

        const userData = LoginData[role as keyof typeof LoginData];
        const user = (Array.isArray(userData) ? userData[0] : userData) as {
            Username: string;
            Password: string;
        };

        if (!user) {
            throw new Error(`Missing login data for role: ${role}`);
        }

        return await this.loginToApplication(
            user.Username,
            user.Password
        );
    }

    async verifyLogin(testInfo: TestInfo): Promise<Homepage> {

        const homePage = await this.loginToApplication();

        Reporter.validateData(
            true,
            homePage !== null,
            'Verify Login Functionality',
            testInfo
        );

        if (!homePage) {
            throw new Error('Login Failed');
        }

        const logoVisible =
            await homePage.Logo.isVisible();

        Reporter.validateData(
            true,
            logoVisible,
            'Verify EVS Logo',
            testInfo
        );

        return homePage;
    }

    async verifyLoginAndLogout(
        testInfo: TestInfo
    ) {

        const homePage =
            await this.verifyLogin(testInfo);

        await homePage.VerifytheLogoutfunctionality();

        Reporter.validateData(
            true,
            true,
            'Verify Logout Functionality',
            testInfo
        );
    }
}