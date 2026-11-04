import { env } from '../../env';

/** Public pay-page URL the client opens to pay an invoice. */
export function payLink(publicToken: string) {
  return `${env.payAppUrl.replace(/\/+$/, '')}/i/${encodeURIComponent(publicToken)}`;
}
