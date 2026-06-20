'use client';

import { PageHeader } from '@/components/page-header';
import { ResourceTable } from '@/components/resource-table';
import { StatusBadge } from '@/components/status-badge';
import { dateTime } from '@/lib/api';

type Complaint = {
  id: string;
  ticketNumber: string;
  subject: string;
  status: string;
  createdAt: string;
  salesOrder: { orderNumber: string; customer: { name: string } };
  messages: unknown[];
};

export default function ComplaintsPage() {
  return (
    <>
      <PageHeader
        title="Keluhan pelanggan"
        description="Ticket, riwayat komunikasi, dan status penyelesaian."
      />
      <ResourceTable<Complaint>
        endpoint="/complaints"
        queryKey="complaints"
        columns={[
          {
            key: 'ticket',
            label: 'Ticket',
            render: (row) => <span className="font-mono font-semibold">{row.ticketNumber}</span>,
          },
          {
            key: 'subject',
            label: 'Subjek',
            render: (row) => (
              <div>
                <p className="font-semibold">{row.subject}</p>
                <p className="text-xs text-slate-500">{row.salesOrder.customer.name}</p>
              </div>
            ),
          },
          { key: 'order', label: 'Order', render: (row) => row.salesOrder.orderNumber },
          { key: 'messages', label: 'Pesan', render: (row) => row.messages.length },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
          { key: 'date', label: 'Dibuat', render: (row) => dateTime(row.createdAt) },
        ]}
      />
    </>
  );
}
