import React, { useState, useEffect, useRef } from 'react';
import {
  ModalMode, GetInRow, StatusKey,
  WAREHOUSES, STATUS_OPTIONS, STATUS_CONFIG_MODAL,
} from './GetInTypes';
import { Button, Input } from '../components/ui';

interface GetInRowModalProps {
  isOpen: boolean;
  mode: ModalMode;
  data: GetInRow | null;
  onClose: () => void;
  onSave?: (updated: GetInRow) => void;
}

export const GetInRowModal: React.FC<GetInRowModalProps> = ({
  isOpen, mode: initialMode, data, onClose, onSave,
}) => {
  const [mode, setMode] = useState<ModalMode>(initialMode);
  const [form, setForm] = useState<GetInRow | null>(null);
  const [saving, setSaving] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && data) {
      setMode(initialMode);
      setForm({ ...data, qualityCheck: data.qualityCheck ?? false });
    }
  }, [isOpen, initialMode, data]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [isOpen, onClose]);

  const set = <K extends keyof GetInRow>(key: K, val: GetInRow[K]) =>
    setForm(prev => prev ? { ...prev, [key]: val } : prev);

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 500)); // mimic API save
    onSave?.(form);
    setSaving(false);
    onClose();
  };

  if (!isOpen || !form) return null;

  const sc = STATUS_CONFIG_MODAL[form.status];

  return (
    <div
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-xl rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-900 shadow-lg overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-900">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white">
              {mode === 'view' ? 'Get In Details' : 'Edit Get In Entry'}
            </h2>
            <p className="text-xxs text-neutral-600 dark:text-neutral-400 font-medium">
              {form.refNo} · {form.po}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {mode === 'view' && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setMode('edit')}
              >
                Edit
              </Button>
            )}
            <button
              onClick={onClose}
              className="text-lg text-neutral-500 hover:text-black dark:hover:text-white"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">

          {mode === 'view' ? (
            <div className="space-y-2">
              {Object.entries(form).map(([key, val]) => (
                <div key={key} className="flex justify-between text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  <span className="capitalize">{key}</span>
                  <span className="font-mono">{String(val)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between text-xs font-bold text-neutral-700 dark:text-neutral-300">
                <span>Status</span>
                <span className={`inline-flex items-center gap-2 px-2 py-1 rounded text-[10px] font-bold uppercase ${sc?.bgClass ?? 'bg-black/10'} ${sc?.textClass ?? 'text-black'}`}>
                  <span className={`w-2 h-2 rounded-full ${sc?.dotClass ?? 'bg-black'}`} />
                  {sc?.label ?? form.status}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Input value={form.refNo} onChange={e => set('refNo', e.target.value)} placeholder="Ref No" />
              <Input value={form.po} onChange={e => set('po', e.target.value)} placeholder="PO Number" />
              <Input value={form.shipment} onChange={e => set('shipment', e.target.value)} placeholder="Shipment" />
              <Input value={form.supplier} onChange={e => set('supplier', e.target.value)} placeholder="Supplier" />

              <select className="input" value={form.warehouse} onChange={e => set('warehouse', e.target.value)}>
                {WAREHOUSES.map(w => <option key={w}>{w}</option>)}
              </select>

              <Input type="number" value={form.quantity} onChange={e => set('quantity', Number(e.target.value))} />

              <select className="input" value={form.status} onChange={e => set('status', e.target.value as StatusKey)}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_CONFIG_MODAL[s].label}</option>)}
              </select>

              <Input type="date" value={form.date} onChange={e => set('date', e.target.value)} />

              {/* QC Toggle */}
              <div
                onClick={() => set('qualityCheck', !form.qualityCheck)}
                className={`flex items-center justify-between p-3 rounded border cursor-pointer
                  ${form.qualityCheck ? 'border-black dark:border-white' : 'border-neutral-200 dark:border-neutral-800'}`}
              >
                <span className="text-xs font-bold">Quality Check</span>
                <span>{form.qualityCheck ? '✓' : '—'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {mode === 'edit' && (
          <div className="flex gap-2 p-4 border-t border-neutral-100 dark:border-neutral-900">
            <Button variant="secondary" className="flex-1" onClick={() => setMode('view')}>Cancel</Button>
            <Button className="flex-1" onClick={handleSave} loading={saving}>Save</Button>
          </div>
        )}
      </div>
    </div>
  );
};