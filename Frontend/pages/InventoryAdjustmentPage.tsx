import React, { useState } from 'react';
import { DataTable, Column } from '../components/DataTable';
import { Badge, Button, Input, Select } from '../components/ui';
import { useProducts } from '../api/hooks/useProducts';
import { useShelfLocations } from '../api/hooks/useShelfLocations';
import { useCreateAdjustment, useAdjustmentHistory } from '../api/hooks/useInventory';

export const InventoryAdjustmentPage: React.FC = () => {
    const [page, setPage] = useState(1);
    const [productSearch, setProductSearch] = useState('');
    const [shelfSearch, setShelfSearch] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');
    const [selectedShelf, setSelectedShelf] = useState('');
    const [adjustmentType, setAdjustmentType] = useState<'shortage' | 'excess'>('shortage');
    const [quantity, setQuantity] = useState('');
    const [reason, setReason] = useState('shortage');
    const [notes, setNotes] = useState('');

    // Queries
    const { data: productsData } = useProducts({ page: 1, pageSize: 10, search: productSearch });
    const { data: shelvesData } = useShelfLocations({ page: 1, pageSize: 10, search: shelfSearch });
    const { data: historyData, isLoading: loadingHistory } = useAdjustmentHistory({ page, pageSize: 10 });

    console.log(shelvesData)
    // Mutation
    const createAdjustmentMutation = useCreateAdjustment();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct || !selectedShelf || !quantity || !reason) return;

        const qty = parseInt(quantity);
        const finalQty = adjustmentType === 'shortage' ? -Math.abs(qty) : Math.abs(qty);

        await createAdjustmentMutation.mutateAsync({
            productID: selectedProduct,
            shelfID: selectedShelf,
            adjustmentQuantity: finalQty,
            reason,
            notes
        });

        // Reset form
        setQuantity('');
        setNotes('');
    };

    const columns: Column<any>[] = [
        {
            key: 'date',
            header: 'Date',
            render: (r) => (
                <span className="text-[10px] text-neutral-400 font-medium">
                    {new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}, {new Date(r.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </span>
            )
        },
        {
            key: 'productName',
            header: 'Product',
            render: (r) => (
                <div className="flex flex-col">
                    <span className="font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-tight text-[10px]">{r.productId}</span>
                    <span className="text-[8px] text-neutral-400 truncate max-w-[150px]">{r.productName}</span>
                </div>
            )
        },
        {
            key: 'shelfLocation',
            header: 'Shelf',
            render: (r) => <Badge color="gray">{r.shelfLocation}</Badge>
        },
        {
            key: 'quantity',
            header: 'Qty',
            render: (r) => (
                <span className={`font-black tabular-nums ${r.quantity < 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {r.quantity > 0 ? `+${r.quantity}` : r.quantity}
                </span>
            )
        },
        {
            key: 'reason',
            header: 'Reason',
            render: (r) => <span className="capitalize text-[10px]">{r.reason}</span>
        },
        {
            key: 'adjustedBy',
            header: 'Admin',
            render: (r) => <span className="text-[10px] text-neutral-500">{r.adjustedBy}</span>
        }
    ];

    return (
        <div className="space-y-6 pb-10">
            <div>
                <h1 className="text-xs font-black text-neutral-500 dark:text-neutral-300 uppercase tracking-widest leading-none">Inventory Adjustments</h1>
                <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest mt-0.5">Manage stock shortage & excess</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Adjustment Form */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl shadow-sm space-y-4">
                        <h2 className="text-[9px] font-black uppercase text-neutral-400 tracking-[0.2em]">New Adjustment</h2>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-[8px] font-black text-neutral-400 uppercase tracking-widest px-1">Product</label>
                                <div className="space-y-2">
                                    <Input
                                        placeholder="Search product..."
                                        value={productSearch}
                                        onChange={e => setProductSearch(e.target.value)}
                                        className="h-8 text-xs"
                                    />
                                    <Select
                                        value={selectedProduct}
                                        onChange={e => setSelectedProduct(e.target.value)}
                                        required
                                    >
                                        <option value="">Select Product</option>
                                        {productsData?.data?.map((p: any) => (
                                            <option key={p.sku} value={p.sku}>{p.sku} - {p.name}</option>
                                        ))}
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[8px] font-black text-neutral-400 uppercase tracking-widest px-1">Shelf Location</label>
                                <div className="space-y-2">
                                    <Input
                                        placeholder="Search shelf..."
                                        value={shelfSearch}
                                        onChange={e => setShelfSearch(e.target.value)}
                                        className="h-8 text-xs"
                                    />
                                    <Select
                                        value={selectedShelf}
                                        onChange={e => setSelectedShelf(e.target.value)}
                                        required
                                    >
                                        <option value="">Select Shelf</option>
                                        {shelvesData?.data?.map((s: any) => (
                                            <option key={s.id} value={s.id}>{s.id}</option>
                                        ))}
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black text-neutral-400 uppercase tracking-widest px-1">Type</label>
                                    <div className="flex bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-lg">
                                        <button
                                            type="button"
                                            onClick={() => { setAdjustmentType('short') }}
                                            className={`flex-1 py-1 text-[8px] font-black uppercase rounded-md transition-all ${adjustmentType === 'short' ? 'bg-white dark:bg-neutral-700 text-red-500 shadow-sm' : 'text-neutral-400'}`}
                                        >
                                            Short
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setAdjustmentType('excess') }}
                                            className={`flex-1 py-1 text-[8px] font-black uppercase rounded-md transition-all ${adjustmentType === 'excess' ? 'bg-white dark:bg-neutral-700 text-green-500 shadow-sm' : 'text-neutral-400'}`}
                                        >
                                            Excess
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black text-neutral-400 uppercase tracking-widest px-1">Quantity</label>
                                    <Input
                                        type="number"
                                        min="1"
                                        placeholder="10"
                                        value={quantity}
                                        onChange={e => setQuantity(e.target.value)}
                                        required
                                        className="h-8"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[8px] font-black text-neutral-400 uppercase tracking-widest px-1">Notes</label>
                                <textarea
                                    className="w-full text-xs p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border-none focus:ring-1 focus:ring-neutral-200 dark:focus:ring-neutral-700 min-h-[60px]"
                                    placeholder="Additional details..."
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-9 mt-2"
                                disabled={createAdjustmentMutation.isPending}
                            >
                                {createAdjustmentMutation.isPending ? 'Processing...' : 'Execute Adjustment'}
                            </Button>
                        </form>
                    </div>
                </div>

                {/* History Table */}
                <div className="lg:col-span-2 space-y-4">
                    <DataTable
                        columns={columns}
                        data={historyData?.data || []}
                        page={page}
                        pageSize={10}
                        total={historyData?.total || 0}
                        loading={loadingHistory}
                        onPageChange={setPage}
                        height="85vh"
                    />
                </div>
            </div>
        </div>
    );
};
