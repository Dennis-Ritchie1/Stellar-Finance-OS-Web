import { createHorizon } from '@finance-os/wallet';
import { env } from '../env';

/** Horizon client used to build and submit the payer's transaction. */
export const horizon = createHorizon(env.horizonUrl);
