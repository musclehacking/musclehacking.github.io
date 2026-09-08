import type { TestInfo } from '@playwright/test';

export function configuredOrigin(testInfo: TestInfo): string {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error('Playwright project is missing baseURL.');
  return new URL(baseURL).origin;
}
