import { http, HttpResponse } from 'msw';
import type { LoginInput, RegisterInput } from '../../types';
import { authenticate, error, newId, TOKEN_PREFIX, type MockContext } from '../context';
import type { MockUser } from '../db';

const session = (user: MockUser) => ({
  token: `${TOKEN_PREFIX}${user.id}`,
  user: { id: user.id, name: user.name, email: user.email },
  memberships: user.memberships,
});

export const authHandlers = ({ db, base }: MockContext) => [
  http.post(`${base}/auth/login`, async ({ request }) => {
    const { email, password } = (await request.json()) as LoginInput;
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user || user.password !== password) {
      return error(401, 'invalid_credentials', 'Email or password is incorrect.');
    }
    return HttpResponse.json(session(user));
  }),

  http.post(`${base}/auth/register`, async ({ request }) => {
    const input = (await request.json()) as RegisterInput;
    if (db.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
      return error(409, 'email_taken', 'An account with this email already exists.');
    }
    const orgId = newId('org');
    db.orgs.push({ id: orgId, name: input.orgName, defaultAssetCode: 'USDC' });
    const user: MockUser = {
      id: newId('u'),
      name: input.name,
      email: input.email,
      password: input.password,
      memberships: [{ orgId, orgName: input.orgName, role: 'owner' }],
    };
    db.users.push(user);
    return HttpResponse.json(session(user), { status: 201 });
  }),

  http.post(`${base}/auth/logout`, () => new HttpResponse(null, { status: 204 })),

  http.get(`${base}/me`, ({ request }) => {
    const caller = authenticate(db, request);
    if (caller instanceof Response) return caller;
    const { user } = caller;
    return HttpResponse.json({
      user: { id: user.id, name: user.name, email: user.email },
      memberships: user.memberships,
    });
  }),
];
