# Stellar Finance OS — Web

> Repo 3 of 3 · `finance-os-web` · React + Tailwind monorepo
> Sibling repos: [`finance-os-backend`](../finance-os-backend) (API, indexer) · [`finance-os-contracts`](../finance-os-contracts) (Soroban)

The frontend for Stellar Business Treasury & Finance OS. Two apps:

- **Dashboard** — where a business's team manages invoices, vendors, approvals, treasury, and reconciliation.
- **Pay** — a public invoice page that a business's client opens to pay an invoice in USDC on Stellar.

The web app holds **no business logic of its own** beyond display and form validation. All data comes from the backend API. The only Stellar action that happens here is **signing** — the user's wallet signs transactions the backend built.

---

## 1. Monorepo layout

```
finance-os-web/
├── apps/
│   ├── dashboard/          # Authenticated business app (Vite + React)
│   └── pay/                # Public invoice payment page (Vite + React, lightweight)
├── packages/
│   ├── ui/                 # Shared components (shadcn/ui-based), design tokens, Tailwind preset
│   ├── api-client/         # Typed client GENERATED from backend /openapi.json — do not hand-edit
│   ├── wallet/             # Wallet connect + sign abstraction (wraps Stellar Wallets Kit)
│   └── utils/              # Money formatting, date utils, Stellar address display helpers
├── turbo.json
├── pnpm-workspace.yaml
├── .env.example
├── AGENTS.md
└── README.md
```

---

## 2. Tech stack

| Concern | Choice |
|---|---|
| Build | Vite + React + TypeScript (strict) |
| Monorepo | pnpm workspaces + Turborepo |
| Styling | Tailwind CSS + shadcn/ui |
| Routing | React Router |
| Server state | TanStack Query |
| Forms | React Hook Form + Zod |
| Tables | TanStack Table |
| Charts | Recharts |
| API client | `openapi-typescript` + `openapi-fetch`, generated from backend |
| Wallets | `@creit.tech/stellar-wallets-kit` (Freighter, xBull, Lobstr, etc. — verify current supported list) |
| QR codes | `qrcode.react` (SEP-7 payment URIs on the pay page) |
| Tests | Vitest + React Testing Library; Playwright for E2E |

---

## 3. Dashboard app — screens

| Route | Screen | What it shows / does |
|---|---|---|
| `/login`, `/register` | Auth | Email/password; org creation on first sign-up |
| `/` | Dashboard | Balances per treasury account, 30-day inflow/outflow chart, open & overdue invoices, pending approvals, unmatched payments count |
| `/invoices` | Invoice list | Filter by status; quick actions (send, void, copy pay link) |
| `/invoices/new`, `/invoices/:id` | Invoice editor/detail | Line items, asset, due date; payment reference (muxed address + memo); match history |
| `/clients` | Clients | Client records; linked sender addresses |
| `/vendors` | Vendors | Vendor records + Stellar payout address + required memo |
| `/payments/outgoing` | Payment requests | Create request → approval status → sign & submit |
| `/approvals` | Approval inbox | Requests awaiting *my* approval; approve/reject with comment |
| `/transactions` | Transactions | All on-chain activity; filter unmatched; **manual match** drawer |
| `/reports` | Treasury report | Date range inflows/outflows/balances |
| `/exports` | Reconciliation | Generate & download CSV |
| `/settings/*` | Settings | Org profile, members & roles, treasury accounts, approval policies, linked wallet |

### Role-based UI

Hide or disable actions by `Member.role` (`owner | admin | approver | accountant | viewer`). **This is for UX only — the backend enforces permissions.**

---

## 4. Pay app — public invoice page

Route: `/i/:publicToken`

Shows: business name, invoice number, line items, amount + asset, due date, status.

Payment options:
1. **Connect wallet & pay** — builds the payment client-side to the invoice's muxed address (or G-address + memo), the payer signs, submits.
2. **Pay from any wallet** — shows address, memo, amount, and a QR code (SEP-7 `web+stellar:pay` URI) with copy buttons.
3. **Status** — polls the backend; flips to "Paid ✓" when the indexer matches the payment.

Clear warning near the memo: *"If you pay to the G-address, you must include this memo or your payment can't be matched."*

Keep this app small and fast — it's opened by clients who've never heard of the product, often on mobile.

> ⚠️ Verify during build: SEP-7 QR support varies by wallet. Test the QR flow with the wallets your pilot businesses' clients actually use.

---

## 5. Signing flow (outgoing payments)

```
user clicks "Sign & send" on an approved PaymentRequest
  → api-client: POST /payment-requests/:id/build-tx  → unsigned XDR
  → packages/wallet: show human-readable summary (to, asset, amount, memo) → wallet.signTransaction(xdr)
  → api-client: POST /payment-requests/:id/submit { signedXdr }
  → poll status until settled | failed
```

Rules:
- Always show a readable summary before opening the wallet. Never ask users to sign something they can't read.
- Network mismatch (wallet on mainnet, app on testnet) → block and explain.
- The connected wallet must match the treasury account that's paying; if not, explain which address to switch to.

---

## 6. `packages/api-client` — the contract with the backend

Generated from the backend's OpenAPI spec:

```bash
pnpm api:generate     # fetches $API_URL/openapi.json → packages/api-client/src/schema.ts
```

- Commit the generated file so builds don't need a running backend.
- Wrap it in TanStack Query hooks (`useInvoices`, `useApprovePaymentRequest`, …) in `packages/api-client/src/hooks/`.
- If the frontend needs a field the API doesn't have, **change the backend**, regenerate — never patch types by hand.

> Bootstrap note: until the backend publishes its spec, `pnpm api:generate --seed` generates `schema.ts` from `packages/api-client/openapi.seed.json`. Once the backend is up, drop `--seed` and the seed file.

---

## 7. Money & display rules

- Amounts arrive as strings. Format with a decimal library (e.g. `big.js`) — never `parseFloat`.
- Show asset code next to every amount (`5,000.00 USDC`).
- Truncate Stellar addresses for display (`GABC…WXYZ`) with copy-to-clipboard and a link to a block explorer for the current network.
- Dates in the user's local timezone; show relative time on lists ("3 days overdue").

---

## 8. Configuration

`.env.example`:

```bash
VITE_API_URL=http://localhost:3000/v1
VITE_STELLAR_NETWORK=testnet          # must match backend
VITE_EXPLORER_URL=https://stellar.expert/explorer/testnet
VITE_PAY_APP_URL=http://localhost:5174
```

Copy it to `.env` at the repo root — both apps read env from the root (`envDir` in each `vite.config.ts`).

### Local development

```bash
pnpm install
pnpm api:generate        # backend must be running, or use committed schema
pnpm dev                 # dashboard on :5173, pay on :5174
```

Until the backend is ready, use **MSW (Mock Service Worker)** with fixtures typed from the generated schema so UI work isn't blocked.

### Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Run both apps |
| `pnpm build` | Production build of both apps |
| `pnpm lint` | ESLint across the workspace |
| `pnpm typecheck` | `tsc --noEmit` in every package |
| `pnpm test` | Vitest in every package |
| `pnpm api:generate` | Regenerate `packages/api-client/src/schema.ts` |

---

## 9. Building this with AI — rules (`AGENTS.md`)

1. Never request, store, or handle a secret key. Signing goes through `packages/wallet` only.
2. Never hand-edit `packages/api-client/src/schema.ts`.
3. No business logic in components — no matching, no approval threshold math. Display what the API returns.
4. Amounts are strings; use the money utils in `packages/utils`.
5. All shared components go in `packages/ui`; apps import, never duplicate.
6. Every screen handles: loading, empty, error, and permission-denied states.
7. Mobile-responsive for the pay app is mandatory; dashboard must work down to tablet width.
8. Run `pnpm lint && pnpm typecheck && pnpm test` before declaring a task done.

### Build order

| # | Task | Done when |
|---|---|---|
| 1 | Scaffold monorepo: pnpm, turbo, Vite apps, Tailwind preset, shadcn/ui in `packages/ui` | Both apps run with a shared Button |
| 2 | `packages/api-client` generation + MSW mocks | Typed hooks return mock data |
| 3 | App shell: auth pages, sidebar layout, org switcher, route guards | Login → dashboard with mocks |
| 4 | `packages/wallet` (connect, network check, sign) | Freighter signs a testnet tx |
| 5 | Clients + invoices (list, editor, detail with payment reference) | Create & send invoice end-to-end |
| 6 | Pay app (`/i/:token`) with wallet pay + QR + status polling | Testnet payment flips invoice to Paid |
| 7 | Vendors + payment requests + approval inbox | Request → 2 approvals → approved |
| 8 | Sign & submit outgoing payment | Settled status shown after indexer picks it up |
| 9 | Transactions page + manual match drawer | Unmatched payment can be linked to an invoice |
| 10 | Dashboard widgets + reports charts | Numbers match API |
| 11 | Exports page | CSV downloads |
| 12 | Settings: members, roles, treasury accounts, approval policies | Role changes reflect in UI |
| 13 | Playwright E2E for invoice-to-paid and request-to-settled | Green in CI |

### Prompt template

```
You are working in finance-os-web. Read README.md and AGENTS.md first.
Task: <task # and name>. Use components from packages/ui and hooks from packages/api-client.
Deliver: code + tests, all four UI states (loading/empty/error/denied). List assumptions at the end.
```

---

## 10. Design direction

- Audience is business owners and accountants, not crypto natives. Say "Payment received", not "Operation detected". Hide hashes behind a "View on explorer" link.
- Calm, trustworthy finance-app look: neutral palette, one accent colour, clear status badges (`Draft`, `Sent`, `Partially paid`, `Paid`, `Overdue`, `Void`).
- Dark mode supported via Tailwind tokens.
