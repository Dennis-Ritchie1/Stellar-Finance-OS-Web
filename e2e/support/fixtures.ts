import { test as base, expect, type Page } from '@playwright/test';

const RELAY = 'http://localhost:5190';
const API = 'http://localhost:3000/v1';

export const test = base.extend<{ resetBackend: void }>({
  resetBackend: [
    async ({ request }, use) => {
      await request.post(`${RELAY}/reset`);
      await use();
    },
    { auto: true },
  ],
});

export { expect, API };

/** Log in through the real form. Each login starts from a clean browser session. */
export async function login(page: Page, email: string, password = 'password') {
  await page.goto('/login');
  await page.evaluate(() => localStorage.clear());
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /log in|sign in/i }).click();
  await expect(page).not.toHaveURL(/\/login/);
}

/** Test-only backend hook: pretend the indexer matched a payment to this invoice. */
export async function indexPayment(page: Page, publicToken: string) {
  const status = await page.evaluate(
    async ({ api, publicToken }) =>
      (
        await fetch(`${api}/__test__/index-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicToken }),
        })
      ).status,
    { api: API, publicToken },
  );
  expect(status).toBe(200);
}
