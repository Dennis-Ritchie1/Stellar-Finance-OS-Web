import { Button, Card, CardDescription, CardHeader, CardTitle, CardContent } from '@finance-os/ui';
import { Wallet } from 'lucide-react';

/** Connect a browser wallet and pay in one step. Wired to packages/wallet in task #6. */
export function ConnectWalletPay() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pay with a connected wallet</CardTitle>
        <CardDescription>Freighter, xBull, Lobstr and other Stellar wallets.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button className="w-full" size="lg" disabled>
          <Wallet /> Connect wallet &amp; pay
        </Button>
      </CardContent>
    </Card>
  );
}
