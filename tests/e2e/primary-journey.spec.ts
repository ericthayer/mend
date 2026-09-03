import { expect, test, type Page } from '@playwright/test';
import {
  installWebMCPMock,
  listRegisteredToolNames,
  loadDemoAndStagePendingPlan,
  waitForToolAvailability,
} from './helpers/webmcpMock';

async function runPrimaryJourney(page: Page, viewport: { width: number; height: number }) {
  await installWebMCPMock(page);
  await page.setViewportSize(viewport);
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Mend' })).toBeVisible();
  await loadDemoAndStagePendingPlan(page);

  await page.getByRole('button', { name: 'Confirm decision' }).click();

  await expect(page.getByText('Approved plan v1', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Next actions' })).toBeVisible();
  await expect(page.getByText(/Secure accessible temporary housing options/i)).toBeVisible();

  await page.reload();

  await expect(page.getByRole('heading', { name: 'What we know' })).toBeVisible();
  await expect(page.getByText('Approved plan v1', { exact: true })).toBeVisible();
  await expect(page.getByText(/Secure accessible temporary housing options/i)).toBeVisible();

  await page.getByRole('button', { name: 'Delete local case' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Delete local case' }).click();

  await expect(page.getByRole('button', { name: 'Start a blank case' })).toBeVisible();

  await waitForToolAvailability(page, 'create_recovery_case');
  const tools = await listRegisteredToolNames(page);
  expect(tools).toContain('get_recovery_snapshot');
  expect(tools).toContain('create_recovery_case');
}

test('mobile happy path persists on reload and supports reset', async ({ page }) => {
  await runPrimaryJourney(page, { width: 390, height: 844 });
});

test('desktop happy path persists on reload and supports reset', async ({ page }) => {
  await runPrimaryJourney(page, { width: 1440, height: 900 });
});
