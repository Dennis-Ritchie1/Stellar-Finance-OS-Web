import { z } from 'zod';
import { isValidAmount } from '@finance-os/utils';

const decimal = (message: string) =>
  z
    .string()
    .trim()
    .refine((v) => isValidAmount(v), message);

export const invoiceFormSchema = z.object({
  clientId: z.string().min(1, 'Choose a client'),
  assetCode: z.enum(['USDC', 'XLM']),
  dueDate: z.string().min(1, 'Choose a due date'),
  notes: z.string().max(500, 'Keep notes under 500 characters'),
  lineItems: z
    .array(
      z.object({
        description: z.string().trim().min(1, 'Describe the item'),
        quantity: decimal('Enter a quantity above 0'),
        unitPrice: decimal('Enter a price above 0 (max 7 decimals)'),
      }),
    )
    .min(1, 'Add at least one line item'),
});

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

export const emptyLineItem = { description: '', quantity: '1', unitPrice: '' };

/** Due dates are picked as local dates; send end-of-day local time as ISO. */
export function toDueDateIso(date: string) {
  return new Date(`${date}T23:59:59`).toISOString();
}

export function fromDueDateIso(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
