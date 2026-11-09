import { test, expect, login, indexPayment } from '../support/fixtures';

test('invoice to paid: accountant invoices a client, client pays on the pay app', async ({
  page,
}) => {
  // --- Dashboard: accountant creates a client and an invoice, then sends it.
  await login(page, 'chi@acme.test');

  await page.goto('/clients');
  await page.getByRole('button', { name: /new client/i }).click();
  const clientDialog = page.getByRole('dialog');
  await clientDialog.getByLabel('Name').fill('Umbrella Corp');
  await clientDialog.getByLabel('Billing email').fill('ap@umbrella.test');
  await clientDialog.getByRole('button', { name: 'Add client' }).click();
  await expect(page.getByText('Umbrella Corp')).toBeVisible();

  await page.goto('/invoices/new');
  await page.getByLabel('Client').selectOption({ label: 'Umbrella Corp' });
  await page.getByLabel('Due date').fill(futureDate(14));
  await page.getByLabel('Description for line 1').fill('Brand strategy workshop');
  await page.getByLabel('Quantity for line 1').fill('2');
  await page.getByLabel('Unit price for line 1').fill('750');
  await expect(page.getByText('1,500.00 USDC').first()).toBeVisible();
  await page.getByRole('button', { name: 'Save draft' }).click();

  await expect(page.getByRole('heading', { name: /Invoice INV-/ })).toBeVisible();
  await page.getByRole('button', { name: /send invoice/i }).click();
  await expect(page.getByRole('button', { name: 'Copy pay link' })).toBeVisible();

  // --- Hand-off: the pay link shown on the invoice is what the client opens.
  const payLink = (await page.getByText(/\/i\/pub_\d+$/).innerText()).trim();
  const token = payLink.split('/i/')[1]!;
  expect(payLink.startsWith('http://localhost:5174/i/')).toBe(true);

  // --- Pay app: the client opens the link and pays with their wallet.
  await page.goto(payLink);
  await expect(page.getByText('Invoice INV-', { exact: false }).first()).toBeVisible();
  await expect(page.getByText('Amount due (USDC)')).toBeVisible();
  await page.getByRole('button', { name: 'Connect wallet & pay' }).click();
  await page.getByRole('button', { name: 'Confirm & sign' }).click();
  await expect(page.getByText('Payment sent')).toBeVisible();

  // --- The backend's indexer sees the payment (test-only hook), the page flips to Paid.
  await indexPayment(page, token);
  await expect(page.getByText('Paid ✓')).toBeVisible({ timeout: 15_000 });

  // --- Dashboard: invoice is Paid and the payment shows up matched.
  await page.goto('/invoices');
  const row = page.getByRole('row', { name: /Umbrella Corp/ });
  await expect(row.getByText('Paid')).toBeVisible();

  await page.goto('/transactions');
  const txRow = page.getByRole('row', { name: /Umbrella|INV-/ }).first();
  await expect(txRow).toBeVisible();
  await page.getByRole('link', { name: /INV-/ }).first().click();
  await expect(page.getByText(/Matched automatically/)).toBeVisible();
});

function futureDate(days: number) {
  const d = new Date(Date.now() + days * 24 * 3600 * 1000);
  return d.toISOString().slice(0, 10);
}
