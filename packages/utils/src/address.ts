/** `GABCDEFG…WXYZ` style truncation for display. Full value should remain copyable. */
export function truncateAddress(address: string, head = 4, tail = 4): string {
  if (address.length <= head + tail + 1) return address;
  return `${address.slice(0, head)}…${address.slice(-tail)}`;
}

export type ExplorerEntity = 'account' | 'tx' | 'asset';

/** Build a block-explorer link. `baseUrl` is VITE_EXPLORER_URL (already network-specific). */
export function explorerUrl(baseUrl: string, entity: ExplorerEntity, id: string): string {
  return `${baseUrl.replace(/\/+$/, '')}/${entity}/${encodeURIComponent(id)}`;
}
