# Stellar Finance OS — Web

> Repo 3 of 3 · `finance-os-web` · React + Tailwind monorepo
> Sibling repos: [`finance-os-backend`](../finance-os-backend) (API, indexer) · [`finance-os-contracts`](../finance-os-contracts) (Soroban)

The frontend for Stellar Business Treasury & Finance OS. Two apps share four packages:

- **Dashboard** (`apps/dashboard`) — where a business's team manages invoices, clients, vendors, approvals, treasury,
  reconciliation and settings.
- **Pay** (`apps/pay`) — a small public page a business's client opens to pay an invoice in USDC on Stellar.

The web app holds **no business logic** beyond display and form validation. All data comes from the backend API. The only
Stellar action that happens here is **signing**: the user's wallet signs transactions — built by the backend for outgoing
payments, or built in the browser when a client pays an invoice.

## Contents

1. [Status](#status)
2. [Quick start](#quick-start)
3. [Configuration](#configuration)
4. [Repository layout](#repository-layout)
5. [Architecture](#architecture)
6. [Dashboard app](#dashboard-app)
7. [Pay app](#pay-app)
8. [Packages](#packages)
9. [Mock API](#mock-api)
10. [Testing & CI](#testing--ci)
11. [Conventions](#conventions)
12. [Build order](#build-order)
13. [Tech stack](#tech-stack)

## Status

Build-order tasks 1–12 are implemented and run end to end against an **in-memory mock API** (MSW). The real backend is not
wired up yet — `packages/api-client/openapi.seed.json` is the API contract the frontend expects the backend to serve.

| Works today (against the mock API)                                    | Still to do                                             |
| --------------------------------------------------------------------- | ------------------------------------------------------- |
| Login / register, org switcher, role-based UI                         | Point at the real `finance-os-backend`                  |
| Clients and invoices: create, send, void, pay link                    | Verify real Freighter signing on testnet                |
| Pay page: wallet pay, SEP-7 QR, live "Paid ✓" status                  | "Paid" after a _real_ payment needs the backend indexer |
| Vendors, payment requests, multi-approver approvals                   | Playwright end-to-end tests (task 13)                   |
| Sign & send outgoing payments                                         | Route-level code splitting for the dashboard bundle     |
| Transactions + manual match, dashboard, reports, CSV export, settings |                                                         |
