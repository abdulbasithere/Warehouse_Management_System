import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Badge } from '../components/ui';
import { useTransferOrderById } from '../api/hooks/useTransferOrders';
import { CustomTable, Column } from '../components/CustomTable';
import { ArrowLeft, Package, Calendar } from 'lucide-react';

export const TransferOrderDetailPage: React.FC = () => {
  const { transferNumber } = useParams<{ transferNumber: string }>();
  const navigate = useNavigate();
  const { data: responseData, isLoading } = useTransferOrderById(transferNumber || '');
  const transferOrder = responseData?.data || responseData;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-supabase-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!transferOrder) {
    return (
      <div className="p-8 text-center text-red-500">
        Transfer order not found.
        <br />
        <Button onClick={() => navigate('/transfer-orders')} className="mt-4">Back to Transfer Orders</Button>
      </div>
    );
  }

  const columns: Column<any>[] = [
    {
      key: 'item', header: 'Item',
      render: (r) => <span className="font-bold text-xs">{r.productVariantId}</span>
    },
    {
      key: 'quantity', header: 'Quantity',
      render: (r) => <span className="text-xs tabular-nums">{r.quantity}</span>
    },
    {
      key: 'shipped', header: 'Shipped',
      render: (r) => <span className="text-xs tabular-nums font-medium text-blue-500">{r.shippedQuantity}</span>
    },
    {
      key: 'received', header: 'Received',
      render: (r) => <span className="text-xs tabular-nums font-medium text-green-500">{r.receivedQuantity}</span>
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white dark:bg-[#232323] p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/transfer-orders')}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-[#2e2e2e] rounded-full transition-colors"
          >
            <ArrowLeft size={18} className="text-neutral-500" />
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-widest">
              Transfer Order Details
            </h1>
            <Badge color="gray" className="text-[9px] px-1.5 py-0">{transferNumber || transferOrder.transferNumber}</Badge>
          </div>
        </div>
        <div>
           <Badge color={transferOrder.status === 'Received' ? 'green' : transferOrder.status === 'Shipped' ? 'blue' : 'orange'}>
              {(transferOrder.status || 'Pending').toUpperCase()}
           </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-white dark:bg-[#232323] p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 flex flex-col gap-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-2">
              <Package size={14} /> Transfer Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
                <div>
                   <p className="text-[10px] font-bold text-neutral-500 uppercase">From Warehouse</p>
                   <p className="font-bold text-sm">{transferOrder.FromWarehouse?.warehouseName || transferOrder.fromWarehouseId}</p>
                </div>
                <div>
                   <p className="text-[10px] font-bold text-neutral-500 uppercase">To Warehouse</p>
                   <p className="font-bold text-sm">{transferOrder.ToWarehouse?.warehouseName || transferOrder.toWarehouseId}</p>
                </div>
                <div>
                   <p className="text-[10px] font-bold text-neutral-500 uppercase">Transfer Date</p>
                   <p className="font-bold text-sm">{transferOrder.transferDate}</p>
                </div>
                <div>
                   <p className="text-[10px] font-bold text-neutral-500 uppercase">Remarks</p>
                   <p className="font-bold text-sm text-neutral-500">{transferOrder.remarks || 'None'}</p>
                </div>
            </div>
         </div>
      </div>
      
      <div className="bg-white dark:bg-[#232323] p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 flex flex-col gap-4">
         <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-2">
            <Package size={14} /> Line Items
         </h2>
         <CustomTable 
            columns={columns} 
            data={transferOrder.Lines || []} 
            page={1} 
            pageSize={100} 
            total={transferOrder.Lines?.length || 0} 
            getRowId={(r) => r.id} 
          />
      </div>
    </div>
  );
};

export default TransferOrderDetailPage;
