import React, { useState, useRef } from 'react';
import { DataTable, Column } from '../components/DataTable';
import { Badge, Button, Input, Modal } from '../components/ui';
import type { Product } from '../types';
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useBulkDeleteProducts,
  useBulkCreateProducts
} from '../api/hooks/useProducts';

export const ProductsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // React Query Hooks
  const { data: queryData, isLoading: loading } = useProducts({ page, pageSize: 100, search });
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();
  const bulkDeleteMutation = useBulkDeleteProducts();
  const bulkCreateMutation = useBulkCreateProducts();

  const data = queryData?.data || [];
  const total = queryData?.total || 0;

  // Create form state
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');

  // Edit form state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState('');

  // File upload state
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to page 1 on search
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku || !name) return;

    await createProductMutation.mutateAsync({
      sku,
      name,
      description,
      price: parseFloat(price) || 0
    });

    setSku('');
    setName('');
    setDescription('');
    setPrice('');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    await updateProductMutation.mutateAsync({
      id: editingProduct.sku,
      data: { name: editName, description: editDescription, price: parseFloat(editPrice) || 0 }
    });

    setEditingProduct(null);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setEditName(p.name);
    setEditDescription(p.description || '');
    setEditPrice(p.productPrice?.toString() || '0');
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedIds.length} items?`)) return;

    try {
      await bulkDeleteMutation.mutateAsync(selectedIds);
      setSelectedIds([]);
    } catch (err) {
      alert("Delete failed.");
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

  const columns: Column<Product>[] = [
    {
      key: 'sku',
      header: 'SKU',
      render: (r: Product) => <span className="font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-tight">{r.sku}</span>
    },
    {
      key: 'name',
      header: 'Item Details',
      render: (r: Product) => (
        <div className="flex flex-col max-w-[200px]">
          <span className="font-semibold text-neutral-500 dark:text-neutral-400 truncate">{r.name}</span>
          {r.description && <span className="text-[8px] text-neutral-400 line-clamp-1 italic">{r.description}</span>}
        </div>
      )
    },
    {
      key: 'qty',
      header: 'Stock',
      render: (r: Product) => (
        <div className="flex items-center gap-1">
          <span className="text-xs font-black text-neutral-600 dark:text-neutral-300 tabular-nums">{r.currentQuantity}</span>
          <Badge color={r.currentQuantity > 20 ? 'green' : 'orange'}>
            {r.currentQuantity > 20 ? 'In' : 'Low'}
          </Badge>
        </div>
      )
    },
    {
      key: 'price',
      header: 'Price',
      render: (r: Product) => <span className="text-xs font-black text-neutral-600 dark:text-neutral-300 tabular-nums">{r.productPrice}</span>
    },
    {
      key: 'act',
      header: '',
      className: 'text-right',
      render: (r: Product) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => openEditModal(r)}>Edit</Button>
          <Button variant="ghost" size="sm" className="text-red-400/80 hover:text-red-600" onClick={() => { if (window.confirm("Delete?")) deleteProductMutation.mutate(r.id); }}>Del</Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4 pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xs font-black text-neutral-500 dark:text-neutral-300 uppercase tracking-widest leading-none">Catalog</h1>
          <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest mt-0.5">Inventory Master</p>
        </div>

        <div className="flex items-center gap-2">
          <Input
            placeholder="Search..."
            value={search}
            onChange={handleSearchChange}
            className="w-32 sm:w-40 h-7"
          />
          <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileImport} />
          <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} disabled={bulkCreateMutation.isPending}>
            {bulkCreateMutation.isPending ? '...' : 'Import'}
          </Button>
          {selectedIds.length > 0 && (
            <Button variant="danger" size="sm" onClick={handleBulkDelete}>Delete ({selectedIds.length})</Button>
          )}
        </div>
      </div>

      <div className="p-3 bg-neutral-50/50 dark:bg-neutral-900/40 border border-neutral-100 dark:border-neutral-800 rounded-lg shadow-sm space-y-2">
        <h2 className="text-[8px] font-black uppercase text-neutral-400 tracking-[0.2em] px-1">New Entry</h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
          <div className="space-y-1">
            <label className="text-[8px] font-black text-neutral-400 uppercase tracking-widest px-1">SKU</label>
            <Input placeholder="SKU-101" value={sku} onChange={e => setSku(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-black text-neutral-400 uppercase tracking-widest px-1">Name</label>
            <Input placeholder="Valve Pro" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-black text-neutral-400 uppercase tracking-widest px-1">Description</label>
            <Input placeholder="Technical specs..." value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-black text-neutral-400 uppercase tracking-widest px-1">Price</label>
            <Input type="number" step="0.01" placeholder="0.00" value={price} onChange={e => setPrice(e.target.value)} />
          </div>
          <Button type="submit" disabled={createProductMutation.isPending} className="w-full">
            {createProductMutation.isPending ? '...' : 'Add'}
          </Button>
        </form>
      </div>

      <DataTable<Product>
        columns={columns}
        data={data}
        page={page}
        pageSize={100}
        total={total}
        loading={loading}
        onPageChange={setPage}
        selectableRows
        selectedRowIds={selectedIds}
        getRowId={r => r.sku}
        onSelectionChange={setSelectedIds}
      />

      <Modal isOpen={!!editingProduct} onClose={() => setEditingProduct(null)} title="Update Product">
        <form onSubmit={handleUpdate} className="space-y-3">
          <div className="space-y-1">
            <label className="text-[8px] font-black text-neutral-400 uppercase tracking-widest px-1">Name</label>
            <Input value={editName} onChange={e => setEditName(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-black text-neutral-400 uppercase tracking-widest px-1">Description</label>
            <Input value={editDescription} onChange={e => setEditDescription(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-black text-neutral-400 uppercase tracking-widest px-1">Price</label>
            <Input type="number" step="0.01" value={editPrice} onChange={e => setEditPrice(e.target.value)} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="secondary" className="flex-1" type="button" onClick={() => setEditingProduct(null)}>Cancel</Button>
            <Button className="flex-1" type="submit" disabled={updateProductMutation.isPending}>
              {updateProductMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};