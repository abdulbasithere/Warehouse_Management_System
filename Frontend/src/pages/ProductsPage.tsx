import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomTable, Column } from '../components/CustomTable';
import { Badge, Button, Input, Modal, Select } from '../components/ui';
import type { Product } from '../types';
import { ChevronDown, Search, Upload, Trash2, Eye } from 'lucide-react';
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useBulkDeleteProducts,
  useBulkCreateProducts
} from '../api/hooks/useProducts';

export const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  // React Query Hooks
  const { data: queryData, isLoading: loading } = useProducts({ page, pageSize: 50, search: debouncedSearch });

  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();
  const bulkCreateMutation = useBulkCreateProducts();

  const data = queryData?.data || [];
  const total = queryData?.total || 0;

  // File upload state
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
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
      key: 'productId',
      header: 'Product ID',
      render: (r: Product) => <span className="font-mono text-[10px] font-bold text-neutral-500">{r.productId || r.ProductID || r.id}</span>
    },
    {
      key: 'name',
      header: 'Name',
      render: (r: Product) => <span className="font-bold text-neutral-600 dark:text-neutral-300">{r.name || r.Name}</span>
    },
    {
      key: 'weight',
      header: 'Weight',
      render: (r: Product) => <span className="text-xs font-medium tabular-nums">{r.weight || 0} kg</span>
    },
    {
      key: 'trackBatch',
      header: 'Batch',
      render: (r: Product) => (
        <Badge color={r.trackBatch ? 'blue' : 'gray'}>
          {r.trackBatch ? 'YES' : 'NO'}
        </Badge>
      )
    },
    {
      key: 'trackSerial',
      header: 'Serial',
      render: (r: Product) => (
        <Badge color={r.trackSerial ? 'purple' : 'gray'}>
          {r.trackSerial ? 'YES' : 'NO'}
        </Badge>
      )
    },
    {
      key: 'trackExpiry',
      header: 'Expiry',
      render: (r: Product) => (
        <Badge color={r.trackExpiry ? 'orange' : 'gray'}>
          {r.trackExpiry ? 'YES' : 'NO'}
        </Badge>
      )
    },
    {
      key: 'totalVariants',
      header: 'Variants',
      render: (r: Product) => {
        const count = r.totalVariants || r.TotalVariants || 0;
        
        let colorClass = "border-neutral-500/30 bg-neutral-500/10 text-neutral-500"; // Default Gray
        
        if (count > 0 && count <= 2) {
          colorClass = "border-orange-500/30 bg-orange-500/10 text-orange-500"; // PICKER style
        } else if (count > 2 && count <= 5) {
          colorClass = "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"; // PACKER/MANAGER style
        } else if (count > 5) {
          colorClass = "border-blue-500/30 bg-blue-500/10 text-blue-500"; // MASTER style
        }

        return (
          <div className={`inline-flex items-center justify-center px-2 py-0.5 rounded border ${colorClass} text-[10px] font-black tracking-wider uppercase`}>
            {count}
          </div>
        );
      }
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (r: Product) => (
        <div className="flex justify-end gap-1">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => navigate(`/products/${String(r.id || r.productId || r.ProductID || '')}/details`)}
          >
            <Eye size={14} className="mr-1" /> Details
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate(`/products/edit/${r.id || r.productId || r.ProductID || r.ProductID}`)}>Edit</Button>
        </div>
      )
    }
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-3 pb-4 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50/50 dark:bg-[#1c1c1c]/50 p-2 rounded-md border border-neutral-100 dark:border-neutral-900">
        <div className="text-left">
          <h1 className="text-sm font-black text-black dark:text-white leading-none">Products</h1>
          <p className="text-[9px] text-neutral-400 font-bold mt-0.5">Master Catalog</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative">
            <Input
              placeholder="Search products..."
              value={search}
              onChange={handleSearchChange}
              className="w-full sm:w-48"
            />
          </div>
          
          <div className="flex gap-2">
            <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileImport} />
            <Button 
              variant="secondary" 
              onClick={() => fileInputRef.current?.click()} 
              disabled={bulkCreateMutation.isPending}
              className="flex-1 sm:flex-none font-bold"
            >
              <Upload size={14} className="mr-1.5" />
              {bulkCreateMutation.isPending ? 'IMPORTING...' : 'IMPORT'}
            </Button>
            
            <Button 
              variant="primary" 
              onClick={() => navigate('/products/new')}
              className="flex-1 sm:flex-none font-bold whitespace-nowrap"
            >
              + ADD PRODUCT
            </Button>
          </div>
        </div>
      </div>

      <CustomTable<Product>
        columns={columns}
        data={data}
        page={page}
        pageSize={50}
        total={total}
        loading={loading}
        onPageChange={setPage}
        getRowId={r => (r.id || r.ProductID || r.productId || r.sku || r.SKU)?.toString()}
      />
    </div>
  );
};
