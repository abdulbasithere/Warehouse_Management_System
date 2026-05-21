import React, { useState, useEffect, useRef } from 'react';
import { CustomTable, Column } from '../components/CustomTable';
import { Badge, Button, Input, Modal } from '../components/ui';
import type { ProductVariant } from '../types';
import { Search, Trash2, Edit, Upload } from 'lucide-react';
import { useVariants, useBulkCreateVariants } from '../api/hooks/useProducts';

export const VariantsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: queryData, isLoading: loading } = useVariants({ page, pageSize: 50, search: debouncedSearch });
  const bulkCreateMutation = useBulkCreateVariants();
  
  const data = queryData?.data || [];
  const total = queryData?.total || 0;

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

  const columns: Column<ProductVariant>[] = [
    {
      key: 'variantId',
      header: 'Variant ID',
      render: (r) => <span className="font-bold text-neutral-600 dark:text-neutral-300">{r.variantId || r.VariantID}</span>
    },
    {
      key: 'color',
      header: 'Color',
      render: (r) => <span>{r.color || r.Color || '-'}</span>
    },
    {
      key: 'size',
      header: 'Size',
      render: (r) => <span>{r.size || r.Size || '-'}</span>
    },
    {
      key: 'price',
      header: 'Price',
      render: (r) => <span className="font-medium">${(r.price || r.Price || 0).toFixed(2)}</span>
    },
    {
      key: 'available',
      header: 'Available',
      render: (r) => <span className="font-bold text-supabase-green">{r.availableQuantity || r.AvailableQuantity || 0}</span>
    },
    {
      key: 'allocated',
      header: 'Allocated',
      render: (r) => <span className="font-bold text-orange-500">{r.allocatedQuantity || r.AllocatedQuantity || 0}</span>
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (r) => (
        <div className="flex justify-end gap-1">
          <Button variant="secondary" size="sm" onClick={() => setEditingVariant(r)}>
            <Edit size={14} />
          </Button>
          <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-600" onClick={() => {}}>
            <Trash2 size={14} />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-3 pb-4 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50/50 dark:bg-[#1c1c1c]/50 p-2 rounded-md border border-neutral-100 dark:border-neutral-900">
        <div className="text-left">
          <h1 className="text-sm font-black text-black dark:text-white leading-none">Variants</h1>
          <p className="text-[9px] text-neutral-400 font-bold mt-0.5">Product Variations</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative">
            <Input
              placeholder="Search variants..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full sm:w-48"
            />
          </div>
          <div className="flex gap-2">
            <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileImport} />
            <Button 
              variant="secondary" 
              onClick={() => fileInputRef.current?.click()} 
              disabled={bulkCreateMutation.isPending}
              className="font-bold"
            >
              <Upload size={14} className="mr-1.5" />
              {bulkCreateMutation.isPending ? 'IMPORTING...' : 'IMPORT'}
            </Button>
            <Button variant="primary" onClick={() => setIsAddModalOpen(true)} className="font-bold">
              + ADD VARIANT
            </Button>
          </div>
        </div>
      </div>

      <CustomTable<ProductVariant>
        columns={columns}
        data={data}
        page={page}
        pageSize={50}
        total={total}
        loading={loading}
        onPageChange={setPage}
        getRowId={r => (r.id || r.ProductVariantID || r.productVariantId || r.VariantID || r.variantId)?.toString()}
      />

      {/* Add/Edit Modals would go here - simplified for now */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Variant">
        <div className="p-4 text-center text-neutral-500 text-xs">Variant creation form would be here.</div>
      </Modal>

      <Modal isOpen={!!editingVariant} onClose={() => setEditingVariant(null)} title="Edit Variant">
        <div className="p-4 text-center text-neutral-500 text-xs">Variant edit form would be here.</div>
      </Modal>
    </div>
  );
};
