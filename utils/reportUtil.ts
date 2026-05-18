// pages/utils/reportUtil.ts

export function logAndValidate(
  {
    step,
    expected,
    actual
  }: {
    step: string;
    expected: any;
    actual: any;
  },
  testInfo?: any
) {

  // =====================================
  // SAFE STRING CONVERSION
  // =====================================

  const expectedValue =
    String(expected ?? '')
      .trim();

  const actualValue =
    String(actual ?? '')
      .trim();

  // =====================================
  // PARTIAL MATCH SUPPORT
  // =====================================

  const passed =
    actualValue
      .toLowerCase()
      .includes(
        expectedValue
          .toLowerCase()
      );

  // =====================================
  // STATUS
  // =====================================

  const status =
    passed
      ? 'PASS ✅'
      : 'FAIL ❌';

  // =====================================
  // REPORT MESSAGE
  // =====================================

  const message =
`
========================================
🔍 STEP: ${step}

EXPECTED: ${expectedValue}

ACTUAL: ${actualValue}

STATUS: ${status}
========================================
`;

  // =====================================
  // CONSOLE REPORT
  // =====================================

  console.log(message);

  // =====================================
  // PLAYWRIGHT REPORT
  // =====================================

  if (testInfo) {

    try {

      testInfo.annotations.push({

        type: 'VALIDATION',

        description: message
      });

    } catch {

      // Ignore annotation failure
    }
  }

  // =====================================
  // NO ASSERTION
  // =====================================
}