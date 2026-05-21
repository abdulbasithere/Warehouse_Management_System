import React, { useState } from 'react';
import { CustomTable, Column } from '../components/CustomTable';
import { Badge, Button, Input } from '../components/ui';
import type { Order } from '../types';
import { useOrders } from '../api/hooks/useOrders';

export const OrdersPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  // React Query Hook
  const { data: queryData, isLoading: loading } = useOrders({ page, search });

  const data = queryData?.data || [];
  const total = queryData?.total || 0;

  const columns: Column<Order>[] = [
    {
      key: 'num', header: 'Order #',
      render: (r: Order) => <span className="font-bold text-neutral-800 dark:text-neutral-100 uppercase tracking-tighter">{r.saleOrderNumber}</span>
    },
    {
      key: 'customer', header: 'Customer',
      render: (r: Order) => (
        <div className="flex flex-col">
          <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">{r.customer?.name}</span>
          <span className="text-[9px] text-neutral-400">{r.customer?.email}</span>
        </div>
      )
    },
    {
      key: 'date', header: 'Date', className: 'hidden sm:table-cell',
      render: (r: Order) => {
        const d = new Date(r.orderDate);
        return <span className="text-[10px] text-neutral-500 tabular-nums">{!isNaN(d.getTime()) ? d.toLocaleDateString() : '-'}</span>;
      }
    },
    {
      key: 'status', header: 'Status',
      render: (r: Order) => (
        <Badge color={r.status === 'delivered' ? 'green' : r.status === 'new' ? 'orange' : 'blue'}>
          {r.status}
        </Badge>
      )
    },
    {
      key: 'total', header: 'Total',
      render: (r: Order) => <span className="text-[11px] font-black text-neutral-800 dark:text-neutral-100 tabular-nums">{r.orderTotalAmount}</span>
    },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50/50 dark:bg-[#1c1c1c]/50 p-2 rounded-md border border-neutral-100 dark:border-neutral-900">
        <div>
          <h1 className="text-sm font-black text-black dark:text-white ">Orders</h1>
          <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-tighter">Customer transaction history</p>
        </div>
        <Input
          placeholder="Search Order #..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-full sm:w-64 h-8"
        />
      </div>

      <CustomTable<Order>
        columns={columns}
        data={data}
        page={page}
        pageSize={10}
        total={total}
        loading={loading}
        onPageChange={setPage}
      />
    </div>
  );
};
