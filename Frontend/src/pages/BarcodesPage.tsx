import React, { useState, useEffect, useRef } from 'react';
import { CustomTable, Column } from '../components/CustomTable';
import { Badge, Button, Input, Modal, Dropdown, DropdownItem } from '../components/ui';
import type { Barcode } from '../types';
import { Search, Trash2, CheckCircle, XCircle, ChevronDown, Upload } from 'lucide-react';
import { useBarcodes, useBulkCreateBarcodes, useBulkUpdateBarcodeStatus } from '../api/hooks/useProducts';

export const BarcodesPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: queryData, isLoading: loading } = useBarcodes({ page, pageSize: 50, search: debouncedSearch });
  const bulkCreateMutation = useBulkCreateBarcodes();
  const bulkStatusMutation = useBulkUpdateBarcodeStatus();
  
  const rawData = queryData?.data || [];
  const data = rawData.filter(item => {
    const isActive = item.isActive !== undefined ? item.isActive : item.IsActive;
    if (statusFilter === 'active') return isActive;
    if (statusFilter === 'inactive') return !isActive;
    return true;
  });
  const total = statusFilter === 'all' ? (queryData?.total || 0) : data.length;

  const handleBulkStatusUpdate = async (isActive: boolean) => {
    if (selectedIds.length === 0) return;
    try {
      await bulkStatusMutation.mutateAsync({ barcodes: selectedIds, isActive });
      setSelectedIds([]);
    } catch (error) {
      // toast is handled in hook
    }
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await bulkCreateMutation.mutateAsync(formData);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const columns: Column<Barcode>[] = [
    {
      key: 'barcode',
      header: 'Barcode',
      render: (r) => <span className="font-mono font-bold text-neutral-600 dark:text-neutral-300">{r.barcode || r.Barcode}</span>
    },
    {
      key: 'variantId',
      header: 'Variant ID',
      render: (r) => <span className="text-xs">{r.variantId || r.VariantID}</span>
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => {
        const active = r.isActive !== undefined ? r.isActive : r.IsActive;
        return (
          <Badge color={active ? 'green' : 'red'}>
            {active ? 'ACTIVE' : 'INACTIVE'}
          </Badge>
        );
      }
    },
    {
      key: 'createdAt',
      header: 'Created At',
      render: (r) => {
        const d = new Date(r.createdAt || r.CreatedAt || Date.now());
        return <span className="text-[10px] text-neutral-400">{!isNaN(d.getTime()) ? d.toLocaleString() : '-'}</span>;
      }
    },
// No actions column needed per user request
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-3 pb-4 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50/50 dark:bg-[#1c1c1c]/50 p-2 rounded-md border border-neutral-100 dark:border-neutral-900">
        <div className="text-left flex items-center gap-4">
          <div>
            <h1 className="text-sm font-black text-black dark:text-white leading-none">Barcodes</h1>
            <p className="text-[9px] text-neutral-400 font-bold mt-0.5">Barcode Management</p>
          </div>
          
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 pl-4 border-l border-neutral-200 dark:border-[#2e2e2e] animate-in slide-in-from-left-2 duration-200">
              <span className="text-[10px] font-bold text-supabase-green uppercase tracking-widest bg-supabase-green/10 px-2 py-0.5 rounded">
                {selectedIds.length} SELECTED
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Dropdown
            trigger={
              <div className="h-6 px-3 flex items-center justify-between gap-2 rounded-md border border-dashed border-neutral-300 dark:border-neutral-800 bg-transparent cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-700 transition-all min-w-[100px]">
                <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                  {statusFilter === 'all' ? 'Status' : `Status: ${statusFilter}`}
                </span>
                <ChevronDown size={12} className="text-neutral-400" />
              </div>
            }
          >
            <div className="px-3 py-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-100 dark:border-[#2e2e2e] mb-1">
              Filter by status
            </div>
            <DropdownItem selected={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>
              All Barcodes
            </DropdownItem>
            <DropdownItem selected={statusFilter === 'active'} onClick={() => setStatusFilter('active')}>
              Active
            </DropdownItem>
            <DropdownItem selected={statusFilter === 'inactive'} onClick={() => setStatusFilter('inactive')}>
              Inactive
            </DropdownItem>
          </Dropdown>

          <div className="relative">
            <Input
              placeholder="Search barcodes..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full sm:w-48"
            />
          </div>

          <div className="flex gap-2 items-center">
            <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileImport} />
            <Button 
              variant="secondary" 
              onClick={() => fileInputRef.current?.click()} 
              disabled={bulkCreateMutation.isPending}
              className="font-bold whitespace-nowrap"
            >
              <Upload size={14} className="mr-1.5" />
              {bulkCreateMutation.isPending ? 'IMPORTING...' : 'IMPORT'}
            </Button>
            
            {selectedIds.length > 0 ? (
              <Dropdown
                trigger={
                  <Button variant="primary" className="font-bold flex items-center gap-2 whitespace-nowrap">
                    Actions <ChevronDown size={12} />
                  </Button>
                }
                align="right"
              >
                <DropdownItem onClick={() => {}}>Export</DropdownItem>
                <DropdownItem onClick={() => handleBulkStatusUpdate(true)}>Active</DropdownItem>
                <DropdownItem onClick={() => handleBulkStatusUpdate(false)}>InActive</DropdownItem>
              </Dropdown>
            ) : (
              <Button variant="primary" onClick={() => setIsAddModalOpen(true)} className="font-bold whitespace-nowrap">
                + ADD BARCODE
              </Button>
            )}
          </div>
        </div>
      </div>

      <CustomTable<Barcode>
        columns={columns}
        data={data}
        page={page}
        pageSize={50}
        total={total}
        loading={loading}
        onPageChange={setPage}
        getRowId={r => (r.id || r.Barcode || r.barcode)?.toString()}
        selectableRows={true}
        selectedRowIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Register New Barcode">
        <div className="p-4 text-center text-neutral-500 text-xs">Barcode registration form would be here.</div>
      </Modal>
    </div>
  );
};
