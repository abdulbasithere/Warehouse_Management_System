import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DataTable, Column } from '../components/DataTable';
import { Badge, Button, ProgressBar } from '../components/ui';
import { getPurchaseOrderByNumber, updatePurchaseOrderStatus } from '../api/endpoints/purchaseOrderApi';

interface ScannedItem {
  LineItemID: number;
  PurchaseOrderID: number;
  VariantID: number;
  Quantity: number;
  UnitPrice: string;
  Subtotal: string;
  ProductVariant?: {
    Color: string;
    Size: string;
    SKU: string;
    Product?: {
      Name: string;
    }
  };
}

interface PODetail {
  PurchaseOrderID: number;
  Number: string;
  SupplierID: number;
  Status: string;
  TotalProducts: number;
  TotalAmount: string;
  TotalUnits: number;
  ExpectedDate: string;
  Supplier?: { Name: string };
  PurchaseOrderLineItems: ScannedItem[];
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export const PurchaseOrderDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { poNumber } = useParams<{ poNumber: string }>();
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<PODetail | null>(null);
  const [items, setItems] = useState<ScannedItem[]>([]);
  const [notFound, setNotFound] = useState(false);

  const [page, setPage] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!poNumber) return;
    setLoading(true);
    getPurchaseOrderByNumber(poNumber)
      .then(res => {
        setLoading(false);
        if (!res) {
          setNotFound(true);
        } else {
          setDetail(res);
          setItems(res.PurchaseOrderLineItems || []);
          setSubmitted(res.Status === 'Received');
        }
      })
      .catch(err => {
        console.error('Failed to fetch PO detail:', err);
        setLoading(false);
        setNotFound(true);
      });
  }, [poNumber]);

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!poNumber) return;
    if (!window.confirm(`Are you sure you want to submit this Purchase Order?`)) return;

    try {
      setSubmitting(true);
      await updatePurchaseOrderStatus(poNumber, 'Received');
      setSubmitting(false);
      setSubmitted(true);
      setDetail(prev => prev ? { ...prev, Status: 'Received' } : prev);
    } catch (error) {
      console.error('Failed to submit PO:', error);
      alert('Failed to submit PO');
      setSubmitting(false);
    }
  };

  // ─── Stats ───────────────────────────────────────────────────────────────────
  const totalAllocated = items.reduce((s, i) => s + Number(i.Quantity), 0);

  // ── Columns ───────────────────────────────────────────────────────────────────
  const columns: Column<ScannedItem>[] = [
    {
      key: 'barcode', header: 'SKU',
      render: (r) => <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 tracking-tight">{r.ProductVariant?.SKU}</span>,
    },
    {
      key: 'item', header: 'Item',
      render: (r) => <span className="text-neutral-600 dark:text-neutral-300 text-xs tracking-tight">{r.ProductVariant?.Product?.Name}</span>,
    },
    {
      key: 'color', header: 'Color', className: 'hidden sm:table-cell',
      render: (r) => <span className="text-xs text-neutral-500 dark:text-neutral-400">{r.ProductVariant?.Color}</span>,
    },
    {
      key: 'size', header: 'Size',
      render: (r) => <Badge color="gray">{r.ProductVariant?.Size}</Badge>,
    },
    {
      key: 'allocatedQty', header: 'Quantity',
      render: (r) => <span className="text-xs font-black text-neutral-600 dark:text-neutral-300 tabular-nums">{r.Quantity}</span>,
    },
    {
      key: 'unitPrice', header: 'Unit Price',
      render: (r) => <span className="text-xs font-black text-neutral-600 dark:text-neutral-300 tabular-nums">{r.UnitPrice}</span>,
    },
    {
      key: 'subtotal', header: 'Subtotal',
      render: (r) => <span className="text-xs font-black text-neutral-600 dark:text-neutral-300 tabular-nums">{r.Subtotal}</span>,
    },
  ];

  return (
    <div className="space-y-3 pb-6">

      {/* Header */}
      {detail && (
        <div className="flex flex-row items-center justify-between gap-4">
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black text-neutral-600 dark:text-neutral-300 uppercase tracking-widest truncate">
                {detail.Number}
              </h1>
              <Badge color={submitted ? 'green' : 'orange'}>
                {detail.Status.toUpperCase()}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="shrink-0"
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
            {!loading && items.length > 0 && !submitted && (
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={submitting}
                className="text-[9px] !bg-green-600 hover:!bg-green-700 dark:!bg-green-700 dark:hover:!bg-green-600 !text-white"
              >
                {submitting ? '…' : 'Submit PO'}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Info Cards */}
      {detail && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Vendor Card */}
          <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl space-y-3 shadow-sm">
            <h2 className="text-[9px] font-black uppercase text-neutral-400 tracking-widest border-b border-neutral-50 dark:border-neutral-800 pb-2">Vendor Details</h2>
            <div className="space-y-2">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-neutral-300 uppercase tracking-tighter">Name</span>
                <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">{detail.Supplier?.Name}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-neutral-300 uppercase tracking-tighter">Expected Date</span>
                <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">{detail.ExpectedDate}</span>
              </div>
            </div>
          </div>

          {/* Quantities Card */}
          <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl space-y-3 shadow-sm">
            <h2 className="text-[9px] font-black uppercase text-neutral-400 tracking-widest border-b border-neutral-50 dark:border-neutral-800 pb-2">Quantities</h2>
            <div className="space-y-2">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-neutral-300 uppercase tracking-tighter">Total Amount</span>
                <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 tabular-nums">{detail.TotalAmount}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-neutral-300 uppercase tracking-tighter">Total Units</span>
                <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 tabular-nums">
                  {detail.TotalUnits}
                </span>
              </div>
            </div>
          </div>

          {/* Status Card */}
          <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl space-y-3 shadow-sm">
            <h2 className="text-[9px] font-black uppercase text-neutral-400 tracking-widest border-b border-neutral-50 dark:border-neutral-800 pb-2">Scan Status</h2>
            <div className="space-y-2">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-neutral-300 uppercase tracking-tighter">Lines</span>
                <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">{items.length}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-neutral-300 uppercase tracking-tighter">Total Products</span>
                <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
                  {detail.TotalProducts}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <DataTable<ScannedItem>
        columns={columns}
        data={items}
        page={page}
        pageSize={10}
        total={items.length}
        loading={loading}
        onPageChange={setPage}
        getRowId={r => String(r.LineItemID)}
      />


    </div>
  );
};

export default PurchaseOrderDetailPage;