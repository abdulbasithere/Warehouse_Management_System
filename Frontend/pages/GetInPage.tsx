import React, { useState } from 'react';
import { DataTable, Column } from '../components/DataTable';
import { Button, Input } from '../components/ui';
import { GetInPageEntry } from './GetInPageEntry';

// ─── Types ────────────────────────────────────────────────────────────────────
type StatusKey = 'received' | 'pending' | 'in_transit' | 'draft';

interface GetInRow {
    id: number;
    refNo: string;
    po: string;
    shipment: string;
    supplier: string;
    warehouse: string;
    quantity: number;
    status: StatusKey;
    date: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const mockData: GetInRow[] = [
    { id: 1, refNo: 'GI-2025-001', po: 'PO-1042', shipment: 'SH-8801', supplier: 'Al-Fatah Traders',   warehouse: 'WH-A', quantity: 240, status: 'received',   date: '2025-03-10' },
    { id: 2, refNo: 'GI-2025-002', po: 'PO-1043', shipment: 'SH-8802', supplier: 'Raza Brothers',       warehouse: 'WH-B', quantity: 120, status: 'pending',    date: '2025-03-11' },
    { id: 3, refNo: 'GI-2025-003', po: 'PO-1044', shipment: 'SH-8803', supplier: 'Metro Supply Co.',    warehouse: 'WH-A', quantity: 580, status: 'in_transit', date: '2025-03-12' },
    { id: 4, refNo: 'GI-2025-004', po: 'PO-1045', shipment: 'SH-8804', supplier: 'Karachi Imports',     warehouse: 'WH-C', quantity: 90,  status: 'draft',      date: '2025-03-13' },
    { id: 5, refNo: 'GI-2025-005', po: 'PO-1046', shipment: 'SH-8805', supplier: 'Crown Distributors', warehouse: 'WH-B', quantity: 310, status: 'received',   date: '2025-03-14' },
    { id: 6, refNo: 'GI-2025-006', po: 'PO-1047', shipment: 'SH-8806', supplier: 'Al-Fatah Traders',   warehouse: 'WH-A', quantity: 75,  status: 'pending',    date: '2025-03-14' },
    { id: 7, refNo: 'GI-2025-007', po: 'PO-1048', shipment: 'SH-8807', supplier: 'Pak Logistics',      warehouse: 'WH-C', quantity: 430, status: 'received',   date: '2025-03-15' },
];

const statusConfig: Record<StatusKey, { label: string; bg: string; text: string; dot: string }> = {
    received:   { label: 'Received',   bg: 'bg-emerald-500/10', text: 'text-emerald-500', dot: 'bg-emerald-500' },
    pending:    { label: 'Pending',    bg: 'bg-amber-500/10',   text: 'text-amber-500',   dot: 'bg-amber-500'   },
    in_transit: { label: 'In Transit', bg: 'bg-blue-500/10',    text: 'text-blue-500',    dot: 'bg-blue-500'    },
    draft:      { label: 'Draft',      bg: 'bg-neutral-500/10', text: 'text-neutral-400', dot: 'bg-neutral-400' },
};

const warehouses = ['All', 'WH-A', 'WH-B', 'WH-C'];
const statuses   = ['All', 'received', 'pending', 'in_transit', 'draft'];

// ─── Page ─────────────────────────────────────────────────────────────────────
const GetInPage: React.FC = () => {
    const [view, setView] = useState<'list' | 'entry'>('list');
    const [search, setSearch]                   = useState('');
    const [warehouseFilter, setWarehouseFilter] = useState('All');
    const [statusFilter, setStatusFilter]       = useState('All');
    const [page, setPage] = useState(1);
    const pageSize = 10;

    // ── Entry view ────────────────────────────────────────────────────────────
    if (view === 'entry') {
        return (
            <GetInPageEntry
                onDiscard={() => setView('list')}
                onSave={(_mode) => setView('list')}
            />
        );
    }

    // ── Filter ────────────────────────────────────────────────────────────────
    const filtered = mockData.filter(row => {
        const q             = search.toLowerCase();
        const matchSearch   = !q || row.po.toLowerCase().includes(q) || row.refNo.toLowerCase().includes(q) || row.shipment.toLowerCase().includes(q);
        const matchWarehouse = warehouseFilter === 'All' || row.warehouse === warehouseFilter;
        const matchStatus    = statusFilter    === 'All' || row.status    === statusFilter;
        return matchSearch && matchWarehouse && matchStatus;
    });

    // ── Columns ───────────────────────────────────────────────────────────────
    const columns: Column<GetInRow>[] = [
        {
            key: 'refNo',
            header: 'Ref No',
            render: (r) => (
                <span className="text-[10px] font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                    {r.refNo}
                </span>
            ),
        },
        {
            key: 'po',
            header: 'PO #',
            render: (r) => (
                <span className="text-[10px] font-bold text-neutral-700 dark:text-neutral-300">
                    {r.po}
                </span>
            ),
        },
        {
            key: 'shipment',
            header: 'Shipment',
            render: (r) => (
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                    {r.shipment}
                </span>
            ),
        },
        {
            key: 'supplier',
            header: 'Supplier Name',
            render: (r) => (
                <span className="text-[10px] text-neutral-600 dark:text-neutral-300 truncate max-w-[160px] block">
                    {r.supplier}
                </span>
            ),
        },
        {
            key: 'warehouse',
            header: 'Warehouse',
            render: (r) => (
                <span className="text-[9px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 px-2 py-0.5 rounded-md">
                    {r.warehouse}
                </span>
            ),
        },
        {
            key: 'quantity',
            header: 'Quantity',
            render: (r) => (
                <span className="text-[10px] font-black tabular-nums text-neutral-700 dark:text-neutral-300">
                    {r.quantity.toLocaleString()}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (r) => {
                const sc = statusConfig[r.status];
                return (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wide ${sc.bg} ${sc.text}`}>
                        <span className={`w-1 h-1 rounded-full ${sc.dot}`} />
                        {sc.label}
                    </span>
                );
            },
        },
        {
            key: 'date',
            header: 'Date',
            render: (r) => (
                <span className="text-[10px] text-neutral-400">
                    {new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                </span>
            ),
        },
        {
            key: 'id',
            header: 'Actions',
            render: () => (
                <div className="flex items-center gap-1">
                    <Button variant="secondary" size="sm" className="h-6 px-2 text-[8px]">View</Button>
                    <Button variant="secondary" size="sm" className="h-6 px-2 text-[8px]">Edit</Button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-3 pb-6">
            {/* Header — same pattern as ProductMapping */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3
                bg-neutral-50/40 dark:bg-neutral-900/40 p-3 rounded-lg
                border border-neutral-100 dark:border-neutral-800"
            >
                <div className="space-y-0.5">
                    <h1 className="text-xs font-black text-neutral-500 dark:text-neutral-300 uppercase tracking-widest leading-none">
                        Get In
                    </h1>
                    <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-tighter">
                        Inbound shipment management
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setView('entry')}
                        className="h-7 px-3 text-[9px] font-black uppercase tracking-widest"
                    >
                        + Add New
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                <Input
                    placeholder="Search PO, Ref No, Shipment..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                    className="h-8 text-xs min-w-[220px]"
                />
                <select
                    value={warehouseFilter}
                    onChange={e => { setWarehouseFilter(e.target.value); setPage(1); }}
                    className="h-8 px-2 text-[10px] font-bold uppercase tracking-widest rounded-lg bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-300"
                >
                    {warehouses.map(w => (
                        <option key={w} value={w}>{w === 'All' ? 'All Warehouses' : w}</option>
                    ))}
                </select>
                <select
                    value={statusFilter}
                    onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                    className="h-8 px-2 text-[10px] font-bold uppercase tracking-widest rounded-lg bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-300"
                >
                    {statuses.map(s => (
                        <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s.replace('_', ' ')}</option>
                    ))}
                </select>
                {(search || warehouseFilter !== 'All' || statusFilter !== 'All') && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setSearch(''); setWarehouseFilter('All'); setStatusFilter('All'); setPage(1); }}
                        className="h-8 text-[9px]"
                    >
                        Clear
                    </Button>
                )}
            </div>

            {/* Table */}
            <DataTable<GetInRow>
                columns={columns}
                data={filtered}
                page={page}
                pageSize={pageSize}
                total={filtered.length}
                loading={false}
                onPageChange={setPage}
                //getRowId={r => r.id}
            />
        </div>
    );
};

export default GetInPage;