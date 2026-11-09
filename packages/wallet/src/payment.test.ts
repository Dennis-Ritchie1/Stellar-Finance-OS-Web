import { Keypair, MuxedAccount, Account, Operation, Horizon } from '@stellar/stellar-sdk';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  BASE_FEE_STROOPS,
  DEFAULT_FEE_STROOPS,
  MAX_FEE_STROOPS,
  buildPaymentTransaction,
  clampFee,
  createHorizon,
  isIndeterminate,
  mapResultCodes,
  txHashHex,
} from './payment';
import { NETWORK_PASSPHRASES } from './network';

const payer = Keypair.random().publicKey();
const treasury = Keypair.random().publicKey();
const issuer = Keypair.random().publicKey();
const muxed = new MuxedAccount(new Account(treasury, '0'), '1001').accountId();

describe('buildPaymentTransaction', () => {
  it('pays a muxed address without a memo', () => {
    const tx = buildPaymentTransaction(
      {
        source: payer,
        destination: muxed,
        amount: '12.5',
        assetCode: 'USDC',
        assetIssuer: issuer,
        memo: { type: 'id', value: '1001' },
      },
      '41',
      'testnet',
    );
    expect(tx.networkPassphrase).toBe(NETWORK_PASSPHRASES.testnet);
    expect(tx.sequence).toBe('42');
    expect(tx.memo.type).toBe('none');
    const op = tx.operations[0] as Operation.Payment;
    expect(op).toMatchObject({ type: 'payment', destination: muxed, amount: '12.5000000' });
    expect(op.asset.getCode()).toBe('USDC');
  });

  it('adds the memo when paying the G-address', () => {
    const tx = buildPaymentTransaction(
      {
        source: payer,
        destination: treasury,
        amount: '1',
        assetCode: 'USDC',
        assetIssuer: issuer,
        memo: { type: 'id', value: '1001' },
      },
      '1',
      'testnet',
    );
    expect(tx.memo.type).toBe('id');
    expect(tx.memo.value).toBe('1001');
  });

  it('supports native XLM', () => {
    const tx = buildPaymentTransaction(
      { source: payer, destination: treasury, amount: '5', assetCode: 'XLM' },
      '1',
      'mainnet',
    );
    expect((tx.operations[0] as Operation.Payment).asset.isNative()).toBe(true);
    expect(tx.networkPassphrase).toBe(NETWORK_PASSPHRASES.mainnet);
  });
});

describe('mapResultCodes', () => {
  const rejection = (result_codes: object) => ({
    response: { status: 400, data: { extras: { result_codes } } },
  });

  it.each([
    [{ transaction: 'tx_bad_seq' }, 'tx_bad_seq', /another transaction/i],
    [{ transaction: 'tx_insufficient_fee' }, 'tx_insufficient_fee', /fee was too low/i],
    [{ transaction: 'tx_too_late' }, 'tx_too_late', /expired/i],
    [{ operations: ['op_no_trust'] }, 'op_no_trust', /isn't set up to receive/i],
    [{ operations: ['op_line_full'] }, 'op_line_full', /reached its limit/i],
    [{ operations: ['op_no_destination'] }, 'op_no_destination', /isn't active/i],
    [{ operations: ['op_underfunded'] }, 'op_underfunded', /enough funds/i],
  ])('maps %j to %s in plain language', (codes, reason, message) => {
    const err = mapResultCodes(rejection(codes));
    expect(err.reason).toBe(reason);
    expect(err.message).toMatch(message);
    expect(err.message).not.toMatch(/sequence|trustline/i);
  });

  it('falls back to a generic rejection for unknown codes', () => {
    expect(mapResultCodes(rejection({ operations: ['op_weird'] })).reason).toBe('submit_failed');
  });
});

describe('isIndeterminate', () => {
  it('treats 5xx and missing responses as unknown, rejections as final', () => {
    expect(isIndeterminate({ response: { status: 504 } })).toBe(true);
    expect(isIndeterminate(new Error('Network Error'))).toBe(true);
    expect(
      isIndeterminate({ response: { status: 400, data: { extras: { result_codes: {} } } } }),
    ).toBe(false);
    expect(isIndeterminate({ response: { status: 400 } })).toBe(false);
  });
});

describe('clampFee', () => {
  it('clamps to the base fee and cap, and falls back when missing', () => {
    expect(clampFee('250')).toBe('250');
    expect(clampFee('5')).toBe(String(BASE_FEE_STROOPS));
    expect(clampFee('99999999')).toBe(String(MAX_FEE_STROOPS));
    expect(clampFee(undefined)).toBe(String(DEFAULT_FEE_STROOPS));
  });
});

describe('createHorizon', () => {
  function signedXdr() {
    const kp = Keypair.random();
    const tx = buildPaymentTransaction(
      { source: kp.publicKey(), destination: treasury, amount: '1', assetCode: 'XLM' },
      '1',
      'testnet',
    );
    tx.sign(kp);
    return { xdr: tx.toXDR(), hash: txHashHex(tx) };
  }

  function horizonWith(
    submit: () => Promise<{ hash: string }>,
    lookup: () => Promise<{ successful: boolean }>,
    clock = { t: Date.now() },
  ) {
    const h = createHorizon('https://horizon.test', {
      pollMs: 1000,
      graceSeconds: 0,
      now: () => clock.t,
      sleep: async (ms) => {
        clock.t += ms;
      },
    });
    // Replace network calls on the underlying server via the SDK prototype.
    vi.spyOn(Horizon.Server.prototype, 'submitTransaction').mockImplementation(submit as never);
    vi.spyOn(Horizon.Server.prototype, 'transactions').mockImplementation((() => ({
      transaction: () => ({ call: lookup }),
    })) as never);
    return h;
  }

  afterEach(() => vi.restoreAllMocks());

  it('maps a definitive rejection without polling', async () => {
    const lookup = vi.fn();
    const h = horizonWith(
      () =>
        Promise.reject({
          response: {
            status: 400,
            data: { extras: { result_codes: { transaction: 'tx_bad_seq' } } },
          },
        }),
      lookup,
    );
    const onChecking = vi.fn();
    await expect(h.submit(signedXdr().xdr, 'testnet', onChecking)).rejects.toMatchObject({
      reason: 'tx_bad_seq',
    });
    expect(onChecking).not.toHaveBeenCalled();
    expect(lookup).not.toHaveBeenCalled();
  });

  it('on a 504, polls by locally computed hash and resolves to success', async () => {
    const { xdr, hash } = signedXdr();
    let calls = 0;
    const h = horizonWith(
      () => Promise.reject({ response: { status: 504 } }),
      () =>
        ++calls < 3
          ? Promise.reject({ response: { status: 404 } })
          : Promise.resolve({ successful: true }),
    );
    const onChecking = vi.fn();
    await expect(h.submit(xdr, 'testnet', onChecking)).resolves.toBe(hash);
    expect(onChecking).toHaveBeenCalledOnce();
    expect(calls).toBe(3);
  });

  it('reports a clear failure when the transaction never lands before its time bounds', async () => {
    const h = horizonWith(
      () => Promise.reject(new Error('Network Error')),
      () => Promise.reject({ response: { status: 404 } }),
    );
    await expect(h.submit(signedXdr().xdr, 'testnet')).rejects.toMatchObject({
      reason: 'tx_too_late',
    });
  });

  it('says it cannot tell when Horizon stays unreachable, and keeps the hash', async () => {
    const { xdr, hash } = signedXdr();
    const h = horizonWith(
      () => Promise.reject({ response: { status: 504 } }),
      () => Promise.reject(new Error('Network Error')),
    );
    const err = await h.submit(xdr, 'testnet').catch((e: unknown) => e);
    expect(err).toMatchObject({ reason: 'timeout_unknown', hash });
    expect((err as Error).message).not.toMatch(/try again/i);
  });
});
