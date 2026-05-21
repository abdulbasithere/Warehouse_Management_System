import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Input, Select, SearchableDropdown, Checkbox } from '../components/ui';
import { MapPin, ScanLine } from 'lucide-react';
import { useInboundShipmentDetail, useUpdateInboundShipment, useCrossDockLines, useParkInboundShipment } from '../api/hooks/useInboundShipments';
import { useCrossDockLocations } from '../api/hooks/useShelfLocations';
import { toast } from 'react-toastify';

export const InboundShipmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Use id from URL directly as shipmentNumber for lines
  const { data: crossDockLinesData, isLoading: linesLoading } = useCrossDockLines(id || '');
  
  // Optional: fetch shipment detail if id happens to be a database ID
  const { data: viewingShipment, isLoading: shipmentLoading } = useInboundShipmentDetail(id!);
  
  const [formData, setFormData] = useState<any>({
    warehouseName: '',
    department: '',
    invoiceQuantity: 0,
    shipmentNumber: id || '',
    remark: '',
    isPlanned: false,
    isBarcoded: false,
    isQualityCheck: false,
    email: ''
  });
  const [items, setItems] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [parkingRows, setParkingRows] = useState<any[]>([]);
  
  const updateShipment = useUpdateInboundShipment();
  const parkShipment = useParkInboundShipment();
  const { data: crossDockLocationsData } = useCrossDockLocations();
  const crossDockLocations = (crossDockLocationsData?.data || []).map((loc: any) => loc.ShelfID || loc.shelfId);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (viewingShipment) {
      // Handle the case where response might be nested under .data
      const data = viewingShipment.data || viewingShipment;
      
      setFormData({
        warehouseName: data.Warehouse?.warehouseName || data.warehouseName || '',
        department: data.department || '',
        invoiceQuantity: data.invoiceQuantity ?? data.quantity ?? 0,
        shipmentNumber: data.shipmentNumber || id || '',
        arrivalDate: data.arrivalDate || '',
        remark: data.remark || '',
        isPlanned: !!data.isPlanned,
        isBarcoded: !!data.isBarcoded,
        isQualityCheck: !!data.isQualityCheck,
        email: data.emails?.join(', ') || ''
      });

      // Handle vehicle details from InboundVehicleDetails array
      const rawVehicles = data.vehicles || data.InboundVehicleDetails || [];
      if (Array.isArray(rawVehicles)) {
        setVehicles(rawVehicles.map((v: any, index: number) => ({
          id: v.id || `v-${index}`,
          vehicleNumber: v.vehicleNumber || '',
          driverName: v.driverName || '',
          driverContact: v.driverContact || v.contactNumber || '',
          deliveryNumber: v.deliveryNumber || '',
          timeIn: v.timeIn || '',
          timeOut: v.timeOut || ''
        })));
      } else {
        setVehicles([]);
      }

      // Handle parking rows
      const rawParkingRows = data.parkingRows || [];
      setParkingRows(Array.isArray(rawParkingRows) ? rawParkingRows : []);

      // Try to parse data.items in case it's a stringified JSON
      let rawDataItems = data.items || data.lineItems || data.InboundShipmentItems;
      if (typeof rawDataItems === 'string') {
        try { rawDataItems = JSON.parse(rawDataItems); } catch(e) { rawDataItems = []; }
      }
      
      let shipmentItems = [];
      const crossDockResult = crossDockLinesData?.data || crossDockLinesData;
      
      // Prioritize items coming directly from shipment detail
      if (Array.isArray(rawDataItems) && rawDataItems.length > 0) {
        shipmentItems = rawDataItems;
      } else if (Array.isArray(crossDockResult) && crossDockResult.length > 0) {
        shipmentItems = crossDockResult;
      }

      if (Array.isArray(shipmentItems)) {
        const itemsWithIds = shipmentItems.map((item: any, index: number) => ({
          ...item,
          // Normalize common field names
          packageType: item.packageType || item.type || item.PackageType || item.package_type || '',
          packageQty: item.packageQty ?? item.packageQuantity ?? item.quantity ?? item.qty ?? item.PackageQty ?? item.item_qty ?? item.package_qty ?? 0,
          id: item.id || item.variantId || item.shipmentLineId || `item-${index}-${Date.now()}`
        }));
        setItems(itemsWithIds);
      }
    }
  }, [viewingShipment, crossDockLinesData, id]);

  const packageTypes = Array.from(new Set([
      'Bora', 'Box', 'Pallet', 'Crate', 'Carton',
      ...items.map(it => it.packageType).filter(Boolean)
  ]));
  const readOnly = true;

  const [isParkModalOpen, setIsParkModalOpen] = useState(false);
  const [parkLocation, setParkLocation] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [parkQuantity, setParkQuantity] = useState('');

  // Update selected item if items change and none selected
  useEffect(() => {
     if (!selectedItemId && items.length > 0) {
         setSelectedItemId(items[0].id);
         setParkQuantity(String(Math.max(0, (parseInt(items[0].packageQty) || 0) - (parseInt(items[0].parkedQuantity) || 0))));
     }
  }, [items, selectedItemId]);

  const selectedItem = items.find(it => it.id === selectedItemId);
  const maxParkQty = selectedItem ? Math.max(0, (parseInt(selectedItem.packageQty) || 0) - (parseInt(selectedItem.parkedQuantity) || 0)) : 0;

  const handleParkQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value);
    if (isNaN(val)) {
      setParkQuantity('');
      return;
    }
    if (val > maxParkQty) val = maxParkQty;
    if (val < 0) val = 0;
    setParkQuantity(String(val));
  };

  if (shipmentLoading && linesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // If shipment detail fails but we have lines, we can still show the lines
  const data = viewingShipment?.data || viewingShipment;
  const displayShipment = data || {
    shipmentNumber: id,
    warehouseName: '-',
    purchaseOrderId: '-',
    quantity: 0,
    status: 'UNKNOWN'
  };

  const handleCommit = async () => {
    setUpdating(true);
    try {
      await updateShipment.mutateAsync({
        id: id!,
        data: {
          ...viewingShipment,
          ...formData,
          items: items.map(({ id: itemId, ...rest }) => ({
            ...rest,
            vehicleDetailId: rest.vehicleDetailId || null
          })),
          vehicles: vehicles.map(({ id: vehicleId, ...rest }) => rest),
          status: 'COMMITTED'
        }
      });
      toast.success('Shipment updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update shipment');
    } finally {
      setUpdating(false);
    }
  };

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(), packageType: '', packageQty: '', location: '', warehouse: formData.warehouseName, purchaseOrderId: '', vehicleDetailId: '' }]);
  };

  const updateItem = (id: string, field: string, value: string) => {
    setItems(items.map(it => it.id === id ? { ...it, [field]: value } : it));
  };

  const addVehicle = () => {
    setVehicles([...vehicles, { id: `v-${Date.now()}`, vehicleNumber: '', driverName: '', driverContact: '', deliveryNumber: '', timeIn: '', timeOut: '' }]);
  };

  const updateVehicle = (id: string, field: string, value: string) => {
    setVehicles(vehicles.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const removeVehicle = (id: string) => {
    if (vehicles.length > 0) {
      setVehicles(vehicles.filter(v => v.id !== id));
    }
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleParkSubmit = async () => {
    if (!parkLocation.trim()) {
      toast.error('Shelf ID / Park location is required');
      return;
    }
    setUpdating(true);
    try {
      const totalQty = items.reduce((sum, it) => sum + (parseInt(it.packageQty) || 0), 0);
      
      // Find the actual shelf ID from the selected location label
      const selectedShelf = (crossDockLocationsData?.data || []).find(
        (loc: any) => (loc.ShelfID || loc.shelfId) === parkLocation
      );
      const shelfIdToSend = selectedShelf?.id || parkLocation;

      await parkShipment.mutateAsync({
        shipmentNumber: formData.shipmentNumber || id,
        itemNumber: selectedItem?.itemNumber || (items.findIndex(it => it.id === selectedItemId) + 1),
        shelfId: shelfIdToSend,
        quantity: parseInt(parkQuantity) || 0,
        notes: formData.remark,
        parkedAt: new Date(),
        // parkedBy: auth.currentUser?.uid // if auth is available
      });
      
      toast.success('Shipment Parked successfully');
      setParkLocation('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to park shipment');
    } finally {
      setUpdating(false);
    }
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(it => it.id !== id));
    }
  };

  if (shipmentLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-16 text-left">
      <div className="flex items-start justify-between gap-3 bg-neutral-50/50 dark:bg-[#1c1c1c]/50 p-3 rounded-md border border-neutral-100 dark:border-neutral-900">
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-black text-black dark:text-white leading-none tracking-tight truncate">
              {id || formData.shipmentNumber || 'Shipment Details'}
            </h1>
          </div>
          <div className="flex">
            <span className={`font-black text-[9px] px-1.5 py-0.5 rounded-sm tracking-widest ${
              displayShipment.status === 'COMMITTED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
              displayShipment.status === 'parked' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
              'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
            }`}>
              {(displayShipment.status === 'parked' ? 'Fully Parked' : displayShipment.status === 'partial' ? 'Partial' : displayShipment.status === 'COMMITTED' ? 'Committed' : 'Pending')}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate(-1)}
            className="capitalize"
          >
            Back
          </Button>
          <Button 
            variant="primary"
            onClick={handleCommit}
            loading={updating}
            className="font-bold capitalize tracking-widest shadow-sm"
          >
            Commit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white dark:bg-[#232323] rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 space-y-8 shadow-sm">
            <div>
              <h2 className="text-[10px] font-bold text-neutral-500 mb-4 tracking-widest">Shipment Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-300 tracking-widest">Warehouse</label>
                  <Input value={formData.warehouseName || ''} readOnly className="w-full" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-300 tracking-widest">Invoice Qty</label>
                  <Input value={formData.invoiceQuantity || 0} onChange={(e) => handleFormChange('invoiceQuantity', parseInt(e.target.value) || 0)} className="w-full" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-300 tracking-widest">Shipment #</label>
                  <Input value={formData.shipmentNumber || ''} readOnly className="w-full" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-300 tracking-widest">Arrival Date</label>
                  <Input type="date" value={formData.arrivalDate || ''} onChange={(e) => handleFormChange('arrivalDate', e.target.value)} className="w-full" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-300 tracking-widest">Remark</label>
                  <Input value={formData.remark || ''} onChange={(e) => handleFormChange('remark', e.target.value)} className="w-full" placeholder="Note..." />
                </div>
              </div>
            </div>

            {/* EMAIL NOTIFICATIONS */}
            <div>
              <h2 className="text-[10px] font-bold text-neutral-500 mb-4 tracking-widest">Notifications & Flags</h2>
              <Input 
                placeholder="Recipient emails (comma separated)..." 
                value={formData.email || ''} 
                onChange={(e) => handleFormChange('email', e.target.value)}
                disabled={readOnly}
                className="w-full mb-4" 
              />
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-[10px] font-bold text-neutral-500 cursor-pointer select-none">
                  <Checkbox 
                    checked={formData.isPlanned}
                    onChange={(checked) => handleFormChange('isPlanned', checked)}
                    disabled={readOnly}
                  />
                  Planned
                </label>
                <label className="flex items-center gap-2 text-[10px] font-bold text-neutral-500 cursor-pointer select-none">
                  <Checkbox 
                    checked={formData.isBarcoded}
                    onChange={(checked) => handleFormChange('isBarcoded', checked)}
                    disabled={readOnly}
                  />
                  Barcoded
                </label>
                <label className="flex items-center gap-2 text-[10px] font-bold text-neutral-500 cursor-pointer select-none">
                  <Checkbox 
                    checked={formData.isQualityCheck}
                    onChange={(checked) => handleFormChange('isQualityCheck', checked)}
                    disabled={readOnly}
                  />
                  Quality Check
                </label>
              </div>
            </div>

            {/* ATTACHMENTS */}
            <div>
              <h2 className="text-[10px] font-bold text-neutral-500 mb-4 tracking-widest">Attachments</h2>
              <div className="border border-dashed border-neutral-300 dark:border-neutral-700 rounded-md p-4 flex items-center justify-center cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                <span className="text-[10px] font-bold text-neutral-500">Click to Attach</span>
              </div>
            </div>
          </div>

          {/* SHIPMENT ITEMS */}
          <div className="bg-white dark:bg-[#232323] border border-neutral-100 dark:border-neutral-950 rounded-md p-3 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
                <h2 className="text-[10px] font-black text-neutral-500 tracking-widest px-0.5">Shipment Items</h2>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                    <thead>
                        <tr className="border-b border-neutral-50 dark:border-neutral-950">
                            {['#', 'Type', 'Package Quantity', 'Purchase Order', 'Department', 'Status', 'Vehicle Number', 'Parked Quantity', ''].map((h, idx) => (
                                <th key={h || `header-${idx}`} className="pb-1.5 text-left text-[10px] font-black text-neutral-500 pr-3 last:text-right whitespace-nowrap">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50 dark:divide-neutral-950/30">
                        {items.map((item, i) => (
                            <tr key={item.id}>
                                <td className="py-1.5 pr-3">
                                    <span className="text-[9px] font-black text-neutral-400 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                                </td>
                                <td className="py-1.5 pr-3">
                                    <select
                                        disabled={readOnly}
                                        value={item.packageType ?? ''}
                                        onChange={e => updateItem(item.id, 'packageType', e.target.value)}
                                        className="h-8 px-2 text-[10px] rounded-md bg-neutral-50/50 dark:bg-[#1c1c1c]/50 border border-neutral-100 dark:border-neutral-900 text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white min-w-[100px] disabled:opacity-70"
                                    >
                                        <option value="">Type</option>
                                        {packageTypes.map((t, idx) => <option key={`${t}-${idx}`} value={t}>{t}</option>)}
                                    </select>
                                </td>
                                <td className="py-1.5 pr-3">
                                    <Input
                                        disabled={readOnly}
                                        type="number"
                                        min="1"
                                        placeholder="0"
                                        value={item.packageQty ?? ''}
                                        onChange={e => updateItem(item.id, 'packageQty', e.target.value)}
                                        className="h-8 text-[10px] w-24"
                                    />
                                </td>
                                <td className="py-1.5 pr-3">
                                    <Input
                                        disabled={readOnly}
                                        placeholder="PO-1234"
                                        value={item.purchaseOrderId ?? ''}
                                        onChange={e => updateItem(item.id, 'purchaseOrderId', e.target.value)}
                                        className="h-8 text-[10px] w-32"
                                    />
                                </td>
                                <td className="py-1.5 pr-3">
                                    <Input
                                        disabled={readOnly}
                                        placeholder="Department"
                                        value={item.department ?? ''}
                                        onChange={e => updateItem(item.id, 'department', e.target.value)}
                                        className="h-8 text-[10px] w-40"
                                    />
                                </td>
                                <td className="py-1.5 pr-3">
                                    <Input
                                        disabled={readOnly}
                                        placeholder="Status"
                                        value={item.status ?? ''}
                                        onChange={e => updateItem(item.id, 'status', e.target.value)}
                                        className="h-8 text-[10px] w-32"
                                    />
                                </td>
                                <td className="py-1.5 pr-3">
                                    <Input
                                        disabled={readOnly}
                                        type="text"
                                        placeholder="Veh #"
                                        value={item.vehicleDetailId ?? ''}
                                        onChange={e => updateItem(item.id, 'vehicleDetailId', e.target.value)}
                                        className="h-8 text-[10px] w-32"
                                    />
                                </td>
                                <td className="py-1.5 pr-3">
                                    <Input
                                        disabled={readOnly}
                                        type="number"
                                        placeholder="0"
                                        value={item.parkedQuantity ?? ''}
                                        onChange={e => updateItem(item.id, 'parkedQuantity', e.target.value)}
                                        className="h-8 text-[10px] w-28 bg-neutral-50 dark:bg-neutral-800"
                                    />
                                </td>
                                <td className="py-1.5 text-right whitespace-nowrap">
                                    {!readOnly && (
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            disabled={items.length === 1}
                                            className="text-neutral-400 hover:text-red-500 transition-colors disabled:opacity-0 p-1 font-bold"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-neutral-50 dark:border-neutral-950 mt-1">
                <span className="text-[10px] font-black text-neutral-500">
                    {items.length} Entries
                </span>
                <span className="text-[10px] font-black tracking-widest text-neutral-500">
                    Total: <span className="text-black dark:text-white tabular-nums">
                        {items.reduce((sum, it) => sum + (parseInt(it.packageQty) || 0), 0).toLocaleString()}
                    </span>
                </span>
            </div>
          </div>

          {/* VEHICLE DETAILS SECTION */}
          <div className="bg-white dark:bg-[#232323] border border-neutral-100 dark:border-neutral-950 rounded-md p-3 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
                <h2 className="text-[10px] font-black text-neutral-500 tracking-widest px-0.5">Vehicle Details</h2>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                    <thead>
                        <tr className="border-b border-neutral-50 dark:border-neutral-950">
                            {['#', 'Vehicle #', 'Driver/Contact', 'Delivery #', 'Times', ''].map((h, idx) => (
                                <th key={h || `header-${idx}`} className="pb-1.5 text-left text-[10px] font-black text-neutral-500 pr-3 last:text-right">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50 dark:divide-neutral-950/30">
                        {vehicles.map((v, i) => (
                            <tr key={v.id}>
                                <td className="py-2 pr-3">
                                    <span className="text-[9px] font-black text-neutral-400 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                                </td>
                                <td className="py-2 pr-3">
                                  <Input 
                                    className="h-8 text-[10px] w-28" 
                                    placeholder="VEH-001"
                                    value={v.vehicleNumber} 
                                    onChange={(e) => updateVehicle(v.id, 'vehicleNumber', e.target.value)} 
                                    disabled={readOnly}
                                  />
                                </td>
                                <td className="py-2 pr-3">
                                  <div className="flex flex-col gap-1">
                                    <Input 
                                      className="h-8 text-[10px] w-40" 
                                      placeholder="Driver Name"
                                      value={v.driverName} 
                                      onChange={(e) => updateVehicle(v.id, 'driverName', e.target.value)} 
                                      disabled={readOnly}
                                    />
                                    <Input 
                                      className="h-8 text-[10px] w-40" 
                                      placeholder="Contact #"
                                      value={v.driverContact} 
                                      onChange={(e) => updateVehicle(v.id, 'driverContact', e.target.value)} 
                                      disabled={readOnly}
                                    />
                                  </div>
                                </td>
                                <td className="py-2 pr-3">
                                  <Input 
                                    className="h-8 text-[10px] w-28" 
                                    placeholder="DEL-123"
                                    value={v.deliveryNumber} 
                                    onChange={(e) => updateVehicle(v.id, 'deliveryNumber', e.target.value)} 
                                    disabled={readOnly}
                                  />
                                </td>
                                <td className="py-2 pr-3">
                                  <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-1">
                                      <span className="text-[7px] font-bold text-neutral-400 w-6">IN:</span>
                                      <Input 
                                        className="h-7 text-[10px] w-24" 
                                        placeholder="10:00 AM"
                                        value={v.timeIn || ''} 
                                        onChange={(e) => updateVehicle(v.id, 'timeIn', e.target.value)} 
                                        disabled={readOnly}
                                      />
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-[7px] font-bold text-neutral-400 w-6">OUT:</span>
                                      <Input 
                                        className="h-7 text-[10px] w-24" 
                                        placeholder="02:00 PM"
                                        value={v.timeOut || ''} 
                                        onChange={(e) => updateVehicle(v.id, 'timeOut', e.target.value)} 
                                        disabled={readOnly}
                                      />
                                    </div>
                                  </div>
                                </td>
                                <td className="py-2 text-right">
                                  {!readOnly && (
                                    <button
                                      onClick={() => removeVehicle(v.id)}
                                      className="text-neutral-400 hover:text-red-500 transition-colors p-1"
                                    >
                                      ✕
                                    </button>
                                  )}
                                </td>
                            </tr>
                        ))}
                        {vehicles.length === 0 && (
                          <tr>
                            <td colSpan={6} className="py-6 text-center text-neutral-400 text-[10px] italic">No vehicles added.</td>
                          </tr>
                        )}
                    </tbody>
                </table>
            </div>
          </div>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-[#232323] border border-neutral-100 dark:border-neutral-950 rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-50 dark:border-neutral-900">
              <h2 className="text-[10px] font-black text-neutral-500 tracking-widest flex items-center gap-1.5">
                <MapPin size={12} /> Location Assignment
              </h2>
            </div>
            <div className="p-4 space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-neutral-300 tracking-widest">Item Number</label>
                <SearchableDropdown
                  placeholder="Select Item"
                  className="w-full"
                  triggerClassName="w-full justify-between"
                  options={items.map((it, idx) => `Item ${idx + 1}`)}
                  value={selectedItemId ? `Item ${items.findIndex(it => it.id === selectedItemId) + 1}` : ''}
                  onChange={(val) => {
                     const item = items.find((it, idx) => `Item ${idx + 1}` === val);
                     if (item) {
                       setSelectedItemId(item.id);
                       setParkQuantity(String(Math.max(0, (parseInt(item.packageQty) || 0) - (parseInt(item.parkedQuantity) || 0))));
                     }
                  }}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-neutral-300 tracking-widest">Total Quantity</label>
                <Input 
                  type="number"
                  value={parkQuantity} 
                  onChange={handleParkQuantityChange}
                  className="w-full" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-neutral-300 tracking-widest">Park Location</label>
                <SearchableDropdown
                  placeholder="Select Park Location"
                  className="w-full"
                  triggerClassName="w-full justify-between"
                  options={crossDockLocations}
                  value={parkLocation}
                  onChange={(val) => setParkLocation(val)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-neutral-300 tracking-widest">Remarks & Issues</label>
                <textarea 
                  placeholder="Additional details..." 
                  value={formData.remark || ''}
                  onChange={(e) => handleFormChange('remark', e.target.value)}
                  className="w-full h-24 bg-neutral-50 dark:bg-[#1c1c1c] border border-neutral-200 dark:border-neutral-800 rounded-md p-3 text-[10px] font-medium text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white resize-none"
                />
              </div>

              <Button 
                size="md" 
                className="w-full" 
                onClick={handleParkSubmit}
                loading={updating}
                disabled={displayShipment.status === 'parked'}
              >
                {displayShipment.status === 'parked' ? 'Already Parked' : 'Park Shipment'}
              </Button>
            </div>
          </div>

          {/* PARKING HISTORY */}
          {parkingRows.length > 0 && (
            <div className="bg-white dark:bg-[#232323] border border-neutral-100 dark:border-neutral-950 rounded-lg shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-50 dark:border-neutral-900 bg-neutral-50/50 dark:bg-neutral-800/20">
                <h2 className="text-[10px] font-black text-neutral-500 tracking-widest flex items-center gap-1.5 uppercase">
                  <ScanLine size={12} /> Parking History
                </h2>
              </div>
              <div className="p-0">
                <div className="divide-y divide-neutral-50 dark:divide-neutral-900">
                  {parkingRows.map((row) => {
                    const d = new Date(row.parkedAt);
                    const formattedDate = !isNaN(d.getTime()) ? d.toLocaleString() : row.parkedAt;
                    return (
                      <div key={row.id} className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-neutral-300 tracking-widest uppercase">Shelf ID</span>
                            <span className="text-xs font-bold text-black dark:text-white">{row.shelfId || row.ShelfID || '-'}</span>
                          </div>
                          <div className="flex flex-col text-right">
                            <span className="text-[10px] font-black text-neutral-300 tracking-widest uppercase">Qty</span>
                            <span className="text-xs font-bold text-black dark:text-white">{row.quantity || row.parkedQuantity || 0}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-neutral-300 tracking-widest uppercase">Parked By</span>
                            <span className="text-[10px] font-medium text-neutral-500">{row.parkedBy || 'System'}</span>
                          </div>
                          <div className="flex flex-col text-right">
                            <span className="text-[10px] font-black text-neutral-300 tracking-widest uppercase">Date</span>
                            <span className="text-[9px] font-medium text-neutral-400 tabular-nums">{formattedDate}</span>
                          </div>
                        </div>
                        {row.notes && (
                           <div className="pt-2 border-t border-neutral-50 dark:border-neutral-900">
                             <span className="text-[9px] text-neutral-500 italic block">"{row.notes}"</span>
                           </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

