import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../components/DataTable';
import { Badge, Button } from '../components/ui';
import type { PickList } from '../types';
import { usePickLists } from '../api/hooks/usePicklists';

export const PickingOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  // React Query Hook
  const { data: queryData, isLoading: loading } = usePickLists({ page });

  const data = queryData?.data || [];
  const total = queryData?.total || 0;

  const columns = [
    { key: 'num', header: 'Pick List #', render: (r: PickList) => <span className="font-bold text-neutral-800 dark:text-neutral-100 uppercase tracking-tighter">{r.pickingListNumber}</span> },
    { key: 'orders', header: 'Total Orders', render: (r: PickList) => <span className="font-semibold text-neutral-700 dark:text-neutral-300">{r.totalOrders}</span> },
    { key: 'quantity', header: 'Total Quantity', render: (r: PickList) => <span className="font-semibold text-neutral-700 dark:text-neutral-300">{r.totalQuantity}</span> },
    { key: 'status', header: 'Status', render: (r: PickList) => <Badge color={r.status === 'COMPLETED' ? 'green' : 'orange'}>{r.status.replace('_', ' ')}</Badge> },
    {
      key: 'act',
      header: '',
      render: (r: PickList) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(`/picking/${r.id}`)}
        >
          Pick
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-black text-neutral-900 dark:text-white uppercase tracking-wider">Picking Queue</h1>
          <p className="text-xxs font-medium text-neutral-600 dark:text-neutral-400">Assigned fulfillment tasks for today</p>
        </div>
      </div>

      <DataTable<PickList>
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
