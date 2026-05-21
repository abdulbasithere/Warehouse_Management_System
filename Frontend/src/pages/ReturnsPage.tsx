import React, { useState } from 'react';
import { Button, Input, Badge } from '../components/ui';
import { CustomTable, Column } from '../components/CustomTable';
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
        <div className="flex-1 flex flex-col min-h-0 space-y-4 text-left">
            <div className="flex items-center justify-between">
                <h1 className="text-sm font-black text-black dark:text-white ">Process Order Return</h1>
            </div>

            <div className="flex justify-start">
                <form onSubmit={handleSearch} className="flex gap-1.5 w-full max-w-sm">
                    <Input
                        placeholder="Shopify Order # (e.g. #1234)"
                        value={orderNumber}
                        onChange={(e) => setOrderNumber(e.target.value)}
                        className="flex-1 uppercase"
                    />
                    <Button type="submit" size="md" disabled={!orderNumber.trim()}>
                        {isSearching ? '...' : 'Search'}
                    </Button>
                </form>
            </div>

            {error && (
                <div className="p-2 bg-black text-white dark:bg-white dark:text-black rounded text-[9px] font-black ">
                    {(error as any).message || 'Order not found.'}
                </div>
            )}

            {order && !error && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-1 duration-200">
                    <div className="p-3 bg-white dark:bg-[#232323] border border-neutral-100 dark:border-neutral-900 rounded-md shadow-sm space-y-3">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="space-y-0.5">
                                <p className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em]">Order Details</p>
                                <h2 className="text-sm font-black text-black dark:text-white uppercase">{order.saleOrderNumber}</h2>
                                <div className="flex items-center gap-2">
                                    <Badge color={order.status === 'returned' ? 'blue' : 'gray'}>
                                        {(order.status || '').toUpperCase()}
                                    </Badge>
                                    <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-tighter">{order.customer.name} | {order.customer.email}</span>
                                </div>
                            </div>

                            <div className="text-right space-y-0.5">
                                <p className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em]">Total</p>
                                <p className="text-sm font-black text-black dark:text-white">Rs. {(order.orderTotalAmount || 0).toLocaleString()}</p>
                            </div>
                        </div>

                        <CustomTable
                            data={order.items || []}
                            columns={columns}
                            page={1}
                            pageSize={100}
                            total={order.items?.length || 0}
                            onPageChange={() => { }}
                            height="auto"
                        />

                        <div className="flex justify-end pt-3 border-t border-neutral-50 dark:border-neutral-950">
                            <Button
                                variant="primary"
                                size="md"
                                onClick={handleProcessReturn}
                                disabled={order.status === 'returned' || isProcessing}
                                className="min-w-[150px]"
                            >
                                {isProcessing ? '...' : order.status === 'returned' ? 'Returned' : 'Confirm Return'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
