// Tiny in-memory relay that lets the dashboard and pay app share one mock database during e2e runs.
// Test code only. Each app's MSW worker pulls/pushes the whole mock db as JSON (see
// packages/api-client/src/mocks/e2e.ts). `POST /reset` wipes it between tests.
import http from 'node:http';

const port = Number(process.env.E2E_RELAY_PORT ?? 5190);
let version = 1;
let state = null;

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const send = (res, status, body) => {
  res.writeHead(status, { ...cors, 'Content-Type': 'application/json' });
  res.end(body === undefined ? undefined : JSON.stringify(body));
};

http
  .createServer((req, res) => {
    const url = new URL(req.url ?? '/', `http://localhost:${port}`);
    if (req.method === 'OPTIONS') return send(res, 204);
    if (url.pathname === '/health') return send(res, 200, { ok: true });
    if (url.pathname === '/reset' && req.method === 'POST') {
      state = null;
      version += 1; // pages see a newer version with no state and re-seed on their next push
      return send(res, 200, { version });
    }
    if (url.pathname === '/state' && req.method === 'GET') {
      const since = Number(url.searchParams.get('since') ?? 0);
      if (since === version) return send(res, 204);
      return send(res, 200, { version, state });
    }
    if (url.pathname === '/state' && req.method === 'PUT') {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        state = JSON.parse(body);
        version += 1;
        send(res, 200, { version });
      });
      return;
    }
    send(res, 404, { message: 'not found' });
  })
  .listen(port, () => console.info(`[e2e] state relay on :${port}`));
