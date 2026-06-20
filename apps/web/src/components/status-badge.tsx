export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const color =
    normalized.includes('paid') ||
    normalized.includes('delivered') ||
    normalized.includes('active') ||
    normalized.includes('completed')
      ? 'bg-emerald-50 text-emerald-700'
      : normalized.includes('cancel') ||
          normalized.includes('failed') ||
          normalized.includes('reject') ||
          normalized.includes('disabled')
        ? 'bg-red-50 text-red-700'
        : 'bg-amber-50 text-amber-700';
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${color}`}>
      {status.replaceAll('_', ' ')}
    </span>
  );
}
