
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Badge, Card } from '../components/ui';
import { useProductInfo } from '../api/hooks/useProducts';
import { ArrowLeft, Package, Tag, Layers, Calendar, Barcode, Edit3 } from 'lucide-react';

export const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, isError } = useProductInfo(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-supabase-green"></div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-red-500 font-medium">Error loading product details.</p>
        <Button variant="secondary" onClick={() => navigate('/products')}>Back to Products</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between bg-white dark:bg-[#232323] p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/products')}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-[#2e2e2e] rounded-full transition-colors"
          >
            <ArrowLeft size={18} className="text-neutral-500" />
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-widest">
              Product Details
            </h1>
            <Badge color="gray" className="text-[9px] px-1.5 py-0">REF: {product.productId || id}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => navigate(`/products/edit/${id}`)}
            className="font-bold flex items-center gap-2"
          >
            <Edit3 size={14} /> EDIT PRODUCT
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#232323] rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 space-y-6 shadow-sm">
            <h2 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] border-b border-neutral-100 dark:border-neutral-800 pb-2 flex items-center gap-2">
              <Package size={14} /> General Information
            </h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest block mb-1">Product Name</label>
                  <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{product.name}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest block mb-1">Category</label>
                  <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{product.category || '-'}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest block mb-1">Weight</label>
                  <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{product.weight ? `${product.weight} kg` : '-'}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest block mb-1">Created At</label>
                  <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 tabular-nums">
                    {(() => {
                      const d = new Date(product.createdAt);
                      return !isNaN(d.getTime()) ? d.toLocaleDateString() : '-';
                    })()}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest block mb-1">Description</label>
                <div className="p-3 bg-neutral-50 dark:bg-[#1c1c1c] border border-neutral-100 dark:border-neutral-800 rounded-md text-sm text-neutral-600 dark:text-neutral-300 min-h-[4rem]">
                  {product.description || <span className="text-neutral-400 italic">No description available.</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Variants Table Card */}
          <div className="bg-white dark:bg-[#232323] rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 space-y-4 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
              <h2 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Layers size={14} /> Variants & Inventory
              </h2>
              <Badge color="blue" className="text-[9px] uppercase tracking-widest font-black px-1.5 py-0">{product.ProductVariants?.length || 0} VARIANTS</Badge>
            </div>

            <div className="overflow-x-auto border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50/30 dark:bg-[#1c1c1c]/30">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100/50 dark:bg-[#232323]/50">
                    <th className="px-4 py-3 text-[9px] font-black text-neutral-400 uppercase tracking-widest">Variant ID</th>
                    <th className="px-4 py-3 text-[9px] font-black text-neutral-400 uppercase tracking-widest">Color / Size</th>
                    <th className="px-4 py-3 text-[9px] font-black text-neutral-400 uppercase tracking-widest text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {product.ProductVariants?.map((variant: any) => (
                    <tr key={variant.productVariantId} className="hover:bg-white dark:hover:bg-[#232323] transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-mono text-xs font-bold text-supabase-green uppercase">
                           {variant.variantId}
                        </div>
                        {/* Optionally handle barcodes */}
                        {variant.ProductBarcodes?.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-1">
                             <Barcode size={10} className="text-neutral-400" />
                             <span className="text-[9px] font-mono text-neutral-500 line-clamp-1">{variant.ProductBarcodes.map((b: any) => b.barcode).join(', ')}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-widest">
                          {variant.color || '-'} / {variant.size || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="text-xs font-mono font-bold text-neutral-700 dark:text-neutral-200 tabular-nums">
                          {variant.price ? `$${variant.price}` : '-'}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!product.ProductVariants || product.ProductVariants.length === 0) && (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-neutral-400 text-xs italic bg-neutral-50/50 dark:bg-[#1c1c1c]/50">
                        No variations defined for this product.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#232323] rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 space-y-4 shadow-sm">
            <h2 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] border-b border-neutral-100 dark:border-neutral-800 pb-2 flex items-center gap-2">
              <Tag size={14} /> Tracking Options
            </h2>
            
            <div className="space-y-3">
               <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50/50 dark:bg-[#1c1c1c]/50 border border-neutral-200 dark:border-neutral-800">
                <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-widest">Batch Tracking</span>
                <Badge color={product.trackBatch ? 'blue' : 'gray'} className="text-[8px] px-1.5 py-0 border-[0.5px]">
                  {product.trackBatch ? 'ENABLED' : 'DISABLED'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50/50 dark:bg-[#1c1c1c]/50 border border-neutral-200 dark:border-neutral-800">
                <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-widest">Serial Tracking</span>
                <Badge color={product.trackSerial ? 'purple' : 'gray'} className="text-[8px] px-1.5 py-0 border-[0.5px]">
                  {product.trackSerial ? 'ENABLED' : 'DISABLED'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50/50 dark:bg-[#1c1c1c]/50 border border-neutral-200 dark:border-neutral-800">
                <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-widest">Expiry Tracking</span>
                <Badge color={product.trackExpiry ? 'orange' : 'gray'} className="text-[8px] px-1.5 py-0 border-[0.5px]">
                  {product.trackExpiry ? 'ENABLED' : 'DISABLED'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#232323] rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 space-y-4 shadow-sm">
            <h2 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] border-b border-neutral-100 dark:border-neutral-800 pb-2 flex items-center gap-2">
              <Calendar size={14} /> History
            </h2>
            <div className="space-y-4 pt-2">
              <div className="flex gap-4 items-start">
                <div className="w-px h-full bg-neutral-200 dark:bg-neutral-800 relative mt-2 shrink-0">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Created</span>
                  <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 tabular-nums">
                    {(() => {
                      const d = new Date(product.createdAt);
                      return !isNaN(d.getTime()) ? d.toLocaleString() : '-';
                    })()}
                  </span>
                </div>
              </div>
              {product.updatedAt && (
                <div className="flex gap-4 items-start">
                  <div className="w-px h-full bg-neutral-200 dark:bg-neutral-800 relative mt-2 shrink-0">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Last Updated</span>
                    <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 tabular-nums">
                      {(() => {
                        const d = new Date(product.updatedAt);
                        return !isNaN(d.getTime()) ? d.toLocaleString() : '-';
                      })()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
