import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CustomTable, Column } from '../components/CustomTable';
import { Badge, Button, Select, Input, SearchableDropdown, Dropdown, DropdownItem, Modal } from '../components/ui';
import { updatePurchaseOrderStatus } from '../api/endpoints/purchaseOrderApi';
import { usePurchaseOrderByNumber, usePurchaseOrderTracking, useUpdatePurchaseOrderTracking, usePatchPurchaseOrder } from '../api/hooks/usePurchaseOrders';
import { useCreateCrossDockTransferOrders } from '../api/hooks/useInboundShipments';
import { useUsers } from '../api/hooks/useUsers';
import { Building2, Phone, History, Check, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';

interface ScannedItem {
// ... keep existing down to details ...
  lineItemId: number;
  purchaseOrderId: string;
  productVariantId: number;
  quantity: number;
  quantityReceived: number;
  unitPrice: string;
  subtotal: string;
  status: string;
  productName?: string;
  name?: string;
  itemName?: string;
  color?: string;
  size?: string;
  Product?: { name: string };
  ProductVariant?: {
    variantId: string;
    color: string;
    size: string;
    Product?: {
      name: string;
    }
  };
}

interface PODetail {
  purchaseOrderId: string;
  supplierId: string;
  status: string;
  totalProducts: number;
  totalAmount: string;
  totalUnits: number;
  expectedDate: string;
  createdAt: string;
  tags?: string;
  notes?: string;
  Supplier?: { name: string; phone?: string; city?: string; address?: string; Address?: string; Zip?: string; zip?: string; Country?: string; country?: string; City?: string };
  Warehouse?: { warehouseName: string; address?: string; city?: string; zip?: string };
  PurchaseOrderLineItems?: ScannedItem[];
  lineItems?: ScannedItem[];
  items?: ScannedItem[];
  PurchaseOrderItems?: ScannedItem[];
  PurchaseOrderActivities?: {
    id: number;
    status: string;
    subStatus: string | null;
    remarks: string | null;
    createdAt: string;
    User?: { fullName: string };
  }[];
}

export const PurchaseOrderDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { poNumber } = useParams<{ poNumber: string }>();
  const { data: detail, isLoading: loading, error } = usePurchaseOrderByNumber(poNumber!);
  const { data: timelineData, isLoading: trackingLoading } = usePurchaseOrderTracking(poNumber!);
  const { data: usersData } = useUsers();
  const updateTrackingMutation = useUpdatePurchaseOrderTracking();
  const patchPOMutation = usePatchPurchaseOrder();
  const createCrossDockTOMutation = useCreateCrossDockTransferOrders();
  
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);

  // Tracking States
  const statusMap: Record<string, string[]> = {
    'Shipment Arrived': [
      'Stock placed in Receiving Rack',
      'Stock placed in Department',
      'Pending due to Documentation',
      'Partial Received from China Carry',
      'Pending for Weight',
      'Partial Received from Supplier End',
      'Pending to Process',
      'Pending for Sampling',
      'Handover to Admin'
    ],
    'In Process': [
      'On Packing',
      'On Partial Barcoding',
      'On Barcoding',
      'On Distribution',
      'On Scanning',
      'Pending due to Network Issue',
      'On Security Verification',
      'On Audit Verification'
    ],
    'GRN Process': [
      'Document handover for GRN',
      'Pending at MSO End',
      'Pending due to Network Issue',
      'GRN Posted'
    ],
    'Partial Closed': [
      'China Partial Received',
      'Receiving WH Issue',
      'Urgent Dispatch'
    ],
    'Closed': [
      'Hand Over to Audit',
      'Hand Over to Merchant'
    ],
    'Cancelled': [
      'PO/TO Cancel',
      'Stock Returned'
    ],
    'Move to Sample': [
      'Physical Stock Moved',
      'Physical Stock not Moved'
    ],
    'Pending a Merchant End': [
      'TO Or PO need to be updated',
      'Q.C Issue found and hold by merchant',
      'PO, Bill & Physical Stock not match',
      'Over Delivery (Need Child PO)',
      'Mix Stock Receive',
      'Partial Barcoded',
      'Wrong Barcoded',
      'Price Updated',
      'Packing Accessories not available',
      'Partial Received',
      'Due to Vendor not available for Live Receiving'
    ],
    'Pending at Supply Chain': [
      'Dispatch not Receive on Time',
      'Change in Dispatch'
    ]
  };

  const [coreStatus, setCoreStatus] = useState('Shipment Arrived');
  const [currentStage, setCurrentStage] = useState(statusMap['Shipment Arrived'][0]);
  const [handoffName, setHandoffName] = useState('');
  const [withSupplier, setWithSupplier] = useState(false);
  const [verifiedByLp, setVerifiedByLp] = useState(false);
  const [auditDone, setAuditDone] = useState(false);
  const [remarks, setRemarks] = useState('');

  // Sync initial state when detail loads
  React.useEffect(() => {
    if (detail) {
      setCoreStatus(detail.status || 'Shipment Arrived');
      if (detail.subStatus) setCurrentStage(detail.subStatus);
      setHandoffName(detail.departmentReceiver || '');
      setWithSupplier(!!detail.withSupplier);
      setVerifiedByLp(!!detail.verifiedByLp);
      setAuditDone(!!detail.verifiedByAudit);
    }
  }, [detail]);

  // Use activities from the detail object if available
  const timelineEvents = detail?.PurchaseOrderActivities || [];

  const handleUpdateTracking = async () => {
    try {
      const d = new Date();
      await updateTrackingMutation.mutateAsync({
        poNumber: poNumber!,
        trackingData: {
          status: coreStatus,
          subStatus: currentStage,
          remarks: remarks || 'Moved to next stage.',
          user: 'Current User', 
          time: !isNaN(d.getTime()) ? d.toISOString() : new Date().toISOString()
        }
      });
      setRemarks('');
    } catch (err) {
      // Error handled in hook
    }
  };

  const handleUpdateDetails = async () => {
    if (!poNumber) return;
    try {
      await patchPOMutation.mutateAsync({
        poNumber,
        updateData: {
          departmentReceiver: handoffName,
          withSupplier,
          verifiedByLp,
          verifiedByAudit: auditDone,
          // You can add more fields here if needed
          remarks: 'Manual update from details sidebar'
        }
      });
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleSubmit = async () => {
    if (!poNumber) return;
    if (!window.confirm(`Are you sure you want to park this Purchase Order?`)) return;

    try {
      setSubmitting(true);
      await updatePurchaseOrderStatus(poNumber, 'Received');
      toast.success('Purchase Order parked successfully');
      setSubmitting(false);
      // In a real app, we'd invalidate the query here
      window.location.reload();
    } catch (error) {
      console.error('Failed to submit PO:', error);
      toast.error('Failed to submit PO');
      setSubmitting(false);
    }
  };

  const handleInProcessConfirm = async (toastId?: any) => {
    if (!poNumber) return;
    try {
      await updatePurchaseOrderStatus(poNumber, 'InProcess');
      if (toastId) toast.dismiss(toastId);
      toast.success('Status updated to In-Process');
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleInProcessClick = () => {
    toast(
      (t) => (
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-bold text-neutral-800 dark:text-white m-0">Change status to In-Process?</p>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => toast.dismiss(t.toastProps.toastId)} className="py-1 px-2 h-auto text-[10px]">Cancel</Button>
            <Button size="sm" variant="primary" onClick={() => handleInProcessConfirm(t.toastProps.toastId)} className="py-1 px-2 h-auto text-[10px]">Confirm</Button>
          </div>
        </div>
      ),
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
        style: { maxWidth: '400px', width: 'max-content' }
      }
    );
  };

  const handleCreateCrossDockTOs = async () => {
    if (!poNumber) return;
    try {
      await createCrossDockTOMutation.mutateAsync(poNumber);
      toast.success('Cross-dock Transfer Orders created successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create Cross-dock Transfer Orders');
    }
  };

  const columns: Column<ScannedItem>[] = [
    {
      key: 'variantId', header: 'SKU / Variant ID',
      render: (r) => <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 tracking-tight">{r.ProductVariant?.variantId}</span>,
    },
    {
      key: 'item', header: 'Item Name',
      render: (r) => {
        const name = r.ProductVariant?.Product?.name || r.productName || r.name || r.Product?.name || r.itemName || '-';
        return <span className="text-black dark:text-white text-[11px] font-bold tracking-tight">{name}</span>;
      },
    },
    {
      key: 'color', header: 'Color', className: 'hidden sm:table-cell',
      render: (r) => <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium uppercase">{r.ProductVariant?.color || r.color || '-'}</span>,
    },
    {
      key: 'size', header: 'Size', className: 'hidden sm:table-cell',
      render: (r) => <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium uppercase">{r.ProductVariant?.size || r.size || '-'}</span>,
    },
    {
      key: 'uom', header: 'UoM',
      render: (r: any) => <span className="text-[10px] text-neutral-500 font-medium uppercase">{r.ProductVariant?.UnitsOfMeasure?.unitName || r.ProductVariant?.uom || r.uom || r.ProductVariant?.Product?.uom || r.Product?.uom || 'Unit'}</span>,
    },
    {
      key: 'quantity', header: 'Qty',
      render: (r) => <span className="text-[11px] font-black text-black dark:text-white tabular-nums">{r.quantity}</span>,
    },
    {
      key: 'unitPrice', header: 'Unit Price',
      render: (r) => <span className="text-[10px] font-bold text-neutral-500 tabular-nums">{Number(r.unitPrice).toLocaleString()}</span>,
    },
    {
      key: 'subtotal', header: 'Subtotal',
      render: (r) => <span className="text-[11px] font-black text-black dark:text-white tabular-nums">{Number(r.subtotal).toLocaleString()}</span>,
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-neutral-400 font-bold text-[10px]">Loading Purchase Order...</p>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <p className="text-neutral-400 font-bold text-[10px]">Purchase order not found</p>
        <Button variant="secondary" size="sm" onClick={() => navigate('/Purchase-Order')}>Back to List</Button>
      </div>
    );
  }

  const items = detail.PurchaseOrderLineItems || detail.lineItems || detail.items || detail.PurchaseOrderItems || [];

  return (
    <div className="space-y-4 pb-16 text-left">
      {/* Header Bar */}
      <div className="flex items-start justify-between gap-3 bg-neutral-50/50 dark:bg-[#1c1c1c]/50 p-3 rounded-md border border-neutral-100 dark:border-neutral-900">
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-black text-black dark:text-white leading-none uppercase tracking-tight truncate">
              {poNumber || detail.purchaseOrderId || 'PO Detail'}
            </h1>
          </div>
          <div className="flex">
            <Badge 
              color={detail.status === 'Received' ? 'green' : detail.status === 'Partial' ? 'orange' : 'blue'} 
              className="font-black text-[9px] px-1.5 py-0.5"
            >
              {(detail.status || '').toUpperCase()}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate(-1)}
            className="uppercase"
          >
            Back
          </Button>
          <Dropdown
            trigger={
              <Button 
                variant="primary" 
                size="md" 
                className="font-black uppercase tracking-widest flex items-center gap-2"
                loading={patchPOMutation.isPending || createCrossDockTOMutation.isPending}
              >
                Actions <ChevronDown size={14} />
              </Button>
            }
            align="right"
          >
            <DropdownItem onClick={handleInProcessClick}>In-Process</DropdownItem>
            <DropdownItem onClick={handleUpdateDetails}>Update</DropdownItem>
            <DropdownItem 
              onClick={handleCreateCrossDockTOs}
              disabled={detail.status !== 'Received'}
            >
              Create Transfer-Orders
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-9 space-y-4">
          
          {/* Order Details Section */}
          <div className="bg-white dark:bg-[#232323] rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 space-y-8 shadow-sm">
            <div>
              <h2 className="text-[10px] font-bold text-neutral-500 mb-4 uppercase tracking-widest">Order Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Supplier Name</label>
                  <Input value={detail.Supplier?.name || 'Not provided'} readOnly className="w-full" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Ship to warehouse</label>
                  <Input value={detail.Warehouse?.warehouseName || 'Not provided'} readOnly className="w-full" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Company</label>
                  <Input value="Chase Value B2C Retailer" readOnly className="w-full" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Order date</label>
                  <Input 
                    value={(() => {
                      const d = new Date(detail.createdAt);
                      return !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : '';
                    })()} 
                    readOnly 
                    className="w-full" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Expected date</label>
                  <Input value={detail.expectedDate || 'Not provided'} readOnly className="w-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="bg-white dark:bg-[#232323] border border-neutral-100 dark:border-neutral-950 rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-50 dark:border-neutral-900 flex items-center justify-between">
              <h2 className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Line Items</h2>
              <span className="text-[9px] font-black text-neutral-400 uppercase">{items.length} Items</span>
            </div>
            <CustomTable<ScannedItem>
              columns={columns}
              data={items}
              page={page}
              pageSize={100}
              total={items.length}
              loading={loading}
              onPageChange={setPage}
              getRowId={r => String(r.lineItemId)}
            />
          </div>

        </div>

        {/* Right Column (Details Sidebar) */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Tracker Form Widget Removed */}

          {/* Financial Summary */}
          <div className="bg-white dark:bg-[#232323] border border-neutral-100 dark:border-neutral-950 rounded-lg p-6 space-y-4 shadow-sm">
            <h3 className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest border-b border-neutral-50 dark:border-neutral-900 pb-2">Financial Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold text-neutral-400 uppercase">Total Units</span>
                <span className="text-xs font-black text-neutral-900 dark:text-white tabular-nums">{detail.totalUnits}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold text-neutral-400 uppercase">Total Products</span>
                <span className="text-xs font-black text-neutral-900 dark:text-white tabular-nums">{detail.totalProducts}</span>
              </div>
              <div className="pt-3 border-t border-neutral-50 dark:border-neutral-900 flex justify-between items-center">
                <span className="text-[10px] font-black text-supabase-green uppercase">Grand Total</span>
                <span className="text-lg font-black text-neutral-900 dark:text-white tabular-nums">
                  {Number(detail.totalAmount).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default PurchaseOrderDetailPage;
