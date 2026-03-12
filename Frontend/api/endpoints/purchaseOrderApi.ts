import { apiFetch, getHeaders } from '../baseFetcher';

export const getAllPurchaseOrders = async () => {
    return apiFetch('/purchase-orders');
};

export const getPurchaseOrderByNumber = async (poNumber: string) => {
    return apiFetch(`/purchase-orders/${poNumber}`);
};

export const updatePurchaseOrderStatus = async (poNumber: string, status: string) => {
    return apiFetch(`/purchase-orders/${poNumber}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status })
    });
};
