import * as React from 'react';

/** Accessible table view of chart data, collapsed by default. */
export function ChartTable({
  caption,
  columns,
  rows,
}: {
  caption: string;
  columns: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <details className="mt-3 text-sm">
      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
        View as table
      </summary>
      <div className="mt-2 max-h-64 overflow-auto rounded-md border">
        <table className="w-full">
          <caption className="sr-only">{caption}</caption>
          <thead className="sticky top-0 bg-muted text-left text-muted-foreground">
            <tr>
              {columns.map((c, i) => (
                <th
                  key={c}
                  className={i ? 'px-3 py-1.5 text-right font-medium' : 'px-3 py-1.5 font-medium'}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t">
                {r.map((cell, j) => (
                  <td key={j} className={j ? 'px-3 py-1.5 text-right tabular-nums' : 'px-3 py-1.5'}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
