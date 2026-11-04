import { useState } from 'react';
import { useOrg, useUpdateOrg } from '@finance-os/api-client';
import {
  Address,
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DescriptionList,
} from '@finance-os/ui';
import { describeWalletError, networkLabel, useWallet } from '@finance-os/wallet';
import { AlertCircle, Wallet } from 'lucide-react';
import { usePermission } from '../../auth/use-permission';
import { FormError } from '../../components/forms/form-error';
import { QueryView } from '../../components/query-view';
import { env } from '../../env';

export function WalletSettingsPage() {
  const org = useOrg();
  const update = useUpdateOrg();
  const wallet = useWallet();
  const canManage = usePermission('settings:manage');
  const [error, setError] = useState<string | null>(null);

  const connect = async () => {
    setError(null);
    try {
      await wallet.connect();
    } catch (e) {
      setError(describeWalletError(e));
    }
  };

  return (
    <QueryView query={org} resource="wallet settings">
      {(o) => (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Linked wallet</CardTitle>
            <CardDescription>
              The wallet your team signs outgoing payments with. Finance OS only ever sees its
              public address.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <DescriptionList
              items={[
                { label: 'Network', value: networkLabel(env.network) },
                {
                  label: 'Linked address',
                  value: o.linkedWalletAddress ? (
                    <Address value={o.linkedWalletAddress} explorerBaseUrl={env.explorerUrl} />
                  ) : (
                    'None'
                  ),
                },
                {
                  label: 'Connected in this browser',
                  value: wallet.address ? <Address value={wallet.address} /> : 'Not connected',
                },
              ]}
            />
            {error ? (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            <FormError error={update.error} />
            <div className="flex flex-wrap gap-2">
              {wallet.address ? (
                <>
                  {canManage && wallet.address !== o.linkedWalletAddress ? (
                    <Button
                      disabled={update.isPending}
                      onClick={() => update.mutate({ linkedWalletAddress: wallet.address! })}
                    >
                      Link this wallet
                    </Button>
                  ) : null}
                  <Button variant="outline" onClick={() => wallet.disconnect()}>
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button onClick={connect} disabled={wallet.status === 'connecting'}>
                  <Wallet /> {wallet.status === 'connecting' ? 'Connecting…' : 'Connect wallet'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </QueryView>
  );
}
