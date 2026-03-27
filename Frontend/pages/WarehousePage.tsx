import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable, Column } from '../components/DataTable';
import { Button, Input } from '../components/ui';

export interface Warehouse {
    id: number;
    name: string;
    label: string;
    phone: string;
    address: string;
    zip: string;
}

export const WarehousePage: React.FC = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');

    // Mock Data
    const [warehouses] = useState<Warehouse[]>([
        { id: 1, name: 'Main Warehouse', label: 'WH-001', phone: '123456789', address: 'Karachi, PK', zip: '74000' },
        { id: 2, name: 'Secondary Warehouse', label: 'WH-002', phone: '987654321', address: 'Lahore, PK', zip: '54000' },
    ]);

    const filtered = warehouses.filter(w =>
        w.name.toLowerCase().includes(search.toLowerCase()) ||
        w.label.toLowerCase().includes(search.toLowerCase())
    );

    const columns: Column<Warehouse>[] = [
        {
            key: 'label', header: 'ID / Label',
            render: (r) => <span className="font-black text-neutral-600 dark:text-neutral-300 text-[10px] uppercase tracking-tight">{r.label}</span>,
        },
        {
            key: 'name', header: 'Warehouse Name',
            render: (r) => <span className="text-xs text-neutral-500 dark:text-neutral-300 font-bold">{r.name}</span>,
        },
        {
            key: 'phone', header: 'Phone',
            render: (r) => <span className="text-[10px] text-neutral-400 tabular-nums">{r.phone}</span>,
        },
        {
            key: 'address', header: 'Address', className: 'hidden sm:table-cell',
            render: (r) => <span className="text-[10px] text-neutral-400 truncate max-w-[200px] block">{r.address}</span>,
        },
        {
            key: 'actions', header: '',
            render: (r) => (
                <div className="flex justify-end">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/warehouse/${r.id}`)}
                        className="h-6 px-2 text-[9px] font-bold uppercase tracking-widest"
                    >
                        Details →
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-3 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-neutral-50/40 dark:bg-neutral-900/40 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800">
                <h1 className="text-xs font-black text-neutral-500 dark:text-neutral-300 uppercase tracking-widest">
                    Warehouse Inventory
                </h1>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Input
                        placeholder="Search warehouse..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="flex-1 sm:w-52 h-7 text-xs"
                    />
                    <Button
                        variant="primary" size="sm"
                        className="h-7 px-3 text-[9px] font-black uppercase tracking-widest"
                        onClick={() => navigate('/warehouse/new')}
                    >
                        + Add Warehouse
                    </Button>
                </div>
            </div>

            <DataTable<Warehouse>
                columns={columns}
                data={filtered}
                page={1}
                pageSize={10}
                total={filtered.length}
                onPageChange={() => { }}
                getRowId={r => String(r.id)}
            />
        </div>
    );
};

export default WarehousePage;