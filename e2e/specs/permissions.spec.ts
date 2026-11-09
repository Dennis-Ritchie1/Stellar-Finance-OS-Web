import { test, expect, login } from '../support/fixtures';

test('viewer sees no write actions on invoices, payments or settings', async ({ page }) => {
  await login(page, 'dee@acme.test');

  await page.goto('/invoices');
  await expect(page.getByRole('table', { name: 'Invoices' })).toBeVisible();
  await expect(page.getByRole('link', { name: /new invoice/i })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /new invoice/i })).toHaveCount(0);

  await page.goto('/payments/outgoing');
  await expect(page.getByRole('heading', { name: /payment/i }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: /new payment request/i })).toHaveCount(0);

  await page.goto('/settings');
  await expect(page.getByRole('button', { name: /^(save|add|invite|remove)/i })).toHaveCount(0);
});
