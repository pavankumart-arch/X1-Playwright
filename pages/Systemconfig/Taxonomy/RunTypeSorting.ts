import { Locator, Page, TestInfo } from '@playwright/test';

import { BasePage } from '../../BasePage';

export class RunTypeSorting extends BasePage {

tableRows: Locator;

tableHeaders: Locator;

constructor(page: Page) {

super(page);

this.tableRows = page.locator('table tbody tr');

this.tableHeaders = page.locator('table thead th');

}

// =========================================

// VALIDATE COLUMN SORTING

// =========================================

async validateColumnSorting(

columnName: string,

testInfo: TestInfo

): Promise<{ passed: boolean; error?: string }> {

const columnIndex =

await this.getColumnIndex(columnName);

const header =

this.tableHeaders.nth(columnIndex);

// ASCENDING

console.log(`
📊 Testing ASCENDING for ${columnName}`);

await header.click();

await this.page.waitForLoadState('networkidle');

let values =

await this.getColumnValues(

columnIndex,

columnName

);

console.log(`${columnName} ASC values:`);

console.log(values);

let ascCheck =

this.checkSorting(values, 'ASC');

if (!ascCheck) {

await header.click();

await this.page.waitForLoadState('networkidle');

values =

await this.getColumnValues(

columnIndex,

columnName

);

ascCheck =

this.checkSorting(values, 'ASC');

}

// DESCENDING

console.log(`
📊 Testing DESCENDING for ${columnName}`);

await header.click();

await this.page.waitForLoadState('networkidle');

values =

await this.getColumnValues(

columnIndex,

columnName

);

console.log(`${columnName} DESC values:`);

console.log(values);

let descCheck =

this.checkSorting(values, 'DESC');

if (!descCheck) {

await header.click();

await this.page.waitForLoadState('networkidle');

values =

await this.getColumnValues(

columnIndex,

columnName

);

descCheck =

this.checkSorting(values, 'DESC');

}

if (ascCheck && descCheck) {

return { passed: true };

} else {

return {

passed: false,

error: `${columnName} sorting failed`

};

}

}

// =========================================

// GET COLUMN VALUES

// =========================================

private async getColumnValues(

columnIndex: number,

columnName: string

): Promise<any[]> {

const values: any[] = [];

const rowCount =

await this.tableRows.count();

for (let i = 0; i < rowCount; i++) {

const cell =

this.tableRows

.nth(i)

.locator('td')

.nth(columnIndex);

const text =

(await cell.innerText()).trim();

values.push(

this.parseValue(text, columnName)

);

}

return values;

}

// =========================================

// PARSE VALUE

// =========================================

private parseValue(

value: string,

columnName: string

): any {

if (columnName.toLowerCase() === 'id') {

const number = parseInt(value);

return isNaN(number) ? value : number;

}

const date = new Date(value);

if (!isNaN(date.getTime())) {

return date;

}

return value.toLowerCase();

}

// =========================================

// CHECK SORTING

// =========================================

private checkSorting(

values: any[],

order: 'ASC' | 'DESC'

): boolean {

for (let i = 0; i < values.length - 1; i++) {

const current = values[i];

const next = values[i + 1];

let valid = false;

if (order === 'ASC') {

valid = this.compareValues(current, next) <= 0;

} else {

valid = this.compareValues(current, next) >= 0;

}

if (!valid) {

console.log(`❌ Sorting Failed: ${current} -> ${next}`);

return false;

}

}

return true;

}

// =========================================

// COMPARE VALUES

// =========================================

private compareValues(a: any, b: any): number {

if (a instanceof Date && b instanceof Date) {

return a.getTime() - b.getTime();

}

if (typeof a === 'number' && typeof b === 'number') {

return a - b;

}

return String(a).localeCompare(String(b));

}

// =========================================

// GET COLUMN INDEX

// =========================================

private async getColumnIndex(

columnName: string

): Promise<number> {

const count =

await this.tableHeaders.count();

for (let i = 0; i < count; i++) {

const text =

(await this.tableHeaders.nth(i).innerText()).trim();

if (text.toLowerCase().includes(columnName.toLowerCase())) {

return i;

}

}

throw new Error(`Column not found: ${columnName}`);

}

}