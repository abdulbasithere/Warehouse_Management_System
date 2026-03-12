import React, { useState, useRef } from 'react';
import { DataTable, Column } from '../components/DataTable';
import { Button, Input } from '../components/ui';
import type { ShelfLocation } from '../types';
import {
  useShelfLocations,
  useCreateShelfLocation,
  useBulkCreateShelfLocations
} from '../api/hooks/useShelfLocations';

export const ShelfLocationsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  // React Query Hooks
  const { data: queryData, isLoading: loading } = useShelfLocations({ page, pageSize: 100, search });
  const createShelfMutation = useCreateShelfLocation();
  const bulkCreateMutation = useBulkCreateShelfLocations();

  const data = queryData?.data || [];
  const total = queryData?.total || 0;

  // Registration form state
  const [aisle, setAisle] = useState('');
  const [shelfLevel, setShelfLevel] = useState('');
  const [basket, setBasket] = useState('');

  // File upload state
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aisle || !shelfLevel || !basket) return;
    await createShelfMutation.mutateAsync({
      aisle: aisle.toUpperCase(),
      shelfLevel: shelfLevel.toUpperCase(),
      basket: basket.toUpperCase(),
      currentOccupancy: 0
    });
    setAisle('');
    setShelfLevel('');
    setBasket('');
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    try {
      await bulkCreateMutation.mutateAsync(formData);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const columns: Column<ShelfLocation>[] = [
    {
      key: 'id',
      header: 'Shelf ID',
      render: (r: ShelfLocation) => <span className="text-[10px] font-black text-neutral-600 dark:text-neutral-300 font-mono tracking-tight">{r.id}</span>
    },
    {
      key: 'aisle',
      header: 'Aisle',
      render: (r: ShelfLocation) => <span className="text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-wider">{r.aisle}</span>
    },
    {
      key: 'shelf',
      header: 'Level',
      render: (r: ShelfLocation) => <span className="text-neutral-400 dark:text-neutral-500 font-bold uppercase">{r.shelfLevel}</span>
    },
    {
      key: 'basket',
      header: 'Basket',
      render: (r: ShelfLocation) => <span className="text-neutral-400 dark:text-neutral-500 font-bold uppercase">{r.basket}</span>
    },
    {
      key: 'occupancy',
      header: 'Occupancy',
      render: (r: ShelfLocation) => (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.currentOccupancy > 0
            ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
            : 'bg-neutral-50 text-neutral-400 dark:bg-neutral-900/50'
          }`}>
          {r.currentOccupancy || 0} Units
        </span>
      )
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xs font-black text-neutral-500 dark:text-neutral-300 uppercase tracking-widest leading-none">Shelves</h1>
          <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest mt-0.5">Warehouse Layout</p>
        </div>

        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input
              placeholder="Search ID..."
              value={search}
              onChange={handleSearchChange}
              className="w-full sm:w-32 h-7"
            />
            <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileImport} />
            <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} disabled={bulkCreateMutation.isPending}>
              {bulkCreateMutation.isPending ? '...' : 'Import'}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-3 bg-neutral-50/50 dark:bg-neutral-900/40 border border-neutral-100 dark:border-neutral-800 rounded-xl shadow-sm space-y-2">
        <h2 className="text-[8px] font-black uppercase text-neutral-400 tracking-[0.2em] px-1">New Location</h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
          <Input placeholder="Aisle (e.g. A01)" value={aisle} onChange={e => setAisle(e.target.value)} required />
          <Input placeholder="Level (e.g. L02)" value={shelfLevel} onChange={e => setShelfLevel(e.target.value)} required />
          <Input placeholder="Basket (e.g. B05)" value={basket} onChange={e => setBasket(e.target.value)} required />
          <Button type="submit" disabled={createShelfMutation.isPending}>
            {createShelfMutation.isPending ? '...' : 'Add Location'}
          </Button>
        </form>
      </div>

      <DataTable<ShelfLocation>
        columns={columns}
        data={data}
        page={page}
        pageSize={100}
        total={total}
        loading={loading}
        onPageChange={setPage}
      />
    </div>
  );
};