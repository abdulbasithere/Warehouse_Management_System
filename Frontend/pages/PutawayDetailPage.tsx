import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge, Button, Input, Select } from '../components/ui';
import type { Putaway, ShelfLocation } from '../types';
import { usePutawayDetail, useCompletePutaway } from '../api/hooks/usePutaway';
import { useShelfLocations } from '../api/hooks/useShelfLocations';
import localforage from 'localforage';
import { toast } from 'react-toastify';

interface PendingScan {
  shelfId: string;
  shelfName: string;
  quantity: number;
}

export const PutawayDetailPage: React.FC = () => {
  const { putawayId } = useParams<{ putawayId: string }>();
  const navigate = useNavigate();

  const [targetShelf, setTargetShelf] = useState('');
  const [shelfSearch, setShelfSearch] = useState('');
  const [scan, setScan] = useState('');
  const [pendingScans, setPendingScans] = useState<PendingScan[]>([]);

  const STORAGE_KEY = `putaway_scans_${putawayId}`;

  // React Query Hooks
  const { data: putaway, isLoading: loading } = usePutawayDetail(putawayId || '');
  const { data: shelvesData, isLoading: shelvesLoading } = useShelfLocations({
    page: 1,
    pageSize: 10,
    search: shelfSearch
  });
  const completeMutation = useCompletePutaway();

  const shelves = shelvesData?.data || [];

  // Load pending scans from local storage
  useEffect(() => {
    const loadSaved = async () => {
      if (!putawayId) return;
      const savedScans = await localforage.getItem<PendingScan[]>(STORAGE_KEY);
      if (savedScans) {
        setPendingScans(savedScans);
      }
    };
    loadSaved();
  }, [putawayId, STORAGE_KEY]);

  // Set default target shelf when shelves load
  useEffect(() => {
    if (shelves.length > 0 && !targetShelf) {
      setTargetShelf(shelves[0].id);
    }
  }, [shelves, targetShelf]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scan || !targetShelf || !putaway) return;

    // Prevent scanning if already fully scanned
    const totalRequired = putaway.items?.reduce((sum, it) => sum + it.quantity, 0) || 0;
    const totalCompleted = putaway.items?.reduce((sum, it) => sum + it.putawayQuantity, 0) || 0;
    const totalPending = pendingScans.reduce((sum, s) => sum + s.quantity, 0);

    if (totalCompleted + totalPending >= totalRequired) {
      toast.warning('All items for this task have already been scanned');
      setScan('');
      return;
    }

    // Validate SKU
    const item = putaway.items?.find(it => it.sku === scan || it.productId === scan);
    if (!item) {
      toast.error('SKU not found in this putaway task');
      setScan('');
      return;
    }

    // Check if total scanned + pending exceeds required
    const itemPendingQty = pendingScans.reduce((sum, s) => sum + s.quantity, 0); // Simplified: Assuming only one type of item in putaway for now as per current logic
    // Actually, the current logic in PutawayDetailPage allows multiple items, but the pendingScans doesn't track SKU?
    // Looking at the original code, pendingScans only tracks shelfId and quantity. 
    // Wait, the original code had:
    // const item = putaway.items?.find(it => it.sku === scan || it.productId === scan);
    // ...
    // updated[existingIdx] = { ...updated[existingIdx], quantity: updated[existingIdx].quantity + 1 };
    // This looks like it assumes there's only one SKU per putaway task or it doesn't care which SKU goes to which shelf in the pending list?
    // The backend completePutaway takes { shelfId, quantity }[] - it seems it's for a specific item putaway task or it aggregates?
    // Let's re-examine PutawayOverviewPage: it shows "Product" in columns. So a Putaway task is for ONE product.

    if (item.putawayQuantity + totalPending + 1 > item.quantity) {
      toast.error('Scanned quantity exceeds required quantity');
      setScan('');
      return;
    }

    const selectedShelf = shelves.find(s => s.id === targetShelf);
    const shelfName = selectedShelf ? `${selectedShelf.aisle}-${selectedShelf.shelfLevel}-${selectedShelf.basket}` : 'Unknown';

    const newPending = [...pendingScans];
    const existingIdx = newPending.findIndex(s => s.shelfId === targetShelf);
    if (existingIdx >= 0) {
      newPending[existingIdx] = { ...newPending[existingIdx], quantity: newPending[existingIdx].quantity + 1 };
    } else {
      newPending.push({ shelfId: targetShelf, shelfName, quantity: 1 });
    }

    setPendingScans(newPending);
    await localforage.setItem(STORAGE_KEY, newPending);
    setScan('');
    toast.success(`Scanned to ${shelfName}`);
  };

  const updatePendingQty = async (index: number, delta: number) => {
    const newPending = [...pendingScans];
    const newQty = newPending[index].quantity + delta;

    if (newQty <= 0) {
      newPending.splice(index, 1);
    } else {
      newPending[index] = { ...newPending[index], quantity: newQty };
    }

    setPendingScans(newPending);
    await localforage.setItem(STORAGE_KEY, newPending);
  };

  const removePendingRow = async (index: number) => {
    const newPending = [...pendingScans];
    newPending.splice(index, 1);
    setPendingScans(newPending);
    await localforage.setItem(STORAGE_KEY, newPending);
  };

  const handleSubmit = async () => {
    if (pendingScans.length === 0 || !putawayId) return;

    try {
      await completeMutation.mutateAsync({
        id: putawayId,
        scans: pendingScans.map(s => ({
          shelfId: s.shelfId,
          quantity: s.quantity
        }))
      });

      setPendingScans([]);
      await localforage.removeItem(STORAGE_KEY);
      navigate('/putaway');
    } catch (error: any) {
      // toast.error handled by mutation hook
    }
  };

  if (loading || !putaway) return <div className="p-8 text-center text-xxs uppercase tracking-widest text-neutral-400">Loading Task...</div>;

  const totalRequired = putaway.items?.reduce((sum, it) => sum + it.quantity, 0) || 0;
  const totalCompleted = putaway.items?.reduce((sum, it) => sum + it.putawayQuantity, 0) || 0;
  const totalPending = pendingScans.reduce((sum, s) => sum + s.quantity, 0);
  const isFullyScanned = totalCompleted + totalPending === totalRequired;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-bold text-black dark:text-white uppercase tracking-widest">Putaway {putaway.putawayNumber}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge color={
              putaway.status === 'COMPLETED' ? 'green' :
                putaway.status === 'IN-PROGRESS' ? 'blue' : 'orange'
            }>
              {putaway.status}
            </Badge>
            {putaway.assignedPickerName && (
              <span className="text-[10px] text-neutral-400 font-medium">
                Assigned to: <span className="text-neutral-600 dark:text-neutral-300 font-bold">{putaway.assignedPickerName}</span>
              </span>
            )}
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigate('/putaway')}>Back</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="border border-neutral-100 dark:border-neutral-900 rounded overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-950 text-xxs font-bold uppercase text-neutral-400">
                <tr><th className="px-3 py-2">SKU</th><th className="px-3 py-2">Item</th><th className="px-3 py-2 text-right">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 dark:divide-neutral-900">
                {putaway.items?.map(it => (
                  <tr key={it.id}>
                    <td className="px-3 py-2 font-bold text-black dark:text-white">{it.sku}</td>
                    <td className="px-3 py-2">{it.productName}</td>
                    <td className="px-3 py-2 text-right font-bold">
                      {it.putawayQuantity}/{it.quantity}
                      {totalPending > 0 && <span className="text-blue-500 ml-1">(+{totalPending})</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pendingScans.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xxs font-bold uppercase text-neutral-400">Pending Scans</h3>
              </div>
              <div className="border border-neutral-100 dark:border-neutral-900 rounded overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 dark:bg-neutral-950 text-xxs font-bold uppercase text-neutral-400">
                    <tr><th className="px-3 py-2">Location</th><th className="px-3 py-2 text-right">Quantity</th><th className="px-3 py-2 text-right">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50 dark:divide-neutral-900">
                    {pendingScans.map((s, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2">{s.shelfName}</td>
                        <td className="px-3 py-2 text-right font-bold">{s.quantity}</td>
                        <td className="px-3 py-2 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => updatePendingQty(idx, -1)}
                              title="Decrease Quantity"
                              className="w-6 h-6 flex items-center justify-center rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-black dark:text-white text-lg font-bold"
                            >
                              -
                            </button>
                            <button
                              onClick={() => removePendingRow(idx)}
                              title="Remove Row"
                              className="px-2 h-6 flex items-center justify-center rounded bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 text-[10px] font-bold uppercase tracking-wider transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="p-4 border border-neutral-100 dark:border-neutral-900 rounded bg-white dark:bg-black space-y-3">
            <div className="space-y-1">
              <label className="text-xxs font-bold uppercase text-neutral-400">Search Shelf</label>
              <Input
                placeholder="e.g. A1"
                value={shelfSearch}
                onChange={e => setShelfSearch(e.target.value)}
                disabled={isFullyScanned}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xxs font-bold uppercase text-neutral-400 flex justify-between">
                <span>Target Shelf</span>
              </label>
              <Select value={targetShelf} onChange={e => setTargetShelf(e.target.value)} disabled={isFullyScanned}>
                {shelves.length === 0 && !shelvesLoading && <option value="">No shelves found</option>}
                {shelves.map(s => <option key={s.id} value={s.id}>{`${s.aisle}-${s.shelfLevel}-${s.basket}`}</option>)}
              </Select>
            </div>
            <div className="space-y-1 pt-3 border-t border-neutral-100 dark:border-neutral-900">
              <label className="text-xxs font-bold uppercase text-neutral-400">Scan Item</label>
              <form onSubmit={handleScan}>
                <Input
                  autoFocus
                  placeholder={isFullyScanned ? "All items scanned" : "Scan SKU"}
                  value={scan}
                  onChange={e => setScan(e.target.value)}
                  disabled={putaway.status === 'COMPLETED' || completeMutation.isPending || isFullyScanned}
                />
                <Button
                  className="w-full mt-2"
                  disabled={putaway.status === 'COMPLETED' || completeMutation.isPending || isFullyScanned}
                  type="submit"
                >
                  {putaway.status === 'COMPLETED' ? 'Task Completed' : isFullyScanned ? 'Scan Finished' : 'Add to List'}
                </Button>
              </form>
            </div>

            {pendingScans.length > 0 && (
              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-900">
                {!isFullyScanned && (
                  <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest mb-2 animate-pulse text-center">
                    Please scan all items before submitting
                  </p>
                )}
                <Button
                  className="w-full"
                  variant={isFullyScanned ? "primary" : "secondary"}
                  onClick={handleSubmit}
                  loading={completeMutation.isPending}
                  disabled={!isFullyScanned}
                >
                  {isFullyScanned ? 'Confirm & Submit All' : `Need ${totalRequired - (totalCompleted + totalPending)} more`}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};