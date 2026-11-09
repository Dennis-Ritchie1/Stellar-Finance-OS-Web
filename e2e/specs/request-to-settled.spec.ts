import { test, expect, login } from '../support/fixtures';
import type { Page } from '@playwright/test';

async function approve(page: Page, email: string) {
  await login(page, email);
  await page.goto('/approvals');
  const card = page.locator('li').filter({ hasText: 'Trade show booth' });
  await card.getByRole('button', { name: 'Approve' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel(/comment/i).fill('Looks right');
  await dialog.getByRole('button', { name: 'Approve' }).click();
  await expect(page.locator('li').filter({ hasText: 'Trade show booth' })).toHaveCount(0);
}

test('request to settled: 5,000 USDC needs two approvals, then the owner signs', async ({
  page,
}) => {
  // Accountant raises the request.
  await login(page, 'chi@acme.test');
  await page.goto('/payments/outgoing');
  await page.getByRole('button', { name: /new payment request/i }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Vendor').selectOption({ label: 'Pixel Print Co.' });
  await dialog.getByLabel('Amount').fill('5000');
  await dialog.getByLabel('Pay from').selectOption({ label: 'Operating' });
  await dialog.getByLabel(/what is it for/i).fill('Trade show booth');
  await dialog.getByRole('button', { name: 'Request approval' }).click();
  const row = page.getByRole('row', { name: /Trade show booth/ });
  await expect(row.getByText('Awaiting approval')).toBeVisible();

  // Two different approvers approve.
  await approve(page, 'ben@acme.test');
  await approve(page, 'eze@acme.test');

  // Owner reviews the summary and signs with the (fake) wallet.
  await login(page, 'ada@acme.test');
  await page.goto('/payments/outgoing');
  await page
    .getByRole('row', { name: /Trade show booth/ })
    .getByRole('button', { name: 'Pixel Print Co.' })
    .click();
  const drawer = page.getByRole('dialog');
  await expect(drawer.getByText('Approvals · 2 of 2')).toBeVisible();
  await drawer.getByRole('button', { name: 'Sign & send' }).click();
  await expect(drawer.getByText(/sign exactly this payment/i)).toBeVisible();
  await expect(drawer.getByText('5,000.00 USDC').first()).toBeVisible();
  await drawer.getByRole('button', { name: 'Open wallet to sign' }).click();
  await expect(drawer.getByText('Payment sent — confirming')).toBeVisible();

  // The mock indexer settles it a few seconds later.
  await expect(drawer.getByText('Paid').first()).toBeVisible({ timeout: 20_000 });
  await expect(drawer.getByRole('link', { name: /view on explorer/i }).first()).toBeVisible();
});
