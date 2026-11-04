import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from './button';
import { StatusBadge } from './status-badge';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Send invoice</Button>);
    expect(screen.getByRole('button', { name: 'Send invoice' })).toBeInTheDocument();
  });
});

describe('StatusBadge', () => {
  it('shows a human label', () => {
    render(<StatusBadge status="partially_paid" />);
    expect(screen.getByText('Partially paid')).toBeInTheDocument();
  });
});
