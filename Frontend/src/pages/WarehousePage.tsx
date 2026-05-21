import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomTable, Column } from '../components/CustomTable';
import { Button, Input, Badge, Dropdown, DropdownItem } from '../components/ui';
import { useWarehouses } from '../api/hooks/useWarehouses';
import { ChevronDown } from 'lucide-react';

export interface Warehouse {
    id: number;
    name: string;
    warehouseName?: string;
    phone: string;
    address: string;
    zip: string;
    isActive?: boolean | number;
    status?: string | boolean | number;
}

export const WarehousePage: React.FC = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(timer);
    }, [search]);

    const { data: response, isLoading } = useWarehouses({ search: debouncedSearch });
    const warehouses = response?.data || [];

    const filteredWarehouses = warehouses.filter((w: any) => {
        if (statusFilter === 'ALL') return true;
        const statusStr = String(w.status || '').toLowerCase();
        const isActive = w.isActive === true || w.isActive === 1 || w.status === true || w.status === 1 || statusStr === 'active';
        return statusFilter === 'ACTIVE' ? isActive : !isActive;
    });

    const columns: Column<Warehouse>[] = [
        {
            key: 'name', header: 'Warehouse',
            render: (r) => (
                <div className="flex flex-col">
                    <span className="font-bold text-neutral-600 dark:text-neutral-300">{r.name || r.warehouseName}</span>
                </div>
            ),
        },
        {
            key: 'phone', header: 'Phone',
            render: (r) => <span className="text-xs text-neutral-500 dark:text-neutral-400 tabular-nums">{r.phone || '-'}</span>,
        },
        {
            key: 'address', header: 'Address', className: 'hidden sm:table-cell',
            render: (r) => <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate max-w-[200px] block">{r.address || '-'}</span>,
        },
        {
            key: 'status', header: 'Status',
            render: (r) => {
                const statusStr = String(r.status || '').toLowerCase();
                const isActive = r.isActive === true || r.isActive === 1 || r.status === true || r.status === 1 || statusStr === 'active';
                return (
                    <Badge color={isActive ? 'green' : 'gray'}>
                        {isActive ? 'ACTIVE' : 'INACTIVE'}
                    </Badge>
                );
            },
        },
        {
            key: 'actions', header: '',
            className: 'text-right',
            render: (r) => (
                <div className="flex justify-end gap-1">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/warehouses/edit/${r.id}`)}
                    >
                        Details
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="flex-1 flex flex-col min-h-0 space-y-3 pb-4 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50/50 dark:bg-[#1c1c1c]/50 p-2 rounded-md border border-neutral-100 dark:border-neutral-900">
                <div className="text-left">
                    <h1 className="text-sm font-black text-black dark:text-white leading-none">Warehouses</h1>
                    <p className="text-[9px] text-neutral-400 font-bold mt-0.5">Distribution Center Management</p>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-2 w-full md:w-auto">
                    <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
                        <Dropdown
                            className="w-full sm:w-auto min-w-[140px]"
                            fullWidth
                            trigger={
                                <div className="h-6 px-3 flex items-center justify-between gap-2 rounded-md border border-dashed border-neutral-300 dark:border-neutral-700 bg-transparent cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-500 transition-all min-w-[120px]">
                                    <span className="text-[10px] text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                                        {statusFilter === 'ALL' ? 'ALL STATUS' : statusFilter}
                                    </span>
                                    <ChevronDown size={14} className="text-neutral-400" />
                                </div>
                            }
                        >
                            <DropdownItem selected={statusFilter === 'ALL'} onClick={() => setStatusFilter('ALL')}>ALL STATUS</DropdownItem>
                            <DropdownItem selected={statusFilter === 'ACTIVE'} onClick={() => setStatusFilter('ACTIVE')}>ACTIVE</DropdownItem>
                            <DropdownItem selected={statusFilter === 'INACTIVE'} onClick={() => setStatusFilter('INACTIVE')}>INACTIVE</DropdownItem>
                        </Dropdown>

                        <Input
                            placeholder="Search nodes..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full sm:w-64 lg:w-48"
                        />
                    </div>
                    
                    <Button 
                        variant="primary" 
                        onClick={() => navigate('/warehouses/new')}
                        className="w-full sm:w-auto font-bold whitespace-nowrap"
                    >
                        + ADD NODE
                    </Button>
                </div>
            </div>

            <CustomTable<Warehouse>
                columns={columns}
                data={filteredWarehouses}
                loading={isLoading}
                page={1}
                pageSize={100}
                total={filteredWarehouses.length}
                onPageChange={() => { }}
                getRowId={r => String(r.id)}
            />
        </div>
    );
};

export default WarehousePage;
