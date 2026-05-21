import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomTable, Column } from '../components/CustomTable';
import { Badge, Button, Input, SearchableDropdown } from '../components/ui';
import { DatePicker } from '../components/DatePicker';
import { usePurchaseOrders } from '../api/hooks/usePurchaseOrders';
import { useWarehouses } from '../api/hooks/useWarehouses';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AllocationRow {
  id: string;
  barcode: string;
  item: string;
  color: string;
  size: string;
  qty: number;
  store: string;
  allocated: number | null;
}

export interface POSummary {
  purchaseOrderId: string;
  supplierId: string;
  status: string;
  totalProducts: number;
  totalAmount: number;
  totalUnits: number;
  receivingWarehouseId: number;
  expectedDate: string;
  createdAt: string;
  vendorName?: string;
  warehouseName?: string;
  Supplier?: { Name: string };
  Warehouse?: { warehouseName: string };
  rows?: AllocationRow[];
  crossDockFlag?: boolean;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export const PurchaseOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [vendorSearch, setVendorSearch] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [whSearch, setWhSearch] = useState('');
  const [debouncedWhSearch, setDebouncedWhSearch] = useState('');
  const [debouncedVendorSearch, setDebouncedVendorSearch] = useState(vendorSearch);
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedWhSearch(whSearch), 300);
    return () => clearTimeout(timer);
  }, [whSearch]);

  const { data: warehousesData } = useWarehouses({ search: debouncedWhSearch });
  const warehouseOptions = ['ALL', ...(warehousesData?.data?.map((w: any) => w.warehouseName || w.name) || [])];

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedVendorSearch(vendorSearch), 300);
    return () => clearTimeout(timer);
  }, [vendorSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleVendorSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVendorSearch(e.target.value);
    setPage(1);
  };

  const handleWarehouseChange = (val: string) => {
    setWarehouseFilter(val);
    setPage(1);
  };

  const handleDateChange = (val: Date | undefined) => {
    setDateFilter(val);
    setPage(1);
  };

  const dateStr = dateFilter ? format(dateFilter, 'yyyy-MM-dd') : undefined;

  // React Query Hook
  const { data: queryData, isLoading: loading } = usePurchaseOrders({
    page,
    pageSize: 25,
    purchaseOrderId: debouncedSearch !== '' ? debouncedSearch : undefined,
    createdDate: dateStr,
    vendorName: debouncedVendorSearch !== '' ? debouncedVendorSearch : undefined,
    warehouseName: warehouseFilter !== 'ALL' ? warehouseFilter : undefined
  });
  const poList = queryData?.data || [];
  const total = queryData?.total || 0;

  // Local filtered for any extra client-side matching if desired, 
  // but predominantly we rely on the server response now.
  const filtered = poList;

  // ── Columns ──────────────────────────────────────────────────────────────────
  const columns: Column<POSummary>[] = [
    {
      key: 'actions', header: 'Actions',
      className: 'text-left w-24',
      render: (r) => (
        <div className="flex items-center justify-start gap-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/Purchase-Order/${r.purchaseOrderId}`)}
          >
            Details
          </Button>
        </div>
      ),
    },
    {
      key: 'purchaseOrderId', header: 'PO Number',
      render: (r) => (
        <div className="flex flex-col">
          <span className="font-black text-neutral-600 dark:text-neutral-300 text-xs uppercase tracking-tight">
            {r.purchaseOrderId}
          </span>
          <span className="text-[8px] text-neutral-400 uppercase tracking-tight">
            Created: {(() => {
              const d = new Date(r.createdAt);
              return !isNaN(d.getTime()) ? d.toLocaleDateString() : '-';
            })()}
          </span>
        </div>
      ),
    },
    {
      key: 'vendor', header: 'Vendor',
      render: (r) => (
        <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">{r.vendorName || r.Supplier?.Name || '-'}</span>
      ),
    },
    {
      key: 'deliveryDate', header: 'Expected Date', className: 'hidden sm:table-cell',
      render: (r) => (
        <span className="text-[10px] text-neutral-400 tabular-nums font-bold">{r.expectedDate || '-'}</span>
      ),
    },
    {
      key: 'crossDockFlag', header: 'Allocation Plan', className: 'hidden sm:table-cell',
      render: (r) => (
        <Badge color={r.crossDockFlag ? 'green' : 'blue'}>
          {r.crossDockFlag ? 'UPLOADED' : 'PENDING'}
        </Badge>
      ),
    },
    {
      key: 'totalUnits', header: 'Total Qty',
      render: (r) => (
        <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 tabular-nums">{r.totalUnits || 0}</span>
      ),
    },
    {
      key: 'totalProducts', header: 'Items',
      render: (r) => (
        <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 tabular-nums">{r.totalProducts || 0}</span>
      ),
    },
    {
      key: 'status', header: 'Status',
      render: (r) => (
        <Badge color={r.status === 'Received' ? 'green' : 'orange'}>
          {(r.status || '').toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'warehouse', header: 'Warehouse',
      render: (r) => (
        <Badge color="blue">
          {r.warehouseName || r.Warehouse?.warehouseName || '-'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col min-h-0 space-y-3 pb-4 text-left">
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h1 className="text-lg sm:text-xl font-black text-black dark:text-white leading-none tracking-tight">Purchase Orders</h1>
        </div>
        <Button 
          variant="primary" 
          onClick={() => navigate('/Purchase-Order/new')} 
          className="font-bold whitespace-nowrap"
        >
          + NEW ORDER
        </Button>
      </div>

      <div className="bg-white dark:bg-[#232323] p-3 rounded-md border border-neutral-200 dark:border-[#2e2e2e] shrink-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="flex flex-col gap-1.5">
            <DatePicker
              className="w-full"
              triggerClassName="w-full border-neutral-200 dark:border-[#2e2e2e] bg-transparent text-neutral-600 dark:text-neutral-400 text-xs"
              value={dateFilter}
              onChange={handleDateChange}
              placeholder="Date..."
            />
          </div>
          
          <div className="flex flex-col gap-1.5">
             <SearchableDropdown
              className="w-full"
              triggerClassName="w-full border-neutral-200 dark:border-[#2e2e2e] bg-transparent text-neutral-600 dark:text-neutral-400 text-xs truncate"
              options={warehouseOptions}
              value={warehouseFilter}
              onChange={handleWarehouseChange}
              onSearchChange={setWhSearch}
              placeholder="Warehouse..."
              menuTitle="FILTER BY WAREHOUSE"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Input
              placeholder="Purchase Order..."
              value={search}
              onChange={handleSearchChange}
              className="w-full border-neutral-200 dark:border-[#2e2e2e] text-xs bg-transparent"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Input
              placeholder="Vendor Name..."
              value={vendorSearch}
              onChange={handleVendorSearchChange}
              className="w-full border-neutral-200 dark:border-[#2e2e2e] text-xs bg-transparent"
            />
          </div>
        </div>
      </div>

      <CustomTable<POSummary>
        columns={columns}
        data={filtered}
        page={page}
        pageSize={25}
        total={total}
        loading={loading}
        onPageChange={setPage}
        getRowId={r => r.purchaseOrderId}
      />
    </div>
  );
};

export default PurchaseOrderPage;
