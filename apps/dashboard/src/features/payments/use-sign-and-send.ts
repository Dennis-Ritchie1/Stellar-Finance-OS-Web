import { useState } from 'react';
import {
  useBuildPaymentTransaction,
  useSubmitPaymentTransaction,
  type BuiltTransaction,
  type PaymentRequest,
} from '@finance-os/api-client';
import { describeWalletError, useWallet } from '@finance-os/wallet';

export type SignStep =
  | { step: 'idle' }
  | { step: 'building' }
  | { step: 'review'; built: BuiltTransaction }
  | { step: 'signing'; built: BuiltTransaction }
  | { step: 'submitting' }
  | { step: 'done' }
  | { step: 'error'; message: string; built?: BuiltTransaction };

/**
 * README §5: build (backend) → readable summary → wallet signs → submit (backend) → poll.
 * The wallet only ever sees an XDR the backend built; no keys are handled here.
 */
export function useSignAndSend(request: PaymentRequest) {
  const wallet = useWallet();
  const build = useBuildPaymentTransaction();
  const submit = useSubmitPaymentTransaction();
  const [state, setState] = useState<SignStep>({ step: 'idle' });

  async function prepare() {
    setState({ step: 'building' });
    try {
      const built = await build.mutateAsync(request.id);
      setState({ step: 'review', built });
    } catch (e) {
      setState({
        step: 'error',
        message: e instanceof Error ? e.message : 'Could not prepare the payment.',
      });
    }
  }

  async function signAndSubmit() {
    if (state.step !== 'review' && !(state.step === 'error' && state.built)) return;
    const built = state.built!;
    setState({ step: 'signing', built });
    try {
      if (!wallet.address) await wallet.connect();
      const signedXdr = await wallet.signTransaction(built.xdr, {
        expectedSigner: request.treasuryAddress,
      });
      setState({ step: 'submitting' });
      await submit.mutateAsync({ id: request.id, signedXdr });
      setState({ step: 'done' });
    } catch (e) {
      setState({ step: 'error', message: describeWalletError(e), built });
    }
  }

  const reset = () => setState({ step: 'idle' });

  return { state, prepare, signAndSubmit, reset };
}
