import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Input, SearchableDropdown } from '../components/ui';
import { toast } from 'react-toastify';
import { useWarehouses } from '../api/hooks/useWarehouses';
import { usePurchaseOrders, usePurchaseOrderByNumber } from '../api/hooks/usePurchaseOrders';
import { useCreateInboundShipment, useUpdateInboundShipment, useInboundShipments, useCrossDockLines } from '../api/hooks/useInboundShipments';

export const InboundShipmentFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { poNumber: routePoNumber } = useParams<{ poNumber: string }>();
  const isEdit = !!routePoNumber;
  const [loading, setLoading] = useState(false);

  const [poSearch, setPoSearch] = useState('');
  const [debouncedPoSearch, setDebouncedPoSearch] = useState('');

  const [whSearch, setWhSearch] = useState('');
  const [debouncedWhSearch, setDebouncedWhSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedPoSearch(poSearch), 500);
    return () => clearTimeout(timer);
  }, [poSearch]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedWhSearch(whSearch), 500);
    return () => clearTimeout(timer);
  }, [whSearch]);

  // Data Hooks
  const { data: warehousesData } = useWarehouses({ search: debouncedWhSearch });
  const { data: posData } = usePurchaseOrders({ purchaseOrderId: debouncedPoSearch });
  const { data: shipmentsData } = useInboundShipments(isEdit ? { search: routePoNumber } : undefined);
  const createShipment = useCreateInboundShipment();
  const updateShipment = useUpdateInboundShipment();

  // Find existing shipment if in edit mode
  const existingShipment = shipmentsData?.data?.find((s: any) => 
    (s.purchaseOrderId === routePoNumber || s.poNumber === routePoNumber || s.PONumber === routePoNumber)
  );

  const shipmentNumberForLines = existingShipment?.shipmentNumber || existingShipment?.shipment || existingShipment?.shipmentNo || existingShipment?.refNo;
  const { data: crossDockLinesData, isLoading: linesLoading } = useCrossDockLines(shipmentNumberForLines || '');

  const warehouseOptions = (warehousesData?.data || []).map((w: any) => w.warehouseName || w.name);
  const poOptions = (posData?.data || []).map((p: any) => p.purchaseOrderId || p.PurchaseOrderId || p.poNumber || p.PONumber || p.id);

  // Form State
  const [formData, setFormData] = useState({
    warehouse: '',
    poNumber: '',
    department: '',
    invoiceQty: '',
    shipmentNo: '',
    vehicleNo: '',
    contactNo: '',
    driverName: '',
    arrivalDate: '',
    timeIn: '',
    remark: ''
  });

  const [items, setItems] = useState([{ id: '1', packageType: '', packageQty: '', location: '', warehouse: 'Main Warehouse' }]);

  // Pre-fill form if in edit mode
  useEffect(() => {
    if (isEdit && existingShipment) {
      setFormData({
        warehouse: existingShipment.warehouseName || existingShipment.warehouse || existingShipment.WarehouseName || '',
        poNumber: existingShipment.purchaseOrderId || existingShipment.poNumber || existingShipment.PONumber || '',
        department: existingShipment.department || existingShipment.Department || '',
        invoiceQty: String(existingShipment.quantity ?? existingShipment.Quantity ?? existingShipment.invoiceQty ?? existingShipment.poQuantity ?? ''),
        shipmentNo: existingShipment.shipmentNumber || existingShipment.shipment || existingShipment.shipmentNo || existingShipment.refNo || '',
        vehicleNo: existingShipment.vehicleNo || existingShipment.VehicleNo || '',
        contactNo: existingShipment.contactNo || existingShipment.ContactNo || '',
        driverName: existingShipment.driverName || existingShipment.DriverName || '',
        arrivalDate: existingShipment.arrivalDate || existingShipment.ArrivalDate || existingShipment.date || '',
        timeIn: existingShipment.timeIn || existingShipment.TimeIn || '',
        remark: existingShipment.remark || existingShipment.Remark || ''
      });

      const shipmentItems = crossDockLinesData?.data || crossDockLinesData || existingShipment.items || existingShipment.lineItems || existingShipment.shipmentItems || existingShipment.InboundShipmentItems;
      if (shipmentItems && Array.isArray(shipmentItems) && shipmentItems.length > 0) {
        setItems(shipmentItems.map((it: any) => ({
          id: it.id || Math.random().toString(),
          packageType: it.packageType || it.PackageType || '',
          packageQty: String(it.packageQty || it.PackageQty || it.quantity || ''),
          location: it.location || it.Location || it.shelfLocation || '',
          warehouse: it.warehouse || it.Warehouse || 'Main Warehouse'
        })));
      }
    }
  }, [isEdit, existingShipment, crossDockLinesData]);
  
  const packageTypes = ['Bora', 'Box', 'Pallet', 'Crate'];
  const departmentOptions = ['Electronics', 'Apparel', 'Home & Kitchen', 'Beauty', 'Toys', 'Sports', 'Automotive', 'Grocery'];
  const shelfOptions = ['A-02-B2', 'B-01-C1', 'C-03-A4', 'D-12-E5', 'E-05-F1', 'F-01-G2', 'G-02-H3'];

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(), packageType: '', packageQty: '', location: '', warehouse: 'Main Warehouse' }]);
  };

  const updateItem = (id: string, field: string, value: string) => {
    setItems(items.map(it => it.id === id ? { ...it, [field]: value } : it));
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(it => it.id !== id));
    }
  };

  const handleSubmit = async () => {
    if (!formData.warehouse || !formData.poNumber) {
      toast.error('Warehouse and PO Number are required');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        items: items.map(({ id, ...rest }) => rest)
      };

      if (isEdit && existingShipment) {
        const id = existingShipment.id || existingShipment.inboundShipmentId;
        await updateShipment.mutateAsync({
          id,
          data: payload
        });
        toast.success('Inbound shipment updated successfully');
      } else {
        await createShipment.mutateAsync(payload);
        toast.success('Inbound shipment created successfully');
      }
      navigate('/inbound-shipments');
    } catch (error: any) {
      toast.error(error.message || `Failed to ${isEdit ? 'update' : 'create'} shipment`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between bg-white dark:bg-[#232323] p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <h1 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-tight">
          {isEdit ? `Edit Shipment: ${formData.shipmentNo || routePoNumber}` : 'New Inbound Shipment'}
        </h1>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="md" onClick={() => navigate(-1)} className="uppercase font-bold">Cancel</Button>
          <Button variant="primary" size="md" onClick={handleSubmit} loading={loading} className="uppercase font-bold">
            {isEdit ? 'Update Shipment' : 'Create Shipment'}
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#232323] rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 space-y-8 shadow-sm">
        {/* SHIPMENT NUMBER */}
        <div>
          <h2 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4">Shipment Number</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Warehouse *</label>
              <SearchableDropdown 
                options={warehouseOptions}
                value={formData.warehouse}
                onChange={(val) => setFormData({ ...formData, warehouse: val })}
                onSearchChange={setWhSearch}
                placeholder="Select Warehouse"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Department</label>
              <SearchableDropdown 
                options={departmentOptions}
                value={formData.department}
                onChange={(val) => setFormData({ ...formData, department: val })}
                placeholder="Select Department"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Select PO *</label>
              <SearchableDropdown 
                options={poOptions}
                value={formData.poNumber}
                onChange={(val) => setFormData({ ...formData, poNumber: val })}
                onSearchChange={setPoSearch}
                placeholder="Search PO Number..."
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Total Quantity</label>
              <Input 
                placeholder="0" 
                className="w-full" 
                value={formData.invoiceQty}
                onChange={(e) => setFormData({ ...formData, invoiceQty: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Shipment #</label>
              <Input 
                placeholder="Shipment ID..." 
                className="w-full" 
                value={formData.shipmentNo}
                onChange={(e) => setFormData({ ...formData, shipmentNo: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Vehicle #</label>
              <Input 
                placeholder="Vehicle number..." 
                className="w-full" 
                value={formData.vehicleNo}
                onChange={(e) => setFormData({ ...formData, vehicleNo: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Contact #</label>
              <Input 
                placeholder="+92..." 
                className="w-full" 
                value={formData.contactNo}
                onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Driver Name</label>
              <Input 
                placeholder="Full name..." 
                className="w-full" 
                value={formData.driverName}
                onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Arrival Date</label>
              <Input 
                type="date" 
                className="w-full" 
                value={formData.arrivalDate}
                onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Time In</label>
              <Input 
                type="time" 
                className="w-full" 
                value={formData.timeIn}
                onChange={(e) => setFormData({ ...formData, timeIn: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* EMAIL NOTIFICATIONS */}
        <div>
          <h2 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4">Email Notifications</h2>
          <Input placeholder="Add email..." className="w-full mb-4" />
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-[10px] font-black text-neutral-400 uppercase tracking-widest cursor-pointer">
              <input type="checkbox" className="rounded border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#232323] text-black dark:text-white focus:ring-black dark:focus:ring-white" />
              PLANNED
            </label>
            <label className="flex items-center gap-2 text-[10px] font-black text-neutral-400 uppercase tracking-widest cursor-pointer">
              <input type="checkbox" className="rounded border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#232323] text-black dark:text-white focus:ring-black dark:focus:ring-white" />
              BARCODED
            </label>
            <label className="flex items-center gap-2 text-[10px] font-black text-neutral-400 uppercase tracking-widest cursor-pointer">
              <input type="checkbox" className="rounded border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#232323] text-black dark:text-white focus:ring-black dark:focus:ring-white" />
              QUALITY CHECK
            </label>
          </div>
        </div>

        {/* REMARK */}
        <div>
          <h2 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4">Remark</h2>
          <textarea 
            placeholder="Additional details..." 
            value={formData.remark}
            onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
            className="w-full h-24 bg-neutral-50 dark:bg-[#1c1c1c] border border-neutral-200 dark:border-neutral-800 rounded-md p-3 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white resize-none"
          />
        </div>

        {/* ATTACHMENTS */}
        <div>
          <h2 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4">Attachments</h2>
          <div className="border border-dashed border-neutral-300 dark:border-neutral-700 rounded-md p-4 flex items-center justify-center cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">CLICK TO ATTACH</span>
          </div>
        </div>
      </div>

      {/* SHIPMENT ITEMS */}
      <div className="bg-white dark:bg-[#232323] border border-neutral-100 dark:border-neutral-950 rounded-md p-3 space-y-3 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between">
            <h2 className="text-[8px] font-black uppercase text-neutral-400 tracking-[0.2em] px-0.5">Shipment Items</h2>
            <Button variant="secondary" size="md" onClick={addItem} className="px-2 text-[8px] font-black ">
                + Add Row
            </Button>
        </div>

        <div className="overflow-x-auto pb-32 -mx-3 px-3 scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-800">
            <table className="w-full min-w-[300px]">
                <thead>
                    <tr className="border-b border-neutral-50 dark:border-neutral-950">
                        {['#', 'Type', 'Qty', ''].map((h, idx) => (
                            <th key={h || `header-${idx}`} className="pb-1.5 text-left text-[8px] font-black uppercase tracking-[0.15em] text-neutral-400 pr-3 last:text-right">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50 dark:divide-neutral-950/30">
                    {items.map((item, i) => (
                        <tr key={item.id} className="group">
                            <td className="py-2 pr-3 align-middle">
                                <span className="text-[9px] font-black text-neutral-400 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                            </td>
                            <td className="py-2 pr-3 align-middle">
                                <select
                                    value={item.packageType}
                                    onChange={e => updateItem(item.id, 'packageType', e.target.value)}
                                    className="h-6 px-2 text-[10px] rounded-md bg-neutral-50/50 dark:bg-[#1c1c1c]/50 border border-neutral-100 dark:border-neutral-900 text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white min-w-[120px]"
                                >
                                    <option value="">Type</option>
                                    {packageTypes.map(t => <option key={t}>{t}</option>)}
                                </select>
                            </td>
                            <td className="py-2 pr-3 align-middle">
                                <Input
                                    type="number"
                                    min="1"
                                    placeholder="0"
                                    value={item.packageQty}
                                    onChange={e => updateItem(item.id, 'packageQty', e.target.value)}
                                    className="w-24 h-6 text-[10px]"
                                />
                            </td>
                            <td className="py-2 text-right align-middle whitespace-nowrap">
                                <button
                                    onClick={() => removeItem(item.id)}
                                    disabled={items.length === 1}
                                    className="p-1.5 text-neutral-300 dark:text-neutral-700 hover:text-red-500 dark:hover:text-red-400 transition-colors disabled:opacity-0 font-bold"
                                >
                                    ✕
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-neutral-50 dark:border-neutral-950 mt-1">
            <span className="text-[7px] font-black text-neutral-300">
                {items.length} ENTRIES
            </span>
            <span className="text-[8px] font-black uppercase tracking-[0.1em] text-neutral-400">
                TOTAL: <span className="text-black dark:text-white tabular-nums">
                    {items.reduce((sum, it) => sum + (parseInt(it.packageQty) || 0), 0).toLocaleString()}
                </span>
            </span>
        </div>
      </div>
    </div>
  );
};
