import React, { useState } from 'react';
import { CustomTable, Column } from '../components/CustomTable';
import { Badge, Button, Input } from '../components/ui';
import { useAdjustmentHistory, useCreateAdjustment } from '../api/hooks/useInventory';

interface InventoryAdjustment {
  id: string;
  sku: string;
  productName: string;
  adjustmentType: string;
  quantity: number;
  reason: string;
  date: string;
}

export const InventoryAdjustmentsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [sku, setSku] = useState('');
  const [qty, setQty] = useState('');
  const [reason, setReason] = useState('');

  const { data: queryData, isLoading: loading } = useAdjustmentHistory({ page });
  const adjustMutation = useCreateAdjustment();

  const data = queryData?.data || [];
  const total = queryData?.total || 0;

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku || !qty) return;
    await adjustMutation.mutateAsync({
      sku,
      quantity: parseInt(qty),
      reason,
      type: parseInt(qty) > 0 ? 'ADD' : 'SUBTRACT'
    });
    setSku('');
    setQty('');
    setReason('');
  };

  const columns: Column<InventoryAdjustment>[] = [
    { key: 'sku', header: 'SKU', render: (r) => <span className="font-bold text-neutral-800 dark:text-neutral-100 uppercase tracking-tighter">{r.sku}</span> },
    { key: 'type', header: 'Type', render: (r) => <Badge color={r.adjustmentType === 'ADD' ? 'green' : 'red'}>{r.adjustmentType}</Badge> },
    { key: 'qty', header: 'Qty', render: (r) => <span className="text-[11px] font-black text-neutral-800 dark:text-neutral-100 tabular-nums">{r.quantity}</span> },
    { key: 'reason', header: 'Reason', render: (r) => <span className="text-[10px] text-neutral-500">{r.reason}</span> },
    { key: 'date', header: 'Date', render: (r) => {
      const d = new Date(r.date);
      return <span className="text-[10px] text-neutral-500 tabular-nums">{!isNaN(d.getTime()) ? d.toLocaleString() : '-'}</span>;
    } },
  ];

  return (
    <div className="space-y-3 pb-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50/50 dark:bg-[#1c1c1c]/50 p-2 rounded-md border border-neutral-100 dark:border-neutral-900">
        <div className="text-left">
          <h1 className="text-sm font-black text-black dark:text-white leading-none">Adjustments</h1>
          <p className="text-[9px] text-neutral-400 font-bold mt-0.5">Manual stock corrections</p>
        </div>
      </div>

      <div className="p-3 bg-neutral-50/50 dark:bg-[#1c1c1c]/40 border border-neutral-100 dark:border-neutral-900 rounded-md shadow-sm space-y-2">
        <h2 className="text-[10px] font-black uppercase text-neutral-400 tracking-widest px-1">New Adjustment</h2>
        <form onSubmit={handleAdjust} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest px-1">SKU Code</label>
            <Input placeholder="SKU..." value={sku} onChange={e => setSku(e.target.value)} required className="bg-white dark:bg-[#1c1c1c]" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest px-1">Quantity (+/-)</label>
            <Input placeholder="Qty..." type="number" value={qty} onChange={e => setQty(e.target.value)} required className="bg-white dark:bg-[#1c1c1c]" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest px-1">Reason</label>
            <Input placeholder="Reason..." value={reason} onChange={e => setReason(e.target.value)} className="bg-white dark:bg-[#1c1c1c]" />
          </div>
          <Button type="submit" disabled={adjustMutation.isPending} className="w-full font-bold">
            {adjustMutation.isPending ? 'APPLYING...' : 'APPLY ADJUSTMENT'}
          </Button>
        </form>
      </div>

      <CustomTable<InventoryAdjustment>
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
