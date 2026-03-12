import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable, Column } from '../components/DataTable';
import { Badge, Button, Input, Select } from '../components/ui';
import type { Order, AllocationStatus } from '../types';
import { useOrders } from '../api/hooks/useOrders';
import { usePickers } from '../api/hooks/useUsers';
import { useCreatePickList } from '../api/hooks/usePicklists';
import { usePutaways, useAssignPickerToPutaway } from '../api/hooks/usePutaway';

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<AllocationStatus | 'ALL'>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedPickerId, setSelectedPickerId] = useState<string>('');

  // New state for Putaway Assignment
  const [targetPutawayId, setTargetPutawayId] = useState<string>('');
  const [targetPickerId, setTargetPickerId] = useState<string>('');

  // React Query Hooks
  const { data: queryData, isLoading: loading } = useOrders({ page, search, status, pageSize: 100 });
  const { data: pickers = [] } = usePickers();
  const { data: putawaysData } = usePutaways({ page: 1, pageSize: 100 });
  const createPickListMutation = useCreatePickList();
  const assignPickerMutation = useAssignPickerToPutaway();

  const data = queryData?.data || [];
  const total = queryData?.total || 0;
  const putaways = putawaysData?.data || [];

  // Set default picker if not set
  React.useEffect(() => {
    if (!selectedPickerId && pickers.length > 0) {
      setSelectedPickerId(pickers[0].id);
    }
  }, [pickers, selectedPickerId]);

  const handleCreatePickList = async () => {
    if (selectedIds.length === 0 || !selectedPickerId) return;

    await createPickListMutation.mutateAsync({
      ids: selectedIds,
      assignedPickerId: selectedPickerId
    });

    setSelectedIds([]);
    alert('Pick List generated.');
  };


  const columns: Column<Order>[] = [
    {
      key: 'so',
      header: 'Order Number',
      render: (r: Order) => (
        <button
          onClick={() => navigate(`/orders/${r.saleOrderNumber}`)}
          className="font-bold text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 transition-all text-left"
        >
          {r.saleOrderNumber}
        </button>
      )
    },
    {
      key: 'odrdate',
      header: 'Order Date',
      render: (r: Order) => <span className="text-neutral-400">{(r.orderDate || '').slice(0, 10)}</span>
    },
    {
      key: 'amt',
      header: 'Total',
      render: (r: Order) => `₨${(r.orderTotalAmount || 0).toLocaleString()}`
    },
    {
      key: 'qty',
      header: 'Qty',
      render: (r: Order) => <span className="font-bold tabular-nums">{r.totalUnitsCount}</span>
    },
    {
      key: 'status',
      header: 'Allocation Status',
      render: (r: Order) => (
        <Badge color={r.allocationStatus === 'AVAILABLE' ? 'green' : r.allocationStatus === 'PARTIAL-AVAILABLE' ? 'orange' : 'red'}>
          {r.allocationStatus}
        </Badge>
      )
    },
    {
      key: 'procStatus',
      header: 'Process Status',
      render: (r: Order) => (
        <Badge color={r.status === 'new' ? 'blue' : 'gray'}>
          {r.status.toUpperCase()}
        </Badge>
      )
    }
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-neutral-50/40 dark:bg-neutral-900/40 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800">
        <div className="space-y-0.5">
          <h1 className="text-xs font-black text-neutral-500 dark:text-neutral-300 uppercase tracking-widest leading-none">Order Management</h1>
          <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-tighter">Inventory Allocation</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Input
            placeholder="Search Order..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-32 h-7"
          />
          <Select
            value={status}
            onChange={e => setStatus(e.target.value as any)}
            className="w-28 h-7"
          >
            <option value="ALL">All Status</option>
            <option value="AVAILABLE">Available</option>
            <option value="PARTIAL-AVAILABLE">Partial Available</option>
            <option value="NOT-AVAILABLE">Not Available</option>
          </Select>
          <div className="h-5 w-px bg-neutral-100 dark:bg-neutral-800"></div>
          <Select
            value={selectedPickerId}
            onChange={e => setSelectedPickerId(e.target.value)}
            disabled={createPickListMutation.isPending}
            className="w-32 h-7"
          >
            <option value="" disabled>Select Picker</option>
            {pickers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
          <Button
            disabled={selectedIds.length === 0 || !selectedPickerId || createPickListMutation.isPending}
            size="sm"
            onClick={handleCreatePickList}
            className="h-7 px-3 text-[9px]"
          >
            {createPickListMutation.isPending ? '...' : `Create Pick (${selectedIds.length})`}
          </Button>
        </div>
      </div>

      <DataTable<Order>
        columns={columns}
        data={data}
        page={page}
        pageSize={100}
        total={total}
        loading={loading}
        onPageChange={setPage}
        selectableRows
        selectedRowIds={selectedIds}
        getRowId={r => r.saleOrderNumber}
        onSelectionChange={setSelectedIds}
        isRowSelectable={r => r.allocationStatus === 'AVAILABLE' && r.status === 'new'}
      />
    </div>
  );
};