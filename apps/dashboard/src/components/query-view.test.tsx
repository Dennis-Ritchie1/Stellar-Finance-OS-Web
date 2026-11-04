import { render, screen } from '@testing-library/react';
import type { UseQueryResult } from '@tanstack/react-query';
import { ApiError } from '@finance-os/api-client';
import { describe, expect, it } from 'vitest';
import { QueryView } from './query-view';

const q = (partial: Partial<UseQueryResult<string[]>>) => partial as UseQueryResult<string[]>;

describe('QueryView', () => {
  it('shows loading', () => {
    render(<QueryView query={q({ isPending: true })}>{() => null}</QueryView>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows permission denied for 403s', () => {
    render(
      <QueryView
        query={q({ isPending: false, isError: true, error: new ApiError(403) })}
        resource="reports"
      >
        {() => null}
      </QueryView>,
    );
    expect(screen.getByText("You don't have access")).toBeInTheDocument();
  });

  it('shows a retryable error', () => {
    render(
      <QueryView
        query={q({ isPending: false, isError: true, error: new ApiError(500) })}
        resource="reports"
      >
        {() => null}
      </QueryView>,
    );
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('shows empty and data states', () => {
    const { rerender } = render(
      <QueryView
        query={q({ isPending: false, isError: false, data: [] })}
        isEmpty={(d) => !d.length}
        empty="Nothing"
      >
        {(d) => d.join()}
      </QueryView>,
    );
    expect(screen.getByText('Nothing')).toBeInTheDocument();
    rerender(
      <QueryView
        query={q({ isPending: false, isError: false, data: ['a', 'b'] })}
        isEmpty={(d) => !d.length}
        empty="Nothing"
      >
        {(d) => d.join()}
      </QueryView>,
    );
    expect(screen.getByText('a,b')).toBeInTheDocument();
  });
});
