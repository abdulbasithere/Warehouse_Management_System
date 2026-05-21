import React, { useState, useCallback } from 'react';
import { CustomTable, Column } from '../components/CustomTable';
import { Button, Input } from '../components/ui';

export interface VariantRow {
  id: string;
  code: string;
  color: string;
  size: string;
  qty: string;
}

const generateId = () => Math.random().toString(36).slice(2, 9);

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
  const [rows, setRows] = useState<VariantRow[]>([emptyRow()]);
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
            className={`text-[10px] font-bold tracking-tight ${out
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
    <div className="space-y-3 pb-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50/50 dark:bg-[#1c1c1c]/50 p-2 rounded-md border border-neutral-100 dark:border-neutral-900">
        <div className="text-left">
          <h1 className="text-sm font-black text-black dark:text-white leading-none">Product Mapping</h1>
          <p className="text-[9px] text-neutral-400 font-bold mt-0.5">Define variant barcode extensions</p>
        </div>
        <Button
          variant="primary"
          onClick={addRow}
          className="w-full sm:w-auto font-bold whitespace-nowrap"
        >
          + ADD ROW
        </Button>
      </div>

      <CustomTable<VariantRow>
        columns={columns}
        data={rows}
        page={1}
        pageSize={100}
        total={rows.length}
        loading={false}
        onPageChange={() => { }}
        getRowId={r => r.id}
      />

      <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-900">
        {submitted ? (
          <span className="flex items-center gap-1.5 text-[10px] font-black text-neutral-500 ">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Changes optimized & saved
          </span>
        ) : (
          <span className="text-[10px] text-neutral-300 dark:text-neutral-700 font-black ">
            {rows.length} Active {rows.length === 1 ? 'Mapping' : 'Mappings'}
          </span>
        )}

        <Button
          variant="primary"
          size="lg"
          onClick={handleSubmit}
          loading={submitting}
          disabled={!hasData || submitting}
          className="h-9 min-w-[180px] text-[10px] font-black bg-black dark:bg-white text-white dark:text-black"
        >
          {submitted ? 'Saved ✓' : 'Commit Mappings'}
        </Button>
      </div>
    </div>
  );
};

export default ProductMapping;
