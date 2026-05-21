import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge, Button, Input } from '../components/ui';
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

  if (loading || !putaway) return <div className="p-8 text-center text-xxs text-neutral-400">Loading Task...</div>;

  const totalRequired = putaway.items?.reduce((sum, it) => sum + it.quantity, 0) || 0;
  const totalCompleted = putaway.items?.reduce((sum, it) => sum + it.putawayQuantity, 0) || 0;
  const totalPending = pendingScans.reduce((sum, s) => sum + s.quantity, 0);
  const isFullyScanned = totalCompleted + totalPending === totalRequired;

  return (
    <div className="space-y-3 pb-8 text-left">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-neutral-50/50 dark:bg-[#1c1c1c]/50 p-2 rounded-md border border-neutral-100 dark:border-neutral-900">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <h1 className="text-[11px] font-black text-black dark:text-white leading-none">
              Putaway: {putaway.putawayNumber}
            </h1>
            <Badge variant="secondary" className="text-[7px] py-0 h-3.5 px-1.5 font-black border-neutral-200 dark:border-neutral-800">
              {putaway.status}
            </Badge>
          </div>
          {putaway.assignedPickerName && (
            <p className="text-[9px] text-neutral-400 font-bold mt-0.5">
              Assigned to: <span className="text-neutral-600 dark:text-neutral-300">{putaway.assignedPickerName}</span>
            </p>
          )}
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/putaway')}
          className="h-6.5 px-3 text-[9px] font-black uppercase"
        >
          Back
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white dark:bg-[#232323] border border-neutral-100 dark:border-neutral-950 rounded-md overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="border-b border-neutral-50 dark:border-neutral-950">
                <tr>
                  <th className="px-3 py-2 text-[8px] font-black text-neutral-400 ">SKU</th>
                  <th className="px-3 py-2 text-[8px] font-black text-neutral-400 ">Product</th>
                  <th className="px-3 py-2 text-[8px] font-black text-neutral-400 text-right">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 dark:divide-neutral-950/30">
                {putaway.items?.map(it => (
                  <tr key={it.id}>
                    <td className="px-3 py-2.5 text-[10px] font-black text-black dark:text-white tabular-nums">{it.sku}</td>
                    <td className="px-3 py-2.5 text-[10px] text-neutral-500 dark:text-neutral-400 font-bold">{it.productName}</td>
                    <td className="px-3 py-2.5 text-right text-[10px] font-black text-black dark:text-white tabular-nums">
                      {it.putawayQuantity} / {it.quantity}
                      {totalPending > 0 && <span className="text-neutral-400 ml-1.5">(+{totalPending})</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pendingScans.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-[8px] font-black uppercase text-neutral-400 tracking-[0.2em] px-0.5">Pending Batch Scans</h3>
              <div className="bg-white dark:bg-[#232323] border border-neutral-100 dark:border-neutral-950 rounded-md overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="border-b border-neutral-50 dark:border-neutral-950">
                    <tr>
                      <th className="px-3 py-1.5 text-[8px] font-black text-neutral-400 ">Target Location</th>
                      <th className="px-3 py-1.5 text-[8px] font-black text-neutral-400 text-right">Qty</th>
                      <th className="px-3 py-1.5 text-[8px] font-black text-neutral-400 text-right w-16"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50 dark:divide-neutral-950/30">
                    {pendingScans.map((s, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2 text-[10px] font-black text-black dark:text-white">{s.shelfName}</td>
                        <td className="px-3 py-2 text-right text-[10px] font-black text-black dark:text-white tabular-nums">{s.quantity}</td>
                        <td className="px-3 py-2 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => updatePendingQty(idx, -1)}
                              className="w-5 h-5 flex items-center justify-center rounded border border-neutral-100 dark:border-neutral-900 bg-neutral-50 dark:bg-[#1c1c1c] hover:bg-neutral-100 dark:hover:bg-neutral-900 text-black dark:text-white font-black text-[10px]"
                            >
                              -
                            </button>
                            <button
                              onClick={() => removePendingRow(idx)}
                              className="text-neutral-300 dark:text-neutral-700 hover:text-black dark:hover:text-white transition-colors"
                            >
                              ✕
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

        <div className="space-y-3">
          <div className="p-3 bg-white dark:bg-[#232323] border border-neutral-100 dark:border-neutral-950 rounded-md space-y-3 shadow-sm">
            <div className="space-y-1">
              <label className="text-[8px] font-black text-neutral-400 px-0.5">Location Search</label>
              <Input
                placeholder="e.g. A1"
                value={shelfSearch}
                onChange={e => setShelfSearch(e.target.value)}
                disabled={isFullyScanned}
                className="h-8 text-[10px]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-black text-neutral-400 px-0.5">Target Shelf</label>
              <select
                value={targetShelf}
                onChange={e => setTargetShelf(e.target.value)}
                disabled={isFullyScanned}
                className="w-full h-8 px-2 text-[10px] font-bold rounded-md bg-neutral-50/50 dark:bg-[#1c1c1c]/50 border border-neutral-100 dark:border-neutral-900 text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              >
                {shelves.length === 0 && !shelvesLoading && <option value="">No results</option>}
                {shelves.map(s => <option key={s.id} value={s.id}>{`${s.aisle}-${s.shelfLevel}-${s.basket}`}</option>)}
              </select>
            </div>
            <div className="space-y-1 pt-3 border-t border-neutral-50 dark:border-neutral-950">
              <label className="text-[8px] font-black text-neutral-400 px-0.5">Scan SKU</label>
              <form onSubmit={handleScan} className="space-y-2">
                <Input
                  autoFocus
                  placeholder={isFullyScanned ? "Batch Complete" : "Enter SKU"}
                  value={scan}
                  onChange={e => setScan(e.target.value)}
                  disabled={putaway.status === 'COMPLETED' || completeMutation.isPending || isFullyScanned}
                  className="h-8 text-[10px]"
                />
                <Button
                  className="w-full h-8 text-[9px] font-black bg-black dark:bg-white text-white dark:text-black"
                  disabled={putaway.status === 'COMPLETED' || completeMutation.isPending || isFullyScanned}
                  type="submit"
                >
                  {putaway.status === 'COMPLETED' ? 'Completed' : isFullyScanned ? 'Scan Finished' : 'Log Scan'}
                </Button>
              </form>
            </div>

            {pendingScans.length > 0 && (
              <div className="pt-3 border-t border-neutral-50 dark:border-neutral-950 space-y-2">
                {!isFullyScanned && (
                  <p className="text-[8px] text-neutral-400 font-black text-center">
                    Pending Scans: {totalPending} / {totalRequired - totalCompleted}
                  </p>
                )}
                <Button
                  className="w-full h-9 text-[10px] font-black "
                  variant={isFullyScanned ? "primary" : "secondary"}
                  onClick={handleSubmit}
                  loading={completeMutation.isPending}
                  disabled={!isFullyScanned}
                >
                  {isFullyScanned ? 'Confirm All' : `Scan Remaining`}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
