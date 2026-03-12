import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge, Button } from '../components/ui';
import type { Order, OrderItem } from '../types';
import { fetchOrderDetailApi } from '../api/client';

export const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const res = await fetchOrderDetailApi(orderId);
      setOrder(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-24">
      <div className="flex gap-1 mb-4">
        <div className="h-1 w-1 rounded-full bg-neutral-300 animate-bounce"></div>
        <div className="h-1 w-1 rounded-full bg-neutral-300 animate-bounce [animation-delay:-0.15s]"></div>
        <div className="h-1 w-1 rounded-full bg-neutral-300 animate-bounce [animation-delay:-0.3s]"></div>
      </div>
      <p className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold">Fetching Context...</p>
    </div>
  );

  if (!order) return <div className="p-8 text-center text-neutral-500">Order not found.</div>;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="space-y-0.5 min-w-0"> {/* min-w-0 prevents text overflow issues in flex */}
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-black text-neutral-600 dark:text-neutral-300 uppercase tracking-widest truncate">
              {order.saleOrderNumber}
            </h1>
            <Badge color={order.allocationStatus === 'AVAILABLE' ? 'green' : order.allocationStatus === 'PARTIAL-AVAILABLE' ? 'orange' : 'red'}>
              {order.allocationStatus}
            </Badge>
            <Badge color={order.status === 'new' ? 'blue' : 'gray'}>
              {order.status.toUpperCase()}
            </Badge>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="shrink-0" // Prevents the button from squishing
          onClick={() => navigate('/orders')}
        >
          Back
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Customer Card */}
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl space-y-3 shadow-sm">
          <h2 className="text-[9px] font-black uppercase text-neutral-400 tracking-widest border-b border-neutral-50 dark:border-neutral-800 pb-2">Customer</h2>
          <div className="space-y-2">
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-neutral-300 uppercase tracking-tighter">Name</span>
              <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">{order.customer?.name}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-neutral-300 uppercase tracking-tighter">Email</span>
              <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">{order.customer?.email}</span>
            </div>
          </div>
        </div>

        {/* Shipping Card */}
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl space-y-3 shadow-sm">
          <h2 className="text-[9px] font-black uppercase text-neutral-400 tracking-widest border-b border-neutral-50 dark:border-neutral-800 pb-2">Delivery address</h2>
          <div className="space-y-1">
            <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400 leading-tight">{order.shippingAddress?.street}</p>
          </div>
        </div>

        {/* Logistics Card */}
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl space-y-3 shadow-sm">
          <h2 className="text-[9px] font-black uppercase text-neutral-400 tracking-widest border-b border-neutral-50 dark:border-neutral-800 pb-2">Shipment</h2>
          <div className="space-y-2">
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-neutral-300 uppercase tracking-tighter">Tracking #</span>
              <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 select-all tabular-nums">{order.trackingNumber || 'Not available'}</span>
            </div>
            {order.awbUrl && (
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-neutral-300 uppercase tracking-tighter">Manifest</span>
                <a
                  href={order.awbUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-neutral-400 hover:text-neutral-600 dark:hover:text-white underline decoration-neutral-200 dark:decoration-neutral-700 underline-offset-4"
                >
                  View Airway Bill (AWB)
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-[9px] font-black uppercase text-neutral-400 tracking-widest px-1">Items ({order.items?.length})</h2>
        <div className="overflow-hidden border border-neutral-100 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-100 dark:border-neutral-800">
                <th className="px-4 py-2 text-[8px] font-black uppercase text-neutral-400 tracking-widest">SKU</th>
                <th className="px-4 py-2 text-[8px] font-black uppercase text-neutral-400 tracking-widest text-center">Quantity</th>
                <th className="px-4 py-2 text-[8px] font-black uppercase text-neutral-400 tracking-widest text-center">Reserved</th>
                <th className="px-4 py-2 text-[8px] font-black uppercase text-neutral-400 tracking-widest text-right">Unit</th>
                <th className="px-4 py-2 text-[8px] font-black uppercase text-neutral-400 tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800">
              {order.items?.map((item: any) => (
                <tr key={item.id} className="hover:bg-neutral-50/30 dark:hover:bg-neutral-950/30">
                  <td className="px-4 py-1.5">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300 leading-none">{item.sku}</span>
                      <span className="text-[8px] text-neutral-400 font-medium truncate max-w-[120px]">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-1.5 text-center">
                    <span className="text-xs font-black text-neutral-600 dark:text-neutral-300 tabular-nums">{item.quantity}</span>
                  </td>
                  <td className="px-4 py-1.5 text-center">
                    <span className={`text-xs font-black tabular-nums ${item.allocated < item.quantity ? 'text-orange-500' : 'text-green-600 dark:text-green-400'}`}>
                      {item.allocated}
                    </span>
                  </td>
                  <td className="px-4 py-1.5 text-right">
                    <span className="text-xs font-bold text-neutral-400 tabular-nums">₹{item.price}</span>
                  </td>
                  <td className="px-4 py-1.5 text-right">
                    <Badge color={item.allocationStatus === 'ALLOCATED' ? 'green' : 'gray'}>
                      {item.allocationStatus}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800">
              <tr>
                <td colSpan={2} className="px-4 py-2 text-[9px] font-black uppercase text-neutral-400 tracking-widest">Total</td>
                <td colSpan={2} className="px-4 py-2 text-right text-xs font-black text-neutral-600 dark:text-neutral-300 tabular-nums">
                  ₹{order.orderTotalAmount.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};