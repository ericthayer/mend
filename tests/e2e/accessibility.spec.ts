import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { installWebMCPMock, loadDemoAndStagePendingPlan } from './helpers/webmcpMock';

async function expectNoSeriousOrCriticalViolations(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  const blocking = results.violations.filter(
    (violation) => violation.impact === 'serious' || violation.impact === 'critical'
  );

  expect(blocking).toHaveLength(0);
}

test('axe: empty state has no serious or critical violations', async ({ page }) => {
  await installWebMCPMock(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Mend' })).toBeVisible();
  await expectNoSeriousOrCriticalViolations(page);
});

test('axe: active dashboard has no serious or critical violations', async ({ page }) => {
  await installWebMCPMock(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  await page.getByRole('button', { name: 'Load flood demo' }).click();
  await expect(page.getByRole('heading', { name: 'What we know' })).toBeVisible();
  await expectNoSeriousOrCriticalViolations(page);
});

test('axe: pending review state has no serious or critical violations', async ({ page }) => {
  await installWebMCPMock(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  await loadDemoAndStagePendingPlan(page);
  await expect(page.getByRole('heading', { name: 'Needs your review' })).toBeVisible();
  await expectNoSeriousOrCriticalViolations(page);
});
