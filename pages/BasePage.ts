import { Locator, Page } from '@playwright/test'

export class BasePage {
    page: Page
    constructor(page: Page) {
        this.page = page
    }
    async clickOnElement(locator: Locator) {
        await locator.waitFor({ state: 'visible' })
        await locator.click()
    }
    async fillElement(locator: Locator, inputText: string) {
        await locator.waitFor({ state: 'visible' })
        await locator.fill(inputText)
    }
    async selectOption(locator: Locator, option: string) {
        await locator.waitFor({ state: 'visible' })
        await locator.selectOption(option)
    }
}