import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomTable, Column } from '../components/CustomTable';
import { Badge, Button, Input, Dropdown, DropdownItem, SearchableDropdown } from '../components/ui';
import { useInboundShipments } from '../api/hooks/useInboundShipments';
import { useWarehouses } from '../api/hooks/useWarehouses';
import { ChevronDown } from 'lucide-react';
import { uploadCrossDockPlan } from '../api/endpoints/purchaseOrderApi';
import { toast } from 'react-toastify';
import { DatePicker } from '../components/DatePicker';
import { isSameDay, startOfDay, format } from 'date-fns';

export interface InboundShipment {
  id: string;
  inboundShipmentId?: string;
  refNo: string;
  poNumber: string;
  shipment: string;
  supplierName: string;
  warehouse: string;
  department?: string;
  quantity: number;
  status: string;
  date: string;
}

export const InboundShipmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [poSearch, setPoSearch] = useState('');
  const [debouncedPoSearch, setDebouncedPoSearch] = useState(poSearch);

  const [warehouseFilter, setWarehouseFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

  const [whSearch, setWhSearch] = useState('');
  const [debouncedWhSearch, setDebouncedWhSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedPoSearch(poSearch), 300);
    return () => clearTimeout(timer);
  }, [poSearch]);

  const onWarehouseFilterChange = (val: string) => {
    setWarehouseFilter(val);
    setPage(1);
  };

  const onDateFilterChange = (val: Date | undefined) => {
    setDateFilter(val);
    setPage(1);
  };

  const onPoSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPoSearch(e.target.value);
    setPage(1);
  };

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedWhSearch(whSearch), 300);
    return () => clearTimeout(timer);
  }, [whSearch]);

  const dateStr = dateFilter ? format(dateFilter, 'yyyy-MM-dd') : undefined;

  // React Query Hooks
  const { data: queryData, isLoading: loading } = useInboundShipments({
    page,
    pageSize: 25,
    search: debouncedSearch !== '' ? debouncedSearch : undefined,
    purchaseOrderId: debouncedPoSearch !== '' ? debouncedPoSearch : undefined,
    date: dateStr
  });
  const shipments = queryData?.data || [];
  const total = queryData?.total || 0;
  const { data: warehousesData } = useWarehouses({ search: debouncedWhSearch });
  const warehouses = warehousesData?.data || [];

  // Import state
  const [importing, setImporting] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importTargetRef = useRef<string | null>(null);

  const triggerImport = (shipmentNumber: string) => {
    importTargetRef.current = shipmentNumber;
    fileInputRef.current?.click();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const target = importTargetRef.current;
    if (!file || !target) return;

    setImporting(target);
    try {
      await uploadCrossDockPlan(file, target);
      toast.success(`Cross dock plan uploaded successfully for shipment ${target}`);
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast.error(error.message || 'Failed to upload cross dock plan');
    } finally {
      setImporting(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const filteredData = shipments.filter((s: any) => {
    const warehouse = s.warehouse || s.warehouseName || s.WarehouseName || s.Warehouse?.warehouseName || '';
    const matchesWarehouse = warehouseFilter === 'ALL' || warehouse === warehouseFilter;
    
    return matchesWarehouse;
  });

  const columns: Column<InboundShipment>[] = [
    { key: 'actions', header: 'Actions', className: 'text-left w-32', render: (r: any) => {
      const id = r.id || r.inboundShipmentId;
      const poId = r.purchaseOrderId || r.poNumber || r.PONumber;
      const shipmentNo = r.shipmentNumber || r.shipmentNo || r.ShipmentNo || r.refNo;
      
      return (
        <div className="flex items-center justify-start gap-1">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => triggerImport(shipmentNo)}
            loading={importing === shipmentNo}
          >
            Import
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate(`/inbound-shipments/${shipmentNo}/scan`)}>Scan</Button>
          <Button variant="secondary" size="sm" onClick={() => navigate(`/inbound-shipments/${shipmentNo}`)}>Details</Button>
        </div>
      );
    } },
    { 
      key: 'refNo', 
      header: 'Reference', 
      render: (r: any) => {
        const ref = r.shipmentNumber || r.shipmentNo || r.ShipmentNo || r.refNo || r.RefNo || r.inboundShipmentId || '-';
        return (
          <div className="flex flex-col">
            <span className="font-black text-neutral-600 dark:text-neutral-300 text-xs uppercase tracking-tight">{ref}</span>
          </div>
        );
      } 
    },
    { 
      key: 'supplierName', 
      header: 'Supplier', 
      render: (r: any) => {
        const name = r.supplierName || r.SupplierName || r.Supplier?.name || r.Supplier?.Name || '-';
        return <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">{name}</span>;
      }
    },
    { 
      key: 'warehouse', 
      header: 'Warehouse', 
      render: (r: any) => {
        const name = r.warehouseName || r.warehouse || r.WarehouseName || r.Warehouse?.warehouseName || r.Warehouse?.name || '-';
        return <Badge color="blue">{name}</Badge>;
      }
    },
    { key: 'status', header: 'Status', render: (r: any) => (
      <Badge color={r.status === 'DRAFT' ? 'gray' : r.status === 'PENDING' ? 'orange' : 'green'}>
        {r.status || r.Status || '-'}
      </Badge>
    ) },
    { 
      key: 'date', 
      header: 'Date', 
      className: 'hidden sm:table-cell', 
      render: (r: any) => {
        const dateVal = r.date || r.Date || r.arrivalDate || r.ArrivalDate || r.createdAt || r.CreatedAt;
        const d = dateVal ? new Date(dateVal) : null;
        const formattedDate = d && !isNaN(d.getTime()) ? d.toLocaleDateString() : '-';
        return <span className="text-[10px] text-neutral-400 font-bold tabular-nums">{formattedDate}</span>;
      }
    },
  ];

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col min-h-0 space-y-3 pb-4 text-left">
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h1 className="text-lg sm:text-xl font-black text-black dark:text-white leading-none tracking-tight">Inbound</h1>
        </div>
        <Button 
          variant="primary" 
          onClick={() => navigate('/inbound-shipments/new')}
          className="font-bold whitespace-nowrap"
        >
          + NEW SHIPMENT
        </Button>
      </div>

      <div className="bg-white dark:bg-[#232323] p-3 rounded-md border border-neutral-200 dark:border-[#2e2e2e] shrink-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="flex flex-col gap-1.5">
            <DatePicker
              className="w-full"
              triggerClassName="w-full border-neutral-200 dark:border-[#2e2e2e] bg-transparent text-neutral-600 dark:text-neutral-400 text-xs"
              value={dateFilter}
              onChange={onDateFilterChange}
              placeholder="Date..."
            />
          </div>

          <div className="flex flex-col gap-1.5">
             <SearchableDropdown
              className="w-full"
              triggerClassName="w-full border-neutral-200 dark:border-[#2e2e2e] bg-transparent text-neutral-600 dark:text-neutral-400 text-xs truncate"
              options={['ALL', ...warehouses.map((w: any) => w.warehouseName || w.name)]}
              value={warehouseFilter}
              onChange={onWarehouseFilterChange}
              onSearchChange={setWhSearch}
              placeholder="Warehouse..."
              menuTitle="Filter by Warehouse"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Input
              placeholder="Purchase Order..."
              value={poSearch}
              onChange={onPoSearchChange}
              className="w-full border-neutral-200 dark:border-[#2e2e2e] text-xs bg-transparent"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Input
              placeholder="Shipment ID..."
              value={search}
              onChange={onSearchChange}
              className="w-full border-neutral-200 dark:border-[#2e2e2e] text-xs bg-transparent"
            />
          </div>
        </div>
      </div>

      <input type="file" accept=".xlsx,.xls" className="hidden" ref={fileInputRef} onChange={handleImport} />

      <CustomTable<InboundShipment>
        columns={columns}
        data={filteredData}
        page={page}
        pageSize={25}
        total={total}
        loading={loading}
        onPageChange={setPage}
        getRowId={r => r.id || r.inboundShipmentId || Math.random().toString()}
      />
    </div>
  );
};

export default InboundShipmentsPage;
