import { Locator, Page, TestInfo } from '@playwright/test'
import { BasePage } from '../BasePage';
import { Homepage } from '../Homepage/Homepage';
import ProjectURLs from '../../testdata/ProjectURLs.json';
import LoginData from '../../testdata/LoginData.json';

export class Login extends BasePage {
    Login(arg0: string, arg1: string, testInfo: TestInfo) {
      throw new Error('Method not implemented.');
    }
    Username: Locator
    Password: Locator
    SignIn: Locator
    ErrorMessage: Locator

    constructor(page: Page) {
        super(page)
        this.Username = this.page.getByPlaceholder("Enter your username")
        this.Password = this.page.getByPlaceholder("Enter your password")
        this.SignIn = this.page.getByRole('button', { name: "Sign in" })
        this.ErrorMessage = this.page.getByText('Invalid username or password')
    }

    async navigateToURL() {
        await this.page.goto(ProjectURLs.QAURL)
        await this.page.waitForLoadState('domcontentloaded')
    }

    async loginToApplication(): Promise<Homepage | null> {
    await this.fillElement(this.Username, LoginData.QAvalidData.Username)
    await this.fillElement(this.Password, LoginData.QAvalidData.Password)
    await this.clickOnElement(this.SignIn)

    const homePage = new Homepage(this.page)

    await this.page.waitForTimeout(2000) // allow UI to update

    //  FIRST check error ONLY
    if (await this.ErrorMessage.isVisible().catch(() => false)) {
        console.log('❌ Login not successful')

        // ✅ CLOSE CONTEXT (safe way)
        await this.page.context().close()

        return null
    }

    //  THEN check success
    if (await homePage.Logo.isVisible().catch(() => false)) {
        console.log('✅ Logged successfully')
        return homePage
    }

    console.log('⚠️ Unknown login state')
    await this.page.context().close()
    return null
}
}




