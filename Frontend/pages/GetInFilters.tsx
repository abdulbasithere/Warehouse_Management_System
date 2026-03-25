import React from 'react';
import { Button, Input } from '../components/ui';

interface GetInFiltersProps {
  search: string;
  warehouseFilter: string;
  statusFilter: string;
  onSearchChange: (val: string) => void;
  onWarehouseChange: (val: string) => void;
  onStatusChange: (val: string) => void;
  onClear: () => void;
}

const WAREHOUSES = ['All', 'WH-A', 'WH-B', 'WH-C'];
const STATUSES   = ['All', 'received', 'pending', 'in_transit', 'draft'];

const selectCls = `
  h-8 px-2 text-[10px] font-bold uppercase tracking-widest rounded-lg
  bg-white dark:bg-neutral-900
  border border-neutral-100 dark:border-neutral-800
  text-neutral-500 dark:text-neutral-400
  focus:outline-none focus:ring-1 focus:ring-neutral-300
`;

export const GetInFilters: React.FC<GetInFiltersProps> = ({
  search, warehouseFilter, statusFilter,
  onSearchChange, onWarehouseChange, onStatusChange, onClear,
}) => {
  const isDirty = search || warehouseFilter !== 'All' || statusFilter !== 'All';

  return (
    <div className="flex flex-wrap gap-2">
      <Input
        placeholder="Search PO, Ref No, Shipment..."
        value={search}
        onChange={e => onSearchChange(e.target.value)}
        className="h-8 text-xs min-w-[220px]"
      />
      <select value={warehouseFilter} onChange={e => onWarehouseChange(e.target.value)} className={selectCls}>
        {WAREHOUSES.map(w => (
          <option key={w} value={w}>{w === 'All' ? 'All Warehouses' : w}</option>
        ))}
      </select>
      <select value={statusFilter} onChange={e => onStatusChange(e.target.value)} className={selectCls}>
        {STATUSES.map(s => (
          <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s.replace('_', ' ')}</option>
        ))}
      </select>
      {isDirty && (
        <Button variant="ghost" size="sm" onClick={onClear} className="h-8 text-[9px]">
          Clear
        </Button>
      )}
    </div>
  );
};