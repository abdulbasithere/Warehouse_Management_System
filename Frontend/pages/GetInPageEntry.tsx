import React, { useState, useRef } from 'react';
import { Button, Input } from '../components/ui';
import {
  SaveMode, PoItem, AttachmentFile,
  WAREHOUSES, PO_NUMBERS, PACKAGE_TYPES, LOCATION_OPTIONS,
} from './GetInTypes';

interface LabelFieldProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export interface GetInPageEntryProps {
  onDiscard: () => void;
  onSave?: (mode: SaveMode) => void;
}

const emptyItem = (): PoItem => ({ id: Date.now() + Math.random(), packageType: '', packageQty: '', location: '' });

const LabelField: React.FC<LabelFieldProps> = ({ label, children, className = '' }) => (
  <div className={`space-y-1 ${className}`}>
    <label className="text-[8px] font-black text-neutral-400 uppercase tracking-widest px-0.5">{label}</label>
    {children}
  </div>
);

const selectCls = "w-full h-8 px-2 text-xs rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-300";

export const GetInPageEntry: React.FC<GetInPageEntryProps> = ({ onDiscard, onSave }) => {
  const [warehouse,        setWarehouse]        = useState('');
  const [poNumber,         setPoNumber]         = useState('');
  const [invoiceQty,       setInvoiceQty]       = useState('');
  const [shipmentNo,       setShipmentNo]       = useState('');
  const [vehicleNo,        setVehicleNo]        = useState('');
  const [contactNo,        setContactNo]        = useState('');
  const [driverName,       setDriverName]       = useState('');
  const [poQty,            setPoQty]            = useState('');
  const [arrivalDate,      setArrivalDate]      = useState('');
  const [timeIn,           setTimeIn]           = useState('');
  const [timeOut,          setTimeOut]          = useState('');
  const [plannedShipment,  setPlannedShipment]  = useState(false);
  const [barcodedShipment, setBarcodedShipment] = useState(false);
  const [QualityCheck,     setQualityCheck]     = useState(false); // ← NEW
  const [remark,           setRemark]           = useState('');
  const [emails,           setEmails]           = useState<string[]>([]);
  const [emailInput,       setEmailInput]       = useState('');
  const [attachments,      setAttachments]      = useState<AttachmentFile[]>([]);
  const [items,            setItems]            = useState<PoItem[]>([emptyItem()]);

  const fileRef = useRef<HTMLInputElement>(null);

  const addEmail = () => {
    const e = emailInput.trim();
    if (e && !emails.includes(e)) { setEmails([...emails, e]); setEmailInput(''); }
  };
  const removeEmail      = (em: string) => setEmails(emails.filter(x => x !== em));
  const removeAttachment = (idx: number) => setAttachments(prev => prev.filter((_, i) => i !== idx));
  const addItem          = () => setItems(prev => [...prev, emptyItem()]);
  const removeItem       = (id: number) => setItems(prev => prev.filter(it => it.id !== id));
  const updateItem       = (id: number, field: keyof Omit<PoItem, 'id'>, value: string) =>
    setItems(prev => prev.map(it => it.id === id ? { ...it, [field]: value } : it));

  const ActionButtons = () => (
    <div className="flex items-center gap-2">
      <Button variant="primary"     size="sm" onClick={onDiscard}            className="h-7 px-3 text-[9px] font-black uppercase tracking-widest">← Discard</Button>
      <Button variant="primary" size="sm" onClick={() => onSave?.('draft')} className="h-7 px-3 text-[9px] font-black uppercase tracking-widest">Save Draft</Button>
      <Button variant="primary"   size="sm" onClick={() => onSave?.('save')}  className="h-7 px-3 text-[9px] font-black uppercase tracking-widest">Save</Button>
    </div>
  );

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-neutral-50/40 dark:bg-neutral-900/40 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800">
        <div className="space-y-0.5">
          <h1 className="text-xs font-black text-neutral-500 dark:text-neutral-300 uppercase tracking-widest leading-none">New Get In Entry</h1>
          <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-tighter">Create inbound shipment record</p>
        </div>
        <ActionButtons />
      </div>

      {/* Shipment Details */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-lg p-4 space-y-4">
        <h2 className="text-[9px] font-black uppercase text-neutral-400 tracking-[0.2em]">Shipment Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <LabelField label="Warehouse">
            <select value={warehouse} onChange={e => setWarehouse(e.target.value)} className={selectCls}>
              <option value="">Select Warehouse</option>
              {WAREHOUSES.map(w => <option key={w}>{w}</option>)}
            </select>
          </LabelField>

          <LabelField label="PO Number">
            <select value={poNumber} onChange={e => setPoNumber(e.target.value)} className={selectCls}>
              <option value="">Select PO Number</option>
              {PO_NUMBERS.map(p => <option key={p}>{p}</option>)}
            </select>
          </LabelField>

          {/* Token field REMOVED — replaced by Invoice Qty moved to first slot */}
          <LabelField label="Invoice Quantity">
            <Input type="number" placeholder="0" value={invoiceQty} onChange={e => setInvoiceQty(e.target.value)} className="h-8 text-xs" />
          </LabelField>

          <LabelField label="Shipment Number">
            <Input placeholder="SH-XXXX" value={shipmentNo} onChange={e => setShipmentNo(e.target.value)} className="h-8 text-xs" />
          </LabelField>

          <LabelField label="Vehicle Number">
            <Input placeholder="ABC-1234" value={vehicleNo} onChange={e => setVehicleNo(e.target.value)} className="h-8 text-xs" />
          </LabelField>

          <LabelField label="Contact Number">
            <Input placeholder="+92 3XX XXXXXXX" value={contactNo} onChange={e => setContactNo(e.target.value)} className="h-8 text-xs" />
          </LabelField>

          <LabelField label="Driver Name">
            <Input placeholder="Full name..." value={driverName} onChange={e => setDriverName(e.target.value)} className="h-8 text-xs" />
          </LabelField>

          <LabelField label="PO Qty">
            <Input type="number" placeholder="0" value={poQty} onChange={e => setPoQty(e.target.value)} className="h-8 text-xs" />
          </LabelField>

          <LabelField label="Shipment Arrival Date">
            <Input type="date" value={arrivalDate} onChange={e => setArrivalDate(e.target.value)} className="h-8 text-xs" />
          </LabelField>

          <LabelField label="Time In">
            <Input type="time" value={timeIn} onChange={e => setTimeIn(e.target.value)} className="h-8 text-xs" />
          </LabelField>

          <LabelField label="Time Out">
            <Input type="time" value={timeOut} onChange={e => setTimeOut(e.target.value)} className="h-8 text-xs" />
          </LabelField>
        </div>

        {/* Emails */}
        <LabelField label="Email(s)">
          <div className="space-y-2">
            <div className="flex gap-1.5">
              <Input
                type="email" placeholder="Add email address..."
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addEmail(); } }}
                className="h-8 text-xs flex-1"
              />
              <Button variant="secondary" size="sm" onClick={addEmail} className="h-8 px-3 text-[9px]">Add</Button>
            </div>
            {emails.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {emails.map(em => (
                  <span key={em} className="flex items-center gap-1 px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-[9px] font-bold text-neutral-600 dark:text-neutral-300">
                    {em}
                    <button onClick={() => removeEmail(em)} className="text-neutral-400 hover:text-red-500 transition-colors ml-0.5">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </LabelField>

        <div className="flex flex-wrap gap-6">
          {([
            { label: 'Planned Shipment',  value: plannedShipment,  set: setPlannedShipment  },
            { label: 'Barcoded Shipment', value: barcodedShipment, set: setBarcodedShipment },
            { label: 'Quality Check', value: QualityCheck, set: setQualityCheck },  
        ] as const).map(({ label, value, set }) => (
            <label key={label} className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => set(!value)}
                className={`w-4 h-4 rounded flex items-center justify-center border transition-all cursor-pointer ${value ? 'bg-neutral-900 dark:bg-white border-neutral-900 dark:border-white' : 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800'}`}
              >
                {value && <span className="text-white dark:text-neutral-900 text-[8px] font-black">✓</span>}
              </div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">{label}</span>
            </label>
          ))}

          {/* Quality Check — styled differently to stand out */}
          {/* <label className="flex items-center gap-2 cursor-pointer">
            <div
              onClick={() => setQualityCheck(!qualityCheck)}
              className={`w-4 h-4 rounded flex items-center justify-center border transition-all cursor-pointer ${qualityCheck ? 'bg-emerald-600 border-emerald-600' : 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800'}`}
            >
              {qualityCheck && <span className="text-white text-[8px] font-black">✓</span>}
            </div>
            <span className={`text-[9px] font-bold uppercase tracking-widest transition-colors ${qualityCheck ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-500 dark:text-neutral-400'}`}>
              Quality Check
            </span>
          </label> */}
        </div>

        {/* Remark */}
        <LabelField label="Remark">
          <textarea
            placeholder="Additional remarks..."
            value={remark}
            onChange={e => setRemark(e.target.value)}
            className="w-full text-xs p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 placeholder-neutral-300 dark:placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-neutral-300 min-h-[70px] resize-none"
          />
        </LabelField>

        {/* Attachments */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Attachments</label>
            <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()} className="h-6 px-2.5 text-[8px]">+ Add File</Button>
            <input ref={fileRef} type="file" multiple className="hidden" />
          </div>
          {attachments.length > 0 ? (
            <div className="space-y-1.5">
              {attachments.map((att, idx) => (
                <div key={idx} className="flex items-center justify-between px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-100 dark:border-neutral-700">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-neutral-400 text-xs">📎</span>
                    <span className="text-[10px] font-medium text-neutral-600 dark:text-neutral-300 truncate">{att.name}</span>
                    <span className="text-[8px] text-neutral-400 shrink-0">{(att.size / 1024).toFixed(1)} KB</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeAttachment(idx)} className="h-6 w-6 p-0 text-neutral-300 hover:text-red-500 shrink-0">✕</Button>
                </div>
              ))}
            </div>
          ) : (
            <div onClick={() => fileRef.current?.click()} className="flex items-center justify-center h-14 border border-dashed border-neutral-200 dark:border-neutral-700 rounded-lg cursor-pointer hover:border-neutral-300 transition-colors">
              <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest">Click to attach files</span>
            </div>
          )}
        </div>
      </div>

      {/* PO Items */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[9px] font-black uppercase text-neutral-400 tracking-[0.2em]">PO Items</h2>
          <Button variant="secondary" size="sm" onClick={addItem} className="h-7 px-3 text-[8px] font-black uppercase tracking-wide">+ Add Row</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100 dark:border-neutral-800">
                {['#', 'Package Type', 'Package Qty', 'Location', 'Action'].map(h => (
                  <th key={h} className="pb-2 text-left text-[8px] font-black uppercase tracking-[0.15em] text-neutral-400 pr-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item.id} className="border-b border-neutral-50 dark:border-neutral-800/50">
                  <td className="py-2 pr-3">
                    <span className="text-[9px] font-black text-neutral-400 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  </td>
                  <td className="py-2 pr-3">
                    <select value={item.packageType} onChange={e => updateItem(item.id, 'packageType', e.target.value)} className="h-7 px-2 text-xs rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-300 min-w-[120px]">
                      <option value="">Select Type</option>
                      {PACKAGE_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </td>
                  <td className="py-2 pr-3">
                    <Input type="number" min="1" placeholder="0" value={item.packageQty} onChange={e => updateItem(item.id, 'packageQty', e.target.value)} className="h-7 text-xs w-24" />
                  </td>
                  <td className="py-2 pr-3">
                    <select value={item.location} onChange={e => updateItem(item.id, 'location', e.target.value)} className="h-7 px-2 text-xs rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-300 min-w-[100px]">
                      <option value="">Select Location</option>
                      {LOCATION_OPTIONS.map(l => <option key={l}>{l}</option>)}
                    </select>
                  </td>
                  <td className="py-2">
                    <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)} disabled={items.length === 1} className="h-7 w-7 p-0 text-neutral-300 dark:text-neutral-700 hover:text-red-400 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-20">✕</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-neutral-100 dark:border-neutral-800">
          <span className="text-[8px] font-bold uppercase tracking-widest text-neutral-400">{items.length} row{items.length !== 1 ? 's' : ''}</span>
          <span className="text-[8px] font-bold uppercase tracking-widest text-neutral-400">
            Total Qty: <span className="text-neutral-600 dark:text-neutral-300 font-black">{items.reduce((sum, it) => sum + (parseInt(it.packageQty) || 0), 0).toLocaleString()}</span>
          </span>
        </div>
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md border-t border-neutral-100 dark:border-neutral-900 px-6 py-3 flex items-center justify-end gap-2 z-40">
        <ActionButtons />
      </div>
    </div>
  );
};