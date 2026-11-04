import { Keypair, MuxedAccount, Account, Operation } from '@stellar/stellar-sdk';
import { describe, expect, it } from 'vitest';
import { buildPaymentTransaction } from './payment';
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
