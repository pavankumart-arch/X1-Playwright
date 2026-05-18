import { Locator, Page, expect, TestInfo } from '@playwright/test'
import { BasePage } from '../BasePage';
import { Homepage } from '../Homepage/Homepage';
import { Login } from './Loginpage';
import ProjectURLs from '../../testdata/ProjectURLs.json';
import LoginData from '../../testdata/LoginData.json';

export class LoginValidation extends BasePage {

    Username: Locator
    Password: Locator
    Singin: Locator

    // ✅ Colors
    GREEN = '\x1b[32m'
    RED = '\x1b[31m'
    RESET = '\x1b[0m'
    CYAN = '\x1b[36m'
    YELLOW = '\x1b[33m'

    constructor(page: Page) {

        super(page)

        this.Username = this.page.getByPlaceholder('Enter your username')

        this.Password = this.page.getByPlaceholder('Enter your password')

        this.Singin = this.page.getByRole('button', { name: 'Sign in' })
    }

    async navigatetoURL() {

        await this.page.goto(ProjectURLs.QAURL)

        await this.Username.waitFor({ state: 'visible' })
    }

    // ✅ Common Login Method
    async login(username: string, password: string) {

        await this.Username.fill(username)

        await this.Password.fill(password)

        await this.clickOnElement(this.Singin)
    }

    // ✅ Capture Actual Validation Message
    async getActualErrorMessage() {

        await this.page.waitForTimeout(1000)

        // ✅ Get only visible validation/error texts
        const errorLocators = this.page.locator('p, span, div')

        const allTexts = await errorLocators.allTextContents()

        // ✅ Possible validation messages
        const validationMessages = [
            'Username is required',
            'Password is required',
            'Invalid credentials'
        ]

        // ✅ Match only required messages
        const matchedMessages = validationMessages.filter(
            validation =>
                allTexts.some(
                    text => text.includes(validation)
                )
        )

        console.log('\n=========== VALIDATION MESSAGES ===========')

        console.log(matchedMessages)

        console.log('===========================================\n')

        return matchedMessages.join(' | ')
    }

    // ✅ Common Validation Method
    async validateErrorMessage(
        testCaseNumber: number,
        testCaseName: string,
        expectedMessage: string,
        stepName: string,
        testInfo: TestInfo
    ) {

        const actualMessage = await this.getActualErrorMessage()

        // ✅ Status
        const isPassed = actualMessage === expectedMessage

        const status = isPassed
            ? 'PASS ✅'
            : 'FAIL ❌'

        const statusColor = isPassed
            ? this.GREEN
            : this.RED

        // ✅ Console Logs
        console.log(`
${this.CYAN}==================================================${this.RESET}
${this.YELLOW}${testCaseName}${this.RESET}

TEST STEP : ${stepName}

EXPECTED : ${expectedMessage}

ACTUAL : ${actualMessage}

${statusColor}STATUS : ${status}${this.RESET}

${this.CYAN}==================================================${this.RESET}
`)

        // ✅ Show Report on TOP of Playwright HTML Report
        testInfo.annotations.push({
            type: `REPORT : ${testCaseNumber}`,
            description:
`${stepName}
STATUS   : ${status}
EXPECTED : ${expectedMessage}
ACTUAL   : ${actualMessage}`
        })

        // ✅ Validation
        expect.soft(
            actualMessage,
            `
${stepName}
STATUS   : ${status}
EXPECTED : ${expectedMessage}
ACTUAL   : ${actualMessage}
`
        ).toBe(expectedMessage)
    }

    // ✅ 1. Empty Username & Password
    async verifyEmptyCredentials(testInfo: TestInfo) {

        console.log(`
${this.YELLOW}
========== TEST CASE 1 : EMPTY USERNAME & PASSWORD ==========
${this.RESET}
`)

        await this.login('', '')

        await this.validateErrorMessage(
            1,
            'TEST CASE 1 : EMPTY USERNAME & PASSWORD',
            'Username is required | Password is required',
            'Verify Empty Username & Password validation',
            testInfo
        )
    }

    // ✅ 2. Empty Username
    async verifyEmptyUsername(testInfo: TestInfo) {

        console.log(`
${this.YELLOW}
========== TEST CASE 2 : EMPTY USERNAME ==========
${this.RESET}
`)

        await this.login(
            '',
            LoginData.QAvalidData.Password
        )

        await this.validateErrorMessage(
            2,
            'TEST CASE 2 : EMPTY USERNAME',
            'Username is required',
            'Verify Empty Username validation',
            testInfo
        )
    }

    // ✅ 3. Empty Password
    async verifyEmptyPassword(testInfo: TestInfo) {

        console.log(`
${this.YELLOW}
========== TEST CASE 3 : EMPTY PASSWORD ==========
${this.RESET}
`)

        await this.login(
            LoginData.QAvalidData.Username,
            ''
        )

        await this.validateErrorMessage(
            3,
            'TEST CASE 3 : EMPTY PASSWORD',
            'Password is required',
            'Verify Empty Password validation',
            testInfo
        )
    }

    // ✅ 4. Invalid Credentials
    async verifyInvalidCredentials(testInfo: TestInfo) {

        console.log(`
${this.YELLOW}
========== TEST CASE 4 : INVALID CREDENTIALS ==========
${this.RESET}
`)

        await this.login(
            LoginData.QAinvalidData[0].Username,
            LoginData.QAinvalidData[0].Password
        )

        await this.validateErrorMessage(
            4,
            'TEST CASE 4 : INVALID CREDENTIALS',
            'Invalid credentials',
            'Verify Invalid Credentials validation',
            testInfo
        )
    }

    // ✅ 5. Case Sensitive Password
    async verifyCaseSensitivePassword(testInfo: TestInfo) {

        console.log(`
${this.YELLOW}
========== TEST CASE 5 : CASE SENSITIVE PASSWORD ==========
${this.RESET}
`)

        await this.login(
            LoginData.QAvalidData.Username,
            'aDmin@123'
        )

        await this.validateErrorMessage(
            5,
            'TEST CASE 5 : CASE SENSITIVE PASSWORD',
            'Invalid credentials',
            'Verify Case Sensitive Password validation',
            testInfo
        )
    }

    // ✅ 6. Valid Login
    async verifyValidLogin(testInfo: TestInfo) {

        console.log(`
${this.YELLOW}
========== TEST CASE 6 : VALID LOGIN ==========
${this.RESET}
`)

        const Loginpage = new Login(this.page)

        const homePage = new Homepage(this.page)

        await Loginpage.navigateToURL()

        await Loginpage.loginToApplication()

        const logoVisible = await homePage.Logo.isVisible()

        const isPassed = logoVisible === true

        const status = isPassed
            ? 'PASS ✅'
            : 'FAIL ❌'

        const statusColor = isPassed
            ? this.GREEN
            : this.RED

        console.log(`
${this.CYAN}==================================================${this.RESET}

${this.YELLOW}TEST CASE 6 : VALID LOGIN${this.RESET}

TEST STEP : Verify Valid Login

EXPECTED : true

ACTUAL : ${logoVisible}

${statusColor}STATUS : ${status}${this.RESET}

${this.CYAN}==================================================${this.RESET}
`)

        // ✅ Show Report on TOP of Playwright HTML Report
        testInfo.annotations.push({
            type: 'REPORT : 6',
            description:
`Verify Valid Login
STATUS   : ${status}
EXPECTED : true
ACTUAL   : ${logoVisible}`
        })

        expect.soft(logoVisible).toBeTruthy()

        await homePage.VerifytheLogoutfunctionality()

        console.log(`${this.GREEN}✅ Successfully logged out${this.RESET}`)
    }
}