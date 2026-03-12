import React, { useState } from 'react';
import { Button, Input, Badge } from '../components/ui';
import { DataTable } from '../components/DataTable';
import { useOrderByNumber, useProcessReturn } from '../api/hooks/useOrders';

export const ReturnsPage: React.FC = () => {
    const [orderNumber, setOrderNumber] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const { data: order, isLoading: isSearching, error } = useOrderByNumber(searchQuery);
    const { mutate: processReturn, isPending: isProcessing } = useProcessReturn();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (orderNumber.trim()) {
            setSearchQuery(orderNumber.trim());
        }
    };

    const handleProcessReturn = () => {
        if (order) {
            processReturn(order.saleOrderNumber, {
                onSuccess: () => {
                    setSearchQuery('');
                    setOrderNumber('');
                }
            });
        }
    };

    const columns = [
        {
            key: 'sku',
            header: 'SKU',
            render: (row: any) => row.sku,
            className: 'font-bold'
        },
        {
            key: 'name',
            header: 'Product Name',
            render: (row: any) => row.name
        },
        {
            key: 'quantity',
            header: 'Quantity',
            render: (row: any) => row.quantity,
            className: 'text-right tabular-nums'
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-sm font-black text-black dark:text-white uppercase tracking-widest">Process Order Return</h1>
            </div>

            <div className="max-w-xl">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <Input
                        placeholder="Enter Shopify Order Number (e.g. #1234)"
                        value={orderNumber}
                        onChange={(e) => setOrderNumber(e.target.value)}
                        className="flex-1"
                    />
                    <Button type="submit" loading={isSearching} disabled={!orderNumber.trim()}>
                        Search Order
                    </Button>
                </form>
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900 rounded text-red-600 dark:text-red-400 text-[10px] font-bold">
                    {(error as any).message || 'Order not found. Please check the order number.'}
                </div>
            )}

            {order && !error && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="p-4 bg-white dark:bg-black border border-neutral-100 dark:border-neutral-900 rounded-lg shadow-sm space-y-4">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Order Details</p>
                                <h2 className="text-lg font-bold text-black dark:text-white">{order.saleOrderNumber}</h2>
                                <div className="flex items-center gap-2">
                                    <Badge color={order.status === 'returned' ? 'blue' : 'gray'}>
                                        {order.status.toUpperCase()}
                                    </Badge>
                                    <span className="text-[10px] text-neutral-500 font-medium">| {order.customer.name} ({order.customer.email})</span>
                                </div>
                            </div>

                            <div className="text-right space-y-1">
                                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Total Amount</p>
                                <p className="text-lg font-bold text-black dark:text-white">Rs. {order.orderTotalAmount.toLocaleString()}</p>
                            </div>
                        </div>

                        <DataTable
                            data={order.items || []}
                            columns={columns}
                            page={1}
                            pageSize={100}
                            total={order.items?.length || 0}
                            onPageChange={() => { }}
                        />

                        <div className="flex justify-end pt-4 border-t border-neutral-50 dark:border-neutral-900">
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={handleProcessReturn}
                                loading={isProcessing}
                                disabled={order.status === 'returned' || isProcessing}
                                className="min-w-[200px]"
                            >
                                {order.status === 'returned' ? 'Already Returned' : 'Confirm & Process Return'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
