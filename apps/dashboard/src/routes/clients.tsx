import { useState } from 'react';
import { useClients, type Client } from '@finance-os/api-client';
import {
  Address,
  Button,
  EmptyState,
  PageHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@finance-os/ui';
import { Plus, Users } from 'lucide-react';
import { Can } from '../components/can';
import { QueryView } from '../components/query-view';
import { env } from '../env';
import { ClientFormDialog } from '../features/clients/client-form-dialog';

export function ClientsPage() {
  const query = useClients();
  const [dialog, setDialog] = useState<{ open: boolean; client?: Client }>({ open: false });
  const openNew = () => setDialog({ open: true });

  return (
    <>
      <PageHeader
        title="Clients"
        description="The businesses you invoice."
        actions={
          <Can permission="clients:write">
            <Button onClick={openNew}>
              <Plus /> New client
            </Button>
          </Can>
        }
      />
      <QueryView
        query={query}
        resource="clients"
        isEmpty={(clients) => clients.length === 0}
        empty={
          <EmptyState
            icon={<Users />}
            title="No clients yet"
            description="Add a client to start sending invoices."
            action={
              <Can permission="clients:write">
                <Button onClick={openNew}>Add client</Button>
              </Can>
            }
          />
        }
      >
        {(clients) => (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Sender addresses</TableHead>
                <TableHead className="w-0" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>
                    {client.senderAddresses.length ? (
                      <div className="flex flex-col">
                        {client.senderAddresses.map((a) => (
                          <Address key={a} value={a} explorerBaseUrl={env.explorerUrl} />
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Can permission="clients:write">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDialog({ open: true, client })}
                      >
                        Edit
                      </Button>
                    </Can>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </QueryView>
      <ClientFormDialog
        open={dialog.open}
        client={dialog.client}
        onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
      />
    </>
  );
}
