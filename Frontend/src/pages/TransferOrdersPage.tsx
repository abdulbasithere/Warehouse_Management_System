import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomTable, Column } from '../components/CustomTable';
import { Badge, Button, Input } from '../components/ui';
import { useTransferOrders } from '../api/hooks/useTransferOrders';
import { toast } from 'react-toastify';

export interface TransferOrderSummary {
  id: number;
  transferNumber: string;
  fromWarehouseId: number;
  toWarehouseId: number;
  status: string;
  transferDate: string;
  createdAt: string;
  FromWarehouse?: { warehouseName: string };
  ToWarehouse?: { warehouseName: string };
}

export const TransferOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // React Query Hook
  const { data: queryData, isLoading: loading } = useTransferOrders(debouncedSearch);
  const toList = queryData?.data || [];

  const filtered = toList;

  const columns: Column<TransferOrderSummary>[] = [
    {
      key: 'transferNumber', header: 'Transfer Number',
      render: (r) => (
        <div className="flex flex-col">
          <span className="font-black text-neutral-600 dark:text-neutral-300 text-xs uppercase tracking-tight">
            {r.transferNumber}
          </span>
          <span className="text-[8px] text-neutral-400 uppercase tracking-tight">
            Created: {(() => {
              const d = new Date(r.createdAt || r.transferDate);
              return !isNaN(d.getTime()) ? d.toLocaleDateString() : '-';
            })()}
          </span>
        </div>
      ),
    },
    {
      key: 'fromWarehouse', header: 'From Warehouse',
      render: (r) => (
        <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">{r.FromWarehouse?.warehouseName || '-'}</span>
      ),
    },
    {
      key: 'toWarehouse', header: 'To Warehouse',
      render: (r) => (
        <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">{r.ToWarehouse?.warehouseName || '-'}</span>
      ),
    },
    {
      key: 'transferDate', header: 'Transfer Date', className: 'hidden sm:table-cell',
      render: (r) => (
        <span className="text-[10px] text-neutral-400 tabular-nums font-bold">{r.transferDate || '-'}</span>
      ),
    },
    {
      key: 'status', header: 'Status',
      render: (r) => (
        <Badge color={r.status === 'Received' ? 'green' : r.status === 'Shipped' ? 'blue' : 'orange'}>
          {(r.status || '').toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'actions', header: '',
      className: 'text-right',
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/transfer-orders/${r.transferNumber}`)}
          >
            Details
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-3 pb-4 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50/50 dark:bg-[#1c1c1c]/50 p-2 rounded-md border border-neutral-100 dark:border-neutral-900">
        <div className="text-left">
          <h1 className="text-sm font-black text-black dark:text-white leading-none">Transfer Orders</h1>
          <p className="text-[9px] text-neutral-400 font-bold mt-0.5">Warehouse to warehouse transfers</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search TOs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full sm:w-48"
          />
          <Button 
            variant="primary" 
            onClick={() => navigate('/transfer-orders/new')} 
            className="font-bold whitespace-nowrap"
          >
            + NEW TRANSFER
          </Button>
        </div>
      </div>

      <CustomTable<TransferOrderSummary>
        columns={columns}
        data={filtered}
        page={page}
        pageSize={50}
        total={filtered.length}
        loading={loading}
        onPageChange={setPage}
        getRowId={r => r.transferNumber}
      />
    </div>
  );
};

export default TransferOrdersPage;
