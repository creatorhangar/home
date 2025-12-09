import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

test('homepage carrega e acessibilidade básica', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScanResults.violations.length).toBe(0);
});

test('upload via input e abertura do ExportModal', async ({ page }) => {
  await page.goto('/');
  const input = page.locator('input#file-upload');
  await input.setInputFiles({ name: 'a.png', mimeType: 'image/png', buffer: Buffer.from([137,80,78,71,13,10,26,10]) });
  await expect(page.getByText('Exportar Imagens')).toBeVisible();
});

test('medir navigation timing', async ({ page }) => {
  await page.goto('/');
  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return { domContentLoaded: nav.domContentLoadedEventEnd, loadEventEnd: nav.loadEventEnd, startTime: nav.startTime };
  });
  expect(metrics.loadEventEnd).toBeGreaterThan(0);
});
