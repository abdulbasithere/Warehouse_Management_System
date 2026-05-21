import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomTable, Column } from '../components/CustomTable';
import { Badge, Button, Input } from '../components/ui';
import type { PackingJob } from '../types';
import { fetchPackingQueue } from '../api/client';

export const PackingOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PackingJob[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [basket, setBasket] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchPackingQueue({ page });
      setData(res.data);
      setTotal(res.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const columns = [
    {
      key: 'so', header: 'Order #',
      render: (r: PackingJob) => <span className="text-[11px] font-black text-black dark:text-white uppercase tracking-tighter">{r.saleOrderNumber}</span>
    },
    {
      key: 'basket', header: 'Basket Ref',
      render: (r: PackingJob) => <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase">{r.basketReference}</span>
    },
    {
      key: 'quantity', header: 'Items',
      render: (r: PackingJob) => <span className="text-[11px] font-black text-black dark:text-white tabular-nums">{r.totalQuantity}</span>
    },
    {
      key: 'status', header: 'Status',
      render: (r: PackingJob) => (
        <Badge variant="secondary" className="text-[7px] py-0 h-3.5 px-1.5 font-black border-neutral-200 dark:border-neutral-800">
          {r.status}
        </Badge>
      )
    },
  ];

  return (
    <div className="space-y-3 text-left">
      <div className="flex items-center justify-between bg-neutral-50/50 dark:bg-[#1c1c1c]/50 p-2 rounded-md border border-neutral-100 dark:border-neutral-900">
        <div className="text-left">
          <h1 className="text-[11px] font-black text-black dark:text-white leading-none">Packing Queue</h1>
          <p className="text-[9px] text-neutral-400 font-bold mt-0.5">Verification and manifest generation</p>
        </div>
      </div>

      <div className="flex gap-1.5 p-2 bg-white dark:bg-[#232323] border border-neutral-100 dark:border-neutral-950 rounded-md shadow-sm">
        <div className="flex-1">
          <Input
            placeholder="Scan Basket reference..."
            value={basket}
            onChange={e => setBasket(e.target.value)}
            className="h-8 text-[11px] font-bold"
          />
        </div>
        <Button
          onClick={() => basket && navigate(`/packing/basket/${basket}`)}
          className="h-8 px-4 text-[9px] font-black bg-black dark:bg-white text-white dark:text-black"
        >
          Open Basket
        </Button>
      </div>

      <CustomTable<PackingJob>
        columns={columns}
        data={data}
        page={page}
        pageSize={10}
        total={total}
        loading={loading}
        onPageChange={setPage}
        getRowId={r => r.saleOrderNumber}
      />
    </div>
  );
};
