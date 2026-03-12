import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Input, ProgressBar } from '../components/ui';
import { useBasketPacking, useScanBasketItem, useCompleteBasketPacking } from '../api/hooks/usePacking';

interface BasketItem {
  sku: string;
  orderedQty: number;
  packedQty: number;
}

interface BasketOrder {
  saleOrderNumber: string;
  items: BasketItem[];
}

interface BasketData {
  orders: BasketOrder[];
}

export const BasketPackingPage: React.FC = () => {
  const { basketRef } = useParams<{ basketRef: string }>();
  const navigate = useNavigate();
  const [scan, setScan] = useState('');
  const [error, setError] = useState<string | null>(null);

  // React Query Hooks
  const { data, isLoading: loading } = useBasketPacking(basketRef || '');
  const scanMutation = useScanBasketItem();
  const completeMutation = useCompleteBasketPacking();

  // Derived Progress
  const totalOrdered = useMemo(() => {
    if (!data) return 0;
    return data.orders.reduce((sum: number, o: BasketOrder) => sum + o.items.reduce((s, i) => s + i.orderedQty, 0), 0);
  }, [data]);

  const totalPacked = useMemo(() => {
    if (!data) return 0;
    return data.orders.reduce((sum: number, o: BasketOrder) => sum + o.items.reduce((s, i) => s + i.packedQty, 0), 0);
  }, [data]);

  const isComplete = totalOrdered > 0 && totalPacked === totalOrdered;

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scan || !data || !basketRef) return;
    setError(null);

    const input = scan.trim().toUpperCase();

    // Find if the SKU exists and needs packing (just for validation/error message)
    let skuValid = false;
    let alreadyPacked = true;

    for (const order of data.orders) {
      const item = order.items.find(it => it.sku.toUpperCase() === input);
      if (item) {
        skuValid = true;
        if (item.packedQty < item.orderedQty) {
          alreadyPacked = false;
          break;
        }
      }
    }

    if (!skuValid) {
      setError(`SKU "${input}" not found in this basket.`);
      setScan('');
      return;
    }

    if (alreadyPacked) {
      setError(`SKU "${input}" is already fully packed in this basket.`);
      setScan('');
      return;
    }

    try {
      await scanMutation.mutateAsync({ basket: basketRef, sku: input });
      setScan('');
    } catch (err: any) {
      setError(err.message || "Failed to scan item.");
    }
  };

  const handleFinish = async () => {
    if (!basketRef) return;
    try {
      await completeMutation.mutateAsync(basketRef);
      navigate('/packing');
    } catch (err: any) {
      setError("Failed to complete packing. Please try again.");
    }
  };

  if (loading || !data) return <div className="p-8 text-center text-xxs uppercase tracking-widest text-neutral-400">Loading Basket...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-bold text-black dark:text-white uppercase tracking-widest">Basket {basketRef}</h1>
          <p className="text-xxs text-neutral-600 dark:text-neutral-400 font-medium">Batch fulfillment for {data.orders.length} orders</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigate('/packing')}>Back</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Total Progress */}
          <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-900 rounded space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xxs font-bold uppercase text-neutral-600 dark:text-neutral-400">Total Basket Progress</span>
              <span className="text-xxs font-bold text-black dark:text-white">{totalPacked}/{totalOrdered}</span>
            </div>
            <ProgressBar value={totalPacked} max={totalOrdered} />
          </div>

          {/* Orders & Items */}
          <div className="space-y-4">
            {data.orders.map((order: BasketOrder) => {
              const orderPacked = order.items.reduce((sum, i) => sum + i.packedQty, 0);
              const orderTotal = order.items.reduce((sum, i) => sum + i.orderedQty, 0);

              return (
                <div key={order.saleOrderNumber} className="border border-neutral-100 dark:border-neutral-900 rounded overflow-hidden bg-white dark:bg-black">
                  <div className="px-3 py-2 bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <span className="text-xxs font-black text-neutral-800 dark:text-neutral-200">Order: {order.saleOrderNumber}</span>
                    <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400">{orderPacked}/{orderTotal}</span>
                  </div>
                  <table className="w-full text-left text-xs">
                    <tbody className="divide-y divide-neutral-50 dark:divide-neutral-900">
                      {order.items.map(it => (
                        <tr key={it.sku} className={it.packedQty >= it.orderedQty ? 'opacity-40' : ''}>
                          <td className="px-3 py-2 font-bold text-neutral-900 dark:text-neutral-100">{it.sku}</td>
                          <td className="px-3 py-2 text-right tabular-nums font-bold text-neutral-700 dark:text-neutral-300">
                            {it.packedQty} / {it.orderedQty}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 border border-neutral-100 dark:border-neutral-900 rounded bg-white dark:bg-black shadow-sm space-y-4">
            <div className="space-y-2">
              <label className="text-xxs font-extrabold uppercase text-neutral-600 dark:text-neutral-400">Scan SKU to Pack</label>
              <form onSubmit={handleScan} className="space-y-2">
                <Input
                  autoFocus
                  placeholder="Scan Item Barcode"
                  value={scan}
                  onChange={e => setScan(e.target.value)}
                  disabled={isComplete || scanMutation.isPending}
                />
                <Button className="w-full" disabled={isComplete || !scan || scanMutation.isPending} loading={scanMutation.isPending}>Confirm Scan</Button>
              </form>
              {error && <p className="text-[10px] text-red-500 font-bold animate-pulse">{error}</p>}
            </div>

            <button
              disabled={!isComplete || completeMutation.isPending}
              onClick={handleFinish}
              className={`w-full h-8 rounded-lg flex items-center justify-center gap-2 font-bold tracking-wider text-xs transition-all duration-300 transform active:scale-95 shadow-lg border-2 ${isComplete
                ? 'bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-700 hover:shadow-emerald-500/20 shadow-emerald-900/40 cursor-pointer'
                : 'bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed'
                }`}
            >
              {completeMutation.isPending ? "Finalizing..." : isComplete ? "Finish Packing" : "Remaining Items..."}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
