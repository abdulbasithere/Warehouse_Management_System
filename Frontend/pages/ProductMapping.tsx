import React, { useState, useCallback } from 'react';
import { DataTable, Column } from '../components/DataTable';
import { Button, Input } from '../components/ui';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface VariantRow {
  id: string;
  code: string;
  color: string;
  size: string;
  qty: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const generateId = () => Math.random().toString(36).slice(2, 9);

const generateBarcode = (code: string, color: string, size: string): string => {
  const parts = [code, color, size].filter(Boolean).join('-').toUpperCase();
  return parts ? `BC-${parts}` : '';
};

const emptyRow = (): VariantRow => ({
  id: generateId(),
  code: '',
  color: '',
  size: '',
  qty: '',
});

// ─── Inline Editable Cell ─────────────────────────────────────────────────────
interface EditableCellProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  numeric?: boolean;
  align?: 'left' | 'right';
}

const EditableCell: React.FC<EditableCellProps> = ({
  value, onChange, placeholder, numeric, align = 'left',
}) => (
  <Input
    value={value}
    onChange={e => onChange(numeric ? e.target.value.replace(/\D/g, '') : e.target.value)}
    placeholder={placeholder}
    className={`h-6 text-[11px] font-semibold border-neutral-100 dark:border-neutral-800 bg-transparent
      focus:bg-neutral-50 dark:focus:bg-neutral-900 w-full min-w-0
      ${align === 'right' ? 'text-right tabular-nums' : ''}
    `}
  />
);

// ─── Page ─────────────────────────────────────────────────────────────────────
export const ProductMapping: React.FC = () => {
  const [rows, setRows]         = useState<VariantRow[]>([emptyRow()]);
  const [submitting, setSubmit] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // ── Mutations ────────────────────────────────────────────────────────────────
  const addRow = () => {
    setSubmitted(false);
    setRows(prev => [...prev, emptyRow()]);
  };

  const removeRow = (id: string) => {
    setSubmitted(false);
    setRows(prev => prev.length === 1 ? [emptyRow()] : prev.filter(r => r.id !== id));
  };

  const updateRow = useCallback((id: string, field: keyof VariantRow, value: string) => {
    setSubmitted(false);
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  }, []);

  const handleSubmit = () => {
    const valid = rows.filter(r => r.code.trim() || r.color.trim() || r.size.trim());
    if (!valid.length) return;
    setSubmit(true);
    setTimeout(() => { setSubmit(false); setSubmitted(true); }, 1200);
  };

  const hasData = rows.some(r => r.code.trim() || r.color.trim() || r.size.trim());


 const FIXED_BARCODE = "A123456";

const columns: Column<VariantRow>[] = [
  {
    key: "barcode",
    header: "Barcode",
    render: () => (
      <span className="text-[10px] font-black tracking-tight tabular-nums text-neutral-700 dark:text-neutral-300">
        {FIXED_BARCODE}
      </span>
    ),
  },

  {
    key: "code",
    header: "Code",
    render: (r) => (
      <EditableCell
        value={r.code}
        onChange={(v) => updateRow(r.id, "code", v)}
        placeholder="e.g. A"
      />
    ),
  },

  {
    key: "color",
    header: "Color",
    render: (r) => (
      <EditableCell
        value={r.color}
        onChange={(v) => updateRow(r.id, "color", v)}
        placeholder="e.g. Green"
      />
    ),
  },

  {
    key: "size",
    header: "Size",
    render: (r) => (
      <EditableCell
        value={r.size}
        onChange={(v) => updateRow(r.id, "size", v)}
        placeholder="S / M / L"
      />
    ),
  },

  {
    key: "qty",
    header: "Qty",
    className: "w-24",
    render: (r) => (
      <EditableCell
        value={r.qty}
        onChange={(v) => updateRow(r.id, "qty", v)}
        placeholder="0"
        numeric
        align="right"
      />
    ),
  },

  {
    key: "output",
    header: "Output",
    render: (r) => {
      const out =
        r.code && r.color && r.size
          ? `${FIXED_BARCODE}-${r.code}-${r.color}-${r.size}`
          : "";

      return (
        <span
          className={`text-[10px] font-bold tracking-tight ${
            out
              ? "text-neutral-500 dark:text-neutral-400"
              : "text-neutral-200 dark:text-neutral-700"
          }`}
        >
          {out || "—"}
        </span>
      );
    },
  },

  {
    key: "actions",
    header: "",
    className: "w-10",
    render: (r) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => removeRow(r.id)}
        className="h-6 w-6 p-0 text-neutral-300 dark:text-neutral-700 hover:text-red-400 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
        title="Remove row"
      >
        ✕
      </Button>
    ),
  },
];

  return (
    <div className="space-y-3 pb-6">

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3
        bg-neutral-50/40 dark:bg-neutral-900/40 p-3 rounded-lg
        border border-neutral-100 dark:border-neutral-800"
      >
        <div className="space-y-0.5">
          <h1 className="text-xs font-black text-neutral-500 dark:text-neutral-300 uppercase tracking-widest leading-none">
            Product Mapping
          </h1>
          <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-tighter">
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={addRow}
            className="h-7 px-3 text-[9px] font-black uppercase tracking-widest"
          >
            + Add Variant
          </Button>
        </div>
      </div>

      {/* ── Table ── */}
      <DataTable<VariantRow>
        columns={columns}
        data={rows}
        page={1}
        pageSize={100}
        total={rows.length}
        loading={false}
        onPageChange={() => {}}
        getRowId={r => r.id}
      />

      {/* ── Footer / Submit ── */}
      <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-900">

        {/* Success msg */}
        {submitted ? (
          <span className="flex items-center gap-1.5 text-[10px] font-black text-green-500 uppercase tracking-widest">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Variants submitted successfully
          </span>
        ) : (
          <span className="text-[9px] text-neutral-300 dark:text-neutral-700 font-bold uppercase tracking-widest">
            {rows.length} {rows.length === 1 ? 'variant' : 'variants'}
          </span>
        )}

        <Button
          variant="primary"
          size="lg"
          onClick={handleSubmit}
          loading={submitting}
          disabled={!hasData || submitting}
          className="min-w-[180px]"
        >
          {submitted ? 'Submitted ✓' : 'Submit Variants'}
        </Button>
      </div>

    </div>
  );
};

export default ProductMapping;