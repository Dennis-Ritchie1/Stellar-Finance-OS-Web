# AGENTS.md — rules for AI assistants working in finance-os-web

Read `README.md` first. These rules are non-negotiable.

1. **Never request, store, or handle a secret key.** Signing goes through `packages/wallet` only.
2. **Never hand-edit `packages/api-client/src/schema.ts`.** Regenerate it with `pnpm api:generate`. If a field is missing, change the backend.
3. **No business logic in components** — no payment matching, no approval threshold math. Display what the API returns.
4. **Amounts are strings.** Use the money utils in `packages/utils` (`formatAmount`, etc.). Never `parseFloat` / `Number()` an amount (ESLint blocks `parseFloat`).
5. **All shared components go in `packages/ui`**; apps import, never duplicate.
6. **Every screen handles four states:** loading, empty, error, and permission-denied.
7. **Responsive:** the pay app must be mobile-first; the dashboard must work down to tablet width.
8. **Before declaring a task done:** `pnpm lint && pnpm typecheck && pnpm test`.

## Where things go

| Need | Location |
|---|---|
| New shared component (shadcn) | `packages/ui/src/components/` — run `pnpm dlx shadcn@latest add <name>` from `packages/ui` |
| Design tokens / dark mode | `packages/ui/src/styles/globals.css` |
| API hooks | `packages/api-client/src/hooks/` |
| Wallet connect / sign | `packages/wallet/src/` |
| Money, dates, address display | `packages/utils/src/` |
| Dashboard screen | `apps/dashboard/src/routes/` |
| Pay page | `apps/pay/src/routes/` |

## Role-based UI

Hide or disable actions by `Member.role` (`owner | admin | approver | accountant | viewer`). This is UX only — the backend enforces permissions.

## Prompt template

```
You are working in finance-os-web. Read README.md and AGENTS.md first.
Task: <task # and name>. Use components from packages/ui and hooks from packages/api-client.
Deliver: code + tests, all four UI states (loading/empty/error/denied). List assumptions at the end.
```
