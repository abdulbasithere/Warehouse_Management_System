import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable, Column } from '../components/DataTable';
import { Badge, Button, Input } from '../components/ui';
import * as XLSX from 'xlsx';
import { getAllPurchaseOrders } from '../api/endpoints/purchaseOrderApi';

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
  id: number;
  PurchaseOrderID: number;
  Number: string;
  SupplierID: number;
  Status: string;
  TotalProducts: number;
  TotalAmount: number;
  TotalUnits: number;
  ReceivingWarehouseID: number;
  ExpectedDate: string;
  CreateDate: string;
  Supplier?: { Name: string };
  Warehouse?: { CompanyName: string };
  rows?: AllocationRow[];
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export const PurchaseOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [poList, setPOList] = useState<POSummary[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  // Per-PO import state: key = poNumber
  const [importing, setImporting] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importTargetRef = useRef<string | null>(null);

  useEffect(() => {
    const fetchPOs = async () => {
      try {
        setLoading(true);
        const data = await getAllPurchaseOrders();
        console.log(data);
        setPOList(data);
      } catch (error) {
        console.error('Failed to fetch POs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPOs();
  }, []);

  const filtered = poList.filter(p =>
    p.Number.toLowerCase().includes(search.toLowerCase()) ||
    (p.Supplier?.Name || '').toLowerCase().includes(search.toLowerCase())
  );

  // ── Per-PO Excel Import ──────────────────────────────────────────────────────
  const triggerImport = (poNumber: string) => {
    importTargetRef.current = poNumber;
    fileInputRef.current?.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const target = importTargetRef.current;
    if (!file || !target) return;

    setImporting(target);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const raw = new Uint8Array(ev.target?.result as ArrayBuffer);
        const wb = XLSX.read(raw, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws) as any[];

        const allocMap: Record<string, number> = {};
        json.forEach((row: any) => {
          const bc = String(row.barcode || row.Barcode || '');
          const qty = Number(row.allocated || row.Allocated || 0);
          if (bc) allocMap[bc] = qty;
        });

        if (Object.keys(allocMap).length === 0) {
          alert('No valid rows. Expected columns: barcode, allocated');
          setImporting(null);
          return;
        }

        setPOList(prev => prev.map(po => {
          if (po.poNumber !== target) return po;
          const updatedRows = po.rows.map(r => ({
            ...r,
            allocated: allocMap[r.barcode] !== undefined ? allocMap[r.barcode] : r.allocated,
          }));
          const allAllocated = updatedRows.every(r => r.allocated !== null);
          const someAllocated = updatedRows.some(r => r.allocated !== null);
          return {
            ...po,
            rows: updatedRows,
            allocationStatus: allAllocated ? 'allocated' : someAllocated ? 'partial' : 'not-allocated',
          };
        }));

        setImporting(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch {
        alert('Failed to parse Excel file.');
        setImporting(null);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // ── Columns ──────────────────────────────────────────────────────────────────
  const columns: Column<POSummary>[] = [
    {
      key: 'poNumber', header: 'PO Number',
      render: (r) => (
        <span className="font-black text-neutral-600 dark:text-neutral-300 text-xs uppercase tracking-tight">
          {r.Number}
        </span>
      ),
    },
    {
      key: 'vendor', header: 'Vendor',
      render: (r) => (
        <span className="text-xs text-neutral-500 dark:text-neutral-400">{r.Supplier?.Name}</span>
      ),
    },
    {
      key: 'deliveryDate', header: 'Expected Date', className: 'hidden sm:table-cell',
      render: (r) => (
        <span className="text-[10px] text-neutral-400 tabular-nums">{r.ExpectedDate}</span>
      ),
    },
    {
      key: 'status', header: 'Status',
      render: (r) => (
        <Badge color={r.Status === 'Received' ? 'green' : 'orange'}>
          {r.Status}
        </Badge>
      ),
    },
    {
      key: 'allocationStatus', header: 'Warehouse',
      render: (r) => (
        <Badge color="blue">
          {r.Warehouse?.CompanyName}
        </Badge>
      ),
    },
    {
      key: 'actions', header: '',
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          {r.Status !== 'Received' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => triggerImport(r.Number)}
              disabled={importing === r.Number}
              className="h-6 px-2 text-[9px]"
            >
              {importing === r.Number ? '…' : 'Import'}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/Purchase-Order/${r.Number}`)}
            className="h-6 px-2 text-[9px]"
          >
            Detail →
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3 pb-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-neutral-50/40 dark:bg-neutral-900/40 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800">
        <div className="space-y-0.5">
          <h1 className="text-xs font-black text-neutral-500 dark:text-neutral-300 uppercase tracking-widest leading-none">
            Purchase Orders
          </h1>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Input
            placeholder="Search PO or vendor…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 sm:w-52 h-7"
          />
        </div>
      </div>

      {/* Hidden file input (shared, per-PO target set via ref) */}
      <input type="file" accept=".xlsx,.xls" className="hidden" ref={fileInputRef} onChange={handleImport} />

      {/* Table */}
      <DataTable<POSummary>
        columns={columns}
        data={filtered}
        page={page}
        pageSize={10}
        total={filtered.length}
        loading={loading}
        onPageChange={setPage}
        getRowId={r => r.Number}
      />
    </div>
  );
};

export default PurchaseOrderPage;