import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge, Button, Input, ProgressBar } from '../components/ui';
import type { PickListItem } from '../types';
import { usePickListDetail, useAssignBasket, useScanPickItem, useCompletePickList } from '../api/hooks/usePicklists';

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
    return Array.from(new Set(items.map(it => it.orderNumber).filter(Boolean)));
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
      } catch (err: any) {
        setError(err.message || "Failed to scan item.");
      }
    } else {
      setError("Invalid SKU or already picked.");
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

  if (loading || !pickList) return <div className="p-8 text-center text-xxs font-bold text-neutral-400">Loading Picking Task...</div>;

  return (
    <div className="space-y-4 pb-12 text-left">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-neutral-50/50 dark:bg-[#1c1c1c]/50 p-2 rounded-md border border-neutral-100 dark:border-neutral-900">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <h1 className="text-[11px] font-black text-black dark:text-white leading-none">
              Picking: {pickList.pickingListNumber}
            </h1>
            <Badge variant="secondary" className="text-[7px] py-0 h-3.5 px-1.5 font-black border-neutral-200 dark:border-neutral-800">
              {pickList.status}
            </Badge>
          </div>
          <p className="text-[9px] text-neutral-400 font-bold mt-0.5">
            {uniqueOrders.length} Orders • {totalRequired} Units total
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/picking')}
          className="h-6.5 px-3 text-[9px] font-black uppercase"
        >
          Back
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        <div className="lg:col-span-3 space-y-3">
          <div className="p-3 bg-white dark:bg-[#232323] border border-neutral-100 dark:border-neutral-950 rounded-md space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-black uppercase text-neutral-400 tracking-widest">Picking Batch Progress</span>
              <span className="text-[10px] font-black tabular-nums text-black dark:text-white">{totalPicked} / {totalRequired} Units</span>
            </div>
            <ProgressBar value={totalPicked} max={totalRequired} className="h-1.5 bg-neutral-50 dark:bg-[#1c1c1c]" />
          </div>

          <div className="bg-white dark:bg-[#232323] border border-neutral-100 dark:border-neutral-950 rounded-md overflow-hidden shadow-sm text-left">
            <table className="w-full text-left">
              <thead className="border-b border-neutral-50 dark:border-neutral-950">
                <tr>
                  <th className="px-3 py-2 text-[8px] font-black text-neutral-400 ">Location</th>
                  <th className="px-3 py-2 text-[8px] font-black text-neutral-400 ">Order</th>
                  <th className="px-3 py-2 text-[8px] font-black text-neutral-400 ">Product SKU</th>
                  <th className="px-3 py-2 text-[8px] font-black text-neutral-400 ">Qty</th>
                  <th className="px-3 py-2 text-[8px] font-black text-neutral-400 text-right">Basket</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 dark:divide-neutral-950/30">
                {items.map(it => (
                  <tr key={it.id} className={`
                    ${it.pickedQty >= it.requiredQty ? 'opacity-25' : ''} 
                    ${activeLocation === it.shelfLocation?.toUpperCase() ? 'bg-neutral-50 dark:bg-[#1c1c1c]/50' : ''}
                    transition-colors
                  `}>
                    <td className="px-3 py-2 text-[10px] font-black text-neutral-600 dark:text-neutral-300 tabular-nums">{it.shelfLocation}</td>
                    <td className="px-3 py-2 text-[9px] font-bold text-neutral-400 truncate max-w-[80px]">{it.orderNumber}</td>
                    <td className="px-3 py-2">
                      <div className="text-[10px] font-black text-black dark:text-white leading-none uppercase tracking-tighter">{it.sku}</div>
                      <div className="text-[8px] text-neutral-400 font-bold uppercase truncate max-w-[120px] mt-0.5">{it.itemName}</div>
                    </td>
                    <td className="px-3 py-2 text-[10px] font-black text-black dark:text-white tabular-nums">{it.pickedQty} / {it.requiredQty}</td>
                    <td className="px-3 py-2 text-right">
                      {it.basketReference ? (
                        <Badge variant="secondary" className="text-[7px] py-0 h-3.5 px-1.5 font-black border-neutral-200 dark:border-neutral-800">
                          {it.basketReference}
                        </Badge>
                      ) : (
                        <span className="text-[8px] text-neutral-300 font-black ">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-3">
          {/* Basket Manager */}
          <div className="p-3 border border-neutral-100 dark:border-neutral-950 rounded-md bg-white dark:bg-[#232323] shadow-sm space-y-2.5">
            <h2 className="text-[8px] font-black uppercase text-neutral-400 tracking-widest border-b border-neutral-50 dark:border-neutral-950 pb-1.5">Basket Mapping</h2>
            <div className="space-y-2 max-h-40 overflow-y-auto px-0.5 scrollbar-thin">
              {uniqueOrders.map(orderNum => (
                <div key={orderNum} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-neutral-500 uppercase">{orderNum}</span>
                    {orderBaskets[orderNum!] && (
                      <Badge variant="secondary" className="text-[7px] py-0 h-3.5 px-1.5 font-black border-neutral-200 dark:border-neutral-800">
                        {orderBaskets[orderNum!]}
                      </Badge>
                    )}
                  </div>
                  {!orderBaskets[orderNum!] && (
                    <Input
                      placeholder="Scan Basket ID"
                      disabled={assignBasketMutation.isPending}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleBasketSet(orderNum!, e.currentTarget.value);
                      }}
                      className="!h-6.5 text-[9px] placeholder:text-neutral-300"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Scanning Interface */}
          <div className="p-3 border border-neutral-100 dark:border-neutral-950 rounded-md bg-white dark:bg-[#232323] shadow-sm space-y-3">
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase text-neutral-400 tracking-widest px-0.5">Location Scan</label>
                <form onSubmit={handleLocScan}>
                  <Input
                    placeholder="Enter Shelf ID..."
                    className="!h-8 font-black text-[10px] uppercase"
                    value={locScan}
                    onChange={e => setLocScan(e.target.value)}
                    autoFocus={!activeLocation}
                  />
                </form>
                {activeLocation && (
                  <div className="mt-2 flex items-center justify-between p-1.5 bg-neutral-50 dark:bg-[#1c1c1c]/50 rounded-md border border-neutral-100 dark:border-neutral-800">
                    <span className="text-[8px] font-black text-neutral-400 ">Active Loc:</span>
                    <span className="text-[10px] font-black text-black dark:text-white ">{activeLocation}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase text-neutral-400 tracking-widest px-0.5">Product SKU Scan</label>
                <form onSubmit={handleSkuScan}>
                  <Input
                    placeholder="Enter Barcode..."
                    className="!h-8 font-black text-[10px] uppercase"
                    disabled={!activeLocation || scanItemMutation.isPending}
                    value={skuScan}
                    onChange={e => setSkuScan(e.target.value)}
                    autoFocus={!!activeLocation}
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
              disabled={!isComplete || completeMutation.isPending}
              onClick={handleConfirmPick}
              loading={completeMutation.isPending}
            >
              {isComplete ? 'Finalize Picking' : `${totalRequired - totalPicked} Units Left`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
