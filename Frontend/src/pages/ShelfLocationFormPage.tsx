import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Button, Badge, Input } from '../components/ui';
import { useShelfLocation, useCreateShelfLocation, useUpdateShelfLocation } from '../api/hooks/useShelfLocations';
import { useWarehouses } from '../api/hooks/useWarehouses';

interface ShelfLocation {
  id?: string;
  ShelfID?: string;
  aisle: string;
  Aisle?: string;
  shelfLevel: string;
  ShelfLevel?: string;
  basket: string;
  Basket?: string;
  warehouseId: string | number;
  WarehouseID?: string | number;
}

interface LabelFieldProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

const LabelField: React.FC<LabelFieldProps> = ({ label, children, className = '' }) => (
  <div className={`space-y-1 ${className}`}>
    <label className="text-[8px] font-black text-neutral-400 px-0.5">{label}</label>
    {children}
  </div>
);

// ─── Searchable Select ───────────────────────────────────────────────────────
const SearchableSelect: React.FC<{
    options: { label: string, value: any }[];
    value: any;
    onChange: (value: any) => void;
    placeholder: string;
    className?: string;
}> = ({ options, value, onChange, placeholder, className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, showAbove: false });
    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const filteredOptions = options.filter(o =>
        (o.label || '').toLowerCase().includes(search.toLowerCase())
    );

    const selectedOption = options.find(o => String(o.value) === String(value));

    const updateCoords = useCallback(() => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const dropdownHeight = 240; 
            const spaceBelow = window.innerHeight - rect.bottom;
            const showAbove = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

            setCoords({
                top: showAbove ? rect.top - dropdownHeight : rect.bottom + 4,
                left: rect.left,
                width: rect.width,
                showAbove
            });
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            updateCoords();
            const observer = new ResizeObserver(updateCoords);
            if (containerRef.current) observer.observe(containerRef.current);
            
            window.addEventListener('scroll', updateCoords, true);
            window.addEventListener('resize', updateCoords);
            
            return () => {
                observer.disconnect();
                window.removeEventListener('scroll', updateCoords, true);
                window.removeEventListener('resize', updateCoords);
            };
        }
    }, [isOpen, updateCoords]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const isInsideContainer = containerRef.current && containerRef.current.contains(event.target as Node);
            const isInsideDropdown = dropdownRef.current && dropdownRef.current.contains(event.target as Node);

            if (!isInsideContainer && !isInsideDropdown) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const dropdown = isOpen && createPortal(
        <div
            ref={dropdownRef}
            className={`fixed z-[9999] bg-white dark:bg-[#232323] border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl overflow-hidden animate-in fade-in duration-200 ${coords.showAbove ? 'slide-in-from-bottom-1' : 'slide-in-from-top-1'}`}
            style={{
                top: `${coords.top}px`,
                left: `${coords.left}px`,
                minWidth: `${coords.width}px`,
                width: 'auto',
                maxWidth: '300px'
            }}
        >
            <div className="p-1.5 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#1c1c1c]/50">
                <input
                    autoFocus
                    className="w-full h-7 px-2 text-[10px] font-bold bg-white dark:bg-[#232323] border border-neutral-100 dark:border-neutral-800 outline-none rounded-md focus:ring-1 focus:ring-black dark:focus:ring-white transition-all"
                    placeholder="Type to search..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>
            <div className="max-h-[200px] overflow-y-auto p-1 py-1 custom-scrollbar">
                {filteredOptions.length > 0 ? (
                    filteredOptions.map((opt) => (
                        <div
                            key={opt.value}
                            onClick={() => {
                                onChange(opt.value);
                                setIsOpen(false);
                                setSearch('');
                            }}
                            className={`px-3 py-2 text-[10px] font-black uppercase tracking-tight rounded-md cursor-pointer transition-colors mb-0.5 last:mb-0 ${String(value) === String(opt.value) ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-black dark:hover:text-white'}`}
                        >
                            {opt.label}
                        </div>
                    ))
                ) : (
                    <div className="px-2 py-4 text-[9px] text-neutral-400 text-center uppercase font-black tracking-widest opacity-50">No matches found</div>
                )}
            </div>
        </div>,
        document.body
    );

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <div
                onClick={() => {
                    updateCoords();
                    setIsOpen(!isOpen);
                }}
                className="w-full h-8 px-2.5 flex items-center justify-between bg-neutral-50 dark:bg-[#2e2e2e] border border-neutral-100 dark:border-neutral-700 rounded-lg cursor-pointer transition-all hover:border-neutral-300 dark:hover:border-neutral-600"
            >
                <span className={`text-xs font-bold truncate ${!selectedOption ? 'text-neutral-400' : 'text-neutral-700 dark:text-neutral-300'}`}>
                    {selectedOption?.label || placeholder}
                </span>
                <svg className={`w-3 h-3 text-neutral-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
            </div>
            {dropdown}
        </div>
    );
};

export const ShelfLocationFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = id && id !== 'new';

    const { data: shelfLocation, isLoading: loading } = useShelfLocation(id);
    const { data: warehousesData } = useWarehouses({});
    const warehouses = warehousesData?.data || [];

    const createMutation = useCreateShelfLocation();
    const updateMutation = useUpdateShelfLocation();

    const submitting = createMutation.isPending || updateMutation.isPending;

    const [form, setForm] = useState<ShelfLocation>({
        aisle: '', shelfLevel: '', basket: '', warehouseId: ''
    });

    useEffect(() => {
        if (shelfLocation) {
            setForm({
                id: shelfLocation.id || shelfLocation.ShelfID,
                aisle: shelfLocation.aisle || shelfLocation.Aisle || '',
                shelfLevel: shelfLocation.shelfLevel || shelfLocation.ShelfLevel || '',
                basket: shelfLocation.basket || shelfLocation.Basket || '',
                warehouseId: shelfLocation.warehouseId || shelfLocation.WarehouseID || ''
            });
        }
    }, [shelfLocation]);

    const handleSave = async () => {
        const payload = {
          Aisle: form.aisle.toUpperCase(),
          ShelfLevel: form.shelfLevel.toUpperCase(),
          Basket: form.basket.toUpperCase(),
          WarehouseID: form.warehouseId
        };

        if (isEdit) {
            updateMutation.mutate({ id: id!, data: payload }, {
                onSuccess: () => navigate('/shelf-locations')
            });
        } else {
            createMutation.mutate(payload, {
                onSuccess: () => navigate('/shelf-locations')
            });
        }
    };

    if (loading) return <div className="p-10 text-[9px] font-black text-neutral-400">Syncing Location...</div>;

    return (
        <div className="space-y-3 pb-8 text-left">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-neutral-50/50 dark:bg-[#1c1c1c]/50 p-2 rounded-md border border-neutral-100 dark:border-neutral-900">
                <div className="text-left">
                    <div className="flex items-center gap-2">
                        <h1 className="text-[11px] font-black text-black dark:text-white leading-none">
                            {isEdit ? `Shelf: ${form.id}` : 'New Shelf Location'}
                        </h1>
                        <Badge variant="secondary" className="text-[7px] py-0 h-3.5 px-1.5 font-black border-neutral-200 dark:border-neutral-800">
                            {isEdit ? 'ACTIVE' : 'DRAFT'}
                        </Badge>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        size="md"
                        onClick={() => navigate(-1)}
                        className="border-neutral-400"
                    >
                        Back
                    </Button>
                    <Button
                        variant="primary"
                        size="md"
                        onClick={handleSave}
                        disabled={submitting}
                    >
                        {submitting ? '…' : 'Commit Changes'}
                    </Button>
                </div>
            </div>

            <div className="bg-white dark:bg-[#232323] border border-neutral-100 dark:border-neutral-950 rounded-md overflow-hidden shadow-sm">
                <div className="p-4 space-y-4">
                    <div className="space-y-3">
                        <h2 className="text-[8px] font-black uppercase text-neutral-400 tracking-widest border-b border-neutral-50 dark:border-neutral-950 pb-1.5">Placement Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <LabelField label="Aisle">
                                <Input
                                    className="h-8 text-[10px]"
                                    value={form.aisle}
                                    onChange={e => setForm({ ...form, aisle: e.target.value })}
                                    placeholder="e.g. A"
                                />
                            </LabelField>
                            <LabelField label="Level">
                                <Input
                                    className="h-8 text-[10px]"
                                    value={form.shelfLevel}
                                    onChange={e => setForm({ ...form, shelfLevel: e.target.value })}
                                    placeholder="e.g. 01"
                                />
                            </LabelField>
                            <LabelField label="Basket">
                                <Input
                                    className="h-8 text-[10px]"
                                    value={form.basket}
                                    onChange={e => setForm({ ...form, basket: e.target.value })}
                                    placeholder="e.g. 05"
                                />
                            </LabelField>
                            <LabelField label="Warehouse">
                                <SearchableSelect
                                    options={warehouses.map((w: any) => ({ label: w.name || w.warehouseName, value: w.id }))}
                                    value={form.warehouseId}
                                    onChange={v => setForm({ ...form, warehouseId: v })}
                                    placeholder="Select Node"
                                />
                            </LabelField>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShelfLocationFormPage;
