import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge, Button, Input, ProgressBar } from '../components/ui';
import type { PickList, PickListItem } from '../types';
import { usePickListDetail, useAssignBasket, useScanPickItem, useCompletePickList } from '../api/hooks/usePicklists';
import { toast } from 'react-toastify';

export const PickingDetailPage: React.FC = () => {
  const { pickListId } = useParams<{ pickListId: string }>();
  const navigate = useNavigate();

  // State
  const [skuScan, setSkuScan] = useState('');
  const [locScan, setLocScan] = useState('');
  const [activeLocation, setActiveLocation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // React Query Hooks
  const { data: detail, isLoading: loading } = usePickListDetail(pickListId || '');
  const pickList = detail?.pickList;
  const items: PickListItem[] = detail?.items || [];

  const assignBasketMutation = useAssignBasket();
  const scanItemMutation = useScanPickItem();
  const completeMutation = useCompletePickList();

  const uniqueOrders = useMemo(() => {
    const orders = items.map(it => it.orderNumber).filter((v, i, a) => a.indexOf(v) === i);
    return orders;
  }, [items]);

  const orderBaskets = useMemo(() => {
    const baskets: { [key: string]: string } = {};
    items.forEach(it => {
      if (it.orderNumber && it.basketReference) {
        baskets[it.orderNumber] = it.basketReference;
      }
    });
    return baskets;
  }, [items]);

  const totalPicked = useMemo(() => items.reduce((sum, it) => sum + it.pickedQty, 0), [items]);
  const totalRequired = useMemo(() => items.reduce((sum, it) => sum + it.requiredQty, 0), [items]);
  const isComplete = totalPicked > 0 && totalPicked === totalRequired;

  const handleLocScan = (e: React.FormEvent) => {
    e.preventDefault();
    const input = locScan.trim().toUpperCase();
    if (!input) return;

    const locationExists = items.some(it => it.shelfLocation?.trim().toUpperCase() === input && it.pickedQty < it.requiredQty);
    if (locationExists) {
      setActiveLocation(input);
      setLocScan('');
      setError(null);
    } else {
      setError(`Invalid or empty location: ${input}`);
      setLocScan('');
    }
  };

  const handleSkuScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skuScan || !pickList || !activeLocation || !pickListId) return;
    setError(null);

    const input = skuScan.trim().toUpperCase();

    // Verify SKU at Active Location
    const targetItem = items.find(it =>
      it.shelfLocation?.trim().toUpperCase() === activeLocation &&
      it.sku.toUpperCase() === input &&
      it.pickedQty < it.requiredQty
    );

    if (targetItem) {
      // Check if basket is assigned for this order
      if (targetItem.orderNumber && !orderBaskets[targetItem.orderNumber]) {
        setError(`Please assign a basket for Order ${targetItem.orderNumber} first.`);
        setSkuScan('');
        return;
      }

      try {
        await scanItemMutation.mutateAsync({ id: pickListId, sku: input });
        setSkuScan('');

        // Check if all items at this location are picked (using refetched data would be better, but we can optimistic check)
        const remainingAtLoc = items.some(it =>
          it.id !== targetItem.id && // not the one we just scanned
          it.shelfLocation?.trim().toUpperCase() === activeLocation &&
          it.pickedQty < it.requiredQty
        );
        // Note: targetItem is from old state. If we need exactly 1 more, then it's finished now.
        if (targetItem.pickedQty + 1 >= targetItem.requiredQty && !remainingAtLoc) {
          setActiveLocation(null);
        }
      } catch (err: any) {
        setError(err.message || "Failed to scan item.");
      }
    } else {
      // Check if this SKU exists but in a DIFFERENT location
      const existsElsewhere = items.some(it => it.sku.toUpperCase() === input && it.pickedQty < it.requiredQty);
      if (existsElsewhere) {
        setError("Item found in picklist, but NOT at this location.");
      } else {
        setError("Invalid SKU or already picked.");
      }
      setSkuScan('');
    }
  };

  const handleBasketSet = async (orderNumber: string, basketId: string) => {
    if (!basketId || !pickListId) return;
    try {
      await assignBasketMutation.mutateAsync({ id: pickListId, basket: basketId, orderNumber });
    } catch (err: any) {
      setError(`Failed to assign basket to Order ${orderNumber}.`);
    }
  };

  const handleConfirmPick = async () => {
    if (!pickListId) return;
    try {
      await completeMutation.mutateAsync(pickListId);
      navigate('/picking');
    } catch (err: any) {
      setError("Failed to finalize picking. Please try again.");
    }
  };

  if (loading || !pickList) return <div className="p-8 text-center text-xxs font-bold uppercase tracking-widest text-neutral-400">Loading Picking Task...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-black dark:text-white uppercase tracking-widest">{pickList.pickingListNumber}</h1>
            <Badge color={pickList.status === 'COMPLETED' ? 'green' : 'orange'}>{pickList.status}</Badge>
          </div>
          <p className="text-[10px] text-neutral-500 font-bold">{uniqueOrders.length} Orders • {totalRequired} Units</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigate('/picking')}>Back</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 space-y-4">
          <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xxs font-bold uppercase text-neutral-500 tracking-wider">Progress</span>
              <span className="text-xs font-bold tabular-nums">{totalPicked} / {totalRequired}</span>
            </div>
            <ProgressBar value={totalPicked} max={totalRequired} className="h-2 rounded-full" />
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-neutral-50 dark:bg-neutral-950 text-xxs font-bold uppercase text-neutral-500 border-b border-neutral-100 dark:border-neutral-800">
                <tr>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Basket</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800">
                {items.map(it => (
                  <tr key={it.id} className={`${it.pickedQty >= it.requiredQty ? 'opacity-30' : ''} ${activeLocation === it.shelfLocation?.toUpperCase() ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
                    <td className="px-4 py-2 font-black text-blue-600 dark:text-blue-400">{it.shelfLocation}</td>
                    <td className="px-4 py-2 font-bold text-neutral-400">{it.orderNumber}</td>
                    <td className="px-4 py-2">
                      <div className="font-bold">{it.sku}</div>
                      <div className="text-[9px] text-neutral-500 truncate max-w-[120px]">{it.itemName}</div>
                    </td>
                    <td className="px-4 py-2 font-black tabular-nums">{it.pickedQty} / {it.requiredQty}</td>
                    <td className="px-4 py-2">
                      {it.basketReference ? (
                        <Badge color="green" className="text-[9px]">{it.basketReference}</Badge>
                      ) : (
                        <span className="text-red-500 font-bold animate-pulse">Required</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          {/* Basket Manager */}
          <div className="p-4 border border-neutral-100 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900 shadow-sm space-y-3">
            <h2 className="text-xxs font-black uppercase text-neutral-400 tracking-widest border-b border-neutral-50 dark:border-neutral-800 pb-2">Assign Baskets</h2>
            {uniqueOrders.map(orderNum => (
              <div key={orderNum} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold">{orderNum}</span>
                  {orderBaskets[orderNum!] && <Badge color="green" size="sm">{orderBaskets[orderNum!]}</Badge>}
                </div>
                {!orderBaskets[orderNum!] && (
                  <div className="flex gap-1">
                    <Input
                      placeholder="Scan Basket"
                      disabled={assignBasketMutation.isPending}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleBasketSet(orderNum!, e.currentTarget.value);
                      }}
                      className="!h-7 text-[10px]"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Scanning Interface */}
          <div className="p-4 border border-neutral-100 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900 shadow-sm space-y-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-neutral-400">Scan Location</label>
                <form onSubmit={handleLocScan}>
                  <Input
                    placeholder="Scan Shelf..."
                    className="!h-8 font-bold text-xs"
                    value={locScan}
                    onChange={e => setLocScan(e.target.value)}
                    autoFocus={!activeLocation}
                  />
                </form>
                {activeLocation && (
                  <div className="mt-10 flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <span className="text-[10px] font-bold text-blue-600">Active:</span>
                    <span className="text-xs font-black text-blue-600 dark:text-blue-300">{activeLocation}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-neutral-400">Scan Product Barcode</label>
                <form onSubmit={handleSkuScan}>
                  <Input
                    placeholder="Scan Barcode..."
                    className="!h-8 font-bold text-xs"
                    disabled={!activeLocation || scanItemMutation.isPending}
                    value={skuScan}
                    onChange={e => setSkuScan(e.target.value)}
                    autoFocus={!!activeLocation}
                  />
                </form>
              </div>

              {error && (
                <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg">
                  <p className="text-[10px] text-red-600 font-bold leading-tight">{error}</p>
                </div>
              )}
            </div>

            <Button
              className="w-full h-10 rounded-xl text-xs font-bold shadow-lg"
              variant={isComplete ? 'primary' : 'secondary'}
              disabled={!isComplete || completeMutation.isPending}
              onClick={handleConfirmPick}
              loading={completeMutation.isPending}
            >
              {isComplete ? 'Complete Picking' : `${totalRequired - totalPicked} Items Remaining`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
