import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomTable, Column } from '../components/CustomTable';
import { Button, Input, Dropdown, DropdownItem, SearchableDropdown } from '../components/ui';
import type { ShelfLocation } from '../types';
import { ChevronDown, Search, Upload, Plus } from 'lucide-react';
import {
  useShelfLocations,
  useBulkCreateShelfLocations
} from '../api/hooks/useShelfLocations';
import { useWarehouses } from '../api/hooks/useWarehouses';

export const ShelfLocationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [warehouseId, setWarehouseId] = useState<string | number>('');

  // React Query Hooks
  const { data: queryData, isLoading: loading } = useShelfLocations({ page, pageSize: 100, search: debouncedSearch, warehouseId });
  const { data: warehousesData } = useWarehouses({});
  const warehouses = warehousesData?.data || [];
  const bulkCreateMutation = useBulkCreateShelfLocations();

  const data = queryData?.data || [];
  const total = queryData?.total || 0;

  // File upload state
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
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

  const columns: Column<any>[] = [
    {
      key: 'id',
      header: 'Location',
      render: (r: any) => (
        <div className="flex flex-col">
          <span className="font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-tight">{r.id || r.ShelfID}</span>
          <span className="text-[8px] text-neutral-400 uppercase tracking-tight">Aisle: {r.aisle || r.Aisle} | Level: {r.shelfLevel || r.ShelfLevel}</span>
        </div>
      )
    },
    {
      key: 'basket',
      header: 'Basket',
      render: (r: any) => <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase">{r.basket || r.Basket || '-'}</span>
    },
    {
      key: 'warehouse',
      header: 'Warehouse',
      render: (r: any) => {
        const whId = r.warehouseId || r.WarehouseID;
        const w = warehouses.find((wh: any) => String(wh.id) === String(whId));
        return <span className="text-[10px] text-neutral-400 font-bold uppercase">{w?.name || w?.warehouseName || whId || '-'}</span>;
      }
    },
    {
      key: 'occupancy',
      header: 'Occupancy',
      render: (r: any) => {
        const occupancy = r.currentOccupancy !== undefined ? r.currentOccupancy : (r.CurrentOccupancy !== undefined ? r.CurrentOccupancy : 0);
        return (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${occupancy > 0
              ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
              : 'bg-neutral-50 text-neutral-400 dark:bg-[#1c1c1c]/50'
            }`}>
            {occupancy} Units
          </span>
        );
      }
    },
    {
        key: 'actions', 
        header: '',
        className: 'text-right',
        render: (r: any) => (
            <div className="flex justify-end">
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/shelf-locations/edit/${r.id || r.ShelfID}`)}
                >
                    Details
                </Button>
            </div>
        ),
    },
  ];

  const selectedWarehouse = warehouses.find(w => String(w.id) === String(warehouseId));

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-3 pb-4 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50/50 dark:bg-[#1c1c1c]/50 p-2 rounded-md border border-neutral-100 dark:border-neutral-900">
        <div className="text-left">
          <h1 className="text-sm font-black text-black dark:text-white leading-none">Shelf-Locations</h1>
          <p className="text-[9px] text-neutral-400 font-bold mt-0.5">Warehouse Topology</p>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 w-full md:w-auto">
          <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
            <SearchableDropdown
              className="w-full sm:w-auto min-w-[140px]"
              triggerClassName="border-dashed border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-600 dark:text-neutral-400 uppercase tracking-wider"
              options={['ALL WAREHOUSES', ...warehouses.map((w: any) => (w.warehouseName || w.name)?.toUpperCase())]}
              value={selectedWarehouse ? (selectedWarehouse.warehouseName || selectedWarehouse.name || '').toUpperCase() : 'ALL WAREHOUSES'}
              onChange={(val) => {
                const wh = warehouses.find((w: any) => (w.warehouseName || w.name)?.toUpperCase() === val);
                setWarehouseId(wh ? wh.id : '');
              }}
              placeholder="Warehouse"
            />
            
            <Input
              placeholder="Search locations..."
              value={search}
              onChange={handleSearchChange}
              className="w-full sm:w-64 lg:w-48"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileImport} />
            <Button 
              variant="secondary" 
              onClick={() => fileInputRef.current?.click()} 
              disabled={bulkCreateMutation.isPending}
              className="w-full sm:w-auto font-bold"
            >
              {bulkCreateMutation.isPending ? '...' : 'IMPORT'}
            </Button>

            <Button 
              variant="primary" 
              onClick={() => navigate('/shelf-locations/new')}
              className="w-full sm:w-auto font-bold whitespace-nowrap"
            >
              + ADD LOCATION
            </Button>
          </div>
        </div>
      </div>

      <CustomTable<ShelfLocation>
        columns={columns}
        data={data}
        page={page}
        pageSize={100}
        total={total}
        loading={loading}
        onPageChange={setPage}
        getRowId={r => String(r.id || r.ShelfID || Math.random().toString())}
      />
    </div>
  );
};

export default ShelfLocationsPage;
