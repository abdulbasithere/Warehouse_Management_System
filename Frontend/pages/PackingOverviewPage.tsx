
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../components/DataTable';
import { Badge, Button, ProgressBar, Input } from '../components/ui';
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
    const res = await fetchPackingQueue({ page });
    setData(res.data);
    setTotal(res.total);
    setLoading(false);
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const columns = [
    { key: 'so', header: 'Order #', render: (r: PackingJob) => <span className="font-bold text-black dark:text-white">{r.saleOrderNumber}</span> },
    { key: 'basket', header: 'Basket Refrence', render: (r: PackingJob) => <span className="font-semibold text-neutral-700 dark:text-neutral-300">{r.basketReference}</span> },
    { key: 'quantity', header: 'Total Quantity', render: (r: PackingJob) => <span className="font-semibold text-neutral-700 dark:text-neutral-300">{r.totalQuantity}</span> },
    { key: 'status', header: 'Status', render: (r: PackingJob) => <Badge color={r.status === 'PACKED' ? 'green' : 'orange'}>{r.status}</Badge> },
    // { key: 'act', header: '', render: (r: PackingJob) => <Button variant="secondary" size="sm" onClick={() => navigate(`/packing/${r.saleOrderNumber}`)}>Pack</Button> }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-black dark:text-white uppercase tracking-wider">Packing Queue</h1>
          <p className="text-xxs text-neutral-400">Verification and manifest generation</p>
        </div>
      </div>

      <div className="flex gap-2 p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-900 rounded">
        <div className="flex-1">
          <Input placeholder="Scan Basket to jump..." value={basket} onChange={e => setBasket(e.target.value)} />
        </div>
        <Button onClick={() => basket && navigate(`/packing/basket/${basket}`)}>Open Basket</Button>
      </div>

      <DataTable<PackingJob>
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
