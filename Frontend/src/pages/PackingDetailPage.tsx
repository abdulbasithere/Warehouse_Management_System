import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge, Button, Input, ProgressBar } from '../components/ui';
import { fetchPackingJobBySaleOrder, scanPackItem, completePacking } from '../api/client';

interface PackedItem {
  id: string;
  sku: string;
  itemName: string;
  requiredQty: number;
  packedQty: number;
}

export const PackingDetailPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const navigate = useNavigate();

  // State
  const [skuScan, setSkuScan] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<any>(null);
  const [items, setItems] = useState<PackedItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!orderNumber) return;
    setLoading(true);
    try {
      const res = await fetchPackingJobBySaleOrder(orderNumber);
      setJob(res.job);
      setItems(res.items);
    } catch (err) {
      console.error(err);
      setError("Failed to load packing job.");
    } finally {
      setLoading(false);
    }
  }, [orderNumber]);

  useEffect(() => { load(); }, [load]);

  const totalPacked = useMemo(() => items.reduce((sum, it) => sum + it.packedQty, 0), [items]);
  const totalRequired = useMemo(() => items.reduce((sum, it) => sum + it.requiredQty, 0), [items]);
  const isComplete = totalPacked > 0 && totalPacked === totalRequired;

  const handleSkuScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skuScan || !orderNumber) return;
    setError(null);

    const input = skuScan.trim().toUpperCase();
    const targetItem = items.find(it => it.sku.toUpperCase() === input && it.packedQty < it.requiredQty);

    if (targetItem) {
      try {
        await scanPackItem(orderNumber, input);
        setItems(prev => prev.map(it => it.sku.toUpperCase() === input ? { ...it, packedQty: it.packedQty + 1 } : it));
        setSkuScan('');
      } catch (err: any) {
        setError(err.message || "Failed to scan item.");
      }
    } else {
      setError("Invalid SKU or already packed.");
      setSkuScan('');
    }
  };

  const handleConfirmPack = async () => {
    if (!orderNumber) return;
    setSubmitting(true);
    try {
      await completePacking(orderNumber);
      navigate('/packing');
    } catch (err: any) {
      setError("Failed to finalize packing.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !job) return <div className="p-8 text-center text-xxs font-bold text-neutral-400">Loading Packing Task...</div>;

  return (
    <div className="space-y-4 pb-12 text-left">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-neutral-50/50 dark:bg-[#1c1c1c]/50 p-2 rounded-md border border-neutral-100 dark:border-neutral-900">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <h1 className="text-[11px] font-black text-black dark:text-white leading-none">
              Packing: {job.saleOrderNumber}
            </h1>
            <Badge variant="secondary" className="text-[7px] py-0 h-3.5 px-1.5 font-black border-neutral-200 dark:border-neutral-800">
              {job.status}
            </Badge>
          </div>
          <p className="text-[9px] text-neutral-400 font-bold mt-0.5">
            Verification & Manifest generation
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/packing')}
          className="h-6.5 px-3 text-[9px] font-black uppercase"
        >
          Queue
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        <div className="lg:col-span-3 space-y-3">
          <div className="p-3 bg-white dark:bg-[#232323] border border-neutral-100 dark:border-neutral-950 rounded-md space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-black uppercase text-neutral-400 tracking-widest">Verification Progress</span>
              <span className="text-[10px] font-black tabular-nums text-black dark:text-white">{totalPacked} / {totalRequired} Units</span>
            </div>
            <ProgressBar value={totalPacked} max={totalRequired} className="h-1.5 bg-neutral-50 dark:bg-[#1c1c1c]" />
          </div>

          <div className="bg-white dark:bg-[#232323] border border-neutral-100 dark:border-neutral-950 rounded-md overflow-hidden shadow-sm text-left">
            <table className="w-full text-left">
              <thead className="border-b border-neutral-50 dark:border-neutral-950">
                <tr>
                  <th className="px-3 py-2 text-[8px] font-black text-neutral-400 ">Product SKU</th>
                  <th className="px-3 py-2 text-[8px] font-black text-neutral-400 ">Item Name</th>
                  <th className="px-3 py-2 text-[8px] font-black text-neutral-400 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 dark:divide-neutral-950/30">
                {items.map(it => (
                  <tr key={it.id} className={`${it.packedQty >= it.requiredQty ? 'opacity-25' : ''} transition-colors`}>
                    <td className="px-3 py-2">
                      <div className="text-[10px] font-black text-black dark:text-white leading-none uppercase tracking-tighter">{it.sku}</div>
                    </td>
                    <td className="px-3 py-2 text-[9px] font-bold text-neutral-400 truncate max-w-[200px]">{it.itemName}</td>
                    <td className="px-3 py-2 text-[10px] font-black text-black dark:text-white tabular-nums text-right">
                      {it.packedQty} / {it.requiredQty}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-3 border border-neutral-100 dark:border-neutral-950 rounded-md bg-white dark:bg-[#232323] shadow-sm space-y-3">
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase text-neutral-400 tracking-widest px-0.5">Product Barcode Scan</label>
                <form onSubmit={handleSkuScan}>
                  <Input
                    placeholder="Enter Barcode..."
                    className="!h-8 font-black text-[10px] uppercase"
                    value={skuScan}
                    onChange={e => setSkuScan(e.target.value)}
                    autoFocus
                  />
                </form>
              </div>

              {error && (
                <div className="p-2 bg-neutral-50 dark:bg-[#232323] border border-neutral-100 dark:border-neutral-800 rounded-md">
                  <p className="text-[9px] text-neutral-500 font-bold leading-none">{error}</p>
                </div>
              )}
            </div>

            <Button
              className="w-full h-9 text-[10px] font-black bg-black dark:bg-white text-white dark:text-black"
              variant={isComplete ? 'primary' : 'secondary'}
              disabled={!isComplete || submitting}
              onClick={handleConfirmPack}
              loading={submitting}
            >
              {isComplete ? 'Generate Manifest' : `${totalRequired - totalPacked} Units Left`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
