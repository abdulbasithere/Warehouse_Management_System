import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge, Button, Input, Select, SearchableDropdown } from '../components/ui';
import { usePurchaseOrderTracking, usePurchaseOrderTrackerDetails, useUpdatePurchaseOrderTracking } from '../api/hooks/usePurchaseOrders';
import { useUsers } from '../api/hooks/useUsers';
import { Building2, Phone, History } from 'lucide-react';

export const PoTrackerDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { poNumber } = useParams<{ poNumber: string }>();
  
  // Data hooks
  const { data: trackerDetailsData, isLoading: loading, error } = usePurchaseOrderTrackerDetails(poNumber!);
  const detail = trackerDetailsData?.data || trackerDetailsData || null;

  const trackerDetail = {
      ...detail,
      supplierName: detail?.Vendor || 'Not provided',
      supplierId: detail?.supplierId || '-',
      expectedDate: detail?.ExptectedDate || detail?.expectedDate || 'Not provided',
      status: detail?.Status || detail?.trackerStatus || 'Pending',
      warehouse: detail?.Warhouse || detail?.warehouse || 'Not provided',
      division: detail?.division || 'Not provided',
      department: detail?.department || 'Not provided',
      brand: detail?.brand || 'Not provided',
      merchandiser: detail?.merchandiser || 'Not provided',
      billFrom: detail?.billFrom || 'Not provided',
      totalDeliveries: detail?.totalDeliveries || 'Not provided',
      receivedUnits: detail?.receivedUnits || 0,
      totalUnits: detail?.TotalQuantity || detail?.totalUnits || 0,
      crossDockFlag: detail?.crossDockFlag || false
  };

  const updateTrackingMutation = useUpdatePurchaseOrderTracking();
  const { data: usersData } = useUsers();
  const [page, setPage] = React.useState(1);

  const [vehicles, setVehicles] = React.useState<any[]>([]);

  const addVehicle = () => setVehicles(v => [...v, { id: Date.now().toString(), vehicleNumber: '', driverName: '', driverContact: '', deliveryNumber: '', timeIn: '', timeOut: '' }]);
  const updateVehicle = (id: string, field: string, value: string) => setVehicles(v => v.map(veh => veh.id === id ? { ...veh, [field]: value } : veh));
  const removeVehicle = (id: string) => setVehicles(v => v.filter(veh => veh.id !== id));

  const [formData, setFormData] = React.useState({
    considerDate: '',
    responsibleSupervisor: '',
    barcoded: false,
    sampleMovementDate: '',
    packerName: '',
    googleLens: false,
    isPlanned: false,
    parkingLocation: '',
    shipmentConsiderDate: '',
    qualityCheck: false,
    chinaCarry: '',
    billAging: '',
    shipmentArrivalDate: '',
    billQuantity: '',
    invoiceSubmittedDate: '',
    committedDate: '',
    billSubmittedDate: '',
    editLines: '',
    deliveryStatus: '',
    grnQuantity: '',
    warehouseName: '',
    department: '',
    invoiceQuantity: 0,
    shipmentNumber: '',
    arrivalDate: '',
    remark: '',
  });

  const handleFormChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

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
      'On Audit Verification',
      'On Sorting'
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
    'Pending at Merchant End': [
      'TO Or PO need to be updated',
      'Q.C Issue found and hold by merchant',
      'PO, Bill & Physical Stock not match',
      'Over Delivery (Need Child PO)',
      'Mix Stock Receive',
      'Partial Barcoded',
      'Wrong Barcoded',
      'Price Updated',
      'Packing Accessories not available',
      'Partial Received'
    ],
    'Pending at Supply Chain': [
      'Dispatch not Receive on Time',
      'Change in Dispatch'
    ]
  };

  const [coreStatus, setCoreStatus] = React.useState('Shipment Arrived');
  const [currentStage, setCurrentStage] = React.useState(statusMap['Shipment Arrived'][0]);
  const [remarks, setRemarks] = React.useState('');

  // Sync initial state when detail loads
  React.useEffect(() => {
    if (detail) {
      const dbStatus = detail.trackerStatus || detail.Status || detail.status;
      const initialCoreStatus = statusMap[dbStatus] ? dbStatus : 'Shipment Arrived';
      setCoreStatus(initialCoreStatus);
      
      const dbSubStatus = detail.trackerSubStatus || detail.subStatus;
      if (dbSubStatus && statusMap[initialCoreStatus]?.includes(dbSubStatus)) {
        setCurrentStage(dbSubStatus);
      } else {
        setCurrentStage(statusMap[initialCoreStatus][0]);
      }

      if (detail.vehicleDetails && vehicles.length === 0) setVehicles(detail.vehicleDetails);
    }
  }, [detail]);

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

  const timelineEvents = detail?.activities || detail?.PurchaseOrderActivities || [];
  const items = detail?.PurchaseOrderLineItems || detail?.lineItems || detail?.items || detail?.PurchaseOrderItems || [];
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-neutral-400 font-bold text-[10px]">Loading PO Details...</p>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <p className="text-neutral-400 font-bold text-[10px]">Purchase order not found</p>
        <Button variant="secondary" size="sm" onClick={() => navigate('/po-tracker')}>Back to Tracker</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-16 text-left">
      {/* Header Bar */}
      <div className="flex items-start justify-between gap-3 bg-neutral-50/50 dark:bg-[#1c1c1c]/50 p-3 rounded-md border border-neutral-100 dark:border-neutral-900">
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-sm font-black text-black dark:text-white leading-none uppercase tracking-tight truncate">
              {poNumber || detail.purchaseOrderId || 'PO Detail'}
            </h1>
            {(detail.shipmentNumber || detail.inboundShipmentId) && (
              <Badge color="orange" className="font-black text-[9px] px-1.5 py-0.5 border-dashed">
                {detail.shipmentNumber || detail.inboundShipmentId}
              </Badge>
            )}
          </div>
          <div className="flex items-center">
            {trackerDetail.status && (
              <Badge 
                color="blue" 
                className="font-black text-[9px] px-1.5 py-0.5"
              >
                {trackerDetail.status.toUpperCase()}
              </Badge>
            )}
            {trackerDetail.crossDockFlag && (
              <Badge color="green" className="text-[9px] px-1.5 py-0.5 ml-2 border-supabase-green">CROSS-DOCK</Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate('/po-tracker')}
            className="uppercase font-bold"
          >
            Back
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Order Details Section */}
          <div className="bg-white dark:bg-[#232323] rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 space-y-8 shadow-sm">
            <div>
              <h2 className="text-[10px] font-bold text-neutral-500 mb-4 uppercase tracking-widest">Order Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Supplier Name</label>
                  <Input value={detail.Supplier?.name || trackerDetail.supplierName || 'Not provided'} readOnly className="w-full" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Ship to warehouse</label>
                  <Input value={detail.Warehouse?.warehouseName || trackerDetail.warehouse || 'Not provided'} readOnly className="w-full" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Division</label>
                  <Input value={trackerDetail.division || 'Not provided'} readOnly className="w-full" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Department</label>
                  <Input value={trackerDetail.department || 'Not provided'} readOnly className="w-full" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Brand</label>
                  <Input value={trackerDetail.brand || 'Not provided'} readOnly className="w-full" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Merchandiser</label>
                  <Input value={trackerDetail.merchandiser || 'Not provided'} readOnly className="w-full" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Bill From</label>
                  <Input value={trackerDetail.billFrom || 'Not provided'} readOnly className="w-full" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Total Deliveries</label>
                  <Input value={trackerDetail.totalDeliveries || 'Not provided'} readOnly className="w-full" />
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
                  <label className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Arrival / Expected date</label>
                  <Input value={trackerDetail.expectedDate || detail.expectedDate || 'Not provided'} readOnly className="w-full" />
                </div>
                {/* NEW FIELDS START */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Consider date</label>
                  <Input type="date" value={formData.considerDate} onChange={(e: any) => handleFormChange('considerDate', e.target.value)} className="w-full" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Responsible Supervisor</label>
                  <SearchableDropdown
                    placeholder="Select User"
                    value={formData.responsibleSupervisor}
                    onChange={(val) => handleFormChange('responsibleSupervisor', val)}
                    options={(usersData?.data || []).map((u: any) => u.fullName || u.username || u.email || 'User')}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Sample Movement date</label>
                  <Input type="date" value={formData.sampleMovementDate} onChange={(e: any) => handleFormChange('sampleMovementDate', e.target.value)} className="w-full" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Packer name</label>
                  <SearchableDropdown
                    placeholder="Select Packer"
                    value={formData.packerName}
                    onChange={(val) => handleFormChange('packerName', val)}
                    options={(usersData?.data || []).map((u: any) => u.fullName || u.username || u.email || 'User')}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Parking location</label>
                  <Input value={formData.parkingLocation} onChange={(e: any) => handleFormChange('parkingLocation', e.target.value)} className="w-full" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Shipment Consider Date</label>
                  <Input type="date" value={formData.shipmentConsiderDate} onChange={(e: any) => handleFormChange('shipmentConsiderDate', e.target.value)} className="w-full" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">China carry</label>
                  <Input value={formData.chinaCarry} onChange={(e: any) => handleFormChange('chinaCarry', e.target.value)} className="w-full" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Bill Aging</label>
                  <Input value={formData.billAging} onChange={(e: any) => handleFormChange('billAging', e.target.value)} className="w-full" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Shipment Arrival Date</label>
                  <Input type="date" value={formData.shipmentArrivalDate} onChange={(e: any) => handleFormChange('shipmentArrivalDate', e.target.value)} className="w-full" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">PO Total Quantity</label>
                  <Input value={detail.totalUnits || 0} readOnly className="w-full" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Bill Quantity</label>
                  <Input type="number" value={formData.billQuantity} onChange={(e: any) => handleFormChange('billQuantity', e.target.value)} className="w-full" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">PO Qty - Bill Qty Diff</label>
                  <Input value={(detail.totalUnits || 0) - (parseInt(formData.billQuantity) || 0)} readOnly className="w-full" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Invoice submitted date</label>
                  <Input type="date" value={formData.invoiceSubmittedDate} onChange={(e: any) => handleFormChange('invoiceSubmittedDate', e.target.value)} className="w-full" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Committed Date</label>
                  <Input type="date" value={formData.committedDate} onChange={(e: any) => handleFormChange('committedDate', e.target.value)} className="w-full" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Bill submitted Date</label>
                  <Input type="date" value={formData.billSubmittedDate} onChange={(e: any) => handleFormChange('billSubmittedDate', e.target.value)} className="w-full" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Total PO line items</label>
                  <Input value={items.length} readOnly className="w-full" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Edit lines</label>
                  <Input value={formData.editLines} onChange={(e: any) => handleFormChange('editLines', e.target.value)} className="w-full" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Delivery status</label>
                  <Input value={formData.deliveryStatus} onChange={(e: any) => handleFormChange('deliveryStatus', e.target.value)} className="w-full" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Grn Quantity</label>
                  <Input type="number" value={formData.grnQuantity} onChange={(e: any) => handleFormChange('grnQuantity', e.target.value)} className="w-full" />
                </div>
              </div>
              
              <div className="pt-4 mt-6 border-t border-neutral-100 dark:border-neutral-800">
                <h2 className="text-[10px] font-bold text-neutral-500 mb-4 uppercase tracking-widest">Flags</h2>
                <div className="flex flex-wrap items-center gap-6">
                  <label className="flex items-center gap-2 text-[10px] font-bold text-neutral-500 uppercase cursor-pointer">
                    <input type="checkbox" checked={formData.barcoded} onChange={(e: any) => handleFormChange('barcoded', e.target.checked)} className="rounded border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#232323] text-black dark:text-white focus:ring-black dark:focus:ring-white" />
                    BARCODED
                  </label>
                  <label className="flex items-center gap-2 text-[10px] font-bold text-neutral-500 uppercase cursor-pointer">
                    <input type="checkbox" checked={formData.googleLens} onChange={(e: any) => handleFormChange('googleLens', e.target.checked)} className="rounded border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#232323] text-black dark:text-white focus:ring-black dark:focus:ring-white" />
                    GOOGLE LENS
                  </label>
                  <label className="flex items-center gap-2 text-[10px] font-bold text-neutral-500 uppercase cursor-pointer">
                    <input type="checkbox" checked={formData.isPlanned} onChange={(e: any) => handleFormChange('isPlanned', e.target.checked)} className="rounded border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#232323] text-black dark:text-white focus:ring-black dark:focus:ring-white" />
                    PLANNED
                  </label>
                  <label className="flex items-center gap-2 text-[10px] font-bold text-neutral-500 uppercase cursor-pointer">
                    <input type="checkbox" checked={formData.qualityCheck} onChange={(e: any) => handleFormChange('qualityCheck', e.target.checked)} className="rounded border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#232323] text-black dark:text-white focus:ring-black dark:focus:ring-white" />
                    QUALITY CHECK
                  </label>
                </div>
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
                            {['#', 'Type', 'Package Quantity', 'Purchase Order', 'Department', 'Status', 'Vehicle Number'].map((h, idx) => (
                                <th key={h || `header-${idx}`} className="pb-1.5 text-left text-[10px] font-black text-neutral-500 pr-3 last:text-right whitespace-nowrap">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50 dark:divide-neutral-950/30">
                        {(detail.shipmentItems || []).map((item: any, i: number) => (
                            <tr key={item.id}>
                                <td className="py-1.5 pr-3">
                                    <span className="text-[9px] font-black text-neutral-400 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                                </td>
                                <td className="py-1.5 pr-3">
                                    <Input
                                        disabled
                                        value={item.packageType ?? ''}
                                        className="h-8 text-[10px] w-24 opacity-70"
                                    />
                                </td>
                                <td className="py-1.5 pr-3">
                                    <Input
                                        disabled
                                        value={item.packageQuantity ?? ''}
                                        className="h-8 text-[10px] w-24 opacity-70"
                                    />
                                </td>
                                <td className="py-1.5 pr-3">
                                    <Input
                                        disabled
                                        value={item.purchaseOrderId ?? ''}
                                        className="h-8 text-[10px] w-32 opacity-70"
                                    />
                                </td>
                                <td className="py-1.5 pr-3">
                                    <Input
                                        disabled
                                        value={item.department ?? ''}
                                        className="h-8 text-[10px] w-40 opacity-70"
                                    />
                                </td>
                                <td className="py-1.5 pr-3">
                                    <Input
                                        disabled
                                        value={item.status ?? ''}
                                        className="h-8 text-[10px] w-32 opacity-70"
                                    />
                                </td>
                                <td className="py-1.5 pr-3">
                                    <Input
                                        disabled
                                        value={item.InboundVehicleDetail?.vehicleNumber ?? ''}
                                        className="h-8 text-[10px] w-28 opacity-70"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {!(detail.shipmentItems?.length) && (
                <div className="text-center py-6 text-[10px] font-bold text-neutral-400 uppercase tracking-widest rounded-md border border-neutral-100 dark:border-neutral-900 border-dashed">
                    No shipment items
                </div>
            )}
            <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] font-bold text-neutral-400">{detail.shipmentItems?.length || 0} Entries</span>
                <span className="text-[10px] font-black text-black dark:text-white">Total: {detail.shipmentItems?.reduce((ac: any, curr: any) => ac + (Number(curr.packageQuantity) || 0), 0) || 0}</span>
            </div>
          </div>

          {/* VEHICLE DETAILS SECTION */}
          <div className="bg-white dark:bg-[#232323] border border-neutral-100 dark:border-neutral-950 rounded-md p-3 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
                <h2 className="text-[8px] font-black uppercase text-neutral-400 tracking-[0.2em] px-0.5">Vehicle Details</h2>
                <Button variant="secondary" size="sm" onClick={addVehicle} className="px-2 text-[8px] font-black ">
                    + Add Vehicle
                </Button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                    <thead>
                        <tr className="border-b border-neutral-50 dark:border-neutral-950">
                            {['#', 'Vehicle #', 'Driver/Contact', 'Delivery #', 'Times', ''].map((h, idx) => (
                                <th key={h || `header-${idx}`} className="pb-1.5 text-left text-[8px] font-black uppercase tracking-[0.15em] text-neutral-400 pr-3 last:text-right">{h}</th>
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
                                    onChange={(e: any) => updateVehicle(v.id, 'vehicleNumber', e.target.value)} 
                                  />
                                </td>
                                <td className="py-2 pr-3">
                                  <div className="flex flex-col gap-1">
                                    <Input 
                                      className="h-8 text-[10px] w-40" 
                                      placeholder="Driver Name"
                                      value={v.driverName} 
                                      onChange={(e: any) => updateVehicle(v.id, 'driverName', e.target.value)} 
                                    />
                                    <Input 
                                      className="h-8 text-[10px] w-40" 
                                      placeholder="Contact #"
                                      value={v.driverContact} 
                                      onChange={(e: any) => updateVehicle(v.id, 'driverContact', e.target.value)} 
                                    />
                                  </div>
                                </td>
                                <td className="py-2 pr-3">
                                  <Input 
                                    className="h-8 text-[10px] w-28" 
                                    placeholder="DEL-123"
                                    value={v.deliveryNumber} 
                                    onChange={(e: any) => updateVehicle(v.id, 'deliveryNumber', e.target.value)} 
                                  />
                                </td>
                                <td className="py-2 pr-3">
                                  <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-1">
                                      <span className="text-[7px] font-bold text-neutral-400 w-6">IN:</span>
                                      <Input 
                                        className="h-7 text-[10px] w-32" 
                                        placeholder="10:00 AM"
                                        value={v.timeIn || v.createdAt} 
                                        onChange={(e: any) => updateVehicle(v.id, 'timeIn', e.target.value)} 
                                      />
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-[7px] font-bold text-neutral-400 w-6">OUT:</span>
                                      <Input 
                                        className="h-7 text-[10px] w-32" 
                                        placeholder="02:00 PM"
                                        value={v.timeOut || v.updatedAt} 
                                        onChange={(e: any) => updateVehicle(v.id, 'timeOut', e.target.value)} 
                                      />
                                    </div>
                                  </div>
                                </td>
                                <td className="py-2 text-right">
                                  <button
                                    onClick={() => removeVehicle(v.id)}
                                    className="text-[9px] font-bold text-red-500 hover:text-red-700 uppercase tracking-widest px-2 py-1"
                                  >
                                    Remove
                                  </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {vehicles.length === 0 && (
                <div className="text-center py-6 text-[10px] font-bold text-neutral-400 uppercase tracking-widest rounded-md border border-neutral-100 dark:border-neutral-900 border-dashed">
                    No vehicles added
                </div>
            )}
          </div>

        </div>

        {/* Right Column (Details Sidebar) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Tracker Form Widget */}
          <div className="bg-white dark:bg-[#232323] border border-neutral-100 dark:border-neutral-950 rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-50 dark:border-neutral-900">
              <h2 className="text-[10px] font-black uppercase text-neutral-400 tracking-widest flex items-center gap-1.5"><History size={12} /> Status & Tracking</h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-neutral-300 uppercase tracking-widest">Core Status</label>
                  <Select 
                    value={coreStatus} 
                    onChange={(e: any) => { 
                      setCoreStatus(e.target.value); 
                      setCurrentStage(statusMap[e.target.value][0]); 
                    }}
                  >
                    {Object.keys(statusMap).map(k => <option key={k} value={k}>{k}</option>)}
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-neutral-300 uppercase tracking-widest">Current Stage</label>
                  <Select value={currentStage} onChange={(e: any) => setCurrentStage(e.target.value)}>
                    {(statusMap[coreStatus] || []).map(s => <option key={s} value={s}>{s}</option>)}
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-neutral-300 uppercase tracking-widest">Remarks & Issues</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Any damages, missing items, or notes?"
                  className="w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-[10px] font-medium text-black focus:ring-1 focus:ring-supabase-green focus:border-supabase-green focus:outline-none dark:border-[#2e2e2e] dark:bg-[#1c1c1c] dark:text-white resize-none h-16"
                />
              </div>

              <Button 
                size="md" 
                className="w-full" 
                onClick={handleUpdateTracking}
                loading={updateTrackingMutation.isPending}
              >
                Update Status
              </Button>
            </div>
          </div>

          {/* Timeline Widget */}
          <div className="bg-white dark:bg-[#232323] border border-neutral-100 dark:border-neutral-950 rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-50 dark:border-neutral-900 flex items-center justify-between">
              <h2 className="text-[10px] font-black uppercase text-neutral-400 tracking-widest flex items-center gap-1.5"><History size={12} /> Activity Timeline</h2>
              <span className="text-[9px] font-black text-neutral-400 uppercase">{timelineEvents.length} Events</span>
            </div>
            <div className="p-6 space-y-4">
              {timelineEvents.map((event: any, idx: number) => (
                <div key={event.id} className="relative flex gap-4 pl-2">
                  {idx !== timelineEvents.length - 1 && <div className="absolute left-3.5 top-6 bottom-0 border-l border-dashed border-neutral-200 dark:border-neutral-800" />}
                  <div className="relative z-10 w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/30 border-2 border-white dark:border-[#232323] flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-black text-neutral-900 dark:text-white leading-tight uppercase tracking-tight">{event.status}</p>
                        <p className="text-[10px] font-bold text-neutral-400 tracking-tight">{event.subStatus || 'Default Stage'}</p>
                      </div>
                      <span className="text-[9px] font-bold text-neutral-400 tabular-nums shrink-0 ml-2">
                        {(() => {
                          const d = new Date(event.createdAt);
                          if (isNaN(d.getTime())) return '-';
                          return `${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, ${d.toLocaleDateString()}`;
                        })()}
                      </span>
                    </div>
                    <div className="bg-neutral-50/70 dark:bg-[#1c1c1c]/70 p-3 mt-3 rounded-md border border-neutral-100 dark:border-neutral-900 shadow-sm relative">
                      <div className="absolute -left-[5px] top-4 w-2 h-2 bg-neutral-50/70 dark:bg-[#1c1c1c]/70 border-l border-t border-neutral-100 dark:border-neutral-900 rotate-[-45deg]" />
                      <p className="text-[10px] font-bold text-neutral-700 dark:text-neutral-300">By {event.User?.fullName || event.userId || 'System'}</p>
                      {event.remarks && <p className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 italic mt-1 pb-2 border-b border-neutral-100 dark:border-neutral-800/50">{event.remarks}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoTrackerDetailPage;
