import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Input, SearchableDropdown, Button } from '../components/ui';
import { Search, X } from 'lucide-react';
import { CustomTable, Column } from '../components/CustomTable';
import { usePurchaseOrderTrackerData } from '../api/hooks/usePurchaseOrders';
import { DatePicker } from '../components/DatePicker';
import { format } from 'date-fns';

export const PoTrackerPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPO, setSelectedPO] = useState<any | null>(null);
    const [page, setPage] = useState(1);
    
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
    const [statusFilter, setStatusFilter] = useState('ALL');

    const dateStr = dateFilter ? format(dateFilter, 'yyyy-MM-dd') : undefined;

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const { data: trackerResponse, isLoading } = usePurchaseOrderTrackerData({
        page,
        pageSize: 25,
        search: debouncedSearchQuery !== '' ? debouncedSearchQuery : undefined,
        date: dateStr,
        trackerStatus: statusFilter !== 'ALL' ? statusFilter : undefined
    });
    const rawPOs = trackerResponse?.data?.PurchaseOrders || trackerResponse?.data || trackerResponse?.PurchaseOrders || [];
    const totalCount = trackerResponse?.data?.total || trackerResponse?.total || 0;
    
    // Normalize properties
    const apiPOs = Array.isArray(rawPOs) ? rawPOs.map((po: any) => ({
        ...po,
        purchaseOrderId: po.poNumber || po.purchaseOrderId || '',
        supplierName: po.Vendor || po.supplierName || '',
        supplierId: po.supplierId || '',
        expectedDate: po.ExptectedDate || po.expectedDate || '',
        totalUnits: po.TotalQuantity || po.totalUnits || 0,
        trackerStatus: po.trackerStatus || po.Status || 'Pending',
        trackerSubStatus: po.trackerSubStatus || '',
        warehouse: po.Warhouse || po.warehouse || '',
        division: po.division || 'Unknown',
        department: po.department || 'Unknown'
    })) : [];

    // No client-side filtering needed since we added backend support, 
    // but Keeping normalized array
    const filteredPOs = apiPOs;

    const getTrackerStatusColor = (status: string) => {
        const s = (status || '').toLowerCase();
        if (s.includes('completed') || s.includes('closed') || s.includes('received') || s.includes('arrived')) return 'green';
        if (s.includes('transit') || s.includes('process') || s.includes('sample')) return 'blue';
        if (s.includes('blocked') || s.includes('cancelled')) return 'red';
        if (s.includes('pending')) return 'orange';
        return 'gray';
    };

    const columns: Column<any>[] = [
        {
            key: 'actions', header: 'Actions',
            className: 'text-left w-24',
            render: (r) => (
                 <Button 
                     variant="secondary" 
                     size="sm" 
                     onClick={() => navigate(`/po-tracker/${r.purchaseOrderId}`)}
                 >
                     Details
                 </Button>
            )
        },
        {
            key: 'purchaseOrderId', header: 'PO Number',
            render: (r) => (
                <div 
                    className="flex flex-col" 
                >
                    <div className="flex items-center gap-2">
                        <span className="font-black text-neutral-600 dark:text-neutral-300 text-xs uppercase tracking-tight">
                            {r.purchaseOrderId}
                        </span>
                        {r.crossDockFlag && <Badge color="green" className="text-[8px] px-1 py-0 border-supabase-green">CROSS-DOCK</Badge>}
                    </div>
                </div>
            )
        },
        {
            key: 'vendor', header: 'Vendor',
            render: (r) => (
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">{r.supplierName}</span>
                    <span className="text-[8px] text-neutral-400 capitalize">{r.division} ({r.department})</span>
                </div>
            )
        },
        {
            key: 'expectedDate', header: 'Expected Date', className: 'hidden sm:table-cell',
            render: (r) => (
                 <span className="text-[10px] text-neutral-400 tabular-nums font-bold">{r.expectedDate}</span>
            )
        },
        {
            key: 'totalQuantity', header: 'Total Quantity',
            render: (r) => (
                <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 tabular-nums">{r.totalUnits.toLocaleString()}</span>
            )
        },
        {
            key: 'status', header: 'Tracker Status',
            render: (r) => (
                <div className="flex flex-col gap-1 items-start">
                    <Badge color={getTrackerStatusColor(r.trackerStatus)}>{r.trackerStatus}</Badge>
                    {r.trackerSubStatus && r.trackerStatus?.toUpperCase() !== r.trackerSubStatus?.toUpperCase() && (
                        <div className="flex items-center gap-1.5 opacity-80">
                            <div className={`w-1.5 h-1.5 rounded-full ${r.subStatusColor === 'green' ? 'bg-green-500' : r.subStatusColor === 'red' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                            <span className="text-[9px] font-bold text-neutral-500">{r.trackerSubStatus}</span>
                        </div>
                    )}
                </div>
            )
        },
        {
            key: 'warehouse', header: 'Warehouse', className: 'hidden md:table-cell',
            render: (r) => (
                 <Badge color="blue">{r.warehouse}</Badge>
            )
        }
    ];

    return (
        <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col min-h-0 space-y-3 pb-4 text-left">
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h1 className="text-lg sm:text-xl font-black text-black dark:text-white leading-none tracking-tight">Purchase Order Tracker</h1>
        </div>
      </div>

      <div className="bg-white dark:bg-[#232323] p-3 rounded-md border border-neutral-200 dark:border-[#2e2e2e] shrink-0">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          <div className="flex flex-col gap-1.5">
            <SearchableDropdown
              className="w-full"
              triggerClassName="w-full border-neutral-200 dark:border-[#2e2e2e] bg-transparent text-neutral-600 dark:text-neutral-400 text-xs truncate"
              options={[
                  'ALL', 
                  'Shipment Arrived',
                  'In Process',
                  'GRN Process',
                  'Partial Closed',
                  'Closed',
                  'Cancelled',
                  'Move to Sample',
                  'Pending a Merchant End',
                  'Pending at Supply Chain'
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Tracker Status..."
              menuTitle="FILTER BY TRACKER STATUS"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <DatePicker
              className="w-full"
              triggerClassName="w-full border-neutral-200 dark:border-[#2e2e2e] bg-transparent text-neutral-600 dark:text-neutral-400 text-xs"
              value={dateFilter}
              onChange={setDateFilter}
              placeholder="Date..."
            />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <Input
              placeholder="Purchase Order..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border-neutral-200 dark:border-[#2e2e2e] text-xs bg-transparent"
            />
          </div>
        </div>
      </div>

      {/* Main Table via CustomTable */}
            <CustomTable<any>
                columns={columns}
                data={filteredPOs}
                page={page}
                pageSize={25}
                total={totalCount}
                loading={isLoading}
                onPageChange={setPage}
                getRowId={(r) => r.purchaseOrderId}
            />

            {/* Interactive Side Drawer */}
            <div 
                className={`fixed inset-y-0 right-0 z-[60] w-full max-w-md bg-white dark:bg-[#1a1a1a] shadow-2xl border-l border-neutral-200 dark:border-neutral-800 transform transition-transform duration-300 ease-in-out ${selectedPO ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {selectedPO && (
                    <div className="h-full flex flex-col">
                        {/* Drawer Header */}
                        <div className="flex items-start justify-between p-6 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#232323]/50">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h2 className="text-xl font-bold font-mono text-supabase-green tracking-tight">{selectedPO.purchaseOrderId}</h2>
                                    <Badge color={getTrackerStatusColor(selectedPO.trackerStatus)}>{selectedPO.trackerStatus}</Badge>
                                </div>
                                <p className="text-sm font-medium">{selectedPO.supplierName}</p>
                                <p className="text-xs text-neutral-500 mt-1">{selectedPO.division} • {selectedPO.brand}</p>
                            </div>
                            <button 
                                onClick={() => setSelectedPO(null)}
                                className="p-2 -mr-2 text-neutral-400 hover:text-black dark:hover:text-white rounded-full hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Drawer Content - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                            
                            {/* Granular Status Overview */}
                            <div>
                                <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4">Current Status</h3>
                                <div className={`p-4 rounded-xl border ${selectedPO.subStatusColor === 'red' ? 'border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-900/10' : selectedPO.subStatusColor === 'yellow' ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-900/30 dark:bg-yellow-900/10' : 'border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-900/10'}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`w-2.5 h-2.5 rounded-full ${selectedPO.subStatusColor === 'red' ? 'bg-red-500' : selectedPO.subStatusColor === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                                        <span className={`text-sm font-bold ${selectedPO.subStatusColor === 'red' ? 'text-red-700 dark:text-red-400' : selectedPO.subStatusColor === 'yellow' ? 'text-yellow-700 dark:text-yellow-400' : 'text-green-700 dark:text-green-400'}`}>
                                            {selectedPO.trackerSubStatus}
                                        </span>
                                    </div>
                                    <div className="text-xs text-neutral-600 dark:text-neutral-400">
                                        {selectedPO.receivedUnits.toLocaleString()} out of {selectedPO.totalUnits.toLocaleString()} units received across {selectedPO.receivedDeliveries} deliveries.
                                    </div>
                                </div>
                            </div>

                            {/* Timeline Activity */}
                            <div>
                                <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4">Activity Timeline</h3>
                                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-neutral-200 dark:before:bg-neutral-800">
                                    {selectedPO.activities.map((act: any, idx: number) => (
                                        <div key={act.id} className="relative flex items-start gap-4">
                                            <div className="absolute left-0 w-4 h-4 rounded-full bg-white dark:bg-[#1a1a1a] border-2 border-supabase-green flex items-center justify-center shadow-sm z-10">
                                                {idx === selectedPO.activities.length - 1 && <div className="w-1.5 h-1.5 rounded-full bg-supabase-green" />}
                                            </div>
                                            <div className="ml-8 w-full">
                                                <div className="bg-white dark:bg-[#232323] p-3 rounded-lg border border-neutral-100 dark:border-[#3e3e3e] shadow-sm">
                                                    <div className="text-xs font-bold">{act.status}</div>
                                                    <div className="flex justify-between items-center mt-1">
                                                        <span className="text-[10px] text-neutral-500">by {act.who}</span>
                                                        <span className="text-[10px] text-neutral-400 font-mono">{act.date}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Line Items */}
                            <div>
                                <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    Line Items <Badge color="gray">{selectedPO.lineItems.length}</Badge>
                                </h3>
                                <div className="space-y-2">
                                    {selectedPO.lineItems.map((item: any) => (
                                        <div key={item.id} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg border border-neutral-100 dark:border-neutral-800">
                                            <div>
                                                <div className="font-mono text-xs font-bold text-neutral-700 dark:text-neutral-300">{item.productVariantId}</div>
                                                <div className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">Variant Code</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium">{item.quantity.toLocaleString()} x <span className="text-supabase-green font-mono">${item.unitPrice.toFixed(2)}</span></div>
                                                <div className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">Total: <span className="font-mono">${(item.quantity * item.unitPrice).toLocaleString()}</span></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Overlay for Drawer */}
            {selectedPO && (
                <div 
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[50]"
                    onClick={() => setSelectedPO(null)}
                />
            )}
        </div>
    );
};

