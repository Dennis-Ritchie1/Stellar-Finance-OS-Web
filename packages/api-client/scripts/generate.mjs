#!/usr/bin/env node
// Generates src/schema.ts from the backend's OpenAPI spec.
//   pnpm api:generate          → fetches $API_URL/openapi.json (falls back to VITE_API_URL from root .env)
//   pnpm api:generate --seed   → uses openapi.seed.json (bootstrap only, until the backend publishes a spec)
// Never hand-edit src/schema.ts.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const pkgDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const rootEnv = resolve(pkgDir, '../../.env');
const out = resolve(pkgDir, 'src/schema.ts');

function readRootEnv(key) {
  if (!existsSync(rootEnv)) return undefined;
  const line = readFileSync(rootEnv, 'utf8')
    .split('\n')
    .find((l) => l.trim().startsWith(`${key}=`));
  return line?.split('=')[1]?.split('#')[0]?.trim();
}

let source;
if (process.argv.includes('--seed')) {
  source = resolve(pkgDir, 'openapi.seed.json');
} else {
  const apiUrl =
    process.env.API_URL ??
    process.env.VITE_API_URL ??
    readRootEnv('VITE_API_URL') ??
    'http://localhost:3000/v1';
  source = `${apiUrl.replace(/\/+$/, '')}/openapi.json`;
}

console.log(`Generating ${out}\n  from ${source}`);
execFileSync('openapi-typescript', [source, '-o', out], { stdio: 'inherit', cwd: pkgDir });
