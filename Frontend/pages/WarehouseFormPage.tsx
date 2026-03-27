import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Badge } from '../components/ui';

interface Warehouse {
    id?: number;
    name: string;
    label: string;
    phone: string;
    zip: string;
    longitude: string;
    latitude: string;
    address: string;
}

export const WarehouseFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = id && id !== 'new';

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState<Warehouse>({
        name: '', label: '', phone: '', zip: '', longitude: '', latitude: '', address: '',
    });

    useEffect(() => {
        if (isEdit) {
            setLoading(true);
            setTimeout(() => {
                setForm({
                    id: Number(id),
                    name: 'Main Warehouse',
                    label: 'WH-001',
                    phone: '1234567890',
                    zip: '74000',
                    longitude: '67.00',
                    latitude: '24.00',
                    address: '123 Main Street, Karachi',
                });
                setLoading(false);
            }, 300);
        }
    }, [id, isEdit]);

    const handleSave = async () => {
        setSubmitting(true);
        try {
            console.log('Final Submit:', form);
            alert('Warehouse Saved');
            navigate('/warehouse');
        } catch (err) {
            alert('Error saving data');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-10 text-[10px] font-black uppercase text-neutral-400">Loading...</div>;

    return (
        <div className="space-y-4 pb-10">
            {/* Header - Simple PO Style */}
            <div className="flex flex-row items-center justify-between gap-4 py-2">
                <div className="flex items-center gap-3">
                    <h1 className="text-sm font-black text-neutral-600 dark:text-neutral-300 uppercase tracking-widest">
                        {isEdit ? form.label : 'New Warehouse'}
                    </h1>
                    <Badge color={isEdit ? 'blue' : 'orange'}>
                        {isEdit ? 'ACTIVE' : 'DRAFT'}
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>Back</Button>
                    <Button
                        variient="primary" size="sm"
                        onClick={handleSave}
                        disabled={submitting}
                        className="h-7 px-3 text-[9px] font-black uppercase tracking-widest"
                    >
                        {submitting ? '…' : 'Save Warehouse'}
                    </Button>
                </div>
            </div>

            {/* Main Single Form Surface (No separate cards) */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">

                {/* Section 1: General Info */}
                <div className="p-5 space-y-4">
                    <div className="pb-2 border-b border-neutral-50 dark:border-neutral-800">
                        <h2 className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">General Information</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-1">
                            <span className="text-[8px] font-black text-neutral-300 dark:text-neutral-500 uppercase tracking-tighter">Warehouse Name</span>
                            <input
                                className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 rounded px-2.5 py-1.5 text-xs font-bold text-neutral-600 dark:text-neutral-300 outline-none "
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[8px] font-black text-neutral-300 dark:text-neutral-500 uppercase tracking-tighter">Label Code</span>
                            <input
                                className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 rounded px-2.5 py-1.5 text-xs font-bold text-neutral-600 dark:text-neutral-300 outline-none focus:border-blue-500 uppercase"
                                value={form.label}
                                onChange={e => setForm({ ...form, label: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Section 2: Contact & Location */}
                <div className="p-5 space-y-4 bg-neutral-50/30 dark:bg-neutral-800/20 border-t border-neutral-50 dark:border-neutral-800">
                    <div className="pb-2 border-b border-neutral-50 dark:border-neutral-800">
                        <h2 className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Contact & Location</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex flex-col gap-1">
                            <span className="text-[8px] font-black text-neutral-300 dark:text-neutral-500 uppercase tracking-tighter">Phone Number</span>
                            <input
                                className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 rounded px-2.5 py-1.5 text-xs font-bold text-neutral-600 dark:text-neutral-300 outline-none focus:border-blue-500"
                                value={form.phone}
                                onChange={e => setForm({ ...form, phone: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[8px] font-black text-neutral-300 dark:text-neutral-500 uppercase tracking-tighter">Zip Code</span>
                            <input
                                className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 rounded px-2.5 py-1.5 text-xs font-bold text-neutral-600 dark:text-neutral-300 outline-none focus:border-blue-500"
                                value={form.zip}
                                onChange={e => setForm({ ...form, zip: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-1 md:col-span-1">
                            {/* Spacer if needed or third field */}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 mt-4">
                        <span className="text-[8px] font-black text-neutral-300 dark:text-neutral-500 uppercase tracking-tighter">Street Address</span>
                        <input
                            className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 rounded px-2.5 py-1.5 text-xs font-bold text-neutral-600 dark:text-neutral-300 outline-none focus:border-blue-500"
                            value={form.address}
                            onChange={e => setForm({ ...form, address: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6 mt-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-[8px] font-black text-neutral-300 dark:text-neutral-500 uppercase tracking-tighter">Latitude</span>
                            <input
                                className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 rounded px-2.5 py-1.5 text-xs font-bold text-neutral-600 dark:text-neutral-300 outline-none"
                                value={form.latitude}
                                onChange={e => setForm({ ...form, latitude: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[8px] font-black text-neutral-300 dark:text-neutral-500 uppercase tracking-tighter">Longitude</span>
                            <input
                                className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 rounded px-2.5 py-1.5 text-xs font-bold text-neutral-600 dark:text-neutral-300 outline-none"
                                value={form.longitude}
                                onChange={e => setForm({ ...form, longitude: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default WarehouseFormPage;