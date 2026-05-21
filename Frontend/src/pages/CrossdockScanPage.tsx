import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Input, Badge, ProgressBar, SearchableDropdown, Dropdown, DropdownItem } from '../components/ui';
import { CustomTable, Column } from '../components/CustomTable';
import { ScanLine, QrCode, Filter, RefreshCcw, Edit2, Save, X, FileSpreadsheet, ChevronDown } from 'lucide-react';

import { useInboundShipmentDetail, useCrossDockLines, usePutScannedItem, useUpdateQuantities, useUpdateInboundShipment, useProcessCrossDockPlan } from '../api/hooks/useInboundShipments';
import { syncCrossDockLines } from '../api/endpoints/inboundShipments';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { updateScannedQuantity, updateItemStatus, setInitialProgress, setValueOverrides, ScanItem } from '../redux/slices/crossdockSlice';
import { toast } from 'react-toastify';

export const CrossdockScanPage: React.FC = () => {
  const { id: shipmentIdParam } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // Use id from URL directly as shipmentNumber for lines
  const shipmentIdParamsFinal = shipmentIdParam || '';
  const { data: crossDockLinesData, isLoading: linesLoading, refetch: refetchLines, isFetching: isFetchingLines } = useCrossDockLines(shipmentIdParamsFinal);
  
  // Local Progress State
  const scanProgress = useAppSelector(state => state.crossdock.progress[shipmentIdParamsFinal]) || {};

  const mapRawLineToScanItem = (it: any, index: number): ScanItem => {
    const variant = it.ProductVariant || it.productVariant || it.Variant;
    const barcodesList = variant?.ProductBarcodes?.filter((b: any) => b.isActive !== false).map((b: any) => b.barcode) 
                  || (Array.isArray(it.barcodes) ? it.barcodes.map((b: any) => typeof b === 'string' ? b : b.barcode) : []) 
                  || [it.barcode].filter(Boolean)
                  || [];
    
    return {
      id: String(it.id || it.ShipmentLineID || it.shipmentLineId || `${it.purchaseOrderId || 'no-po'}-${variant?.productVariantId || it.variantId || 'no-var'}-${index}`),
      purchaseOrderId: it.purchaseOrderId || it.poNumber || it.PONumber || shipmentIdParam || '',
      variantId: String(variant?.productVariantId || it.productVariantId || it.variantId || it.sku || it.SKU || it.id || ''),
      itemDescription: it.itemDescription || it.description || variant?.ProductBarcodes?.[0]?.description || (Array.isArray(it.barcodes) && it.barcodes[0]?.description) || it.productName || it.Name || variant?.Product?.name || variant?.name || 'No Description',
      color: variant?.color || it.color || '-',
      size: variant?.size || it.size || '-',
      warehouseId: it.warehouseId || 0,
      warehouseName: it.Warehouse?.warehouseName || it.warehouseName || it.warehouse || 'Unknown',
      plannedQuantity: it.plannedQuantity || it.quantity || it.packageQty || it.qty || 0,
      scannedQuantity: it.scannedQuantity || it.qty_scanned || 0,
      status: it.status || 'Pending',
      barcodes: barcodesList,
      uploadedBarcode: it.barcode
    };
  };

  const rawLines = crossDockLinesData?.data || crossDockLinesData?.lines || crossDockLinesData;
  const items: ScanItem[] = Array.isArray(rawLines) ? rawLines.map((it: any, index: number) => {
    const baseItem = mapRawLineToScanItem(it, index);
    const progress = scanProgress[baseItem.id];
    if (progress) {
       return {
         ...baseItem,
         scannedQuantity: Math.max(baseItem.scannedQuantity, progress.scannedQuantity),
         plannedQuantity: typeof progress.plannedQuantity === 'number' ? progress.plannedQuantity : baseItem.plannedQuantity,
         status: (baseItem.status === 'Completed' || baseItem.status === 'Posted' || baseItem.status === 'Scanned') ? baseItem.status : (progress.status || baseItem.status)
       };
    }
    return baseItem;
  }) : [];
  
  // Optional: fetch shipment detail if id happens to be a database ID, but don't let it block
  const { data: viewingShipment, isLoading: shipmentLoading } = useInboundShipmentDetail(shipmentIdParamsFinal);
  const postMutation = usePutScannedItem();
  const updateQuantitiesMutation = useUpdateQuantities();
  const updateInboundShipmentMutation = useUpdateInboundShipment();
  const processCrossDockPlanMutation = useProcessCrossDockPlan();
  
  const shipmentNumber = viewingShipment?.shipmentNumber || viewingShipment?.shipment || viewingShipment?.Shipment || viewingShipment?.shipmentNo || viewingShipment?.refNo || shipmentIdParam;

  // Modal state
  const [scanningItem, setScanningItem] = useState<ScanItem | null>(null);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editPlannedQtyValue, setEditPlannedQtyValue] = useState('');
  const [editScannedQtyValue, setEditScannedQtyValue] = useState('');
  const [scanInput, setScanInput] = useState('');
  const [globalScanInput, setGlobalScanInput] = useState('');
  const [scanQuantity, setScanQuantity] = useState('1');
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastScannedId, setLastScannedId] = useState<string | null>(null);
  const [warehouseFilter, setWarehouseFilter] = useState('ALL');
  const [poFilter, setPoFilter] = useState('ALL');
  const globalInputRef = React.useRef<HTMLInputElement>(null);

  // Filtered items logic
  const warehouses = Array.from(new Set(items.map(it => it.warehouseName))) as string[];
  const purchaseOrders = Array.from(new Set(items.map(it => it.purchaseOrderId).filter(Boolean))) as string[];

  const filteredItems = items.filter(it => {
    const matchesWarehouse = warehouseFilter === 'ALL' || it.warehouseName === warehouseFilter;
    const matchesPO = poFilter === 'ALL' || it.purchaseOrderId === poFilter;
    return matchesWarehouse && matchesPO;
  });

  // Overall progress logic
  const totalPlanned = filteredItems.reduce((sum, it) => sum + it.plannedQuantity, 0);
  const totalScanned = filteredItems.reduce((sum, it) => sum + it.scannedQuantity, 0);
  const totalProgress = totalPlanned > 0 ? Math.round((totalScanned / totalPlanned) * 100) : 0;

  // Audio Feedback Helper
  const playFlashSound = (type: 'success' | 'error' | 'warning') => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContext();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      if (type === 'success') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
      } else if (type === 'error') {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.5);
      } else if (type === 'warning') {
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3);
      }
    } catch (e) {
      console.error('Audio feedback failed', e);
    }
  };

  useEffect(() => {
    // Keep focus on global input but allow clicking other inputs
    const handleFocus = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA';
      
      if (!scanningItem && !isInput) {
        globalInputRef.current?.focus();
      }
    };
    window.addEventListener('click', handleFocus);
    return () => window.removeEventListener('click', handleFocus);
  }, [scanningItem]);

  const handleRefreshData = async () => {
    try {
      await refetchLines();
      toast.success('Synced planning data');
    } catch (e) {
      toast.error('Failed to refresh data from server.');
    }
  };

  const handleExportExcel = () => {
    try {
      const headers = ['Purchase Order ID', 'Warehouse Name', 'Color', 'Size', 'Planned Qty', 'Scanned Qty', 'Barcode'];
      const rows = items.map(item => [
        item.purchaseOrderId || '',
        item.warehouseName || '',
        item.color || '',
        item.size || '',
        item.plannedQuantity || 0,
        item.scannedQuantity || 0,
        item.uploadedBarcode || ''
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `CrossdockPlan_${shipmentIdParam || 'export'}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      toast.error('Failed to export data');
    }
  };

  const loading = shipmentLoading || linesLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-2 border-supabase-green border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-sm font-bold text-neutral-500">Loading planning data...</span>
      </div>
    );
  }

  const handleSync = async () => {
    // Filter items that are fully scanned and still have 'Pending' status
    const eligibleItems = items.filter(it => 
      it.plannedQuantity > 0 && 
      it.scannedQuantity === it.plannedQuantity && 
      it.status === 'Pending'
    );

    if (eligibleItems.length === 0) {
      toast.info('No fully scanned items ready to post');
      return;
    }

    setIsSyncing(true);
    let successCount = 0;
    try {
      for (const item of eligibleItems) {
        await postMutation.mutateAsync({
          shipmentNumber: shipmentNumber || shipmentIdParamsFinal,
          purchaseOrderId: item.purchaseOrderId,
          warehouseName: item.warehouseName,
          productVariantId: parseInt(item.variantId) || item.variantId,
          scannedQuantity: item.scannedQuantity
        });
        
        dispatch(updateItemStatus({ 
          shipmentId: shipmentIdParamsFinal, 
          itemId: item.id, 
          status: 'Scanned' 
        }));
        successCount++;
      }
      toast.success(`${successCount} items posted to system`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to post items');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateReceiveNow = async () => {
    if (!shipmentNumber) return;
    try {
      setIsSyncing(true);
      await processCrossDockPlanMutation.mutateAsync(shipmentNumber);
      toast.success('Shipment processed successfully');
      handleRefreshData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to process shipment');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGlobalScan = (e: React.FormEvent) => {
    e.preventDefault();
    const barcodeUpper = globalScanInput.trim().toUpperCase();
    const qty = parseInt(scanQuantity) || 1;
    if (!barcodeUpper) return;

    // Use filteredItems so it only scans on visible rows
    const matches = filteredItems.filter(it => 
      it.variantId.toUpperCase() === barcodeUpper || 
      it.barcodes.some(b => b.toUpperCase() === barcodeUpper)
    );

    if (matches.length === 0) {
      playFlashSound('error');
      const isAvailableElsewhere = items.some(it => 
        it.variantId.toUpperCase() === barcodeUpper || 
        it.barcodes.some(b => b.toUpperCase() === barcodeUpper)
      );
      if (isAvailableElsewhere) {
        toast.error(`Barcode ${barcodeUpper} found in other warehouses. Please switch filter.`);
      } else {
        toast.error(`Barcode ${barcodeUpper} not found in this shipment`);
      }
      setGlobalScanInput('');
      return;
    }

    // Calculate capacity for this barcode within the visible matches
    const barcodePlanned = matches.reduce((sum, it) => sum + it.plannedQuantity, 0);
    const barcodeScanned = matches.reduce((sum, it) => sum + it.scannedQuantity, 0);

    if (barcodeScanned + qty > barcodePlanned) {
      playFlashSound('warning');
      toast.error(`Limit reached for ${barcodeUpper} in this view. Max: ${barcodePlanned}`);
      setGlobalScanInput('');
      return;
    }

    playFlashSound('success');
    
    // Find target item specifically from filtered matches
    let targetItem = matches.find(it => it.status === 'Pending' && it.scannedQuantity < it.plannedQuantity) 
                  || matches.find(it => it.scannedQuantity < it.plannedQuantity) 
                  || matches[0];
    
    if (targetItem && targetItem.id) {
      setLastScannedId(null);
      setTimeout(() => setLastScannedId(targetItem.id), 10);
      
      let remaining = qty;
      
      // 1. Fill Pending rows that are not yet full
      const pendingIncomplete = matches.filter(it => it.status === 'Pending' && it.scannedQuantity < it.plannedQuantity);
      for (const item of pendingIncomplete) {
        if (remaining <= 0) break;
        const canTake = item.plannedQuantity - item.scannedQuantity;
        const toAdd = Math.min(remaining, canTake);
        if (toAdd > 0) {
          dispatch(updateScannedQuantity({ shipmentId: shipmentIdParamsFinal, itemId: item.id, quantity: toAdd }));
          remaining -= toAdd;
        }
      }

      // 2. Fill other incomplete rows
      if (remaining > 0) {
        const othersIncomplete = matches.filter(it => it.status !== 'Pending' && it.scannedQuantity < it.plannedQuantity);
        for (const item of othersIncomplete) {
          if (remaining <= 0) break;
          const canTake = item.plannedQuantity - item.scannedQuantity;
          const toAdd = Math.min(remaining, canTake);
          if (toAdd > 0) {
            dispatch(updateScannedQuantity({ shipmentId: shipmentIdParamsFinal, itemId: item.id, quantity: toAdd }));
            remaining -= toAdd;
          }
        }
      }
    }

    setGlobalScanInput('');
    setScanQuantity('1'); 
  };

  const openScanModal = (item: ScanItem) => {
    setScanningItem(item);
    setScanInput('');
    setError(null);
  };

  const closeScanModal = () => {
    setScanningItem(null);
    setScanInput('');
  };

  const startEditingRow = (item: ScanItem) => {
    setEditingRowId(item.id);
    setEditPlannedQtyValue(String(item.plannedQuantity));
    setEditScannedQtyValue(String(item.scannedQuantity));
  };

  const cancelEditingRow = () => {
    setEditingRowId(null);
    setEditPlannedQtyValue('');
    setEditScannedQtyValue('');
  };

  const saveEditedRow = async (item: ScanItem) => {
    const newPlannedQty = parseInt(editPlannedQtyValue);
    const newScannedQty = parseInt(editScannedQtyValue);
    
    if (isNaN(newPlannedQty) || newPlannedQty < 0 || isNaN(newScannedQty) || newScannedQty < 0) {
      toast.error("Valid quantity required");
      return;
    }
    
    if (newScannedQty > newPlannedQty) {
      toast.error("Scanned quantity cannot exceed planned quantity");
      return;
    }

    try {
      await updateQuantitiesMutation.mutateAsync({
        purchaseOrderId: item.purchaseOrderId,
        productVariantId: parseInt(item.variantId) || item.variantId,
        warehouseName: item.warehouseName,
        plannedQuantity: newPlannedQty,
        scannedQuantity: newScannedQty,
        shipmentNumber: shipmentNumber || shipmentIdParamsFinal,
      });
      
      dispatch(setValueOverrides({
        shipmentId: shipmentIdParamsFinal,
        itemId: item.id,
        plannedQuantity: newPlannedQty,
        scannedQuantity: newScannedQty
      }));
      
      toast.success("Quantities updated");
      cancelEditingRow();
      
      handleRefreshData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update quantities");
    }
  };

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!scanningItem) return;

    const barcodeUpper = scanInput.trim().toUpperCase();
    if (!barcodeUpper) return;

    // Find matches in Redux state
    const matches = items.filter(it => 
      it.variantId.toUpperCase() === barcodeUpper || 
      it.barcodes.some(b => b.toUpperCase() === barcodeUpper)
    );

    if (matches.length === 0) {
      playFlashSound('error');
      setError(`Invalid Barcode: ${barcodeUpper} not found in this shipment.`);
      setScanInput('');
      return;
    }

    // Global limit check for modal scan too
    const totalPlanned = matches.reduce((sum, it) => sum + it.plannedQuantity, 0);
    const totalScanned = matches.reduce((sum, it) => sum + it.scannedQuantity, 0);

    if (totalScanned + 1 > totalPlanned) {
      playFlashSound('warning');
      setError(`Limit reached for ${barcodeUpper}. Max allowed: ${totalPlanned}`);
      setScanInput('');
      return;
    }

    playFlashSound('success');
    
    // Determine target for highlight and local update
    const targetItem = matches.find(it => it.status === 'Pending' && it.scannedQuantity < it.plannedQuantity) || matches.find(it => it.scannedQuantity < it.plannedQuantity) || matches[0];

    if (targetItem && targetItem.id) {
      setLastScannedId(null);
      setTimeout(() => setLastScannedId(targetItem.id), 10);
      
      let remaining = 1;
      
      // 1. Fill Pending rows that are not yet full
      const pendingIncomplete = matches.filter(it => it.status === 'Pending' && it.scannedQuantity < it.plannedQuantity);
      for (const item of pendingIncomplete) {
        if (remaining <= 0) break;
        const canTake = item.plannedQuantity - item.scannedQuantity;
        const toAdd = Math.min(remaining, canTake);
        if (toAdd > 0) {
          dispatch(updateScannedQuantity({ shipmentId: shipmentIdParamsFinal, itemId: item.id, quantity: toAdd }));
          remaining -= toAdd;
        }
      }

      // 2. Fill other incomplete rows
      if (remaining > 0) {
        const othersIncomplete = matches.filter(it => it.status !== 'Pending' && it.scannedQuantity < it.plannedQuantity);
        for (const item of othersIncomplete) {
          if (remaining <= 0) break;
          const canTake = item.plannedQuantity - item.scannedQuantity;
          const toAdd = Math.min(remaining, canTake);
          if (toAdd > 0) {
            dispatch(updateScannedQuantity({ shipmentId: shipmentIdParamsFinal, itemId: item.id, quantity: toAdd }));
            remaining -= toAdd;
          }
        }
      }
    }
    
    // Update local modal state for immediate feedback
    const newScannedQty = targetItem.scannedQuantity + 1;
    setScanningItem({
      ...targetItem,
      scannedQuantity: newScannedQty,
    });

    setScanInput('');
  };

  const columns: Column<ScanItem>[] = [
    { 
      key: 'progress', 
      header: 'PROGRESS', 
      render: (r) => {
        const isExcess = r.scannedQuantity > r.plannedQuantity;
        return (
          <div className="w-32">
            <ProgressBar 
              value={r.scannedQuantity} 
              max={r.plannedQuantity} 
              displayType="ratio"
              className={isExcess ? "[&>div>div]:bg-orange-500" : ""}
            />
          </div>
        );
      }
    },
    { 
      key: 'itemDescription', 
      header: 'DESCRIPTION', 
      render: (r) => (
        <div className="flex flex-col">
          <span className="font-medium text-neutral-900 dark:text-white line-clamp-1">{r.itemDescription || 'No Description'}</span>
          <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-tight">
            {r.color} • {r.size}
          </span>
        </div>
      )
    },
    {
      key: 'purchaseOrderId',
      header: 'PURCHASE ORDER',
      render: (r) => (
        <Badge className="text-[10px] font-black text-orange-500 dark:text-orange-400 bg-orange-500/10 border-orange-500/20 px-1.5 py-0.5 tracking-widest uppercase rounded">
          {r.purchaseOrderId}
        </Badge>
      )
    },
    { 
      key: 'uploadedBarcode', 
      header: 'UPLOADED BARCODE', 
      render: (r) => <span className="font-bold text-neutral-900 dark:text-white">{r.uploadedBarcode || r.barcodes[0] || r.variantId}</span> 
    },
    { 
      key: 'warehouseName', 
      header: 'WAREHOUSE', 
      render: (r) => <Badge color="gray">{r.warehouseName}</Badge> 
    },
    { 
      key: 'plannedQuantity', 
      header: 'PLANNED', 
      render: (r) => {
        const isEditing = editingRowId === r.id;
        if (isEditing) {
          return (
            <input 
              type="number" 
              value={editPlannedQtyValue}
              onChange={(e) => setEditPlannedQtyValue(e.target.value)}
              className="w-16 font-medium bg-transparent border-b border-black dark:border-white focus:outline-none focus:border-supabase-green dark:focus:border-supabase-green p-0 pb-0.5"
            />
          );
        }
        return <span className="font-medium">{r.plannedQuantity}</span>;
      }
    },
    { 
      key: 'scannedQuantity', 
      header: 'SCANNED', 
      render: (r) => {
        const isEditing = editingRowId === r.id;
        if (isEditing) {
          return (
            <input 
              type="number" 
              value={editScannedQtyValue}
              onChange={(e) => setEditScannedQtyValue(e.target.value)}
              className="w-16 font-medium bg-transparent border-b border-black dark:border-white focus:outline-none focus:border-supabase-green dark:focus:border-supabase-green p-0 pb-0.5"
            />
          );
        }
        
        const isExcess = r.scannedQuantity > r.plannedQuantity;
        return (
          <span className={`font-bold ${isExcess ? 'text-orange-500' : 'text-[#24b47e]'}`}>
            {r.scannedQuantity}
          </span>
        );
      }
    },
    { 
      key: 'status', 
      header: 'STATUS', 
      render: (r) => (
        <Badge color={r.status === 'In_Progress' || r.status === 'Completed' || r.status === 'Posted' || r.status === 'Scanned' ? 'green' : 'gray'}>
          {r.status.replace('_', ' ')}
        </Badge>
      ) 
    },
    {
      key: 'actions',
      header: '',
      render: (r) => {
        const isEditing = editingRowId === r.id;
        
        if (isEditing) {
          return (
            <div className="flex items-center gap-1">
              <button 
                onClick={() => cancelEditingRow()}
                className="p-1.5 rounded-md text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                title="Cancel"
              >
                <X size={16} />
              </button>
              <button 
                onClick={() => saveEditedRow(r)}
                disabled={updateQuantitiesMutation.isPending}
                className="p-1.5 rounded-md text-supabase-green hover:bg-supabase-green/10 transition-colors disabled:opacity-50"
                title="Save"
              >
                <Save size={16} className={updateQuantitiesMutation.isPending ? "animate-pulse" : ""} />
              </button>
            </div>
          );
        }

        if (r.status === 'Completed' || r.status === 'Posted') {
          return null;
        }

        return (
          <div className="flex items-center justify-end">
            <button 
              onClick={() => startEditingRow(r)}
              className="p-1.5 rounded-md text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#2e2e2e] transition-colors"
              title="Edit Quantities"
            >
              <Edit2 size={16} />
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="h-full w-full max-w-7xl mx-auto flex flex-col gap-3 p-3 lg:p-4 bg-[#f8f9fa] dark:bg-[#0c0c0c] overflow-hidden">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0 w-full">
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-neutral-900 dark:text-white tracking-tight leading-none uppercase">
              {shipmentIdParam}
            </h1>
            <button 
              onClick={handleRefreshData}
              disabled={isFetchingLines}
              className="p-1.5 rounded-md text-neutral-400 hover:text-supabase-green hover:bg-supabase-green/10 transition-colors disabled:opacity-50"
              title="Refresh planning data"
            >
              <RefreshCcw size={16} className={isFetchingLines ? "animate-spin" : ""} />
            </button>
            <button 
              onClick={handleExportExcel}
              className="p-1.5 rounded-md text-neutral-400 hover:text-[#107C41] hover:bg-[#107C41]/10 transition-colors"
              title="Export to Excel"
            >
              <FileSpreadsheet size={16} />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {Array.isArray(crossDockLinesData?.purchaseOrders) && crossDockLinesData.purchaseOrders.map((po: string) => (
              <Badge key={po} className="text-[10px] font-black text-orange-500 dark:text-orange-400 bg-orange-500/10 border-orange-500/20 px-1.5 py-0.5 tracking-widest uppercase rounded">
                {po}
              </Badge>
            ))}
            {Array.isArray(crossDockLinesData?.data?.purchaseOrders) && crossDockLinesData.data.purchaseOrders.map((po: string) => (
              <Badge key={po} className="text-[10px] font-black text-orange-500 dark:text-orange-400 bg-orange-500/10 border-orange-500/20 px-1.5 py-0.5 tracking-widest uppercase rounded">
                {po}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:flex sm:items-center gap-2 w-full sm:w-auto">
          <div className="w-full sm:w-[160px]">
            <SearchableDropdown 
              options={['ALL', ...purchaseOrders]}
              value={poFilter}
              onChange={setPoFilter}
              placeholder="PO: ALL"
              menuTitle="Filter by PO"
              triggerClassName="w-full border-dashed bg-white dark:bg-[#1c1c1c] border-neutral-200 dark:border-[#2e2e2e] font-black font-mono text-orange-600 dark:text-orange-400"
            />
          </div>
          <div className="w-full sm:w-[140px]">
            <SearchableDropdown 
              options={['ALL', ...warehouses]}
              value={warehouseFilter}
              onChange={setWarehouseFilter}
              placeholder="ALL"
              menuTitle="Filter by Warehouse"
              triggerClassName="w-full border-dashed bg-white dark:bg-[#1c1c1c] border-neutral-200 dark:border-[#2e2e2e] font-black"
            />
          </div>
          <div className="w-full sm:w-auto">
            <Dropdown
              trigger={
                <Button 
                  variant="primary" 
                  disabled={isSyncing}
                  className="w-full font-black uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  {isSyncing ? 'Processing...' : 'Actions'} <ChevronDown size={14} />
                </Button>
              }
              align="right"
              className="w-full sm:w-auto"
              fullWidth={true}
            >
              <DropdownItem onClick={handleSync}>Post</DropdownItem>
              <DropdownItem onClick={handleUpdateReceiveNow}>Update Receive Now</DropdownItem>
            </Dropdown>
          </div>
          <Button 
            onClick={() => navigate('/inbound-shipments')} 
            variant="secondary" 
            className="w-full sm:w-auto font-bold px-6 bg-white dark:bg-[#1c1c1c] border border-neutral-200 dark:border-[#2e2e2e] rounded-md"
          >
            BACK
          </Button>
        </div>
      </div>

      {/* Progress & Scan Control Card */}
      <div className="bg-white dark:bg-[#1c1c1c] p-2.5 px-4 rounded-lg border border-neutral-200 dark:border-[#2e2e2e] shadow-sm flex flex-col lg:flex-row items-center gap-4 lg:gap-6 shrink-0">
        {/* Left Side: Progress */}
        <div className="w-full lg:w-1/2">
          <div className="flex justify-between items-end mb-1.5">
            <span className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.3em] leading-none">
              Progress
            </span>
            <span className="text-sm font-black text-neutral-900 dark:text-white leading-none">{totalScanned} / {totalPlanned} ({totalProgress}%)</span>
          </div>
          <div className="relative h-1.5 w-full bg-neutral-100 dark:bg-[#2e2e2e] rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-supabase-green transition-all duration-700 ease-out"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>

        {/* Right Side: Scan Input */}
        <div className="w-full lg:w-1/2 flex items-center gap-2">
          <form onSubmit={handleGlobalScan} className="flex-1 relative">
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400">
              <ScanLine size={13} />
            </div>
            <Input
              ref={globalInputRef}
              placeholder="Scan barcode..."
              value={globalScanInput}
              onChange={(e) => setGlobalScanInput(e.target.value)}
              className="pl-7 h-7 text-[10px] font-bold bg-neutral-50 dark:bg-[#111] border-neutral-200 dark:border-[#2e2e2e] rounded-md focus:ring-1 focus:ring-supabase-green"
            />
          </form>
          <div className="w-12">
            <Input
              type="number"
              placeholder="1"
              value={scanQuantity}
              onChange={(e) => setScanQuantity(e.target.value)}
              className="h-7 text-[10px] text-center font-bold bg-neutral-50 dark:bg-[#111] border-neutral-200 dark:border-[#2e2e2e] rounded-md [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <Button 
            onClick={handleGlobalScan} 
            variant="primary" 
            className="font-bold px-6 whitespace-nowrap"
          >
            SCAN
          </Button>
        </div>
      </div>

      {/* Main Table Content - Scrollable container */}
      <div className="flex-1 min-h-0 bg-white dark:bg-[#1c1c1c] rounded-xl border border-neutral-200 dark:border-[#2e2e2e] shadow-sm flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredItems.length > 0 ? (
            <CustomTable<ScanItem>
              columns={columns}
              data={filteredItems}
              getRowId={(r) => r.id}
              rowClassName={(r) => (r.id && r.id === lastScannedId) ? 'animate-highlight' : ''}
              pageSize={filteredItems.length}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 bg-neutral-50 dark:bg-[#111] rounded-full flex items-center justify-center mb-3">
                <QrCode className="text-neutral-300" size={28} />
              </div>
              <h3 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-widest">Inbound Loading...</h3>
              <p className="text-[9px] text-neutral-500 mt-1 uppercase tracking-tight max-w-xs">{shipmentIdParam}</p>
            </div>
          )}
        </div>
      </div>

      {/* Custom Scan Modal Overlay */}
      {scanningItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1c1c1c] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative">
            
            {/* Close Button */}
            <button 
              onClick={closeScanModal} 
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-black dark:hover:text-white transition-colors z-10 bg-white/50 dark:bg-black/50 rounded-full backdrop-blur-md"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="p-8">
              {/* Scanner Graphic */}
              <div className="relative w-48 h-48 mx-auto mb-10 bg-supabase-green/5 dark:bg-supabase-green/10 rounded-2xl flex items-center justify-center overflow-hidden border border-supabase-green/20 dark:border-supabase-green/20">
                <QrCode size={120} className="text-neutral-800 dark:text-neutral-200" strokeWidth={1} />
                <div className="absolute top-0 left-0 w-full h-1 bg-supabase-green shadow-[0_0_12px_3px_rgba(36,180,126,0.6)] animate-scan" />
              </div>

              {/* Item Details */}
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Barcode</span>
                  <span className="text-sm font-bold text-black dark:text-white font-mono">{scanningItem.barcodes[0] || scanningItem.variantId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Description</span>
                  <span className="text-sm font-bold text-black dark:text-white text-right max-w-[200px] truncate">{scanningItem.itemDescription}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Variant</span>
                  <span className="text-sm font-bold text-black dark:text-white underline decoration-supabase-green/30">{scanningItem.variantId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Color/Size</span>
                  <span className="text-sm font-bold text-black dark:text-white">{scanningItem.color} / {scanningItem.size}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Warehouse</span>
                  <span className="text-sm font-bold text-black dark:text-white">{scanningItem.warehouseName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Planned</span>
                  <span className="text-sm font-bold text-black dark:text-white">{scanningItem.plannedQuantity}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Scanned</span>
                  <span className={`text-sm font-bold ${scanningItem.scannedQuantity > scanningItem.plannedQuantity ? 'text-orange-500' : 'text-[#24b47e]'}`}>
                    {scanningItem.scannedQuantity}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Status</span>
                  <span className="text-sm font-bold text-black dark:text-white">{scanningItem.status.replace('_', ' ')}</span>
                </div>
              </div>

              {/* Scan Input & Actions */}
              <form onSubmit={handleScan} className="space-y-4">
                <Input
                  autoFocus
                  placeholder="Enter barcode..."
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  className="h-12 text-center text-base rounded-xl bg-neutral-50 dark:bg-[#232323] border-neutral-200 dark:border-[#3e3e3e]"
                />
                
                {error && (
                  <div className="p-2 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-lg text-center">
                    <p className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>
                  </div>
                )}

                <div className="pt-2">
                  <Button 
                    type="submit" 
                    variant="primary"
                    className="w-full sm:w-auto font-bold whitespace-nowrap"
                  >
                    <ScanLine size={18} className="mr-2" />
                    Scan
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
