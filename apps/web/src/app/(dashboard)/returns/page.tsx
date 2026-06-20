'use client';

import { PageHeader } from '@/components/page-header';
import { ResourceTable } from '@/components/resource-table';
import { StatusBadge } from '@/components/status-badge';
import { dateTime } from '@/lib/api';

type ReturnItem = {
  id: string;
  returnNumber: string;
  status: string;
  reason: string;
  resolution?: string;
  createdAt: string;
  salesOrder: { orderNumber: string; customer: { name: string } };
  items: unknown[];
};

export default function ReturnsPage() {
  return (
    <>
      <PageHeader
        title="Retur"
        description="Pengajuan, review, replacement, dan refund yang terhubung ke order."
      />
      <ResourceTable<ReturnItem>
        endpoint="/returns"
        queryKey="returns"
        columns={[
          {
            key: 'number',
            label: 'Retur',
            render: (row) => <span className="font-mono font-semibold">{row.returnNumber}</span>,
          },
          { key: 'order', label: 'Order', render: (row) => row.salesOrder.orderNumber },
          { key: 'customer', label: 'Pelanggan', render: (row) => row.salesOrder.customer.name },
          { key: 'items', label: 'Item', render: (row) => row.items.length },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
          { key: 'date', label: 'Diajukan', render: (row) => dateTime(row.createdAt) },
        ]}
      />
    </>
  );
}
