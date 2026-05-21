import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomTable, Column } from '../components/CustomTable';
import { Button, Input, Dropdown, DropdownItem, Badge } from '../components/ui';
import { useSuppliers } from '../api/hooks/useSuppliers';
import { ChevronDown, Search } from 'lucide-react';

export interface Supplier {
    id?: string;
    supplierId?: string;
    SupplierID?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    Name?: string;
    city?: string;
    City?: string;
    phone?: string;
    Phone?: string;
    status?: string | boolean | number;
    Status?: string | boolean | number;
}

export const SupplierPage: React.FC = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(timer);
    }, [search]);

    const { data: response, isLoading } = useSuppliers();
    const suppliers = response?.data || [];

    const filteredSuppliers = suppliers.filter((s: Supplier) => {
        const firstName = s.firstName || s.name || s.Name || '';
        const lastName = s.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim();
        const id = s.id || s.supplierId || s.SupplierID || '';
        
        const statusVal = s.status !== undefined ? s.status : s.Status;
        const isActive = statusVal === true || statusVal === 1 || statusVal === 'true' || statusVal === 'Active';
        
        const matchesSearch = fullName.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
                             id.toLowerCase().includes(debouncedSearch.toLowerCase());
        
        if (statusFilter === 'ALL') return matchesSearch;
        return matchesSearch && (statusFilter === 'ACTIVE' ? isActive : !isActive);
    });

    const columns: Column<Supplier>[] = [
        {
            key: 'name', header: 'Supplier',
            render: (r) => (
                <div className="flex flex-col">
                    <span className="font-bold text-neutral-600 dark:text-neutral-300">
                        {r.firstName ? `${r.firstName} ${r.lastName || ''}` : (r.name || r.Name)}
                    </span>
                    <span className="text-[8px] text-neutral-400 uppercase tracking-tight">ID: {r.supplierId || r.SupplierID || r.id}</span>
                </div>
            ),
        },
        {
            key: 'city', header: 'City',
            render: (r) => <span className="text-xs text-neutral-500 dark:text-neutral-400">{r.city || r.City || '-'}</span>,
        },
        {
            key: 'phone', header: 'Phone',
            render: (r) => <span className="text-xs text-neutral-500 dark:text-neutral-400 tabular-nums">{r.phone || r.Phone || '-'}</span>,
        },
        {
            key: 'status', header: 'Status',
            render: (r) => {
                const statusVal = r.status !== undefined ? r.status : r.Status;
                const isActive = statusVal === true || statusVal === 1 || statusVal === 'true' || statusVal === 'Active';
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
                        onClick={() => navigate(`/suppliers/edit/${r.supplierId || r.SupplierID || r.id}`)}
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
                    <h1 className="text-sm font-black text-black dark:text-white leading-none">Suppliers</h1>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <Input
                        placeholder="Search suppliers..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full sm:w-48"
                    />
                    <Dropdown
                        className="w-full sm:w-auto"
                        fullWidth
                        trigger={
                            <div className="h-8 px-3 flex items-center justify-between gap-2 rounded-md border border-dashed border-neutral-300 dark:border-neutral-700 bg-transparent cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-500 transition-all min-w-[100px]">
                                <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                                    {statusFilter === 'ALL' ? 'Status' : `Status: ${statusFilter}`}
                                </span>
                                <ChevronDown size={12} className="text-neutral-400" />
                            </div>
                        }
                    >
                        <DropdownItem selected={statusFilter === 'ALL'} onClick={() => setStatusFilter('ALL')}>ALL STATUS</DropdownItem>
                        <DropdownItem selected={statusFilter === 'ACTIVE'} onClick={() => setStatusFilter('ACTIVE')}>ACTIVE</DropdownItem>
                        <DropdownItem selected={statusFilter === 'INACTIVE'} onClick={() => setStatusFilter('INACTIVE')}>INACTIVE</DropdownItem>
                    </Dropdown>
                    <Button 
                        variant="primary" 
                        onClick={() => navigate('/suppliers/new')}
                        className="w-full sm:w-auto font-bold whitespace-nowrap"
                    >
                        + ADD SUPPLIER
                    </Button>
                </div>
            </div>

            <CustomTable<Supplier>
                columns={columns}
                data={filteredSuppliers}
                loading={isLoading}
                page={1}
                pageSize={100}
                total={filteredSuppliers.length}
                onPageChange={() => { }}
                getRowId={r => String(r.supplierId || r.SupplierID || r.id || Math.random().toString())}
            />
        </div>
    );
};

export default SupplierPage;
