import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Select, SearchableDropdown } from '../components/ui';
import { toast } from 'react-toastify';
import { Search, Plus, Calendar, CreditCard, Tag, Package, FileText, ChevronDown, Image as ImageIcon } from 'lucide-react';
import { useSuppliers } from '../api/hooks/useSuppliers';

export const PurchaseOrderFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { data: suppliersData } = useSuppliers();
  const suppliers = suppliersData?.data || [];
  const supplierOptions = suppliers.map((s: any) => s.name || s.Name || '');

  const [selectedSupplierName, setSelectedSupplierName] = useState('');
  const selectedSupplier = suppliers.find((s: any) => (s.name || s.Name) === selectedSupplierName);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success('Purchase Order created successfully');
      navigate('/Purchase-Order');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col space-y-4 text-left">
      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <div>
          <h1 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-tight">New Purchase Order</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="md" onClick={() => navigate('/Purchase-Order')} className="uppercase">Cancel</Button>
          <Button variant="primary" size="md" onClick={handleSubmit} loading={loading} className="uppercase">Save Order</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Supplier & Line Items */}
        <div className="lg:col-span-9 space-y-4">
          
          {/* Supplier Section */}
          <div className="bg-white dark:bg-[#232323] border border-neutral-100 dark:border-neutral-950 rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-2 border-b border-neutral-50 dark:border-neutral-900 bg-neutral-50/50 dark:bg-[#1c1c1c]/50">
              <h2 className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Supplier *</h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <SearchableDropdown 
                    options={supplierOptions}
                    value={selectedSupplierName}
                    onChange={(val) => setSelectedSupplierName(val)}
                    placeholder="Search by supplier name, email, phone number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 py-2">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-neutral-300 uppercase">Company name</span>
                  <p className="text-xs font-bold text-neutral-700 dark:text-neutral-200">{selectedSupplier?.name || selectedSupplier?.Name || '-'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-neutral-300 uppercase">Contact person</span>
                  <p className="text-xs font-bold text-neutral-700 dark:text-neutral-200">{selectedSupplier?.contactPerson || selectedSupplier?.ContactPerson || '-'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-neutral-300 uppercase">Phone number</span>
                  <p className={selectedSupplier?.phone || selectedSupplier?.Phone ? "text-xs font-bold text-neutral-700 dark:text-neutral-200" : "text-xs font-bold text-neutral-400 italic"}>
                    {selectedSupplier?.phone || selectedSupplier?.Phone || 'Not provided'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Supplier Address */}
                <div className="border border-neutral-100 dark:border-neutral-900 rounded-lg overflow-hidden">
                  <div className="px-3 py-1.5 border-b border-neutral-50 dark:border-neutral-900 flex justify-between items-center">
                    <span className="text-[9px] font-black text-neutral-400 uppercase">Supplier address</span>
                    <button className="text-[9px] font-black text-neutral-400 uppercase flex items-center hover:text-black dark:hover:text-white">
                      <Plus size={10} className="mr-1" /> CHANGE
                    </button>
                  </div>
                  <div className="p-3 space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-neutral-300 uppercase">Address *</label>
                      <Input value={selectedSupplier?.address || selectedSupplier?.Address || '-'} disabled className="bg-neutral-50/50 dark:bg-[#1c1c1c]/50" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-neutral-300 uppercase">City *</label>
                      <Input value={selectedSupplier?.city || selectedSupplier?.City || '-'} disabled className="bg-neutral-50/50 dark:bg-[#1c1c1c]/50" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-neutral-300 uppercase">Zip code</label>
                      <Input value={selectedSupplier?.zip || selectedSupplier?.Zip || '-'} disabled className="bg-neutral-50/50 dark:bg-[#1c1c1c]/50" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-neutral-300 uppercase">Country</label>
                      <Input value={selectedSupplier?.country || selectedSupplier?.Country || '-'} disabled className="bg-neutral-50/50 dark:bg-[#1c1c1c]/50" />
                    </div>
                  </div>
                </div>

                {/* Billing Address */}
                <div className="border border-neutral-100 dark:border-neutral-900 rounded-lg overflow-hidden">
                  <div className="px-3 py-1.5 border-b border-neutral-50 dark:border-neutral-900 flex justify-between items-center">
                    <span className="text-[9px] font-black text-neutral-400 uppercase">Billing address</span>
                    <button className="text-[9px] font-black text-neutral-400 uppercase flex items-center hover:text-black dark:hover:text-white">
                      <Plus size={10} className="mr-1" /> CHANGE
                    </button>
                  </div>
                  <div className="p-3 space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-neutral-300 uppercase">Address *</label>
                      <Input value={selectedSupplier?.address || selectedSupplier?.Address || '-'} disabled className="bg-neutral-50/50 dark:bg-[#1c1c1c]/50" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-neutral-300 uppercase">City *</label>
                      <Input value={selectedSupplier?.city || selectedSupplier?.City || '-'} disabled className="bg-neutral-50/50 dark:bg-[#1c1c1c]/50" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-neutral-300 uppercase">Zip code</label>
                      <Input value={selectedSupplier?.zip || selectedSupplier?.Zip || '-'} disabled className="bg-neutral-50/50 dark:bg-[#1c1c1c]/50" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-neutral-300 uppercase">Country</label>
                      <Input value={selectedSupplier?.country || selectedSupplier?.Country || '-'} disabled className="bg-neutral-50/50 dark:bg-[#1c1c1c]/50" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Section */}
          <div className="bg-white dark:bg-[#232323] border border-neutral-100 dark:border-neutral-950 rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-2 border-b border-neutral-50 dark:border-neutral-900 bg-neutral-50/50 dark:bg-[#1c1c1c]/50">
              <h2 className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Line items</h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
                  <Input placeholder="Search" className="pl-9" />
                </div>
                <Button variant="secondary" size="md" className="text-blue-600 border-blue-100 dark:border-blue-900/30">
                  <Plus size={14} className="mr-1" /> BROWSE
                </Button>
              </div>

              <div className="border border-neutral-50 dark:border-neutral-900 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-50/50 dark:bg-[#1c1c1c]/50 border-b border-neutral-50 dark:border-neutral-900">
                      <th className="px-4 py-2 text-[9px] font-black text-neutral-400 uppercase">Image</th>
                      <th className="px-4 py-2 text-[9px] font-black text-neutral-400 uppercase">Product</th>
                      <th className="px-4 py-2 text-[9px] font-black text-neutral-400 uppercase">Supplier SKU</th>
                      <th className="px-4 py-2 text-[9px] font-black text-neutral-400 uppercase">Order Qty</th>
                      <th className="px-4 py-2 text-[9px] font-black text-neutral-400 uppercase">Unit cost</th>
                      <th className="px-4 py-2 text-[9px] font-black text-neutral-400 uppercase text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={6} className="py-20">
                        <div className="flex flex-col items-center justify-center text-neutral-300 space-y-2">
                          <div className="p-4 bg-neutral-50 dark:bg-[#1c1c1c] rounded-full">
                            <ImageIcon size={32} />
                          </div>
                          <p className="text-[10px] font-bold uppercase tracking-widest">No scanned items.</p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Invoice Summary */}
            <div className="bg-white dark:bg-[#232323] border border-neutral-100 dark:border-neutral-950 rounded-lg shadow-sm overflow-hidden">
              <div className="px-4 py-2 border-b border-neutral-50 dark:border-neutral-900 bg-neutral-50/50 dark:bg-[#1c1c1c]/50">
                <h2 className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Invoice summary</h2>
              </div>
              <div className="p-4 space-y-2">
                {[
                  { label: 'Line items', value: '0' },
                  { label: 'Units ordered', value: '0' },
                  { label: 'Subtotal', value: 'PKR 0.00' },
                  { label: 'Discount price', value: 'PKR 0.00' },
                  { label: 'Taxes', value: 'PKR 0.00' },
                  { label: 'Shipping charges', value: 'PKR 0.00' },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1 border-b border-neutral-50 dark:border-neutral-900 last:border-0">
                    <span className="text-[10px] font-medium text-neutral-500">{item.label}</span>
                    <span className="text-[10px] font-bold text-neutral-900 dark:text-white tabular-nums">{item.value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 mt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <span className="text-[11px] font-black text-neutral-900 dark:text-white uppercase">Total</span>
                  <span className="text-[11px] font-black text-neutral-900 dark:text-white tabular-nums">PKR 0.00</span>
                </div>
              </div>
            </div>

            {/* Supplier Notes */}
            <div className="bg-white dark:bg-[#232323] border border-neutral-100 dark:border-neutral-950 rounded-lg shadow-sm overflow-hidden flex flex-col">
              <div className="px-4 py-2 border-b border-neutral-50 dark:border-neutral-900 bg-neutral-50/50 dark:bg-[#1c1c1c]/50">
                <h2 className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Supplier notes</h2>
              </div>
              <div className="p-4 flex-1 flex flex-col space-y-2">
                <label className="text-[9px] font-black text-neutral-300 uppercase">Notes</label>
                <textarea 
                  className="flex-1 w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-medium text-black placeholder-neutral-400 focus:ring-1 focus:ring-supabase-green focus:border-supabase-green focus:outline-none dark:border-[#2e2e2e] dark:bg-[#1c1c1c] dark:text-white transition-all min-h-[150px] resize-none"
                  placeholder="Add any notes here..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-[#232323] border border-neutral-100 dark:border-neutral-950 rounded-lg shadow-sm overflow-hidden sticky top-4">
            <div className="px-4 py-2 border-b border-neutral-50 dark:border-neutral-900 bg-neutral-50/50 dark:bg-[#1c1c1c]/50">
              <h2 className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Details</h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-neutral-300 uppercase tracking-widest">Ship to warehouse *</label>
                <Select>
                  <option>Chase Value B2C</option>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-neutral-300 uppercase tracking-widest">Company *</label>
                <Select>
                  <option>Chase Value 3PL</option>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-neutral-300 uppercase tracking-widest">Order date *</label>
                <div className="relative">
                  <Input type="date" defaultValue="2026-04-13" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-neutral-300 uppercase tracking-widest">Expected Date *</label>
                <div className="relative">
                  <Input type="date" defaultValue="2026-04-27" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-neutral-300 uppercase tracking-widest">Payment type</label>
                <Select>
                  <option>Cash</option>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-neutral-300 uppercase tracking-widest">Payment Term</label>
                <Select>
                  <option>-</option>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-neutral-300 uppercase tracking-widest">Supplier reference id</label>
                <Input placeholder="Reference ID" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-neutral-300 uppercase tracking-widest">Tags</label>
                <Input placeholder="Tags" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
