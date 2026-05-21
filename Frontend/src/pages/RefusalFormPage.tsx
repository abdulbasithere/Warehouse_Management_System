import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, SearchableDropdown } from '../components/ui';
import { usePurchaseOrders } from '../api/hooks/usePurchaseOrders';
import { toast } from 'react-toastify';

export const RefusalFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [poSearch, setPoSearch] = useState('');
  const [debouncedPoSearch, setDebouncedPoSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedPoSearch(poSearch), 500);
    return () => clearTimeout(timer);
  }, [poSearch]);

  const { data: posData } = usePurchaseOrders({ purchaseOrderId: debouncedPoSearch });
  
  const poOptions = (posData?.data || []).map((p: any) => p.purchaseOrderId || p.poNumber || p.PONumber || p.id);

  const [formData, setFormData] = useState({
    serial: 'AUTO-GENERATED',
    supplierInvoice: '',
    purchaseOrder: '',
    vendorName: '',
    vendorId: '',
    remarks: '',
  });

  const [items, setItems] = useState([
    { id: '1', itemBarcode: '', itemCode: '', description: '', color: '', size: '', qty: '', manualRemarks: '', stackingLocation: '' }
  ]);

  // Simulate auto-fetch when PO changes
  useEffect(() => {
    if (formData.purchaseOrder) {
      const selectedPO = posData?.data?.find((p: any) => 
        p.purchaseOrderId === formData.purchaseOrder || p.poNumber === formData.purchaseOrder || p.PONumber === formData.purchaseOrder || p.id === formData.purchaseOrder
      );
      if (selectedPO) {
        setFormData(prev => ({
          ...prev,
          vendorName: selectedPO.Supplier?.name || selectedPO.Supplier?.Name || selectedPO.supplierName || 'System Vendor',
          vendorId: selectedPO.Supplier?.id || selectedPO.supplierId || 'V0000810'
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, vendorName: '', vendorId: '' }));
    }
  }, [formData.purchaseOrder, posData]);

  const updateItem = (id: string, field: string, value: string) => {
    setItems(items.map(it => it.id === id ? { ...it, [field]: value } : it));

    // Simulate auto-fetch item details based on barcode
    if (field === 'itemBarcode' && value.length > 5) {
      setItems(prev => prev.map(it => it.id === id ? {
        ...it,
        itemCode: value.substring(0, 6),
        description: "Men's Cargo Pant (CVCSG702) / Men's Cargo Pant (CVCSG702)",
        color: ['Khakhi', 'Navy Blue', 'Brown'][Math.floor(Math.random() * 3)],
        size: ['36', '38', '40'][Math.floor(Math.random() * 3)]
      } : it));
    }
  };

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(), itemBarcode: '', itemCode: '', description: '', color: '', size: '', qty: '', manualRemarks: '', stackingLocation: '' }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(it => it.id !== id));
    }
  };

  const handleSubmit = async () => {
    if (!formData.purchaseOrder) {
      toast.error('Purchase Order is required');
      return;
    }
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success('Delivery Refusal Form saved successfully');
      navigate(-1);
    }, 1000);
  };

  return (
    <div className="space-y-6 text-left w-full pb-20">
      
      {/* Header Actions */}
      <div className="flex items-center justify-between bg-white dark:bg-[#232323] p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <h1 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-tight">
          New Refusal
        </h1>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="md" onClick={() => navigate(-1)} className="uppercase font-bold">Cancel</Button>
          <Button variant="primary" size="md" onClick={handleSubmit} loading={loading} className="uppercase font-bold text-white">
            Save Refusal
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#232323] rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 space-y-8 shadow-sm">
        
        {/* Top Details */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Purchase Order *</label>
              <SearchableDropdown 
                options={poOptions}
                value={formData.purchaseOrder}
                onChange={(val) => setFormData({ ...formData, purchaseOrder: val })}
                onSearchChange={setPoSearch}
                placeholder="Select Purchase Order"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Vendor ID</label>
              <SearchableDropdown 
                options={['V0000810', 'V0000811', 'V0000812', 'V0000813']}
                value={formData.vendorId}
                onChange={(val) => setFormData({ ...formData, vendorId: val })}
                placeholder="Select Vendor ID"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Supplier Invoice</label>
              <Input 
                className="w-full" 
                placeholder="Enter Supplier Invoice #"
                value={formData.supplierInvoice}
                onChange={(e) => setFormData({ ...formData, supplierInvoice: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Vendor Name</label>
              <Input 
                className="w-full bg-neutral-50 dark:bg-[#1a1a1a] text-neutral-600 dark:text-neutral-400" 
                placeholder="Vendor Name (Auto-fills or enter manually)"
                value={formData.vendorName}
                onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Refused Items Table */}
        <div className="space-y-3 pt-4">
          <div className="flex items-center justify-between">
              <h2 className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Refused Items</h2>
              <Button variant="secondary" size="sm" onClick={addItem} className="px-3 text-[9px] font-black uppercase">
                  + Add Item
              </Button>
          </div>

          <div className="overflow-x-auto border border-neutral-200 dark:border-neutral-800 rounded-md">
              <table className="w-full min-w-[1000px] text-sm">
                  <thead>
                      <tr className="bg-neutral-50 dark:bg-[#1c1c1c] border-b border-neutral-200 dark:border-neutral-800">
                          <th className="py-2 pl-3 pr-2 text-left text-[9px] font-black uppercase tracking-wider text-neutral-300 w-12">S.No</th>
                          <th className="py-2 px-2 text-left text-[9px] font-black uppercase tracking-wider text-neutral-300 w-32">Item Barcode</th>
                          <th className="py-2 px-2 text-left text-[9px] font-black uppercase tracking-wider text-neutral-300 opacity-60 w-24">Item</th>
                          <th className="py-2 px-2 text-left text-[9px] font-black uppercase tracking-wider text-neutral-300 opacity-60">Description</th>
                          <th className="py-2 px-2 text-left text-[9px] font-black uppercase tracking-wider text-neutral-300 opacity-60 w-20">Color</th>
                          <th className="py-2 px-2 text-left text-[9px] font-black uppercase tracking-wider text-neutral-300 opacity-60 w-16">Size</th>
                          <th className="py-2 px-2 text-left text-[9px] font-black uppercase tracking-wider text-neutral-300 w-20">Qty</th>
                          <th className="py-2 px-2 text-left text-[9px] font-black uppercase tracking-wider text-neutral-300 w-48">Manual Remarks</th>
                          <th className="py-2 px-3 text-left text-[9px] font-black uppercase tracking-wider text-neutral-300 w-36">Stacking Loc...</th>
                          <th className="py-2 pr-3 w-10"></th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                      {items.map((item, i) => (
                          <tr key={item.id} className="hover:bg-neutral-50/50 dark:hover:bg-[#1a1a1a]/50">
                              <td className="py-1.5 pl-3 pr-2 align-middle">
                                  <span className="text-[10px] font-black text-neutral-400 tabular-nums">{i + 1}</span>
                              </td>
                              <td className="py-1.5 px-2 align-middle">
                                  <Input
                                      placeholder="Scan/Enter"
                                      value={item.itemBarcode}
                                      onChange={e => updateItem(item.id, 'itemBarcode', e.target.value)}
                                      className="h-8 text-[10px] w-full"
                                  />
                              </td>
                              <td className="py-1.5 px-2 align-middle">
                                <span className="text-[9px] font-mono text-neutral-500">{item.itemCode || '-'}</span>
                              </td>
                              <td className="py-1.5 px-2 align-middle">
                                <span className="text-[9px] font-medium text-neutral-600 dark:text-neutral-300 line-clamp-1">{item.description || '-'}</span>
                              </td>
                              <td className="py-1.5 px-2 align-middle">
                                <span className="text-[9px] text-neutral-500">{item.color || '-'}</span>
                              </td>
                              <td className="py-1.5 px-2 align-middle">
                                <span className="text-[10px] tabular-nums font-medium text-neutral-500">{item.size || '-'}</span>
                              </td>
                              <td className="py-1.5 px-2 align-middle">
                                  <Input
                                      type="number"
                                      placeholder="0"
                                      value={item.qty}
                                      onChange={e => updateItem(item.id, 'qty', e.target.value)}
                                      className="h-8 text-[10px] w-full"
                                  />
                              </td>
                              <td className="py-1.5 px-2 align-middle">
                                  <Input
                                      placeholder="Remarks for this item"
                                      value={item.manualRemarks}
                                      onChange={e => updateItem(item.id, 'manualRemarks', e.target.value)}
                                      className="h-8 text-[10px] w-full"
                                  />
                              </td>
                              <td className="py-1.5 pl-2 pr-3 align-middle">
                                  <select
                                      value={item.stackingLocation}
                                      onChange={e => updateItem(item.id, 'stackingLocation', e.target.value)}
                                      className="h-8 px-2 text-[9px] rounded-md bg-transparent border border-neutral-200 dark:border-neutral-700 w-full focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                                  >
                                      <option value="">Select Location</option>
                                      <option value="Zone-A">Zone-A</option>
                                      <option value="Zone-B">Zone-B</option>
                                      <option value="Damaged Area">Damaged Area</option>
                                      <option value="Excess Area">Excess Area</option>
                                      <option value="R-01">R-01</option>
                                  </select>
                              </td>
                              <td className="py-1.5 pr-3 text-right align-middle">
                                  <button
                                      onClick={() => removeItem(item.id)}
                                      disabled={items.length === 1}
                                      className="p-1.5 text-neutral-300 hover:text-red-500 transition-colors disabled:opacity-0"
                                  >
                                      <span className="text-xs font-black">✕</span>
                                  </button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
        </div>

        {/* Remarks */}
        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-900">
            <h2 className="text-[10px] font-black text-neutral-300 uppercase tracking-widest mb-4">Remarks</h2>
            <textarea 
              placeholder="Overall remarks..." 
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full bg-neutral-50 dark:bg-[#1c1c1c] border border-neutral-200 dark:border-neutral-800 rounded-md p-3 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white resize-none"
            />
        </div>
      </div>
    </div>
  );
};

export default RefusalFormPage;
