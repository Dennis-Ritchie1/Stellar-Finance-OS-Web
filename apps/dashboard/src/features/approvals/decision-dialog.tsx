import { useEffect, useState } from 'react';
import {
  useApprovePaymentRequest,
  useRejectPaymentRequest,
  type PaymentRequest,
} from '@finance-os/api-client';
import {
  Amount,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  Textarea,
} from '@finance-os/ui';
import { FormError } from '../../components/forms/form-error';

export type Decision = 'approve' | 'reject';

export function DecisionDialog({
  request,
  decision,
  onClose,
}: {
  request: PaymentRequest | null;
  decision: Decision;
  onClose: () => void;
}) {
  const approve = useApprovePaymentRequest();
  const reject = useRejectPaymentRequest();
  const mutation = decision === 'approve' ? approve : reject;
  const [comment, setComment] = useState('');
  const [touched, setTouched] = useState(false);
  const needsComment = decision === 'reject' && !comment.trim();

  useEffect(() => {
    setComment('');
    setTouched(false);
    approve.reset();
    reject.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset when a new request opens
  }, [request?.id, decision]);

  if (!request) return null;

  const submit = () => {
    setTouched(true);
    if (needsComment) return;
    mutation.mutate(
      { id: request.id, comment: comment.trim() || undefined },
      { onSuccess: onClose },
    );
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{decision === 'approve' ? 'Approve payment' : 'Reject payment'}</DialogTitle>
          <DialogDescription>
            <Amount value={request.amount} assetCode={request.assetCode} /> to {request.vendorName}
            {request.description ? ` · ${request.description}` : ''}
          </DialogDescription>
        </DialogHeader>
        <FormError error={mutation.error} />
        <Field
          label={decision === 'approve' ? 'Comment (optional)' : 'Reason'}
          htmlFor="decision-comment"
          error={touched && needsComment ? 'Tell the requester why' : undefined}
        >
          <Textarea
            id="decision-comment"
            rows={3}
            value={comment}
            aria-invalid={touched && needsComment}
            onChange={(e) => setComment(e.target.value)}
          />
        </Field>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={decision === 'approve' ? 'default' : 'destructive'}
            disabled={mutation.isPending}
            onClick={submit}
          >
            {mutation.isPending ? 'Saving…' : decision === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
