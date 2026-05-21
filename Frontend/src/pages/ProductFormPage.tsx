import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Input } from '../components/ui';
import type { ProductVariant } from '../types';
import { Plus, X, ArrowLeft, Upload } from 'lucide-react';
import { useCreateProduct, useUpdateProduct, useProduct } from '../api/hooks/useProducts';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';

export const ProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const { data: productData, isLoading: isProductLoading } = useProduct(id);

  const variantFileInputRef = React.useRef<HTMLInputElement>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [weight, setWeight] = useState('');
  const [trackBatch, setTrackBatch] = useState(false);
  const [trackSerial, setTrackSerial] = useState(false);
  const [trackExpiry, setTrackExpiry] = useState(false);
  const [variants, setVariants] = useState<ProductVariant[]>([
    { variantId: '', color: '', size: '', price: 0 }
  ]);

  useEffect(() => {
    if (isEditMode && productData) {
      // Handle potential wrapping from apiFetch or different API structures
      const p = (productData as any).data && !Array.isArray((productData as any).data) 
        ? (productData as any).data 
        : productData;

      setName(p.name || p.Name || '');
      setDescription(p.description || p.Description || '');
      setCategory(p.category || p.Category || '');
      setWeight(String(p.weight || p.Weight || ''));
      setTrackBatch(!!(p.trackBatch || p.TrackBatch));
      setTrackSerial(!!(p.trackSerial || p.TrackSerial));
      setTrackExpiry(!!(p.trackExpiry || p.TrackExpiry));
      
      const apiVariants = p.variants || p.Variants || p.productVariants || p.ProductVariants || p.items || [];
      if (apiVariants && apiVariants.length > 0) {
        setVariants(apiVariants.map((v: any) => ({
          id: v.id || v.ProductID || v.ProductVariantID || v.productVariantId || v.VariantID,
          variantId: v.variantId || v.VariantID || v.sku || v.SKU || v.code || v.Code || '',
          color: v.color || v.Color || '',
          size: v.size || v.Size || '',
          price: parseFloat(v.price || v.Price || '0')
        })));
      }
    }
  }, [isEditMode, productData]);

  const addVariantRow = () => {
    setVariants([...variants, { variantId: '', color: '', size: '', price: 0 }]);
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    
    // Check uniqueness
    const key = `${newVariants[index].variantId}-${newVariants[index].color || ''}-${newVariants[index].size || ''}`.toLowerCase();
    const isDuplicate = newVariants.some((v, i) => {
      if (i === index) return false;
      return `${v.variantId}-${v.color || ''}-${v.size || ''}`.toLowerCase() === key;
    });

    if (isDuplicate && field !== 'price') {
      toast.warn(`Duplicate variant detected: ${newVariants[index].variantId} ${newVariants[index].color || ''} ${newVariants[index].size || ''}`);
    }

    setVariants(newVariants);
  };

  const handleImportVariants = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        const importedVariants: ProductVariant[] = data.map(row => ({
          variantId: String(row.variantId || row.SKU || row.sku || row['Variant ID'] || ''),
          color: String(row.color || row.Color || ''),
          size: String(row.size || row.Size || ''),
          price: parseFloat(row.price || row.Price || '0')
        })).filter(v => v.variantId);

        if (importedVariants.length === 0) {
          toast.error("No valid variants found in file");
          return;
        }

        // Filter out empty initial row if it's the only one
        const currentVariants = (variants.length === 1 && !variants[0].variantId) ? [] : variants;
        
        const combined = [...currentVariants, ...importedVariants];
        
        // Check uniqueness
        const seen = new Set();
        const unique = combined.filter(v => {
          const key = `${v.variantId}-${v.color || ''}-${v.size || ''}`.toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        if (unique.length < combined.length) {
          toast.info(`${combined.length - unique.length} duplicate variants were skipped`);
        }

        setVariants(unique);
        toast.success(`Imported ${unique.length - currentVariants.length} variants`);
      } catch (err) {
        toast.error("Failed to parse Excel file");
      }
    };
    reader.readAsBinaryString(file);
    if (variantFileInputRef.current) variantFileInputRef.current.value = '';
  };

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name) {
      toast.error("Product Name is required");
      return;
    }

    // Final uniqueness check
    const seen = new Set();
    const hasDuplicates = variants.some(v => {
      if (!v.variantId) return false;
      const key = `${v.variantId}-${v.color || ''}-${v.size || ''}`.toLowerCase();
      if (seen.has(key)) return true;
      seen.add(key);
      return false;
    });

    if (hasDuplicates) {
      toast.error("Duplicate variants found. Each combination of SKU, Color, and Size must be unique.");
      return;
    }

    const payload = {
      name,
      description,
      category,
      weight: parseFloat(weight) || 0,
      trackBatch,
      trackSerial,
      trackExpiry,
      // Some backends expect 'items' or 'productVariants' instead of just 'variants'
      variants: variants
        .filter(v => v.variantId)
        .map(v => ({
          id: v.id, // Include ID for existing variants
          productId: id, // Link back to parent product
          sku: v.variantId,
          variantId: v.variantId,
          color: v.color,
          size: v.size,
          price: v.price,
          trackBatch,
          trackSerial,
          trackExpiry
        })),
      items: variants
        .filter(v => v.variantId)
        .map(v => ({
          id: v.id,
          sku: v.variantId,
          color: v.color,
          size: v.size,
          price: v.price
        }))
    };

    try {
      if (isEditMode) {
        await updateProductMutation.mutateAsync({ id: id!, data: payload });
      } else {
        await createProductMutation.mutateAsync(payload);
      }
      navigate('/products');
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  };

  if (isEditMode && isProductLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-supabase-green"></div>
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
          <h1 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-widest">
            {isEditMode ? 'Edit Product' : 'Create New Product'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => navigate('/products')} className="font-bold">CANCEL</Button>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleSave}
            disabled={createProductMutation.isPending || updateProductMutation.isPending}
            className="font-bold"
          >
            {createProductMutation.isPending || updateProductMutation.isPending ? 'SAVING...' : isEditMode ? 'UPDATE PRODUCT' : 'CREATE PRODUCT'}
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#232323] rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 space-y-8 shadow-sm">
        {/* PRODUCT DETAILS */}
        <section className="space-y-6">
          <h2 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] border-b border-neutral-100 dark:border-neutral-800 pb-2">Product Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest px-1">Product Name</label>
              <Input placeholder="e.g. Valve Pro" value={name} onChange={e => setName(e.target.value)} required className="bg-neutral-50 dark:bg-[#1c1c1c] border-neutral-200 dark:border-neutral-800" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest px-1">Category</label>
              <Input placeholder="e.g. Hardware" value={category} onChange={e => setCategory(e.target.value)} className="bg-neutral-50 dark:bg-[#1c1c1c] border-neutral-200 dark:border-neutral-800" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest px-1">Weight (kg)</label>
              <Input type="number" step="0.01" placeholder="0.00" value={weight} onChange={e => setWeight(e.target.value)} className="bg-neutral-50 dark:bg-[#1c1c1c] border-neutral-200 dark:border-neutral-800" />
            </div>
            <div className="space-y-1.5 md:col-span-3">
              <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest px-1">Description</label>
              <textarea 
                placeholder="Technical specifications and details..." 
                value={description} 
                onChange={e => setDescription(e.target.value)}
                className="w-full h-20 bg-neutral-50 dark:bg-[#1c1c1c] border border-neutral-200 dark:border-neutral-800 rounded-md p-3 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-supabase-green transition-all resize-none"
              />
            </div>
          </div>
        </section>

        {/* TRACKING OPTIONS */}
        <section className="space-y-4">
          <h2 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] border-b border-neutral-100 dark:border-neutral-800 pb-2">Tracking Configuration</h2>
          <div className="flex flex-wrap gap-8">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" checked={trackBatch} onChange={e => setTrackBatch(e.target.checked)} className="accent-supabase-green w-3.5 h-3.5 rounded border-neutral-300 dark:border-neutral-700" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-widest group-hover:text-black dark:group-hover:text-white transition-colors">Track Batch</span>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" checked={trackSerial} onChange={e => setTrackSerial(e.target.checked)} className="accent-supabase-green w-3.5 h-3.5 rounded border-neutral-300 dark:border-neutral-700" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-widest group-hover:text-black dark:group-hover:text-white transition-colors">Track Serial</span>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" checked={trackExpiry} onChange={e => setTrackExpiry(e.target.checked)} className="accent-supabase-green w-3.5 h-3.5 rounded border-neutral-300 dark:border-neutral-700" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-widest group-hover:text-black dark:group-hover:text-white transition-colors">Track Expiry</span>
              </div>
            </label>
          </div>
        </section>

        {/* VARIANTS SECTION */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
            <h2 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Product Variants</h2>
            <div className="flex items-center gap-2">
              <input type="file" ref={variantFileInputRef} className="hidden" accept=".xlsx, .xls, .csv" onChange={handleImportVariants} />
              <Button variant="secondary" size="sm" type="button" onClick={() => variantFileInputRef.current?.click()} className="h-7 px-3 text-[9px] font-black uppercase tracking-widest">
                <Upload size={12} className="mr-1.5" /> Import
              </Button>
              <Button variant="secondary" size="sm" type="button" onClick={addVariantRow} className="h-7 px-3 text-[9px] font-black uppercase tracking-widest">
                <Plus size={14} className="mr-1.5" /> Add Row
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50/30 dark:bg-[#1c1c1c]/30">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100/50 dark:bg-[#232323]/50">
                  <th className="px-4 py-3 text-[9px] font-black text-neutral-400 uppercase tracking-widest w-12 text-center">#</th>
                  <th className="px-4 py-3 text-[9px] font-black text-neutral-400 uppercase tracking-widest">Variant ID</th>
                  <th className="px-4 py-3 text-[9px] font-black text-neutral-400 uppercase tracking-widest">Color</th>
                  <th className="px-4 py-3 text-[9px] font-black text-neutral-400 uppercase tracking-widest">Size</th>
                  <th className="px-4 py-3 text-[9px] font-black text-neutral-400 uppercase tracking-widest">Price</th>
                  <th className="px-4 py-3 text-[9px] font-black text-neutral-400 uppercase tracking-widest w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {variants.map((v, i) => (
                  <tr key={v.id || v.productVariantId || v.VariantID || i} className="group hover:bg-white dark:hover:bg-[#232323] transition-colors">
                    <td className="px-4 py-3 text-[10px] font-black text-neutral-400 tabular-nums text-center">
                      {String(i + 1).padStart(2, '0')}
                    </td>
                    <td className="px-3 py-2">
                      <Input 
                        placeholder="SKU-001" 
                        value={v.variantId} 
                        onChange={e => updateVariant(i, 'variantId', e.target.value)}
                        className="h-8 text-[11px] bg-white dark:bg-[#1c1c1c] border-neutral-200 dark:border-neutral-800 focus:ring-supabase-green"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input 
                        placeholder="Red" 
                        value={v.color} 
                        onChange={e => updateVariant(i, 'color', e.target.value)}
                        className="h-8 text-[11px] bg-white dark:bg-[#1c1c1c] border-neutral-200 dark:border-neutral-800 focus:ring-supabase-green"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input 
                        placeholder="XL" 
                        value={v.size} 
                        onChange={e => updateVariant(i, 'size', e.target.value)}
                        className="h-8 text-[11px] bg-white dark:bg-[#1c1c1c] border-neutral-200 dark:border-neutral-800 focus:ring-supabase-green"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input 
                        type="number"
                        step="0.01"
                        placeholder="0.00" 
                        value={v.price} 
                        onChange={e => updateVariant(i, 'price', parseFloat(e.target.value) || 0)}
                        className="h-8 text-[11px] bg-white dark:bg-[#1c1c1c] border-neutral-200 dark:border-neutral-800 focus:ring-supabase-green"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        type="button"
                        onClick={() => removeVariant(i)}
                        disabled={variants.length === 1}
                        className="text-neutral-300 dark:text-neutral-700 hover:text-red-500 transition-colors disabled:opacity-0"
                      >
                        <X size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center px-2">
            <span className="text-[8px] font-black text-neutral-300 uppercase tracking-widest">
              {variants.length} ENTRIES
            </span>
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
              Total Variants: <span className="text-black dark:text-white">{variants.length}</span>
            </span>
          </div>
        </section>
      </div>
    </div>
  );
};
