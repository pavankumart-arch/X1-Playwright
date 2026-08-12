import { expect, TestInfo } from '@playwright/test';

export type StepResult = {
  step: string;
  expected: any;
  actual: any;
};

export function logAndValidate(result: StepResult, testInfo: TestInfo) {

  const status = result.expected === result.actual ? 'PASS ✅' : 'FAIL ❌';

  const message = `
🔍 STEP: ${result.step}
EXPECTED: ${result.expected}
ACTUAL: ${result.actual}
STATUS: ${status}
`;

  console.log(message);

  testInfo.annotations.push({
    type: 'Validation',
    description: message
  });

  expect.soft(result.actual, message).toBe(result.expected);
}